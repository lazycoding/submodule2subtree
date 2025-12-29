#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');

// 检查是否安装inquirer
try {
    require.resolve('inquirer');
} catch (e) {
    console.error('请先安装依赖: npm install inquirer');
    process.exit(1);
}

const CONFIG_FILE = 'submodule_branches.json';

class SubmoduleManager {
    constructor(workDir = process.cwd()) {
        this.workDir = path.resolve(workDir);
        this.submodules = [];
        this.config = {};

        // 切换到工作目录
        process.chdir(this.workDir);
        console.log(`工作目录: ${this.workDir}`);
    }

    async run() {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '请选择操作:',
                choices: [
                    '1. 获取子模块分支信息',
                    '2. 解绑所有子模块',
                    '3. 重新添加为subtree',
                    '4. 退出'
                ]
            }
        ]);

        switch (action[0]) {
            case '1':
                await this.getSubmoduleBranches();
                break;
            case '2':
                await this.unbindSubmodules();
                break;
            case '3':
                await this.addAsSubtree();
                break;
            default:
                process.exit(0);
        }

        // 返回主菜单
        await this.run();
    }

    async getSubmoduleBranches() {
        console.log('正在获取子模块分支和远程信息...');

        // 检查.gitmodules文件是否存在
        const gitmodulesPath = path.join(this.workDir, '.gitmodules');
        if (!fs.existsSync(gitmodulesPath)) {
            console.error('错误: 未找到.gitmodules文件');
            return;
        }

        const submoduleLines = execSync('git config --file .gitmodules --get-regexp path')
            .toString()
            .split('\n')
            .filter(Boolean);

        this.submodules = submoduleLines.map(line => {
            const [, name, submodulePath] = line.match(/submodule\.(.+?)\.path (.+)/);
            return { name, path: submodulePath };
        });

        const config = {};

        for (const { name, path: submodulePath } of this.submodules) {
            try {
                const submoduleFullPath = path.join(this.workDir, submodulePath);

                // 检查子模块目录是否存在
                if (!fs.existsSync(submoduleFullPath)) {
                    console.warn(`警告: 子模块目录不存在: ${submodulePath}`);
                    continue;
                }

                // 获取分支
                const branch = execSync('git rev-parse --abbrev-ref HEAD', {
                    cwd: submoduleFullPath
                }).toString().trim();

                // 获取远程URL
                const url = execSync(`git config --file .gitmodules --get submodule.${name}.url`)
                    .toString().trim();

                config[submodulePath] = {
                    branch,
                    url
                };

                console.log(`[${submodulePath}] 分支: ${branch}, URL: ${url}`);
            } catch (error) {
                console.error(`获取 ${submodulePath} 信息失败:`, error.message);
            }
        }

        const configPath = path.join(this.workDir, CONFIG_FILE);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`子模块信息已保存到 ${configPath}`);
    }

    async unbindSubmodules() {
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: '确定要解绑所有子模块吗？此操作不可逆！',
                default: false
            }
        ]);

        if (!confirm) return;

        console.log('正在解绑所有子模块...');

        for (const { path: submodulePath } of this.submodules) {
            try {
                execSync(`git submodule deinit -f ${submodulePath}`);
                execSync(`git rm -f ${submodulePath}`);

                // 删除.git/modules下的目录
                const modulesPath = path.join('.git', 'modules', submodulePath);
                if (fs.existsSync(modulesPath)) {
                    fs.rmSync(modulesPath, { recursive: true, force: true });
                }

                console.log(`[${submodulePath}] 解绑成功`);
            } catch (error) {
                console.error(`解绑 ${submodulePath} 失败:`, error.message);
            }
        }

        execSync('git commit -m "chore: remove all submodules"');
        console.log('所有子模块已解绑');
    }

    async addAsSubtree() {
        const configPath = path.join(this.workDir, CONFIG_FILE);
        if (!fs.existsSync(configPath)) {
            console.error(`错误: 未找到${configPath}配置文件`);
            console.error('请先运行选项1获取分支信息');
            return;
        }

        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('正在重新添加为subtree...');

        for (const [submodulePath, info] of Object.entries(this.config)) {
            const repoName = `${submodulePath.replace(/\//g, '-')}-repo`;

            try {
                execSync(`git remote add ${repoName} ${info.url}`);
                execSync(`git fetch ${repoName}`);
                execSync(`git subtree add --prefix=${submodulePath} ${repoName} ${info.branch} --squash=false`);
                console.log(`[${submodulePath}] 添加成功 (分支: ${info.branch}, URL: ${info.url})`);
            } catch (error) {
                console.error(`添加 ${submodulePath} 失败:`, error.message);
            }
        }

        console.log('所有子仓库已重新添加为subtree并保留历史记录');
    }
}

// 解析命令行参数
const args = process.argv.slice(2);
const workDir = args[0] || process.cwd();

// 启动程序
new SubmoduleManager(workDir).run().catch(console.error);
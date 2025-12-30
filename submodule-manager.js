#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

// 检查是否安装inquirer
try {
    await import('inquirer');
} catch (e) {
    console.error('请先安装依赖: npm install inquirer');
    process.exit(1);
}

const CONFIG_FILE = 'submodule_branches.json';

class SubmoduleManager {
    constructor(workDir = process.cwd()) {
        this.workDir = path.resolve(workDir);
        this.currentDir = path.resolve(); // 保存当前目录
        this.submodules = [];
        this.config = {};

        // 切换到工作目录
        process.chdir(this.workDir);
        console.log(`工作目录: ${this.workDir}`);
    }

    async run() {
        while (true) {
            const response = await inquirer.prompt([
                {
                    type: 'rawlist',
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
            const action = response.action[0];

            switch (action) {
                case '1':
                    await this.getSubmoduleBranches();
                    break;
                case '2':
                    await this.unbindSubmodules();
                    break;
                case '3':
                    await this.addAsSubtree();
                    break;
                case '4':
                    console.log('程序退出');
                    process.exit(0);
                default:
                    console.log('无效选择');
                    break;
            }
        }
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
            const match = line.match(/submodule\.(.+?)\.path (.+)/);
            if (!match) return null;
            const [, name, submodulePath] = match;
            return { name, path: submodulePath };
        }).filter(Boolean);

        const config = {};

        for (const { name, path: submodulePath } of this.submodules) {
            try {
                const submoduleFullPath = path.join(this.workDir, submodulePath);

                // 检查子模块目录是否存在
                if (!fs.existsSync(submoduleFullPath)) {
                    console.warn(`警告: 子模块目录不存在: ${submodulePath}`);
                    continue;
                }

                // 获取当前commitId
                const currentCommit = execSync('git rev-parse HEAD', {
                    cwd: submoduleFullPath
                }).toString().trim();

                // 获取本地分支名
                let branch = execSync('git rev-parse --abbrev-ref HEAD', {
                    cwd: submoduleFullPath
                }).toString().trim();

                // 如果当前是detached HEAD状态（显示为HEAD或commitId）
                if (branch === 'HEAD' || branch === currentCommit.substring(0, 7)) {
                    console.log(`[${submodulePath}] 当前处于detached HEAD状态: ${currentCommit.substring(0, 7)}`);

                    // 尝试获取远程分支信息
                    try {
                        const remoteBranches = execSync('git branch -r --contains HEAD', {
                            cwd: submoduleFullPath
                        }).toString().trim().split('\n').filter(Boolean);

                        if (remoteBranches.length > 0) {
                            // 如果当前commit是某个远程分支的HEAD，使用该分支名
                            const remoteBranch = remoteBranches[0].trim()
                                .replace('origin/', '')
                                .replace(/^HEAD -> /, '')
                                .replace(/^origin\//, ''); // 移除开头的"origin/"
                            branch = remoteBranch;
                            console.log(`[${submodulePath}] 使用远程分支: ${branch}`);
                        } else {
                            // 如果不是远程分支的HEAD，提示创建新分支
                            const mainBranch = execSync('git rev-parse --abbrev-ref HEAD', {
                                cwd: this.workDir
                            }).toString().trim();

                            console.log(`[${submodulePath}] 提示: 当前commitId ${currentCommit.substring(0, 7)} 不是任何远程分支的HEAD`);
                            console.log(`[${submodulePath}] 建议: 在子模块中执行: git checkout -b ${mainBranch} ${currentCommit.substring(0, 7)}`);
                            console.log(`[${submodulePath}] 然后: git push -u origin ${mainBranch}`);

                            // 使用主仓库分支名作为建议分支名
                            branch = `${mainBranch}(待创建)`;
                        }
                    } catch (error) {
                        console.warn(`[${submodulePath}] 获取远程分支信息失败:`, error.message);
                        branch = `detached-${currentCommit.substring(0, 7)}`;
                    }
                }

                // 获取远程URL
                try {
                    const url = execSync(`git config --file .gitmodules --get submodule.${name}.url`)
                        .toString().trim();

                    config[submodulePath] = {
                        branch,
                        url
                    };
                } catch (error) {
                    console.error(`获取 ${submodulePath} 的远程URL失败:`, error.message);
                    config[submodulePath] = { branch, url: '' };
                    console.log(`[${submodulePath}] 分支: ${branch}, URL: 获取失败`);
                }

                if (config[submodulePath].url) {
                    console.log(`[${submodulePath}] 分支: ${branch.replace(/^HEAD -> /, '').replace(/^origin\//, '')}, URL: ${config[submodulePath].url}`);
                } else {
                    console.log(`[${submodulePath}] 分支: ${branch.toString().replace(/^origin\//, '')}, URL: 获取失败`);
                }
            } catch (error) {
                console.error(`获取 ${submodulePath} 信息失败:`, error.message);
            }
        }

        const configPath = path.join(this.currentDir, CONFIG_FILE);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`子模块信息已保存到 ${configPath}`);
    }

    async unbindSubmodules() {
        // 检查this.submodules和CONFIG_FILE是否存在
        const configPath = path.join(this.currentDir, CONFIG_FILE);
        if (!fs.existsSync(configPath) && (!this.submodules || this.submodules.length === 0)) {
            console.error('错误: 未找到子模块配置文件和子模块信息');
            console.error('请先运行选项1获取子模块分支信息');
            return;
        }

        // 如果this.submodules不存在但配置文件存在，则初始化this.submodules
        if (!this.submodules || this.submodules.length === 0) {
            this.submodules = Object.keys(JSON.parse(fs.readFileSync(configPath, 'utf8')))
                .map(path => ({ path }));
            console.log('已从配置文件初始化子模块信息');
        }

        const response2 = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: '确定要解绑所有子模块吗？此操作不可逆！',
                default: false
            }
        ]);
        const { confirm } = response2;

        if (!confirm) return;

        console.log('正在解绑所有子模块...');

        for (const { path: submodulePath } of this.submodules) {
            try {
                console.log(`deinit ${submodulePath} ...`);
                execSync(`git submodule deinit -f ${submodulePath}`);
                execSync(`git rm -f ${submodulePath}`);

                // 删除.git/modules下的目录
                const modulesPath = path.join('.git', 'modules', submodulePath.replace(/mgit\//g, ''));
                if (fs.existsSync(modulesPath)) {
                    fs.rmSync(modulesPath, { recursive: true, force: true });
                }

                console.log(`[${submodulePath}] 解绑成功`);
            } catch (error) {
                console.error(`解绑 ${submodulePath} 失败:`, error.message);
            }
        }

        execSync('git commit -am "chore: remove all submodules"');
        console.log('所有子模块已解绑');
    }

    async addAsSubtree() {
        const configPath = path.join(this.currentDir, CONFIG_FILE);
        if (!fs.existsSync(configPath)) {
            console.error(`错误: 未找到${configPath}配置文件`);
            console.error('请先运行选项1获取分支信息');
            return;
        }

        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('正在检查并重新添加为subtree...');

        for (const [submodulePath, info] of Object.entries(this.config)) {
            const repoName = submodulePath.replace(/mgit\//g, '');

            try {
                // 检查工作区是否有未提交的修改
                try {
                    const status = execSync('git status --porcelain').toString().trim();
                    if (status) {
                        console.log(`\n检测到工作区有未提交的修改：`);
                        console.log(status);
                        console.log(`\n请先提交或暂存这些修改，然后再添加子树 ${submodulePath}`);
                        return;
                    }
                } catch (error) {
                    console.warn(`检查工作区状态失败: ${error.message}`);
                }

                // 检查子树目录和远程仓库是否都已存在
                const submoduleFullPath = path.join(this.workDir, submodulePath);
                const remotes = execSync('git remote').toString().split('\n').filter(Boolean);
                const hasSubtreeDir = fs.existsSync(submoduleFullPath);
                const hasRemote = remotes.includes(repoName);

                // 如果remote已存在，询问是否删除现有remote和子树目录
                if (hasRemote) {
                    console.log(`[${submodulePath}] 检测到已存在的远程仓库: ${repoName}`);

                    const { confirmDelete } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'confirmDelete',
                            message: `是否删除现有的远程仓库 ${repoName} 并重新添加?`,
                            default: true
                        }
                    ]);

                    if (confirmDelete) {
                        try {
                            // 删除现有的remote
                            console.log(`[${submodulePath}] 删除远程仓库 ${repoName}...`);
                            execSync(`git remote remove ${repoName}`);

                            // 如果子树目录存在，也删除它
                            if (hasSubtreeDir) {
                                console.log(`[${submodulePath}] 删除现有子树目录...`);
                                fs.rmSync(submoduleFullPath, { recursive: true, force: true });
                            }

                            console.log(`[${submodulePath}] 清理完成，准备重新添加`);
                        } catch (error) {
                            console.error(`[${submodulePath}] 清理现有配置失败:`, error.message);
                            continue;
                        }
                    } else {
                        console.log(`[${submodulePath}] 跳过，保留现有配置`);
                        continue;
                    }
                } else if (hasSubtreeDir) {
                    console.log(`[${submodulePath}] 检测到已存在的子树目录，将保留目录结构`);
                }

                // 询问是否使用 squash 参数
                const { useSquash } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'useSquash',
                        message: `添加子树 ${submodulePath} 时是否使用 --squash 参数?`,
                        default: true,
                        description: '使用 --squash 会将子树历史合并为一个提交，不使用则保留完整历史'
                    }
                ]);

                const squashOption = useSquash ? '--squash' : '';

                console.log(`[${submodulePath}] 正在添加...`);
                execSync(`git remote add ${repoName} ${info.url}`);
                // execSync(`git fetch ${repoName}`);
                execSync(`git subtree add --prefix=${submodulePath} ${repoName} ${info.branch} ${squashOption}`);
                console.log(`[${submodulePath}] 添加成功 (分支: ${info.branch}, URL: ${info.url})`);
            } catch (error) {
                console.error(`添加 ${submodulePath} 失败:`, error.message);
            }
        }

        console.log('子树检查与添加操作完成');
    }
}

// 解析命令行参数
const args = process.argv.slice(2);
const workDir = args[0] && !args[0].startsWith('-') ? args[0] : process.cwd();

// 启动程序
new SubmoduleManager(workDir).run().catch(console.error);
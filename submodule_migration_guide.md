# 子模块迁移到Subtree操作指南

## 概述
本文档记录了将Git子模块(submodule)迁移为Git子树(subtree)的完整流程，包含以下内容：
- 子模块解绑脚本
- 子树添加脚本
- Node.js整合方案
- 工作目录支持

## 1. 批处理脚本方案

### 1.1 获取子模块分支信息
```batch
@echo off
REM 获取所有子模块当前commit所在的分支名并保存到配置文件
echo # 子模块分支配置文件 > submodule_branches.cfg
for /f "tokens=1,3 delims= " %%a in ('git config --file .gitmodules --get-regexp path') do (
    cd %%b
    for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set branch=%%i
    cd ..
    echo %%b=%branch% >> submodule_branches.cfg
)
```

### 1.2 解绑所有子模块
```batch
@echo off
for /f "tokens=1,3 delims= " %%a in ('git config --file .gitmodules --get-regexp path') do (
    git submodule deinit -f %%b
    git rm -f %%b
    rmdir /s /q .git/modules/%%b
)
git commit -m "chore: remove all submodules"
```

### 1.3 添加为Subtree
```batch
@echo off
for /f "tokens=1,2 delims==" %%a in (submodule_branches.cfg) do (
    git remote add %%a-repo [REPO_URL]
    git fetch %%a-repo
    git subtree add --prefix=%%a %%a-repo %%b --squash=false
)
```

## 2. Node.js整合方案

### 2.1 功能特点
- 交互式命令行界面
- 自动保存分支和远程URL信息
- 支持自定义工作目录
- 完善的错误处理

### 2.2 使用方式
```bash
# 安装依赖
npm install inquirer

# 运行脚本
node submodule-manager.js [工作目录]
```

### 2.3 主要功能代码
```javascript
// 获取子模块信息
const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
  cwd: submodulePath 
}).toString().trim();

const url = execSync(`git config --file .gitmodules --get submodule.${name}.url`)
  .toString().trim();

// 添加为subtree
execSync(`git remote add ${repoName} ${info.url}`);
execSync(`git fetch ${repoName}`);
execSync(`git subtree add --prefix=${submodulePath} ${repoName} ${info.branch} --squash=false`);
```

## 3. 操作流程
1. 获取子模块信息
2. 解绑子模块
3. 添加为Subtree
4. 验证迁移结果

## 注意事项
1. 操作前确保工作目录干净
2. 解绑操作不可逆，建议先备份
3. 确保有权限访问所有子模块仓库
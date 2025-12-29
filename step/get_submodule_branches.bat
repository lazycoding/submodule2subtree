@echo off
REM 获取所有子模块当前commit所在的分支名并保存到配置文件
echo 正在获取子模块分支信息...

REM 创建配置文件
echo # 子模块分支配置文件 > submodule_branches.cfg
echo # 格式: 子模块名=分支名 >> submodule_branches.cfg
echo. >> submodule_branches.cfg

REM 遍历每个子模块获取分支信息
for /f "tokens=1,3 delims= " %%a in ('git config --file .gitmodules --get-regexp path') do (
    set submodule_path=%%b
    set submodule_name=%%b
    call :get_branch
)

echo 分支信息已保存到 submodule_branches.cfg
pause
goto :eof

:get_branch
REM 进入子模块目录获取当前分支
cd %submodule_path%
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set branch=%%i
cd ..\..
echo %submodule_name%=%branch% >> submodule_branches.cfg
goto :eof
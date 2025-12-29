@echo off
REM 检查配置文件是否存在
if not exist submodule_branches.cfg (
    echo 错误: 未找到submodule_branches.cfg配置文件
    echo 请先运行 get_submodule_branches.bat 获取分支信息
    pause
    exit /b 1
)

REM 读取配置文件中的分支信息
for /f "tokens=1,2 delims==" %%a in (submodule_branches.cfg) do (
    if "%%a"=="flutter_desktop" set flutter_desktop_branch=%%b
    if "%%a"=="flutter_module" set flutter_module_branch=%%b
    if "%%a"=="hardware-flutter" set hardware_flutter_branch=%%b
    if "%%a"=="flutter_exception_performance" set flutter_exception_performance_branch=%%b
    if "%%a"=="flutter_imsdk" set flutter_imsdk_branch=%%b
    if "%%a"=="webview_cef" set webview_cef_branch=%%b
    if "%%a"=="flutter_desktop_window_plugins" set flutter_desktop_window_plugins_branch=%%b
    if "%%a"=="bespoke-resources-flutter" set bespoke_resources_flutter_branch=%%b
    if "%%a"=="app-resources" set app_resources_branch=%%b
    if "%%a"=="flutter-quill" set flutter_quill_branch=%%b
    if "%%a"=="birtc-flutter" set birtc_flutter_branch=%%b
    if "%%a"=="flutter_local_notifications" set flutter_local_notifications_branch=%%b
    if "%%a"=="super_drag_and_drop" set super_drag_and_drop_branch=%%b
)

REM 为flutter_desktop添加subtree
git remote add flutter_desktop-repo ssh://git@icode.baidu.com:8235/baidu/so-hermes/flutter_desktop
git fetch flutter_desktop-repo
git subtree add --prefix=mgit/flutter_desktop flutter_desktop-repo %flutter_desktop_branch% --squash=false

REM 为flutter_module添加subtree
git remote add flutter_module-repo ssh://git@icode.baidu.com:8235/baidu/so-hermes/flutter_mobile
git fetch flutter_module-repo
git subtree add --prefix=mgit/flutter_module flutter_module-repo %flutter_module_branch% --squash=false

REM 为hardware-flutter添加subtree
git remote add hardware-flutter-repo ssh://git@icode.baidu.com:8235/baidu/so-hermes/flutter_hardware
git fetch hardware-flutter-repo
git subtree add --prefix=mgit/hardware-flutter hardware-flutter-repo %hardware_flutter_branch% --squash=false

REM 为flutter_exception_performance添加subtree
git remote add flutter_exception_performance-repo ssh://git@icode.baidu.com:8235/baidu/flutter-dev/flutter_exception_performance
git fetch flutter_exception_performance-repo
git subtree add --prefix=mgit/flutter_exception_performance flutter_exception_performance-repo %flutter_exception_performance_branch% --squash=false

REM 为flutter_imsdk添加subtree
git remote add flutter_imsdk-repo ssh://git@icode.baidu.com:8235/baidu/so-hermes/flutter_imsdk
git fetch flutter_imsdk-repo
git subtree add --prefix=mgit/flutter_imsdk flutter_imsdk-repo %flutter_imsdk_branch% --squash=false

REM 为webview_cef添加subtree
git remote add webview_cef-repo ssh://git@icode.baidu.com:8235/baidu/third-party/webview_cef
git fetch webview_cef-repo
git subtree add --prefix=mgit/webview_cef webview_cef-repo %webview_cef_branch% --squash=false

REM 为flutter_desktop_window_plugins添加subtree
git remote add flutter_desktop_window_plugins-repo ssh://git@icode.baidu.com:8235/baidu/so-hermes/flutter_desktop_window_manager
git fetch flutter_desktop_window_plugins-repo
git subtree add --prefix=mgit/flutter_desktop_window_plugins flutter_desktop_window_plugins-repo %flutter_desktop_window_plugins_branch% --squash=false

REM 为bespoke-resources-flutter添加subtree
git remote add bespoke-resources-flutter-repo ssh://git@icode.baidu.com:8235/baidu/infoflow-slimes/bespoke-resources-flutter
git fetch bespoke-resources-flutter-repo
git subtree add --prefix=mgit/bespoke-resources-flutter bespoke-resources-flutter-repo %bespoke_resources_flutter_branch% --squash=false

REM 为app-resources添加subtree
git remote add app-resources-repo ssh://git@icode.baidu.com:8235/baidu/so-hermes/app-resources
git fetch app-resources-repo
git subtree add --prefix=mgit/app-resources app-resources-repo %app_resources_branch% --squash=false

REM 为flutter-quill添加subtree
git remote add flutter-quill-repo ssh://git@icode.baidu.com:8235/baidu/third-party/flutter-quill
git fetch flutter-quill-repo
git subtree add --prefix=mgit/flutter-quill flutter-quill-repo %flutter_quill_branch% --squash=false

REM 为birtc-flutter添加subtree
git remote add birtc-flutter-repo ssh://git@icode.baidu.com:8235/baidu/speech-arch/birtc-flutter
git fetch birtc-flutter-repo
git subtree add --prefix=mgit/birtc-flutter birtc-flutter-repo %birtc_flutter_branch% --squash=false

REM 为flutter_local_notifications添加subtree
git remote add flutter_local_notifications-repo ssh://git@icode.baidu.com:8235/baidu/third-party/flutter_local_notifications
git fetch flutter_local_notifications-repo
git subtree add --prefix=mgit/flutter_local_notifications flutter_local_notifications-repo %flutter_local_notifications_branch% --squash=false

REM 为super_drag_and_drop添加subtree
git remote add super_drag_and_drop-repo ssh://git@icode.baidu.com:8235/baidu/third-party/super_drag_and_drop
git fetch super_drag_and_drop-repo
git subtree add --prefix=mgit/super_drag_and_drop super_drag_and_drop-repo %super_drag_and_drop_branch% --squash=false

echo 所有子仓库已重新添加为subtree并保留历史记录
pause
@echo off
REM 解绑flutter_desktop子模块
git submodule deinit -f mgit/flutter_desktop
git rm -f mgit/flutter_desktop
rmdir /s /q .git/modules/mgit/flutter_desktop
git commit -m "chore: remove submodule flutter_desktop"

REM 解绑flutter_module子模块
git submodule deinit -f mgit/flutter_module
git rm -f mgit/flutter_module
rmdir /s /q .git/modules/mgit/flutter_module
git commit -m "chore: remove submodule flutter_module"

REM 解绑hardware-flutter子模块
git submodule deinit -f mgit/hardware-flutter
git rm -f mgit/hardware-flutter
rmdir /s /q .git/modules/mgit/hardware-flutter
git commit -m "chore: remove submodule hardware-flutter"

REM 解绑flutter_exception_performance子模块
git submodule deinit -f mgit/flutter_exception_performance
git rm -f mgit/flutter_exception_performance
rmdir /s /q .git/modules/mgit/flutter_exception_performance
git commit -m "chore: remove submodule flutter_exception_performance"

REM 解绑flutter_imsdk子模块
git submodule deinit -f mgit/flutter_imsdk
git rm -f mgit/flutter_imsdk
rmdir /s /q .git/modules/mgit/flutter_imsdk
git commit -m "chore: remove submodule flutter_imsdk"

REM 解绑webview_cef子模块
git submodule deinit -f mgit/webview_cef
git rm -f mgit/webview_cef
rmdir /s /q .git/modules/mgit/webview_cef
git commit -m "chore: remove submodule webview_cef"

REM 解绑flutter_desktop_window_plugins子模块
git submodule deinit -f mgit/flutter_desktop_window_plugins
git rm -f mgit/flutter_desktop_window_plugins
rmdir /s /q .git/modules/mgit/flutter_desktop_window_plugins
git commit -m "chore: remove submodule flutter_desktop_window_plugins"

REM 解绑bespoke-resources-flutter子模块
git submodule deinit -f mgit/bespoke-resources-flutter
git rm -f mgit/bespoke-resources-flutter
rmdir /s /q .git/modules/mgit/bespoke-resources-flutter
git commit -m "chore: remove submodule bespoke-resources-flutter"

REM 解绑app-resources子模块
git submodule deinit -f mgit/app-resources
git rm -f mgit/app-resources
rmdir /s /q .git/modules/mgit/app-resources
git commit -m "chore: remove submodule app-resources"

REM 解绑flutter-quill子模块
git submodule deinit -f mgit/flutter-quill
git rm -f mgit/flutter-quill
rmdir /s /q .git/modules/mgit/flutter-quill
git commit -m "chore: remove submodule flutter-quill"

REM 解绑birtc-flutter子模块
git submodule deinit -f mgit/birtc-flutter
git rm -f mgit/birtc-flutter
rmdir /s /q .git/modules/mgit/birtc-flutter
git commit -m "chore: remove submodule birtc-flutter"

REM 解绑flutter_local_notifications子模块
git submodule deinit -f mgit/flutter_local_notifications
git rm -f mgit/flutter_local_notifications
rmdir /s /q .git/modules/mgit/flutter_local_notifications
git commit -m "chore: remove submodule flutter_local_notifications"

REM 解绑super_drag_and_drop子模块
git submodule deinit -f mgit/super_drag_and_drop
git rm -f mgit/super_drag_and_drop
rmdir /s /q .git/modules/mgit/super_drag_and_drop
git commit -m "chore: remove submodule super_drag_and_drop"

echo 所有子模块解绑完成
pause
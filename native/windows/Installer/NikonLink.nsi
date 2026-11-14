!ifndef PRODUCT_VERSION
  !error "PRODUCT_VERSION is required."
!endif
!ifndef FILE_VERSION
  !error "FILE_VERSION is required."
!endif
!ifndef APP_ARCHITECTURE
  !error "APP_ARCHITECTURE is required."
!endif
!ifndef PUBLISH_GLOB
  !error "PUBLISH_GLOB is required."
!endif
!ifndef PROJECT_ROOT
  !error "PROJECT_ROOT is required."
!endif
!ifndef OUTPUT_FILE
  !error "OUTPUT_FILE is required."
!endif

!ifdef ZENCH_DEVELOP_PREVIEW
  !define APP_DISPLAY_NAME "帧澈 ZENCHE develop 预览版"
  !define APP_INSTALL_DIR "$LOCALAPPDATA\Programs\ZENCHE-develop-preview"
  !define APP_REG_ROOT HKCU
  !define APP_REG_KEY "Software\NikonLinkDevelopPreview"
  !define APP_UNINSTALL_REG "Software\Microsoft\Windows\CurrentVersion\Uninstall\NikonLinkDevelopPreview"
  !define APP_SHORTCUT "帧澈 ZENCHE develop 预览版.lnk"
  !define APP_UNINSTALL_SHORTCUT "卸载 帧澈 ZENCHE develop 预览版.lnk"
  !define APP_SHELL_CONTEXT current
  !define APP_ELEVATION user
!else
  !define APP_DISPLAY_NAME "帧澈 ZENCHE"
  !define APP_INSTALL_DIR "$PROGRAMFILES64\帧澈 ZENCHE"
  !define APP_REG_ROOT HKLM
  !define APP_REG_KEY "Software\NikonLink"
  !define APP_UNINSTALL_REG "${APP_UNINSTALL_REG}"
  !define APP_SHORTCUT "帧澈 ZENCHE.lnk"
  !define APP_UNINSTALL_SHORTCUT "卸载 帧澈 ZENCHE.lnk"
  !define APP_SHELL_CONTEXT all
  !define APP_ELEVATION admin
!endif

!include "MUI2.nsh"

Unicode true
Name "${APP_DISPLAY_NAME}"
Caption "${APP_DISPLAY_NAME} ${PRODUCT_VERSION} 安装程序"
BrandingText "${APP_DISPLAY_NAME}"
OutFile "${OUTPUT_FILE}"
InstallDir "${APP_INSTALL_DIR}"
InstallDirRegKey ${APP_REG_ROOT} "${APP_REG_KEY}" "InstallDir"
RequestExecutionLevel ${APP_ELEVATION}
ManifestDPIAware true
SetCompressor /SOLID lzma
SetCompressorDictSize 64

VIProductVersion "${FILE_VERSION}"
VIAddVersionKey /LANG=2052 "ProductName" "${APP_DISPLAY_NAME}"
VIAddVersionKey /LANG=2052 "ProductVersion" "${PRODUCT_VERSION}"
VIAddVersionKey /LANG=2052 "FileDescription" "${APP_DISPLAY_NAME} ${APP_ARCHITECTURE} 安装程序"
VIAddVersionKey /LANG=2052 "FileVersion" "${PRODUCT_VERSION}"
VIAddVersionKey /LANG=2052 "CompanyName" "帧澈 ZENCHE contributors"
VIAddVersionKey /LANG=2052 "LegalCopyright" "Copyright (c) 2026 Tauber01"

!define MUI_ABORTWARNING
!define MUI_ICON "${PROJECT_ROOT}/native/windows/Assets/app-icon.ico"
!define MUI_UNICON "${PROJECT_ROOT}/native/windows/Assets/app-icon.ico"
!define MUI_FINISHPAGE_RUN "$INSTDIR\ZENCHE.exe"
!define MUI_FINISHPAGE_RUN_TEXT "启动 ${APP_DISPLAY_NAME}"

Var StartMenuFolder

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "${PROJECT_ROOT}/LICENSE"
!insertmacro MUI_PAGE_DIRECTORY

!define MUI_STARTMENUPAGE_REGISTRY_ROOT "${APP_REG_ROOT}"
!define MUI_STARTMENUPAGE_REGISTRY_KEY "${APP_REG_KEY}"
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "StartMenuFolder"
!insertmacro MUI_PAGE_STARTMENU Application $StartMenuFolder

!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "English"

Function .onInit
check_running:
  FindWindow $0 "" "帧澈 ZENCHE"
  IntCmp $0 0 app_closed
  MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION \
    "请先关闭正在运行的 帧澈 ZENCHE，然后选择“重试”继续安装。" \
    IDRETRY check_running
  Abort

app_closed:
FunctionEnd

Section "帧澈 ZENCHE" SecApplication
  SectionIn RO
  SetShellVarContext ${APP_SHELL_CONTEXT}
  SetRegView 64

  SetOutPath "$INSTDIR"
  File /r /x ".DS_Store" "${PUBLISH_GLOB}"

  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr ${APP_REG_ROOT} "${APP_REG_KEY}" "InstallDir" "$INSTDIR"

  WriteRegStr ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "DisplayName" "帧澈 ZENCHE"
  WriteRegStr ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "Publisher" "帧澈 ZENCHE contributors"
  WriteRegStr ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "InstallLocation" "$INSTDIR"
  WriteRegStr ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "DisplayIcon" "$INSTDIR\ZENCHE.exe"
  WriteRegStr ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "QuietUninstallString" '"$INSTDIR\Uninstall.exe" /S'
  WriteRegDWORD ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "NoModify" 1
  WriteRegDWORD ${APP_REG_ROOT} "${APP_UNINSTALL_REG}" \
    "NoRepair" 1

  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
    CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
    CreateShortcut "$SMPROGRAMS\$StartMenuFolder\${APP_SHORTCUT}" \
      "$INSTDIR\ZENCHE.exe" "" "$INSTDIR\ZENCHE.exe"
    CreateShortcut "$SMPROGRAMS\$StartMenuFolder\${APP_UNINSTALL_SHORTCUT}" \
      "$INSTDIR\Uninstall.exe"
  !insertmacro MUI_STARTMENU_WRITE_END

  CreateShortcut "$DESKTOP\${APP_SHORTCUT}" \
    "$INSTDIR\ZENCHE.exe" "" "$INSTDIR\ZENCHE.exe"
SectionEnd

Section "Uninstall"
  SetShellVarContext ${APP_SHELL_CONTEXT}
  SetRegView 64

  !insertmacro MUI_STARTMENU_GETFOLDER Application $StartMenuFolder
  Delete "$SMPROGRAMS\$StartMenuFolder\${APP_SHORTCUT}"
  Delete "$SMPROGRAMS\$StartMenuFolder\${APP_UNINSTALL_SHORTCUT}"
  RMDir "$SMPROGRAMS\$StartMenuFolder"
  Delete "$DESKTOP\${APP_SHORTCUT}"

  DeleteRegKey ${APP_REG_ROOT} "${APP_UNINSTALL_REG}"
  DeleteRegKey ${APP_REG_ROOT} "${APP_REG_KEY}"

  RMDir /r /REBOOTOK "$INSTDIR"
SectionEnd

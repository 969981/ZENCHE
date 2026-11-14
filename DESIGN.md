# 帧澈 ZENCHE · 原生界面设计准则

本文适用于五端原生工作区（iOS/iPadOS、Android、HarmonyOS、macOS、Windows），不包含网站/PWA 的改造。详细技术约定参见 `docs/TECHNICAL_APPROACH.md`。

## Workspace
- 开发分支 `develop`：启动直接进入相机和影像工作区，账号登录与注册不是进入本地模块的先决条件。
- 连接、监看、拍摄、编辑、传输、文件库和设置使用各平台原生可访问控件；交互操作不应被闲置遮罩阻断。
- 软件启动品牌页与工作区视觉可保持一致，但不得把云端 AI 激活状态与本地相机可用性混为一谈。

## Waveform scopes
- Signal visualization uses dense traces for luminance and an **RGB overlay** for color waveform analysis.
- Scopes must show real source measurements when available, use meaningful scales and footer labels, and use **no decorative signature, watermark** or unrelated logo inside the signal plot.
- Empty signal states use concise localized descriptions and must not retain previous frames as fresh data.

## Release safety
- 保留设备绑定、激活码和 AI 额度系统的验证边界；登录墙移除不构成云服务免费权益。
- 正式发布必须沿用既有签名身份，升级时复核设备码与数据连续性。

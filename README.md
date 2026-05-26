# PicSign - 照片签名工具

为 JPG 照片底部添加白色信息条（摄影者姓名 + 作品名），专为摄影爱好者设计的极简桌面工具。

## 功能特点

- **一键签名**：拖入照片，自动添加白色底栏并标注摄影者和作品名
- **批量处理**：支持多张照片一次性处理，每张照片的作品名可独立编辑
- **画质保真**：使用 quality=100 + 4:4:4 色度采样，照片区域肉眼无损
- **EXIF 保留**：完整保留原始拍摄数据（相机型号、光圈、快门、ISO、GPS 等）
- **智能默认**：底栏高度自适应图片尺寸、作品名自动提取文件名
- **设置记忆**：摄影者名字、字体偏好等自动保存，下次启动自动恢复
- **离线运行**：完全本地处理，无需网络

## 使用方法

1. 打开 PicSign
2. 将照片拖入窗口（或点击"打开照片"按钮）
3. 在底部编辑面板中填写/确认摄影者名字和作品名
4. 点击"保存照片"即可

保存的文件会自动命名为 `原文件名_签名.jpg`，保存在原文件同一目录下，绝不覆盖原始文件。

## 开发

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev:electron
```

### 构建

```bash
# 仅构建前端（不打包桌面应用）
npm run build:vite

# 打包 Windows 安装包
npm run pack:win

# 打包 macOS 安装包
npm run pack:mac
```

### 打包输出

打包产物在 `release/` 目录：

- **Windows**: `PicSign Setup x.x.x.exe`（安装包）+ `PicSign x.x.x.exe`（绿色免安装版）
- **macOS**: `PicSign-x.x.x.dmg`

## 技术栈

- **桌面框架**：Electron
- **前端**：React + TypeScript + TailwindCSS
- **图片处理**：sharp (libvips)
- **构建工具**：Vite + electron-builder
- **状态持久化**：electron-store

## 项目结构

```
src/
├── main/                   # Electron 主进程
│   ├── index.ts            # 主进程入口
│   ├── ipc.ts              # IPC 消息处理
│   ├── image-processor.ts  # sharp 图片处理核心
│   └── store.ts            # 设置持久化
├── preload/
│   └── index.ts            # 安全桥接层
└── renderer/               # React 前端
    ├── App.tsx             # 主应用组件
    ├── components/         # UI 组件
    │   ├── DropZone.tsx    # 拖拽区域
    │   ├── Preview.tsx     # 图片预览
    │   ├── EditPanel.tsx   # 编辑面板
    │   ├── FileList.tsx    # 批量文件列表
    │   ├── Toolbar.tsx     # 顶部工具栏
    │   ├── ProgressBar.tsx # 批量保存进度
    │   └── Toast.tsx       # 提示消息
    ├── types.ts            # TypeScript 类型定义
    └── styles/
        └── index.css       # TailwindCSS 入口
```

## 许可证

MIT

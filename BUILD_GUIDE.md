# SoraWriter 打包发布指南

## 打包准备

### 1. 完善项目信息

首先更新 `package.json` 中的项目信息：

```json
{
  "name": "sorawriter",
  "productName": "SoraWriter",
  "version": "1.0.0",
  "description": "一个现代化的 Markdown 编辑器",
  "main": ".webpack/main",
  "author": {
    "name": "你的名字",
    "email": "你的邮箱"
  },
  "license": "MIT"
}
```

### 2. 确保必要文件存在

打包时需要包含以下文件：

#### 核心文件
- `src/` - 源代码目录
  - `main.js` - 主进程
  - `renderer.js` - 渲染进程
  - `preload.js` - 预加载脚本
  - `index.html` - 主页面
  - `index.css` - 样式文件
  - `locales/` - 国际化文件
    - `zh-CN.js`
    - `en-US.js`
  - `utils/` - 工具函数
    - `i18n.js`

#### 资源文件
- `assets/` - 资源目录
  - `welcome.md` - 中文欢迎文档
  - `welcome-en.md` - 英文欢迎文档
  - （如果有图标文件也放在这里）

#### 配置文件
- `package.json` - 项目配置
- `forge.config.js` - 打包配置
- `webpack.*.config.js` - Webpack 配置

## 打包命令

### 1. 开发模式构建
```bash
npm run start
```

### 2. 生产模式打包
```bash
npm run package
```
这会创建一个可运行的应用程序，但不会创建安装包。

### 3. 创建安装包
```bash
npm run make
```
这会创建适用于当前平台的安装包。

### 4. 发布到分发平台
```bash
npm run publish
```
（需要配置发布目标）

## 打包配置优化

### 1. 改进 forge.config.js

```javascript
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon', // 应用图标（无扩展名）
    name: 'SoraWriter',
    executableName: 'SoraWriter',
    // 包含额外文件
    extraResource: [
      './assets'
    ]
  },
  rebuildConfig: {},
  makers: [
    // Windows 安装包
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'SoraWriter',
        authors: '你的名字',
        description: '现代化的 Markdown 编辑器'
      },
    },
    // macOS 应用包
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    // Linux DEB 包
    {
      name: '@electron-forge/maker-deb',
      config: {
        name: 'sorawriter',
        productName: 'SoraWriter',
        genericName: 'Markdown Editor',
        description: '现代化的 Markdown 编辑器',
        categories: ['Office', 'TextEditor'],
        maintainer: '你的名字 <你的邮箱>',
        homepage: 'https://github.com/你的用户名/sorawriter'
      },
    },
    // Linux RPM 包
    {
      name: '@electron-forge/maker-rpm',
      config: {
        name: 'sorawriter',
        productName: 'SoraWriter',
        genericName: 'Markdown Editor',
        description: '现代化的 Markdown 编辑器',
        categories: ['Office', 'TextEditor'],
        maintainer: '你的名字 <你的邮箱>',
        homepage: 'https://github.com/你的用户名/sorawriter'
      },
    },
  ],
  // 其他配置...
};
```

### 2. 创建应用图标

需要为不同平台创建图标：

#### Windows (.ico)
- `assets/icon.ico` - Windows 图标文件

#### macOS (.icns)
- `assets/icon.icns` - macOS 图标文件

#### Linux (.png)
- `assets/icon.png` - Linux 图标文件（建议 512x512）

## 资源文件处理

由于你使用了外部 `assets` 目录，需要确保打包时包含这些文件：

### 方法1：修改 main.js 中的路径处理

```javascript
// 获取资源路径的函数
function getAssetsPath() {
  if (app.isPackaged) {
    // 生产环境：从 resources 目录读取
    return path.join(process.resourcesPath, 'assets');
  } else {
    // 开发环境：从项目目录读取
    return path.join(__dirname, '..', 'assets');
  }
}

// 更新 readWelcomeFile 函数
async function readWelcomeFile() {
  const assetsPath = getAssetsPath();
  // ... 其余代码不变
}
```

### 方法2：将 assets 复制到 app 目录

在打包前，可以将 assets 文件夹复制到 src 目录：

```bash
# Windows
xcopy /E /I assets src\assets

# macOS/Linux
cp -r assets src/assets
```

## 打包流程

### 1. 准备发布
```bash
# 安装依赖
npm install

# 检查代码
npm run lint

# 测试应用
npm run start
```

### 2. 创建不同平台的包

#### Windows
```bash
npm run make -- --platform=win32
```

#### macOS
```bash
npm run make -- --platform=darwin
```

#### Linux
```bash
npm run make -- --platform=linux
```

### 3. 输出文件

打包完成后，在 `out` 目录下会生成：

```
out/
├── make/
│   ├── squirrel.windows/   # Windows 安装包
│   ├── zip/               # macOS 应用包
│   ├── deb/               # Linux DEB 包
│   └── rpm/               # Linux RPM 包
└── SoraWriter-win32-x64/  # Windows 可执行文件
```

## 发布检查清单

### 打包前检查
- [ ] 更新版本号 (`package.json`)
- [ ] 完善应用信息和描述
- [ ] 准备应用图标文件
- [ ] 测试所有功能正常
- [ ] 确认资源文件路径正确
- [ ] 检查国际化文件完整

### 打包后检查
- [ ] 测试打包后的应用能正常启动
- [ ] 验证 welcome 文档能正确加载
- [ ] 测试文件操作功能
- [ ] 确认语言切换功能正常
- [ ] 检查应用图标和信息显示正确

## 自动化构建

可以创建 GitHub Actions 工作流来自动化构建：

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm install
    - run: npm run make
    - uses: actions/upload-artifact@v3
      with:
        name: ${{ matrix.os }}-build
        path: out/make/**/*
```

## 分发方式

### 1. GitHub Releases
- 创建 GitHub Release
- 上传构建的安装包
- 提供详细的发布说明

### 2. 自建下载页面
- 创建官网下载页面
- 提供不同平台的下载链接

### 3. 应用商店
- Microsoft Store (Windows)
- Mac App Store (macOS)  
- Snap Store (Linux)

这样你就可以成功打包和发布 SoraWriter 应用了！

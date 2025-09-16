const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// 保存当前窗口引用和语言设置
let mainWindow;
let currentLanguage = 'zh-CN';

// 导入语言包
const zhCN = require('./locales/zh-CN.js').default;
const enUS = require('./locales/en-US.js').default;

// 定义支持的语言
const locales = {
  'zh-CN': zhCN,
  'en-US': enUS
};

// 获取当前语言包
function getLocale() {
  return locales[currentLanguage];
}

// 获取翻译文本
function t(key) {
  const locale = getLocale();
  return locale[key] || key;
}

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

// 读取welcome文件
async function readWelcomeFile() {
  const assetsPath = getAssetsPath();
  
  // 根据当前语言选择对应的welcome文件
  const welcomeFileName = currentLanguage === 'en-US' ? 'welcome-en.md' : 'welcome.md';
  const welcomeFilePath = path.join(assetsPath, welcomeFileName);
  
  try {
    // 确保assets目录存在
    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
    }
    
    // 首先尝试读取已存在的welcome文件
    if (fs.existsSync(welcomeFilePath)) {
      const content = fs.readFileSync(welcomeFilePath, 'utf8');
      return content;
    }
    
    // 如果welcome.md文件不存在，创建一个默认的
    const defaultContent = currentLanguage === 'en-US' 
      ? `# Welcome to SoraWriter

Welcome to SoraWriter Markdown Editor!

## Getting Started

1. Click the "+" button in the sidebar to create a new file
2. Enter your Markdown content in the editor
3. View the rendered effect in the preview panel
4. Use Ctrl+S to save the file

Happy writing!`
      : `# 欢迎使用 SoraWriter

欢迎来到 SoraWriter Markdown 编辑器！

## 开始使用

1. 点击侧边栏的 "+" 按钮创建新文件
2. 在编辑器中输入您的 Markdown 内容  
3. 在预览面板中查看渲染效果
4. 使用 Ctrl+S 保存文件

祝您写作愉快！`;
    
    fs.writeFileSync(welcomeFilePath, defaultContent, 'utf8');
    return defaultContent;
  } catch (error) {
    console.error('读取welcome文件失败:', error);
    // 返回默认内容
    return currentLanguage === 'en-US' 
      ? `# Welcome to SoraWriter

Welcome to SoraWriter Markdown Editor!

## Getting Started

1. Click the "+" button in the sidebar to create a new file
2. Enter your Markdown content in the editor
3. View the rendered effect in the preview panel
4. Use Ctrl+S to save the file

Happy writing!`
      : `# 欢迎使用 SoraWriter

欢迎来到 SoraWriter Markdown 编辑器！

## 开始使用

1. 点击侧边栏的 "+" 按钮创建新文件
2. 在编辑器中输入您的 Markdown 内容  
3. 在预览面板中查看渲染效果
4. 使用 Ctrl+S 保存文件

祝您写作愉快！`;
  }
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // 隐藏默认标题栏
    titleBarStyle: 'hidden', // 隐藏标题栏但保留窗口控制按钮区域
    icon: path.join(getAssetsPath(), 'favicon.ico'),
    show: false, // 先不显示窗口，等内容加载完成后再显示
    backgroundColor: '#667eea', // 设置背景色与启动画面一致
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  // 等待页面准备完毕后再显示窗口
  mainWindow.once('ready-to-show', () => {
    // 直接显示窗口，不使用淡入动画（会与启动画面冲突）
    mainWindow.show();
    
    // 使窗口获得焦点
    if (process.platform === 'win32') {
      mainWindow.focus();
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools only in development mode
  // To enable DevTools, uncomment the line below or press F12
  // mainWindow.webContents.openDevTools();
  
  // 创建菜单
  createMenu();
};

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: t('menu_file'),
      submenu: [
        {
          label: t('menu_new_file'),
          accelerator: 'CmdOrCtrl+N',
          click() {
            mainWindow.webContents.send('new-file');
          }
        },
        {
          label: t('menu_open_file'),
          accelerator: 'CmdOrCtrl+O',
          click() {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Markdown Files', extensions: ['md'] },
                { name: 'Text Files', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                fs.readFile(filePath, 'utf8', (err, data) => {
                  if (!err) {
                    mainWindow.webContents.send('file-opened', { content: data, filePath });
                  }
                });
              }
            }).catch(err => {
              console.log(err);
            });
          }
        },
        {
          label: t('menu_save'),
          accelerator: 'CmdOrCtrl+S',
          click() {
            mainWindow.webContents.send('save-file');
          }
        },
        {
          label: t('menu_save_as'),
          accelerator: 'CmdOrCtrl+Shift+S',
          click() {
            mainWindow.webContents.send('save-file-as');
          }
        }
      ]
    },
    {
      label: t('menu_edit'),
      submenu: [
        { label: t('menu_undo'), role: 'undo' },
        { label: t('menu_redo'), role: 'redo' },
        { type: 'separator' },
        { label: t('menu_cut'), role: 'cut' },
        { label: t('menu_copy'), role: 'copy' },
        { label: t('menu_paste'), role: 'paste' },
        { label: t('menu_delete'), role: 'delete' },
        { label: t('menu_select_all'), role: 'selectall' }
      ]
    },
    {
      label: t('menu_view'),
      submenu: [
        { label: t('menu_reload'), role: 'reload' },
        { label: t('menu_force_reload'), role: 'forcereload' },
        { label: t('menu_toggle_dev_tools'), role: 'toggledevtools' },
        { type: 'separator' },
        { label: t('menu_reset_zoom'), role: 'resetzoom' },
        { label: t('menu_zoom_in'), role: 'zoomin' },
        { label: t('menu_zoom_out'), role: 'zoomout' },
        { type: 'separator' },
        { label: t('menu_toggle_fullscreen'), role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: t('menu_settings') || 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click() {
            if (mainWindow) mainWindow.webContents.send('open-settings');
          }
        }
      ]
    },
    {
      label: t('menu_window'),
      submenu: [
        { label: t('menu_minimize'), role: 'minimize' },
        { label: t('menu_close'), role: 'close' }
      ]
    },
    {
      label: t('menu_language'),
      submenu: [
        {
          label: '简体中文',
          type: 'radio',
          checked: currentLanguage === 'zh-CN',
          click() {
            changeLanguage('zh-CN');
          }
        },
        {
          label: 'English',
          type: 'radio',
          checked: currentLanguage === 'en-US',
          click() {
            changeLanguage('en-US');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 改变语言
function changeLanguage(language) {
  currentLanguage = language;
  createMenu(); // 重新创建菜单
  mainWindow.webContents.send('language-change', language);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  // 监听保存文件请求
  ipcMain.on('save-file-dialog', (event, filePath) => {
    if (filePath) {
      dialog.showSaveDialog(mainWindow, {
        defaultPath: filePath,
        filters: [
          { name: 'Markdown Files', extensions: ['md'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          event.reply('save-file-as-path', result.filePath);
        }
      });
    } else {
      dialog.showSaveDialog(mainWindow, {
        filters: [
          { name: 'Markdown Files', extensions: ['md'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          event.reply('save-file-as-path', result.filePath);
        }
      });
    }
  });

  // 保存文件对话框（带默认文件名）
  ipcMain.on('save-file-dialog-with-default-name', (event, defaultName) => {
    dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName,
      filters: [
        { name: 'Markdown Files', extensions: ['md'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    }).then(result => {
      if (!result.canceled) {
        event.reply('save-file-as-path', result.filePath);
      }
    });
  });
  
  // 监听新建文件请求
  ipcMain.on('create-new-file-dialog', (event) => {
    dialog.showSaveDialog(mainWindow, {
      title: 'Create New File', // 设置对话框标题为"新建文件"
      filters: [
        { name: 'Markdown Files', extensions: ['md'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    }).then(result => {
      if (!result.canceled) {
        event.reply('create-new-file-path', result.filePath);
      }
    });
  });
  
  // 监听保存文件内容请求
  ipcMain.on('save-file-content', (event, data) => {
    fs.writeFile(data.filePath, data.content, 'utf8', (err) => {
      if (err) {
        console.error(err);
      } else {
        event.reply('file-saved', data.filePath);
      }
    });
  });
  
  // 监听语言切换请求
  ipcMain.on('change-language', (event, language) => {
    changeLanguage(language);
  });
  
  // 添加读取welcome文件的处理器
  ipcMain.handle('read-welcome-file', async () => {
    return await readWelcomeFile();
  });
  
  // 添加重命名文件的处理器
  ipcMain.handle('rename-file', async (event, oldPath, newPath) => {
    try {
      await fs.promises.rename(oldPath, newPath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 窗口控制处理器
  ipcMain.handle('window-minimize', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle('window-close', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  // 应用启动完成事件
  ipcMain.on('app-ready', () => {
    // 可以在这里执行一些应用启动后的操作
    console.log('App is ready and fully loaded');
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
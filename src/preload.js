// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作相关
  onNewFile: (callback) => ipcRenderer.on('new-file', callback),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  onSaveFile: (callback) => ipcRenderer.on('save-file', callback),
  onSaveFileAs: (callback) => ipcRenderer.on('save-file-as', callback),
  onSaveFileAsPath: (callback) => ipcRenderer.on('save-file-as-path', callback),
  onFileSaved: (callback) => ipcRenderer.on('file-saved', callback),
  saveFileDialog: (filePath) => {
    return new Promise((resolve) => {
      // 发送请求到主进程
      ipcRenderer.send('save-file-dialog', filePath);
      
      // 监听返回结果
      ipcRenderer.once('save-file-as-path', (event, result) => {
        resolve({ filePath: result });
      });
    });
  },
  saveFileDialogWithDefaultName: (defaultName) => {
    return new Promise((resolve) => {
      // 发送请求到主进程，使用默认文件名
      ipcRenderer.send('save-file-dialog-with-default-name', defaultName);
      
      // 监听返回结果
      ipcRenderer.once('save-file-as-path', (event, result) => {
        resolve({ filePath: result });
      });
    });
  },
  createNewFileDialog: () => {
    return new Promise((resolve) => {
      // 发送请求到主进程，指定为新建文件模式
      ipcRenderer.send('create-new-file-dialog');
      
      // 监听返回结果
      ipcRenderer.once('create-new-file-path', (event, result) => {
        resolve({ filePath: result });
      });
    });
  },
  saveFileContent: (data) => ipcRenderer.send('save-file-content', data),
  
  // 语言相关
  onLanguageChange: (callback) => ipcRenderer.on('language-change', callback),
  changeLanguage: (language) => ipcRenderer.send('change-language', language),
  
  // 文件系统操作
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('rename-file', oldPath, newPath),
  
  // 读取welcome文件
  readWelcomeFile: () => ipcRenderer.invoke('read-welcome-file'),
  
  // 窗口控制
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // 应用启动状态
  appReady: () => ipcRenderer.send('app-ready'),
  
  // 设置页打开事件（主进程触发）
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  // 选择图片
  pickImage: () => ipcRenderer.invoke('pick-image'),
  imageToDataUrl: (filePath) => ipcRenderer.invoke('image-to-dataurl', filePath),
  
  // 工具方法
  basename: (path) => path.split(/[\/\\]/).pop(),
  dirname: (path) => path.substring(0, path.lastIndexOf(/[\/\\]/)),
  join: (...paths) => paths.join('/')
  ,
  // 打开外部链接（默认浏览器）
  openExternal: (url) => {
    try {
      const u = (url || '').trim();
      if (u && /^(https?:|mailto:|tel:)/i.test(u)) {
        const p = shell.openExternal(u);
        // 兼容 Promise/void
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } catch {}
  }
});
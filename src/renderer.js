/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of the security implications and understand the
 * trade-offs involved.
 */

// 导入图标
import { iconPng } from './icon-import.js';

// 启动画面管理
class SplashScreen {
  constructor() {
    this.splashElement = document.getElementById('splashScreen');
    this.isHidden = false;
  }

  hide() {
    if (this.isHidden || !this.splashElement) {
      console.log('启动画面已隐藏或不存在');
      return;
    }
    
    console.log('开始隐藏启动画面...');
    this.isHidden = true;
    this.splashElement.classList.add('fade-out');
    
    setTimeout(() => {
      if (this.splashElement) {
        this.splashElement.style.display = 'none';
        console.log('启动画面已完全隐藏');
      }
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
      console.log('应用内容已显示');
    }, 500); // 与CSS动画时间一致
  }

  show() {
    if (!this.splashElement) return;
    
    this.isHidden = false;
    this.splashElement.style.display = 'flex';
    this.splashElement.classList.remove('fade-out');
    document.body.classList.add('loading');
    document.body.classList.remove('loaded');
  }
}

// 创建启动画面实例
const splashScreen = new SplashScreen();

// 模拟应用加载完成
function initializeApp() {
  // 确保DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(async () => {
        await initializeAppContent();
      }, 800); // 最少显示800ms的启动画面
    });
  } else {
    setTimeout(async () => {
      await initializeAppContent();
    }, 800);
  }
}

async function initializeAppContent() {
  console.log('开始初始化应用内容...');
  try {
    // 初始化编辑器（包含大部分组件初始化）
    console.log('正在初始化编辑器...');
    await initEditor();
    console.log('编辑器初始化完成');
    
    // 隐藏启动画面
    console.log('隐藏启动画面...');
    splashScreen.hide();
    
    // 通知主进程应用已准备好
    if (window.electronAPI && window.electronAPI.appReady) {
      console.log('通知主进程应用已准备好');
      window.electronAPI.appReady();
    }
    console.log('应用初始化完成！');
  } catch (error) {
    console.error('应用初始化失败:', error);
    // 即使初始化失败，也要隐藏启动画面
    splashScreen.hide();
  }
}

// 开始初始化
initializeApp();

// 初始化自定义标题栏
function initCustomTitlebar() {
  const minimizeBtn = document.getElementById('minimizeBtn');
  const maximizeBtn = document.getElementById('maximizeBtn');
  const closeBtn = document.getElementById('closeBtn');
  const titlebarFileName = document.getElementById('titlebarFileName');
  const titlebarDragRegion = document.querySelector('.titlebar-drag-region');

  // 设置应用图标
  const appIcon = document.querySelector('.app-icon');
  if (appIcon && appIcon.tagName === 'IMG') {
    appIcon.src = iconPng;
  }

  // 最小化窗口
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      window.electronAPI.windowMinimize();
    });
    minimizeBtn.title = t('minimize_window') || '最小化';
  }

  // 最大化/还原窗口
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', async () => {
      await window.electronAPI.windowMaximize();
      updateMaximizeButton();
    });
  }

  // 关闭窗口
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.electronAPI.windowClose();
    });
    closeBtn.title = t('close_window') || '关闭';
  }

  // 双击标题栏最大化/还原
  if (titlebarDragRegion) {
    titlebarDragRegion.addEventListener('dblclick', async () => {
      await window.electronAPI.windowMaximize();
      updateMaximizeButton();
    });
  }

  // 更新最大化按钮图标
  async function updateMaximizeButton() {
    const isMaximized = await window.electronAPI.windowIsMaximized();
    const svg = maximizeBtn.querySelector('svg');
    
    if (isMaximized) {
      // 还原图标
      svg.innerHTML = `
        <rect x="2" y="3" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/>
        <rect x="4" y="1" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/>
      `;
      maximizeBtn.title = t('restore_window') || '还原';
    } else {
      // 最大化图标
      svg.innerHTML = `
        <rect x="2" y="2" width="8" height="8" stroke="currentColor" stroke-width="1" fill="none"/>
      `;
      maximizeBtn.title = t('maximize_window') || '最大化';
    }
  }

  // 初始更新最大化按钮状态
  updateMaximizeButton();

  // 更新标题栏文件名显示
  function updateTitlebarFileName(fileName) {
    if (titlebarFileName) {
      titlebarFileName.textContent = fileName || '';
    }
  }

  // 返回更新函数供外部调用
  return {
    updateFileName: updateTitlebarFileName,
    updateMaximizeButton: updateMaximizeButton
  };
}

// 显示文件名输入对话框
function getDefaultExt() {
  const ext = (window.__soraDefaultExt__ || '.md').trim();
  return ext.startsWith('.') ? ext : `.${ext}`;
}

function showFileNameDialog(callback, defaultValue = 'new-file') {
  // 创建模态对话框
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${t('enter_filename') || '请输入文件名:'}</h3>
      <input type="text" id="filenameInput" value="${defaultValue}${getDefaultExt()}" />
      <div class="modal-buttons">
        <button id="confirmBtn">${t('confirm') || '确定'}</button>
        <button id="cancelBtn">${t('cancel') || '取消'}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const input = document.getElementById('filenameInput');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  
  // 自动选中文件名部分（不包括 .md 扩展名）
  const filename = input.value;
  const ext = getDefaultExt();
  if (filename.endsWith(ext)) {
    input.setSelectionRange(0, filename.length - ext.length);
  } else {
    input.select();
  }
  input.focus();
  
  // 确定按钮事件
  confirmBtn.addEventListener('click', () => {
    const value = input.value.trim();
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
    if (value) {
      callback(value);
    }
  });
  
  // 取消按钮事件
  cancelBtn.addEventListener('click', () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  });
  
  // 回车键确认
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const value = input.value.trim();
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
      if (value) {
        callback(value);
      }
    }
  });
  
  // ESC 键取消
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }
  });
}

import './index.css';
import { t, setLocale } from './utils/i18n.js';
import { marked } from 'marked';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

// 当前打开的文件
let currentFile = 'welcome.md';
let currentFilePath = null;
let isFileSaved = true;
let files = {};

// 文件状态跟踪
let fileStates = {};

// DOM 元素
const editor = document.getElementById('editor');
const fileList = document.getElementById('fileList');
const newFileBtn = document.getElementById('newFileBtn');
const outlineList = document.getElementById('outlineList');
const currentFileName = document.getElementById('currentFileName');
const unsavedIndicator = document.getElementById('unsavedIndicator');
const filesTitle = document.getElementById('filesTitle');
const outlineTitle = document.getElementById('outlineTitle');
const sidebar = document.querySelector('.sidebar');
const leftResizer = document.getElementById('leftResizer');
const panelResizer = document.getElementById('panelResizer');
const container = document.querySelector('.container');

// 预览相关元素
const previewPanel = document.getElementById('previewPanel');
const preview = document.getElementById('preview');
const splitViewBtn = document.getElementById('splitViewBtn');
const editViewBtn = document.getElementById('editViewBtn');
const previewViewBtn = document.getElementById('previewViewBtn');
const editorResizer = document.getElementById('editorResizer');
const mainEditor = document.querySelector('.main-editor');
const editorPanel = document.querySelector('.editor-panel');

// 拖拽调整相关变量
let isResizing = false;
let isPanelResizing = false;
let isEditorResizing = false;
let currentResizer = null;
let startX = 0;
let startY = 0;
let sidebarWidth = 0;
let topPanelHeight = 0;
let editorWidth = 0;

// 预览模式
let currentViewMode = 'split'; // 'split', 'edit', 'preview'

// 自定义标题栏控制器
let titlebarController = null;
// 主题监听器
let _systemThemeMedia = null;
const THEME_KEY = 'sora.theme';

function applyTheme(preference) {
  const pref = preference || localStorage.getItem(THEME_KEY) || 'system';
  // 清理旧监听
  if (_systemThemeMedia) {
    _systemThemeMedia.onchange = null;
    _systemThemeMedia = null;
  }
  if (pref === 'system') {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const setByMedia = () => {
      document.body.dataset.theme = media.matches ? 'dark' : 'light';
    };
    setByMedia();
    media.onchange = setByMedia;
    _systemThemeMedia = media;
  } else if (pref === 'dark' || pref === 'light') {
    document.body.dataset.theme = pref;
  }
  try { localStorage.setItem(THEME_KEY, pref); } catch {}
}

// 初始化编辑器
async function initEditor() {
  // 初始化自定义标题栏
  titlebarController = initCustomTitlebar();
  
  // 加载welcome文件
  try {
    const welcomeContent = await window.electronAPI.readWelcomeFile();
    files['welcome.md'] = welcomeContent;
    fileStates['welcome.md'] = {
      savedContent: welcomeContent,
      filePath: null,
      isDirty: false
    };
  } catch (error) {
    console.error('加载welcome文件失败:', error);
    // 使用fallback内容
    const fallbackContent = `# ${t('welcome_title') || '欢迎使用 SoraWriter'}

${t('welcome_content') || '欢迎来到 SoraWriter Markdown 编辑器！开始您的写作之旅吧！'}`;
    files['welcome.md'] = fallbackContent;
    fileStates['welcome.md'] = {
      savedContent: fallbackContent,
      filePath: null,
      isDirty: false
    };
  }
  
  // 设置初始内容
  editor.value = files[currentFile];
  
  // 添加事件监听器
  editor.addEventListener('input', handleEditorInput);
  editor.addEventListener('scroll', handleEditorScroll);
  newFileBtn.addEventListener('click', createNewFile);
  
  // 初始化预览模式按钮
  initPreviewModeButtons();
  
  // 更新文件列表
  updateFileList();
  
  // 生成大纲和预览
  generateOutline();
  updatePreview();
  
  // 初始化拖拽调整功能
  initResizers();
  
  // 设置窗口标题
  updateWindowTitle();
  
  // 更新界面语言
  updateUILanguage();

  // 初始化设置 UI
  initSettingsUI();

  // 应用主题（跟随系统/持久化）
  applyTheme();
}

// 处理编辑器输入
function handleEditorInput() {
  // 保存当前内容
  files[currentFile] = editor.value;

  // 检查当前文件是否有未保存的更改
  isFileSaved = !isFileDirty(currentFile);
  
  // 更新文件修改时间
  if (fileStates[currentFile]) {
    fileStates[currentFile].lastModified = Date.now();
  }

  // 生成新的大纲和预览
  generateOutline();
  if (window.__soraLivePreview__ !== false) {
    updatePreview();
  }

  updateUnsavedIndicator();
  updateWindowTitle();
  updateFileList(); // 更新文件列表以显示/隐藏 *
}

// 处理编辑器滚动 - 双屏模式下预览窗口同步滚动
function handleEditorScroll() {
  // 只在分屏模式下进行滚动同步
  if (currentViewMode !== 'split' || !preview) return;
  
  const editorScrollTop = editor.scrollTop;
  const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
  const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
  
  // 计算滚动比例
  const scrollRatio = editorScrollHeight > 0 ? editorScrollTop / editorScrollHeight : 0;
  
  // 同步预览窗口滚动
  if (previewScrollHeight > 0) {
    preview.scrollTop = scrollRatio * previewScrollHeight;
  }
}

// 更新未保存指示器
function updateUnsavedIndicator() {
  if (!unsavedIndicator) return;
  
  if (isFileSaved) {
    unsavedIndicator.classList.add('hidden');
  } else {
    unsavedIndicator.classList.remove('hidden');
  }
}

// 更新窗口标题
function updateWindowTitle() {
  if (!currentFileName) return;
  
  if (currentFile) {
    const fileName = currentFilePath ? window.electronAPI.basename(currentFilePath) : currentFile;
    const unsavedMark = isFileSaved ? '' : ` ${t('unsaved_indicator')}`;
    document.title = `${fileName}${unsavedMark} - SoraWriter`;
    
    // 更新当前文件名显示
    currentFileName.textContent = fileName;
    
    // 更新自定义标题栏中的文件名
    if (titlebarController && titlebarController.updateFileName) {
      titlebarController.updateFileName(`${fileName}${unsavedMark}`);
    }
  } else {
    // 没有打开的文件
    document.title = 'SoraWriter';
    currentFileName.textContent = t('no_file_open') || '无打开文件';
    
    // 更新自定义标题栏
    if (titlebarController && titlebarController.updateFileName) {
      titlebarController.updateFileName('');
    }
  }
}

// 更新界面语言
function updateUILanguage() {
  // 更新标题
  if (filesTitle) filesTitle.textContent = t('files');
  if (outlineTitle) outlineTitle.textContent = t('table_of_contents'); // 使用翻译文本
  
  // 更新文件列表中的文件项
  const fileItems = document.querySelectorAll('.file-item');
  fileItems.forEach(item => {
    if (item.dataset.file === 'welcome.md') {
      item.textContent = 'welcome.md';
    }
  });
  
  // 更新编辑器占位符
  if (editor) editor.placeholder = t('start_writing');
  
  // 更新按钮文字
  if (newFileBtn) newFileBtn.textContent = t('new_file_btn');
  
  // 更新自定义标题栏按钮提示
  const minimizeBtn = document.getElementById('minimizeBtn');
  const maximizeBtn = document.getElementById('maximizeBtn');
  const closeBtn = document.getElementById('closeBtn');
  
  if (minimizeBtn) minimizeBtn.title = t('minimize_window') || '最小化';
  if (closeBtn) closeBtn.title = t('close_window') || '关闭';
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) settingsBtn.title = t('settings') || '设置';
  
  // 最大化按钮的标题需要根据当前状态更新
  if (maximizeBtn && titlebarController && titlebarController.updateMaximizeButton) {
    titlebarController.updateMaximizeButton();
  }
}

// 更新文件列表
function updateFileList() {
  fileList.innerHTML = '';
  
  Object.keys(files).forEach(filename => {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.dataset.file = filename;
    
    // 创建文件信息容器
    const fileInfoContainer = document.createElement('div');
    fileInfoContainer.className = 'file-info';
    
    // 创建文件名容器
    const fileNameSpan = document.createElement('div');
    fileNameSpan.className = 'file-name';
    
    // 检查文件是否有未保存的更改
    const isDirty = isFileDirty(filename);
    const displayName = isDirty ? `${filename} *` : filename;
    fileNameSpan.textContent = displayName;
    
    // 创建文件详情容器
    const fileDetailsSpan = document.createElement('div');
    fileDetailsSpan.className = 'file-details';
    
    // 获取文件信息
    const fileState = fileStates[filename];
    const fileContent = files[filename] || '';
    const fileSize = new Blob([fileContent]).size;
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return `${bytes} ${t('file_size_bytes') || 'bytes'}`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${t('file_size_kb') || 'KB'}`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} ${t('file_size_mb') || 'MB'}`;
    };
    
    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return t('just_now') || 'Just now';
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return t('just_now') || 'Just now';
      if (diffMins < 60) return `${diffMins}分钟前`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`;
      
      // 超过一天显示日期
      return date.toLocaleDateString();
    };
    
    const modifiedTime = fileState?.lastModified || Date.now();
    fileDetailsSpan.innerHTML = `${formatFileSize(fileSize)} • ${formatTime(modifiedTime)}`;
    
    fileInfoContainer.appendChild(fileNameSpan);
    fileInfoContainer.appendChild(fileDetailsSpan);
    
    // 创建删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-file-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = t('delete_file') || '删除文件';
    
    // 创建重命名按钮
    const renameBtn = document.createElement('button');
    renameBtn.className = 'rename-file-btn';
    renameBtn.innerHTML = '✏';
    renameBtn.title = t('rename_file') || '重命名文件';
    
    // 创建按钮容器
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'file-buttons';
    buttonsContainer.appendChild(renameBtn);
    buttonsContainer.appendChild(deleteBtn);
    
    li.appendChild(fileInfoContainer);
    li.appendChild(buttonsContainer);
    
    if (filename === currentFile) {
      li.classList.add('active');
    }
    
    // 点击文件信息切换文件
    fileInfoContainer.addEventListener('click', () => {
      switchToFile(filename);
    });
    
    // 点击删除按钮
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止触发文件切换
      deleteFile(filename);
    });
    
    // 点击重命名按钮
    renameBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止触发文件切换
      renameFile(filename);
    });
    
    fileList.appendChild(li);
  });
}

// 检查文件是否有未保存的更改
function isFileDirty(filename) {
  if (!fileStates[filename]) {
    return false;
  }
  
  const currentContent = files[filename] || '';
  const savedContent = fileStates[filename].savedContent || '';
  
  return currentContent !== savedContent;
}

// 切换到指定文件
function switchToFile(filename) {
  // 保存当前文件的编辑状态
  if (currentFile && files[currentFile] !== undefined) {
    files[currentFile] = editor.value;
  }
  
  // 切换到新文件
  currentFile = filename;
  editor.value = files[filename] || '';
  
  // 更新当前文件路径和保存状态
  currentFilePath = fileStates[filename]?.filePath || null;
  isFileSaved = !isFileDirty(filename);
  
  updateFileList();
  generateOutline();
  updatePreview(); // 更新预览
  
  // 强制触发编辑器滚动事件，确保预览窗口同步
  if (currentViewMode === 'split') {
    handleEditorScroll();
  }
  
  updateWindowTitle();
  updateUnsavedIndicator();
}

// 删除文件
function deleteFile(filename) {
  const message = filename === currentFile && isFileDirty(filename) 
    ? `${t('delete_unsaved_file_warning') || '此文件有未保存的更改，确定要删除吗？'}\n\n${t('unsaved_changes_lost') || '未保存的更改将会丢失。'}`
    : `${t('confirm_delete_file') || '确定要删除文件'} "${filename}" ${t('question_mark') || '吗？'}`;
  
  showCustomConfirm(message, (confirmed) => {
    if (!confirmed) return;
    
    // 删除文件和文件状态
    delete files[filename];
    delete fileStates[filename];
    
    // 如果删除的是当前文件，切换到其他文件
    if (filename === currentFile) {
      const remainingFiles = Object.keys(files);
      if (remainingFiles.length > 0) {
        // 切换到第一个剩余文件
        currentFile = remainingFiles[0];
        editor.value = files[currentFile];
        isFileSaved = !isFileDirty(currentFile);
        // 更新当前文件路径
        currentFilePath = fileStates[currentFile]?.filePath || null;
      } else {
        // 没有剩余文件，创建一个空的编辑状态
        currentFile = null;
        currentFilePath = null;
        editor.value = '';
        isFileSaved = true;
      }
    }
    
    updateFileList();
    generateOutline();
    updateWindowTitle();
    updateUnsavedIndicator();
  });
}

// 创建新文件
function createNewFile() {
  showFileNameDialog((filename) => {
    if (filename && filename.trim()) {
      let finalFilename = filename.trim();
      const ext = getDefaultExt();
      if (!finalFilename.toLowerCase().endsWith(ext.toLowerCase())) {
        finalFilename += ext;
      }
      
      // 检查文件名是否已存在，如果存在则添加数字后缀
      let uniqueFilename = finalFilename;
      let counter = 1;
      while (files[uniqueFilename]) {
        const idx = finalFilename.toLowerCase().lastIndexOf(ext.toLowerCase());
        const nameWithoutExt = idx > -1 ? finalFilename.slice(0, idx) : finalFilename;
        uniqueFilename = `${nameWithoutExt}-${counter}${ext}`;
        counter++;
      }
      
      // 创建新文件
      files[uniqueFilename] = '';
      
      // 初始化文件状态
      fileStates[uniqueFilename] = {
        savedContent: '', // 新文件的保存内容为空
        filePath: null,   // 还没有保存到磁盘
        isDirty: false,   // 空文件不算脏
        lastModified: Date.now() // 添加创建时间
      };
      
      currentFile = uniqueFilename;
      currentFilePath = null;
      isFileSaved = true; // 空文件认为是已保存状态
      
      editor.value = files[uniqueFilename];
      updateFileList();
      generateOutline();
      updateWindowTitle();
      updateUnsavedIndicator();
      
      // 聚焦到编辑器
      editor.focus();
      
      // 提示用户保存文件
      setTimeout(() => {
        const message = `${t('new_file_created') || '新文件已创建'}: ${uniqueFilename}\n\n${t('save_file_now') || '是否现在保存到磁盘？'}\n\n${t('save_reminder') || '如果不保存，文件只会存在于内存中，关闭应用后将丢失。'}`;
        showCustomConfirm(message, (shouldSave) => {
          if (shouldSave) {
            // 保存新文件，使用用户输入的文件名作为默认名称
            saveFileWithDefaultName(uniqueFilename);
          }
        });
      }, 500);
    }
  });
}

// 打开文件
function openFile(content, filePath) {
  const fileName = window.electronAPI.basename(filePath);
  currentFile = fileName;
  currentFilePath = filePath;
  files[currentFile] = content;
  
  // 初始化或更新文件状态
  fileStates[currentFile] = {
    savedContent: content, // 从磁盘读取的内容就是已保存的内容
    filePath: filePath,
    isDirty: false
  };
  
  editor.value = content;
  isFileSaved = true;
  updateFileList();
  generateOutline();
  updateWindowTitle();
  updateUnsavedIndicator();
}

// 保存文件
function saveFile() {
  if (currentFilePath) {
    // 保存到已知路径
    window.electronAPI.saveFileContent({
      filePath: currentFilePath,
      content: editor.value
    });
  } else {
    // 另存为
    window.electronAPI.saveFileDialog();
  }
}

// 保存文件并指定默认文件名
function saveFileWithDefaultName(defaultName) {
  if (currentFilePath) {
    // 保存到已知路径
    window.electronAPI.saveFileContent({
      filePath: currentFilePath,
      content: editor.value
    });
  } else {
    // 另存为，使用指定的默认文件名
    window.electronAPI.saveFileDialogWithDefaultName(defaultName);
  }
}

// 生成大纲
function generateOutline() {
  // 清空大纲
  outlineList.innerHTML = '';
  
  const content = editor.value;
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      
      const li = document.createElement('li');
      li.className = `outline-h${level}`;
      li.textContent = text;
      
      // 点击跳转到对应标题位置
      li.addEventListener('click', () => {
        // 查找精确匹配的标题行
        const lines = editor.value.split('\n');
        let targetLine = -1;
        
        // 精确匹配标题行（包括#号）
        const targetPattern = new RegExp(`^#{${level}}\\s+${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
        
        for (let i = 0; i < lines.length; i++) {
          if (targetPattern.test(lines[i])) {
            targetLine = i;
            break;
          }
        }
        
        if (targetLine !== -1) {
          // 计算目标字符位置
          const position = lines.slice(0, targetLine).join('\n').length + (targetLine > 0 ? 1 : 0);
          
          // 设置光标位置到标题行开始
          editor.setSelectionRange(position, position);
          editor.focus();
          
          // 使用scrollIntoView让标题滚动到视口顶部
          // 由于textarea没有scrollIntoView，我们需要手动计算
          const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
          const paddingTop = parseFloat(getComputedStyle(editor).paddingTop) || 0;
          
          // 将目标行滚动到编辑器顶部（留少量边距）
          const targetScrollTop = targetLine * lineHeight - paddingTop;
          editor.scrollTop = Math.max(0, targetScrollTop);
          
          // 如果在双屏模式下，同步预览窗口滚动
          if (currentViewMode === 'split') {
            handleEditorScroll();
          }
        }
      });
      
      outlineList.appendChild(li);
    }
  });
}

// 强制重新显示编辑器分隔条
function ensureEditorResizerVisible() {
  const resizer = document.getElementById('editorResizer');
  if (resizer && currentViewMode === 'split') {
    // 强制重新应用样式
    resizer.style.display = 'block';
    resizer.style.width = '5px';
    resizer.style.flexShrink = '0';
    resizer.style.zIndex = '10';
  }
}

// 初始化拖拽调整功能
function initResizers() {
  const filePanel = document.querySelector('.sidebar-panel:first-child');
  const outlinePanel = document.querySelector('.sidebar-panel:last-child');
  
  // 左侧拖拽条事件
  if (leftResizer) {
    leftResizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      currentResizer = leftResizer;
      startX = e.clientX;
      sidebarWidth = sidebar.offsetWidth;
      document.body.style.cursor = 'default'; // 使用默认鼠标样式以应用自定义主题
      container.classList.add('resizing');
      e.preventDefault();
    });
  }
  
  // 面板分隔条事件
  if (panelResizer) {
    panelResizer.addEventListener('mousedown', (e) => {
      isPanelResizing = true;
      startY = e.clientY;
      topPanelHeight = filePanel.offsetHeight;
      document.body.style.cursor = 'default'; // 使用默认鼠标样式以应用自定义主题
      e.preventDefault();
    });
  }
  
  // 编辑器分隔条事件
  if (editorResizer) {
    editorResizer.addEventListener('mousedown', (e) => {
      isEditorResizing = true;
      startX = e.clientX;
      editorWidth = editorPanel.offsetWidth;
      document.body.style.cursor = 'default'; // 使用默认鼠标样式以应用自定义主题
      e.preventDefault();
    });
  }
  
  // 鼠标移动事件
  document.addEventListener('mousemove', (e) => {
    if (isResizing && currentResizer === leftResizer) {
      // 调整左侧栏宽度
      const offset = e.clientX - startX;
      const newWidth = sidebarWidth + offset;
      if (newWidth >= 150 && newWidth <= 500) {
        sidebar.style.width = `${newWidth}px`;
      }
    } else if (isPanelResizing) {
      // 调整面板高度
      const offset = e.clientY - startY;
      const newHeight = topPanelHeight + offset;
      const sidebarHeight = sidebar.offsetHeight;
      if (newHeight >= 100 && newHeight <= sidebarHeight - 100) {
        filePanel.style.height = `${newHeight}px`;
        outlinePanel.style.height = `${sidebarHeight - newHeight - 5}px`; // 减去分隔条高度
      }
    } else if (isEditorResizing && currentViewMode === 'split') {
      // 调整编辑器和预览面板宽度
      const offset = e.clientX - startX;
      const newWidth = editorWidth + offset;
      const containerWidth = mainEditor.querySelector('.editor-content').offsetWidth;
      const minWidth = 200;
      const maxWidth = containerWidth - minWidth - 5; // 减去分隔条宽度
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        editorPanel.style.width = `${newWidth}px`;
        editorPanel.style.flex = 'none';
        previewPanel.style.width = `${containerWidth - newWidth - 5}px`;
        previewPanel.style.flex = 'none';
      }
    }
  });
  
  // 鼠标释放事件
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      container.classList.remove('resizing');
      currentResizer = null;
      // 确保编辑器分隔条在拖拽结束后仍然可见
      ensureEditorResizerVisible();
    }
    if (isPanelResizing) {
      isPanelResizing = false;
      document.body.style.cursor = '';
      // 确保编辑器分隔条在拖拽结束后仍然可见
      ensureEditorResizerVisible();
    }
    if (isEditorResizing) {
      isEditorResizing = false;
      document.body.style.cursor = '';
      // 确保编辑器分隔条在拖拽结束后仍然可见
      ensureEditorResizerVisible();
    }
  });
}

// 初始化预览模式按钮
function initPreviewModeButtons() {
  // 确保所有DOM元素都存在
  const splitBtn = document.getElementById('splitViewBtn');
  const editBtn = document.getElementById('editViewBtn');
  const previewBtn = document.getElementById('previewViewBtn');
  const mainEd = document.querySelector('.main-editor');
  
  if (!splitBtn || !editBtn || !previewBtn || !mainEd) {
    console.error('预览模式按钮或主编辑器元素未找到');
    return;
  }
  
  splitBtn.addEventListener('click', () => {
    console.log('切换到分屏模式');
    setViewMode('split');
  });
  
  editBtn.addEventListener('click', () => {
    console.log('切换到编辑模式');
    setViewMode('edit');
  });
  
  previewBtn.addEventListener('click', () => {
    console.log('切换到预览模式');
    setViewMode('preview');
  });
  
  // 设置初始模式
  setViewMode('split');
}

// 设置预览模式
function setViewMode(mode) {
  currentViewMode = mode;
  const mainEd = document.querySelector('.main-editor');
  
  if (!mainEd) {
    console.error('主编辑器元素未找到');
    return;
  }
  
  console.log('设置预览模式:', mode);
  
  // 清除编辑器和预览面板的内联样式，以便CSS能正确应用
  if (editorPanel) {
    editorPanel.style.width = '';
    editorPanel.style.flex = '';
  }
  if (previewPanel) {
    previewPanel.style.width = '';
    previewPanel.style.flex = '';
  }
  
  // 更新按钮状态
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  
  // 更新主编辑器类名
  mainEd.className = `main-editor ${mode}-mode`;
  
  const splitBtn = document.getElementById('splitViewBtn');
  const editBtn = document.getElementById('editViewBtn');
  const previewBtn = document.getElementById('previewViewBtn');
  
  switch (mode) {
    case 'split':
      if (splitBtn) splitBtn.classList.add('active');
      break;
    case 'edit':
      if (editBtn) editBtn.classList.add('active');
      break;
    case 'preview':
      if (previewBtn) previewBtn.classList.add('active');
      break;
  }
  
  // 在预览模式下更新预览内容
  if (mode === 'preview' || mode === 'split') {
    updatePreview();
  }
  
  // 在分屏模式下确保分隔条可见
  if (mode === 'split') {
    // 延迟执行以确保DOM已更新
    setTimeout(() => {
      ensureEditorResizerVisible();
    }, 10);
  }
}

// 更新Markdown预览
function updatePreview() {
  if (!preview) return;
  
  const content = editor.value || '';
  const html = marked(content);
  preview.innerHTML = html;
}

// ========== 设置抽屉 ==========
let settingsOverlay = null;

function initSettingsUI() {
  // 快捷键：Ctrl+, 打开设置
  document.addEventListener('keydown', (e) => {
    const isCtrlComma = (e.ctrlKey || e.metaKey) && e.key === ',';
    if (isCtrlComma) {
      e.preventDefault();
      openSettings();
    }
  });

  // 菜单触发（由主进程发送）
  if (window.electronAPI && window.electronAPI.onOpenSettings) {
    window.electronAPI.onOpenSettings(() => openSettings());
  }

  // 标题栏按钮
  const btn = document.getElementById('settingsBtn');
  if (btn) {
    btn.addEventListener('click', openSettings);
  }
}

function openSettings() {
  if (!settingsOverlay) {
    settingsOverlay = createSettingsOverlay();
    document.body.appendChild(settingsOverlay);
  }
  settingsOverlay.classList.add('open');
  activateSettingsTab('general');
  // 同步选择框为当前主题偏好
  const themeSel = settingsOverlay.querySelector('#settingTheme');
  if (themeSel) {
    const pref = localStorage.getItem(THEME_KEY) || 'system';
    themeSel.value = pref;
  }
}

function closeSettings() {
  if (settingsOverlay) settingsOverlay.classList.remove('open');
}

function createSettingsOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'settings-overlay';
  overlay.innerHTML = `
    <div class="settings-backdrop"></div>
    <aside class="settings-drawer" role="dialog" aria-modal="true" aria-label="${t('settings') || '设置'}">
      <header class="settings-header">
        <h2 class="settings-title">${t('settings') || '设置'}</h2>
        <button class="settings-close-btn" id="closeSettingsBtn" aria-label="${t('close') || '关闭'}">×</button>
      </header>
      <div class="settings-body">
        <nav class="settings-tabs" aria-label="${t('categories') || '分类'}">
          <button class="settings-tab" data-tab="general">${t('general') || '通用'}</button>
          <button class="settings-tab" data-tab="editor">${t('editor') || '编辑器'}</button>
          <button class="settings-tab" data-tab="preview">${t('preview') || '预览'}</button>
          <button class="settings-tab" data-tab="appearance">${t('appearance') || '外观'}</button>
          <button class="settings-tab" data-tab="files">${t('files') || '文件'}</button>
          <button class="settings-tab" data-tab="shortcuts">${t('shortcuts') || '快捷键'}</button>
        </nav>
        <section class="settings-content">
          <div class="settings-page" data-page="general">
            <h3>${t('general') || '通用'}</h3>
            <label class="setting-item">
              <span>${t('language') || '语言'}</span>
              <select id="settingLanguage">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </label>
            <label class="setting-item">
              <span>${t('auto_save') || '自动保存'}</span>
              <input type="checkbox" id="settingAutoSave" />
            </label>
          </div>

          <div class="settings-page" data-page="editor">
            <h3>${t('editor') || '编辑器'}</h3>
            <label class="setting-item">
              <span>${t('font_size') || '字号'}</span>
              <input type="number" id="settingEditorFontSize" min="10" max="28" step="1" value="14" />
            </label>
            <label class="setting-item">
              <span>${t('line_wrap') || '自动换行'}</span>
              <input type="checkbox" id="settingLineWrap" checked />
            </label>
          </div>

          <div class="settings-page" data-page="preview">
            <h3>${t('preview') || '预览'}</h3>
            <label class="setting-item">
              <span>${t('live_preview') || '实时预览'}</span>
              <input type="checkbox" id="settingLivePreview" checked />
            </label>
          </div>

          <div class="settings-page" data-page="appearance">
            <h3>${t('appearance') || '外观'}</h3>
            <label class="setting-item">
              <span>${t('theme') || '主题'}</span>
              <select id="settingTheme">
                <option value="system">${t('follow_system') || '跟随系统'}</option>
                <option value="light">${t('light') || '浅色'}</option>
                <option value="dark">${t('dark') || '深色'}</option>
              </select>
            </label>
          </div>

          <div class="settings-page" data-page="files">
            <h3>${t('files') || '文件'}</h3>
            <label class="setting-item">
              <span>${t('default_save_ext') || '默认扩展名'}</span>
              <input type="text" id="settingDefaultExt" value=".md" />
            </label>
          </div>

          <div class="settings-page" data-page="shortcuts">
            <h3>${t('shortcuts') || '快捷键'}</h3>
            <p class="setting-hint">${t('shortcuts_hint') || '在此查看或自定义常用快捷键（后续可扩展）。'}</p>
          </div>
        </section>
      </div>
      <footer class="settings-footer">
        <button class="btn-secondary" id="settingsCancelBtn">${t('cancel') || '取消'}</button>
        <button class="btn-primary" id="settingsSaveBtn">${t('save') || '保存'}</button>
      </footer>
    </aside>
  `;

  // 关闭逻辑
  const closeBtn = overlay.querySelector('#closeSettingsBtn');
  const cancelBtn = overlay.querySelector('#settingsCancelBtn');
  const saveBtn = overlay.querySelector('#settingsSaveBtn');
  const backdrop = overlay.querySelector('.settings-backdrop');

  const closeAll = () => closeSettings();
  closeBtn.addEventListener('click', closeAll);
  cancelBtn.addEventListener('click', closeAll);
  backdrop.addEventListener('click', closeAll);
  document.addEventListener('keydown', function escHandler(e) {
    if (overlay.classList.contains('open') && e.key === 'Escape') {
      e.preventDefault();
      closeAll();
    }
  });

  // 标签切换
  overlay.querySelectorAll('.settings-tab').forEach(btn => {
    btn.addEventListener('click', () => activateSettingsTab(btn.dataset.tab));
  });

  // 保存设置
  saveBtn.addEventListener('click', () => {
    const lang = overlay.querySelector('#settingLanguage')?.value;
    const autoSave = overlay.querySelector('#settingAutoSave')?.checked;
    const fontSize = parseInt(overlay.querySelector('#settingEditorFontSize')?.value || '14', 10);
    const lineWrap = overlay.querySelector('#settingLineWrap')?.checked;
    const livePreview = overlay.querySelector('#settingLivePreview')?.checked;
  const theme = overlay.querySelector('#settingTheme')?.value;
    const defaultExt = overlay.querySelector('#settingDefaultExt')?.value || '.md';

    try {
      if (lang) {
        setLocale(lang);
        if (window.electronAPI && window.electronAPI.changeLanguage) {
          window.electronAPI.changeLanguage(lang);
        }
      }
      if (editor) {
        editor.style.fontSize = `${fontSize}px`;
        editor.wrap = lineWrap ? 'soft' : 'off';
      }
  window.__soraLivePreview__ = livePreview !== false;
  applyTheme(theme || 'system');
      window.__soraDefaultExt__ = defaultExt.startsWith('.') ? defaultExt : `.${defaultExt}`;

      updateUILanguage();
      updatePreview();

      showCustomAlert(t('settings_saved') || '设置已保存');
      closeAll();
    } catch (e) {
      console.error('保存设置失败:', e);
      showCustomAlert(t('settings_save_failed') || '保存设置失败');
    }
  });

  return overlay;
}

function activateSettingsTab(tabName) {
  if (!settingsOverlay) return;
  settingsOverlay.querySelectorAll('.settings-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  settingsOverlay.querySelectorAll('.settings-page').forEach(p => {
    p.classList.toggle('active', p.dataset.page === tabName);
  });
}

// 显示自定义确认对话框
function showCustomConfirm(message, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${t('confirm') || '确认'}</h3>
      <p class="modal-message">${message}</p>
      <div class="modal-buttons">
        <button id="confirmBtn">${t('confirm') || '确定'}</button>
        <button id="cancelBtn">${t('cancel') || '取消'}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const confirmBtn = modal.querySelector('#confirmBtn');
  const cancelBtn = modal.querySelector('#cancelBtn');
  
  const closeModal = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  };
  
  const handleConfirm = () => {
    closeModal();
    callback(true);
  };
  
  const handleCancel = () => {
    closeModal();
    callback(false);
  };
  
  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', handleCancel);
  
  // 按下 Escape 键取消
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      document.removeEventListener('keydown', escapeHandler);
      handleCancel();
    }
  });
  
  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      handleCancel();
    }
  });
  
  // 聚焦确认按钮
  confirmBtn.focus();
}

// 显示自定义提示对话框
function showCustomAlert(message, callback = null) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${t('alert') || '提示'}</h3>
      <p class="modal-message">${message}</p>
      <div class="modal-buttons">
        <button id="okBtn">${t('ok') || '确定'}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const okBtn = modal.querySelector('#okBtn');
  
  const closeModal = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
    if (callback) callback();
  };
  
  okBtn.addEventListener('click', closeModal);
  
  // 按下 Escape 或 Enter 键关闭
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      document.removeEventListener('keydown', escapeHandler);
      closeModal();
    }
  });
  
  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // 聚焦确定按钮
  okBtn.focus();
}

// 处理语言切换
window.electronAPI.onLanguageChange(async (event, language) => {
  setLocale(language);
  updateUILanguage();
  updateWindowTitle();
  
  // 重新加载welcome文件（如果当前文件是welcome.md）
  if (currentFile === 'welcome.md') {
    try {
      const welcomeContent = await window.electronAPI.readWelcomeFile();
      files['welcome.md'] = welcomeContent;
      fileStates['welcome.md'] = {
        savedContent: welcomeContent,
        filePath: null,
        isDirty: false
      };
      
      // 如果当前正在查看welcome文件，更新编辑器内容
      editor.value = welcomeContent;
      updatePreview();
      generateOutline();
    } catch (error) {
      console.error('重新加载welcome文件失败:', error);
    }
  }
  
  // 注意：菜单会由主进程重新创建，这里只需更新渲染进程中的界面
});

// 处理新建文件请求
window.electronAPI.onNewFile(() => {
  createNewFile();
});

// 处理打开文件请求
window.electronAPI.onFileOpened((event, data) => {
  openFile(data.content, data.filePath);
});

// 处理保存文件请求
window.electronAPI.onSaveFile(() => {
  saveFile();
});

// 处理另存为请求
window.electronAPI.onSaveFileAs(() => {
  window.electronAPI.saveFileDialog(currentFilePath);
});

// 接收保存文件路径
window.electronAPI.onSaveFileAsPath((event, filePath) => {
  if (filePath) {
    const fileName = window.electronAPI.basename(filePath);
    
    // 如果这是一个新文件的首次保存，且文件名发生了变化
    if (!currentFilePath && currentFile !== fileName) {
      // 删除原来的临时文件记录
      delete files[currentFile];
      if (fileStates[currentFile]) {
        delete fileStates[currentFile];
      }
    }
    
    currentFilePath = filePath;
    currentFile = fileName;
    files[currentFile] = editor.value;
    
    // 创建或更新文件状态
    fileStates[currentFile] = {
      savedContent: editor.value,
      filePath: filePath,
      isDirty: false
    };
    
    window.electronAPI.saveFileContent({
      filePath: filePath,
      content: editor.value
    });
    
    // 更新界面
    updateFileList();
    updateWindowTitle();
    updateUnsavedIndicator();
  }
});

// 文件保存成功回调
window.electronAPI.onFileSaved((event, filePath) => {
  isFileSaved = true;
  
  // 更新文件状态
  if (fileStates[currentFile]) {
    fileStates[currentFile].savedContent = files[currentFile];
    fileStates[currentFile].filePath = filePath;
    fileStates[currentFile].isDirty = false;
  }
  
  // 如果是新保存的文件，更新当前文件路径
  if (filePath && !currentFilePath) {
    currentFilePath = filePath;
  }
  
  updateUnsavedIndicator();
  updateWindowTitle();
  updateFileList(); // 更新文件列表以移除 *
  
  // 只有当用户主动保存文件时才显示成功消息
  // 不在自动创建新文件时显示
  if (filePath && currentFilePath) {
    showCustomAlert(`${t('file_saved_success')}${filePath}`);
  }
});

// 重命名文件
async function renameFile(oldFilename) {
  showFileNameDialog(async (newFilename) => {
    if (newFilename && newFilename.trim()) {
      let finalFilename = newFilename.trim();
      if (!finalFilename.endsWith('.md')) {
        finalFilename += '.md';
      }
      
      // 检查新文件名是否与现有文件冲突
      if (files[finalFilename] && finalFilename !== oldFilename) {
        showCustomAlert(t('file_already_exists') || '文件已存在！');
        return;
      }
      
      // 执行重命名
      const fileContent = files[oldFilename];
      const fileState = fileStates[oldFilename];
      
      // 如果文件已保存到磁盘，需要实际重命名磁盘文件
      if (fileState.filePath) {
        const oldPath = fileState.filePath;
        const dir = window.electronAPI.dirname(oldPath);
        const newPath = window.electronAPI.join(dir, finalFilename);
        
        try {
          // 重命名磁盘文件
          const result = await window.electronAPI.renameFile(oldPath, newPath);
          
          if (!result.success) {
            showCustomAlert(`重命名文件失败: ${result.error}`);
            return;
          }
          
          // 更新文件状态
          fileStates[finalFilename] = {
            ...fileState,
            filePath: newPath
          };
        } catch (error) {
          showCustomAlert(`重命名文件失败: ${error.message}`);
          return;
        }
      } else {
        // 文件未保存到磁盘，只更新内存状态
        fileStates[finalFilename] = {
          ...fileState,
          filePath: null
        };
      }
      
      // 删除旧文件记录
      delete files[oldFilename];
      delete fileStates[oldFilename];
      
      // 创建新文件记录
      files[finalFilename] = fileContent;
      
      // 如果重命名的是当前文件，更新当前文件引用
      if (currentFile === oldFilename) {
        currentFile = finalFilename;
        currentFilePath = fileStates[finalFilename].filePath;
      }
      
      updateFileList();
      updateWindowTitle();
      updateUnsavedIndicator();
    }
  }, oldFilename.replace('.md', ''));
}

// 原来的初始化代码已移动到新的启动流程中
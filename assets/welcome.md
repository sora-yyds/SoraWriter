# 欢迎使用 SoraWriter

欢迎来到 SoraWriter Markdown 编辑器！这是一个功能强大、简洁易用的 Markdown 编辑工具。

## 主要功能

### 📝 编辑功能
- **实时预览**: 支持分屏模式，边编辑边预览
- **语法高亮**: 清晰的 Markdown 语法显示
- **自动保存**: 智能保存您的工作进度

### 📁 文件管理
- **多文件管理**: 同时管理多个 Markdown 文件
- **文件重命名**: 轻松重命名您的文件
- **文件删除**: 安全删除不需要的文件

### 📑 大纲导航
- **自动生成大纲**: 根据标题自动生成文档大纲
- **快速导航**: 点击大纲项目快速跳转到对应位置

### 🔧 视图模式
- **分屏模式**: 同时显示编辑器和预览
- **编辑模式**: 专注于写作，隐藏预览
- **预览模式**: 专注于阅读，隐藏编辑器

## 快速开始

1. **新建文件**: 点击侧边栏的 "+" 按钮创建新文件
2. **编辑内容**: 在编辑器中输入您的 Markdown 内容
3. **查看预览**: 在预览面板中查看渲染效果
4. **保存文件**: 使用 Ctrl+S 或菜单保存文件

## Markdown 语法示例

### 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 文本样式
- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- `代码文本`

### 列表
1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项
- 无序列表项
- 无序列表项

### 链接和图片
[链接文本](https://example.com)
![图片描述](image.png)

### 代码块
```javascript
function hello() {
    console.log("Hello, SoraWriter!");
}
```

### 表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

### 引用
> 这是一个引用块
> 可以包含多行内容

### 科学公式 TeX(KaTeX)

$$E=mc^2$$

$$x > y$$

$$\(\sqrt{3x-1}+(1+x)^2\)$$

$$\sin(\alpha)^{\theta}=\sum_{i=0}^{n}(x^i + \cos(f))$$

多行公式：

```math
\displaystyle
\left( \sum\_{k=1}^n a\_k b\_k \right)^2
\leq
\left( \sum\_{k=1}^n a\_k^2 \right)
\left( \sum\_{k=1}^n b\_k^2 \right)
```

```katex
\displaystyle 
    \frac{1}{
        \Bigl(\sqrt{\phi \sqrt{5}}-\phi\Bigr) e^{
        \frac25 \pi}} = 1+\frac{e^{-2\pi}} {1+\frac{e^{-4\pi}} {
        1+\frac{e^{-6\pi}}
        {1+\frac{e^{-8\pi}}
         {1+\cdots} }
        } 
    }
```

```latex
f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi
```
---

### 绘制流程图 Flowchart

```flow
st=>start: 用户登陆
op=>operation: 登陆操作
cond=>condition: 登陆成功 Yes or No?
e=>end: 进入后台

st->op->cond
cond(yes)->e
cond(no)->op
```
---

### 绘制序列图 Sequence Diagram

```seq
Andrew->China: Says Hello 
Note right of China: China thinks\nabout it 
China-->Andrew: How are you? 
Andrew->>China: I am good thanks!
```

---

开始您的 Markdown 写作之旅吧！🚀

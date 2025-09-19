# Welcome to SoraWriter

Welcome to SoraWriter Markdown Editor! This is a powerful and user-friendly Markdown editing tool.

## Key Features

### 📝 Editing Features
- **Live Preview**: Support split-screen mode, edit and preview simultaneously
- **Syntax Highlighting**: Clear Markdown syntax display
- **Auto Save**: Intelligent saving of your work progress

### 📁 File Management
- **Multi-file Management**: Manage multiple Markdown files simultaneously
- **File Renaming**: Easily rename your files
- **File Deletion**: Safely delete unwanted files

### 📑 Outline Navigation
- **Auto-generated Outline**: Automatically generate document outline based on headings
- **Quick Navigation**: Click outline items to quickly jump to corresponding positions

### 🔧 View Modes
- **Split Mode**: Display editor and preview simultaneously
- **Edit Mode**: Focus on writing, hide preview
- **Preview Mode**: Focus on reading, hide editor

## Quick Start

1. **New File**: Click the "+" button in the sidebar to create a new file
2. **Edit Content**: Enter your Markdown content in the editor
3. **View Preview**: See the rendered effect in the preview panel
4. **Save File**: Use Ctrl+S or menu to save the file

## Markdown Syntax Examples

### Headings
```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Styles
- **Bold text**
- *Italic text*
- ~~Strikethrough text~~
- `Code text`

### Lists
1. Ordered list item 1
2. Ordered list item 2
3. Ordered list item 3

- Unordered list item
- Unordered list item
- Unordered list item

### Links and Images
[Link text](https://example.com)
![Image description](image.png)

### Code Blocks
```javascript
function hello() {
    console.log("Hello, SoraWriter!");
}
```

### Tables
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

### Blockquotes
> This is a blockquote
> It can contain multiple lines

### TeX(KaTeX)

$$E=mc^2$$

$$x > y$$

$$\(\sqrt{3x-1}+(1+x)^2\)$$

$$\sin(\alpha)^{\theta}=\sum_{i=0}^{n}(x^i + \cos(f))$$

Multi line formula：

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

### Flowchart

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

### Sequence Diagram

```seq
Andrew->China: Says Hello 
Note right of China: China thinks\nabout it 
China-->Andrew: How are you? 
Andrew->>China: I am good thanks!
```

---

Start your Markdown writing journey! 🚀

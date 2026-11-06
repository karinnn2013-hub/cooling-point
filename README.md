# Peak-Time Energy Within Reach — GitHub Pages 部署包

当前线上版本：v153。已包含正面轴测、屋顶光伏顶视、中英文切换、图表与页面所需资源。

这是纯静态网站，无需 npm、Node.js、后端、数据库或 API Key，也无需构建。

## 推荐部署方式：从 main 分支根目录发布

1. 在 GitHub 创建一个空仓库（例如 `peak-hour`）。
2. 解压 ZIP，把解压目录**里面的全部文件与 assets 文件夹**放到仓库根目录。`index.html` 应直接位于根目录；不要只上传 ZIP，也不要把整层导出目录再套进仓库里。
3. 保留空文件 `.nojekyll`。macOS Finder 可按 Command + Shift + . 显示隐藏文件；使用 Git 上传时 `git add .` 会包含它。
4. 提交并推送到 `main` 分支。
5. 在仓库进入 **Settings → Pages → Build and deployment**：
   - Source：**Deploy from a branch**
   - Branch：**main**
   - Folder：**/(root)**
   - 点击 **Save**。
6. 等 GitHub 的 Pages 部署完成后，访问设置页给出的地址。普通项目仓库通常为：`https://你的用户名.github.io/仓库名/`。

官方设置说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 可选：用 Git 命令上传

先在 GitHub 创建空仓库，然后在这个解压目录运行（将 YOUR_USERNAME 和 YOUR_REPOSITORY 替换为实际值）：

```bash
git init -b main
git add .
git commit -m "Deploy current static website"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

如果目标仓库已有内容，请在该仓库的工作副本中复制本站文件并正常提交，不必重新初始化。

## 本地预览

在这个解压目录运行：

```bash
python3 -m http.server 8000
```

浏览器打开 `http://localhost:8000/`。请使用 HTTP 预览，避免直接双击 HTML 导致浏览器限制本地 JSON 读取。

## 包内内容

- `index.html`：主页。
- `assets/`：图片、Blender 渲染图、模型、气候数据和图标。
- `architecture.html`、`technical-architecture.html`、`energy-panel.html`：独立图页与能源面板。
- 同级 CSS/JS 文件：页面样式和交互。
- `.nojekyll`：让 Pages 直接发布这些静态文件。
- `Sunroom_Energy_Monitor.html` 和 `tools/sunroom_pv_runtime.js`：补齐能源面板的独立窗口及嵌入式模型脚本。
- `SOURCE_VERSION.json`：导出版本记录。
- `FILE_CHECKSUMS.json`：网站资源的 SHA-256 校验记录。

所有站内资源路径保留相对路径，可部署在 GitHub Pages 的仓库子路径下。网站字体使用 Google Fonts；其余核心交互和数据在包内。字体服务不可用时使用 CSS 的后备字体。

本包不包含 Sites 平台配置、Git 历史、凭据、Blender 工程文件或本机绝对路径。Blender 工程是独立的设计源文件，不是网站运行所需文件。

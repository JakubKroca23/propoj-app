import fs from 'fs';
import path from 'path';

const README_PATH = path.resolve('README.md');
const USER_GUIDE_PATH = path.resolve('docs/USER_GUIDE.md');
const OUTPUT_PATH = path.resolve('docs/index.html');

console.log('[Docs Builder] Načítám zdrojové soubory...');

try {
  const readmeContent = fs.readFileSync(README_PATH, 'utf8');
  const userGuideContent = fs.readFileSync(USER_GUIDE_PATH, 'utf8');

  console.log('[Docs Builder] Generuji single-file HTML dokumentaci...');

  const htmlTemplate = `<!DOCTYPE html>
<html lang="cs" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas OS — Dokumentační Portál</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Markdown Parser & Code Highlighter CDNs -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/bash.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/nginx.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/yaml.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"></script>

  <style>
    :root {
      /* Theme variables - Dark (default) */
      --bg-main: #070913;
      --bg-sidebar: #0b0e1a;
      --bg-card: rgba(255, 255, 255, 0.03);
      --border-color: rgba(255, 255, 255, 0.08);
      --border-glow: rgba(108, 71, 255, 0.2);
      --text-primary: #e2e8f0;
      --text-secondary: #94a3b8;
      --accent: #6c47ff;
      --accent-glow: rgba(108, 71, 255, 0.15);
      --table-header: rgba(255, 255, 255, 0.05);
      --code-bg: #0f1324;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 20px;
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    html[data-theme="light"] {
      --bg-main: #f8fafc;
      --bg-sidebar: #f1f5f9;
      --bg-card: #ffffff;
      --border-color: rgba(0, 0, 0, 0.08);
      --border-glow: rgba(108, 71, 255, 0.15);
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --accent: #4f46e5;
      --accent-glow: rgba(79, 70, 229, 0.1);
      --table-header: rgba(0, 0, 0, 0.03);
      --code-bg: #f8fafc;
    }

    * {
      box-sizing: border-box;
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      padding: 0;
      background: var(--bg-main);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      display: flex;
      height: 100vh;
      overflow: hidden;
      transition: background var(--transition-base), color var(--transition-base);
    }

    /* Sidebar */
    .sidebar {
      width: 320px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      height: 100%;
      flex-shrink: 0;
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
      animation: pulse 3s infinite;
    }

    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #fff 30%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    html[data-theme="light"] .logo-text {
      background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .search-container {
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 10px 14px 10px 36px;
      background: var(--bg-main);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--accent);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      color: var(--text-secondary);
      pointer-events: none;
    }

    /* Tabs switching */
    .tabs-nav {
      display: flex;
      padding: 16px 24px 8px 24px;
      gap: 8px;
      border-bottom: 1px solid var(--border-color);
    }

    .tab-btn {
      flex: 1;
      padding: 10px 6px;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      text-align: center;
    }

    .tab-btn.active {
      background: var(--accent-glow);
      color: var(--text-primary);
      border: 1px solid var(--border-glow);
    }

    .tab-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.02);
      color: var(--text-primary);
    }

    /* TOC Section */
    .toc-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }

    .toc-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .toc-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-left: 0;
      margin: 0;
      list-style-type: none;
    }

    .toc-item {
      display: block;
      font-size: 13.5px;
      color: var(--text-secondary);
      text-decoration: none;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      transition: all 0.15s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toc-item:hover {
      background: rgba(255, 255, 255, 0.02);
      color: var(--text-primary);
      padding-left: 14px;
    }

    .toc-item.depth-1 { font-weight: 600; color: var(--text-primary); }
    .toc-item.depth-2 { padding-left: 10px; }
    .toc-item.depth-3 { padding-left: 20px; font-size: 12px; }

    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .theme-toggle {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 6px 12px;
      color: var(--text-primary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    /* Main Content */
    .content-area {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      padding: 40px 60px 80px 60px;
      background: var(--bg-main);
    }

    .content-wrapper {
      max-width: 860px;
      margin: 0 auto;
    }

    /* Markdown styling */
    .markdown-body {
      font-size: 15px;
      color: var(--text-primary);
      line-height: 1.7;
    }

    .markdown-body h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    .markdown-body h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-top: 40px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }

    .markdown-body h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 600;
      margin-top: 28px;
      margin-bottom: 12px;
    }

    .markdown-body p {
      margin-bottom: 18px;
      color: var(--text-secondary);
    }

    .markdown-body strong {
      color: var(--text-primary);
    }

    .markdown-body hr {
      border: 0;
      height: 1px;
      background: var(--border-color);
      margin: 40px 0;
    }

    /* Lists */
    .markdown-body ul, .markdown-body ol {
      margin-bottom: 18px;
      padding-left: 24px;
      color: var(--text-secondary);
    }

    .markdown-body li {
      margin-bottom: 8px;
    }

    /* Codes & syntax blocks */
    .markdown-body code {
      font-family: 'Fira Code', monospace;
      font-size: 13.5px;
      padding: 3px 6px;
      background: var(--code-bg);
      border-radius: 4px;
      color: var(--accent);
    }

    .markdown-body pre {
      background: var(--code-bg) !important;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      overflow-x: auto;
      margin-bottom: 20px;
      position: relative;
    }

    .markdown-body pre code {
      background: none !important;
      padding: 0;
      font-size: 13px;
      color: #cbd5e1;
      border-radius: 0;
    }

    /* Copy code button */
    .copy-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .copy-btn:hover {
      background: var(--accent);
      color: #fff;
    }

    /* Table styling */
    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .markdown-body th, .markdown-body td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }

    .markdown-body th {
      background: var(--table-header);
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-primary);
    }

    .markdown-body td {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .markdown-body tr:last-child td {
      border-bottom: none;
    }

    /* Alert Boxes (Callouts) */
    .markdown-body blockquote {
      margin: 20px 0;
      padding: 16px 20px;
      background: rgba(108, 71, 255, 0.05);
      border-left: 4px solid var(--accent);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }

    .markdown-body blockquote p {
      margin: 0;
      font-style: italic;
      color: var(--text-primary);
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(108, 71, 255, 0)); }
      50% { transform: scale(1.05); filter: drop-shadow(0 0 15px rgba(108, 71, 255, 0.4)); }
    }

    /* Responsive */
    @media (max-width: 992px) {
      body { flex-direction: column; }
      .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border-color); }
      .content-area { padding: 30px 24px; }
      .toc-container { display: none; }
    }
  </style>
</head>
<body>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-container">
        <span class="logo-icon">⚙️</span>
        <span class="logo-text">propoj.app Docs</span>
      </div>
      
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" id="searchBox" placeholder="Vyhledat v dokumentaci...">
      </div>
    </div>
    
    <div class="tabs-nav">
      <button class="tab-btn active" onclick="switchTab('userGuide')">📘 Uživatelská příručka</button>
      <button class="tab-btn" onclick="switchTab('readme')">🚀 Vývoj & self-host</button>
    </div>
    
    <div class="toc-container">
      <div class="toc-title">Obsah dokumentu</div>
      <ul class="toc-list" id="tocList">
        <!-- Generuje se dynamicky -->
      </ul>
    </div>
    
    <div class="sidebar-footer">
      <button class="theme-toggle" onclick="toggleTheme()">
        <span id="themeIcon">☀️</span> Světlý motiv
      </button>
      <span style="font-size: 11px; color: var(--text-secondary);">v1.0 MVP</span>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="content-area">
    <div class="content-wrapper">
      <article class="markdown-body" id="docContent">
        <!-- Renderuje se dynamicky -->
      </article>
    </div>
  </main>

  <!-- RAW Markdown stores -->
  <script type="text/markdown" id="rawUserGuide">${userGuideContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}</script>
  <script type="text/markdown" id="rawReadme">${readmeContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}</script>

  <script>
    let currentTab = 'userGuide';

    // Inicializace Marked.js s možnostmi Highlight.js
    marked.setOptions({
      highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: 'hljs language-'
    });

    function renderMarkdown() {
      const rawElementId = currentTab === 'userGuide' ? 'rawUserGuide' : 'rawReadme';
      const markdown = document.getElementById(rawElementId).textContent;
      
      // Parse markdown to HTML
      const html = marked.parse(markdown);
      const contentEl = document.getElementById('docContent');
      contentEl.innerHTML = html;

      // Zpracování kódových bloků (přidání tlačítka Kopírovat)
      document.querySelectorAll('pre').forEach(preBlock => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.innerText = 'Kopírovat';
        copyButton.addEventListener('click', () => {
          const codeText = preBlock.querySelector('code').innerText;
          navigator.clipboard.writeText(codeText).then(() => {
            copyButton.innerText = 'Zkopírováno!';
            setTimeout(() => { copyButton.innerText = 'Kopírovat'; }, 2000);
          });
        });
        preBlock.appendChild(copyButton);
      });

      generateTOC();
    }

    function generateTOC() {
      const tocList = document.getElementById('tocList');
      tocList.innerHTML = '';
      
      const contentEl = document.getElementById('docContent');
      const headers = contentEl.querySelectorAll('h1, h2, h3');
      
      headers.forEach((header, index) => {
        // Přidáme id pro navigaci, pokud neexistuje
        const cleanId = 'header-' + index;
        header.id = cleanId;

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + cleanId;
        a.innerText = header.innerText.replace(/^[#\\s]+/, '');
        
        let depth = 1;
        if (header.tagName === 'H2') depth = 2;
        if (header.tagName === 'H3') depth = 3;
        
        a.className = 'toc-item depth-' + depth;
        li.appendChild(a);
        tocList.appendChild(li);
      });
    }

    function switchTab(tabId) {
      if (currentTab === tabId) return;
      currentTab = tabId;
      
      // Upravit aktivní třídy tlačítek
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtnIdx = tabId === 'userGuide' ? 0 : 1;
      document.querySelectorAll('.tab-btn')[activeBtnIdx].classList.add('active');
      
      renderMarkdown();
      document.querySelector('.content-area').scrollTop = 0;
    }

    // Fulltextové vyhledávání v dokumentu
    document.getElementById('searchBox').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const contentEl = document.getElementById('docContent');
      
      if (!query) {
        renderMarkdown();
        return;
      }

      // Prohledat odstavce, nadpisy a tabulky
      const elements = contentEl.querySelectorAll('p, h1, h2, h3, li, tr');
      elements.forEach(el => {
        const text = el.innerText.toLowerCase();
        if (text.includes(query)) {
          el.style.display = '';
          el.style.opacity = '1';
          el.style.borderLeft = '2px solid var(--accent)';
          el.style.paddingLeft = '6px';
        } else {
          el.style.display = 'none';
        }
      });
    });

    // Dark/Light Theme přepínač
    function toggleTheme() {
      const html = document.documentElement;
      const theme = html.getAttribute('data-theme');
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      
      const btnIcon = document.getElementById('themeIcon');
      const btn = document.querySelector('.theme-toggle');
      
      if (newTheme === 'light') {
        btnIcon.innerText = '🌙';
        btn.innerHTML = '🌙 Tmavý motiv';
      } else {
        btnIcon.innerText = '☀️';
        btn.innerHTML = '☀️ Světlý motiv';
      }
    }

    // Prvotní načtení
    window.addEventListener('DOMContentLoaded', () => {
      renderMarkdown();
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_PATH, htmlTemplate, 'utf8');
  console.log(`[Docs Builder] Dokumentace byla úspěšně vygenerována do: ${OUTPUT_PATH}`);

} catch (error) {
  console.error('[Docs Builder] Chyba při čtení nebo zápisu souborů:', error);
}

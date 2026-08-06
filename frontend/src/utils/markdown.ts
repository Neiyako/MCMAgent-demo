import { marked } from 'marked';
import katex from 'katex';

export function renderMarkdown(text: string): string {
  if (!text) return '';
  const renderer = new marked.Renderer();
  renderer.code = (token: any) => {
    const code = token.text || '';
    const lang = token.lang || '';
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const encoded = encodeURIComponent(code);
    const langLabel = lang ? `<span class="mcm-code-lang">${lang}</span>` : '';
    return `<div class="code-block">${langLabel}<pre><code class="language-${lang}">${escaped}</code></pre><button class="copy-code-btn" data-code="${encoded}"><i class="fas fa-copy"></i> 复制代码</button></div>`;
  };
  renderer.image = (token: any) => `<img src="${token.href}" alt="${token.text || ''}" class="inline-image" loading="lazy" />`;
  marked.setOptions({ renderer, breaks: true, gfm: true });
  let html = marked(text) as string;
  // 处理 LaTeX
  html = html.replace(/\$\$(.+?)\$\$/g, (_, math) => {
    try { return katex.renderToString(math, { displayMode: true, throwOnError: false }); } catch { return _; }
  });
  html = html.replace(/\$(.+?)\$/g, (_, math) => {
    try { return katex.renderToString(math, { displayMode: false, throwOnError: false }); } catch { return _; }
  });
  return html;
}
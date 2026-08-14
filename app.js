'use strict';

const LICENSE_OPTIONS = [
  ['mit', 'MIT License'],
  ['apache-2.0', 'Apache License 2.0'],
  ['gpl-3.0', 'GNU GPL v3'],
  ['agpl-3.0', 'GNU AGPL v3'],
  ['lgpl-3.0', 'GNU LGPL v3'],
  ['bsd-3-clause', 'BSD 3-Clause'],
  ['bsd-2-clause', 'BSD 2-Clause'],
  ['mpl-2.0', 'Mozilla Public License 2.0'],
  ['unlicense', 'The Unlicense']
];

const FEATURE_LABELS = {
  'commercial-use': '商用利用',
  modifications: '改変',
  distribution: '再配布',
  'private-use': '私的利用',
  'patent-use': '特許利用',
  'include-copyright': '著作権表示を含める',
  'include-license': 'ライセンスを含める',
  'disclose-source': 'ソース公開',
  'document-changes': '変更点を明示',
  'same-license': '同一ライセンス',
  'same-license--file': 'ファイル単位で同一ライセンス',
  'same-license--library': 'ライブラリ利用時も同一条件',
  'network-use-disclose': 'ネットワーク利用時もソース公開',
  liability: '責任',
  warranty: '保証',
  'trademark-use': '商標利用'
};

const elements = {
  licenseSelect: document.querySelector('#licenseSelect'),
  projectName: document.querySelector('#projectName'),
  ownerName: document.querySelector('#ownerName'),
  copyrightYear: document.querySelector('#copyrightYear'),
  licenseName: document.querySelector('#licenseName'),
  licenseDescription: document.querySelector('#licenseDescription'),
  sourceLink: document.querySelector('#sourceLink'),
  permissionsList: document.querySelector('#permissionsList'),
  conditionsList: document.querySelector('#conditionsList'),
  limitationsList: document.querySelector('#limitationsList'),
  licensePreview: document.querySelector('#licensePreview'),
  spdxBadge: document.querySelector('#spdxBadge'),
  statusMessage: document.querySelector('#statusMessage'),
  copyButton: document.querySelector('#copyButton')
};

const state = {
  rawLicense: null,
  renderedText: '',
  cache: new Map(),
  loading: false
};

function init() {
  const year = new Date().getFullYear();
  elements.copyrightYear.value = String(year);
  elements.projectName.value = 'License Creator';

  for (const [key, label] of LICENSE_OPTIONS) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = label;
    elements.licenseSelect.appendChild(option);
  }

  elements.licenseSelect.value = 'mit';

  elements.licenseSelect.addEventListener('change', loadSelectedLicense);
  elements.ownerName.addEventListener('input', renderPersonalizedText);
  elements.copyrightYear.addEventListener('input', renderPersonalizedText);

  document.querySelectorAll('[data-export]').forEach((button) => {
    button.addEventListener('click', () => runExport(button.dataset.export));
  });

  elements.copyButton.addEventListener('click', copyLicenseText);
  loadSelectedLicense();
}

async function loadSelectedLicense() {
  const key = elements.licenseSelect.value;
  setStatus('ライセンス情報を取得しています…');
  state.loading = true;
  setExportDisabled(true);

  try {
    let data = state.cache.get(key);
    if (!data) {
      const response = await fetch(`https://api.github.com/licenses/${encodeURIComponent(key)}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub License API: ${response.status}`);
      }

      data = await response.json();
      state.cache.set(key, data);
    }

    state.rawLicense = data;
    renderLicenseSummary(data);
    renderPersonalizedText();
    setStatus('準備できました。');
  } catch (error) {
    console.error(error);
    state.rawLicense = null;
    state.renderedText = '';
    elements.licenseName.textContent = '取得できませんでした';
    elements.licenseDescription.textContent = 'GitHub License APIへの接続に失敗しました。通信状態またはAPI制限を確認してください。';
    elements.licensePreview.textContent = 'ライセンス本文を取得できませんでした。';
    elements.spdxBadge.textContent = 'ERROR';
    renderFeatureList(elements.permissionsList, []);
    renderFeatureList(elements.conditionsList, []);
    renderFeatureList(elements.limitationsList, []);
    setStatus('ライセンスの取得に失敗しました。', true);
  } finally {
    state.loading = false;
    setExportDisabled(false);
  }
}

function renderLicenseSummary(data) {
  elements.licenseName.textContent = data.name || 'Unknown license';
  elements.licenseDescription.textContent = data.description || '説明はありません。';
  elements.spdxBadge.textContent = data.spdx_id || 'SPDX';

  if (data.html_url) {
    elements.sourceLink.href = data.html_url;
    elements.sourceLink.hidden = false;
  } else {
    elements.sourceLink.hidden = true;
  }

  renderFeatureList(elements.permissionsList, data.permissions || []);
  renderFeatureList(elements.conditionsList, data.conditions || []);
  renderFeatureList(elements.limitationsList, data.limitations || []);
}

function renderFeatureList(container, items) {
  container.replaceChildren();

  if (!items.length) {
    const empty = document.createElement('span');
    empty.className = 'empty-chip';
    empty.textContent = '記載なし';
    container.appendChild(empty);
    return;
  }

  for (const item of items) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = FEATURE_LABELS[item] || humanizeFeature(item);
    chip.title = item;
    container.appendChild(chip);
  }
}

function humanizeFeature(value) {
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderPersonalizedText() {
  if (!state.rawLicense?.body) {
    return;
  }

  const year = elements.copyrightYear.value.trim() || String(new Date().getFullYear());
  const owner = elements.ownerName.value.trim() || '[著作者名]';
  const text = personalizeLicense(state.rawLicense.body, { year, owner });

  state.renderedText = normalizeLineEndings(text).trimEnd() + '\n';
  elements.licensePreview.textContent = state.renderedText;
}

function personalizeLicense(body, { year, owner }) {
  let result = normalizeLineEndings(body);

  const replacements = [
    [/\[year\]/gi, year],
    [/\[yyyy\]/gi, year],
    [/<year>/gi, year],
    [/\{year\}/gi, year],
    [/\[fullname\]/gi, owner],
    [/\[full name\]/gi, owner],
    [/\[name of copyright owner\]/gi, owner],
    [/\[copyright holder\]/gi, owner],
    [/\[copyright holders\]/gi, owner],
    [/<name of author>/gi, owner],
    [/<copyright holders>/gi, owner]
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

function normalizeLineEndings(text) {
  return String(text).replace(/\r\n?/g, '\n');
}

function getLicenseText() {
  if (!state.renderedText) {
    throw new Error('ライセンス本文がまだ準備できていません。');
  }
  return state.renderedText;
}

async function runExport(type) {
  if (state.loading) {
    return;
  }

  try {
    setStatus('ファイルを作成しています…');

    switch (type) {
      case 'license':
        exportPlainText('LICENSE');
        break;
      case 'txt':
        exportPlainText('LICENSE.txt');
        break;
      case 'pdf':
        await exportPdf();
        break;
      case 'docx':
        await exportDocx();
        break;
      default:
        throw new Error('未対応のエクスポート形式です。');
    }

    setStatus(`${type.toUpperCase()}を書き出しました。`);
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'エクスポートに失敗しました。', true);
  }
}

function exportPlainText(filename) {
  const blob = new Blob([getLicenseText()], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}

async function exportDocx() {
  if (!window.docx) {
    throw new Error('DOCX生成ライブラリを読み込めませんでした。');
  }

  const { Document, Packer, Paragraph, TextRun } = window.docx;
  const lines = normalizeLineEndings(getLicenseText()).split('\n');
  const children = lines.map((line) => new Paragraph({
    spacing: { after: line === '' ? 120 : 0, line: 276 },
    children: line === '' ? [] : [new TextRun({
      text: line,
      font: 'Aptos',
      size: 20
    })]
  }));

  const documentFile = new Document({
    creator: elements.ownerName.value.trim() || 'License Creator',
    title: `${elements.projectName.value.trim() || 'Project'} License`,
    description: `${state.rawLicense?.name || 'License'} generated by License Creator`,
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1134,
            right: 1134,
            bottom: 1134,
            left: 1134
          }
        }
      },
      children
    }]
  });

  const blob = await Packer.toBlob(documentFile);
  downloadBlob(blob, 'LICENSE.docx');
}

async function exportPdf() {
  if (!window.jspdf?.jsPDF) {
    throw new Error('PDF生成ライブラリを読み込めませんでした。');
  }

  const { jsPDF } = window.jspdf;
  const pages = renderTextToCanvasPages(getLicenseText());
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  pages.forEach((canvas, index) => {
    if (index > 0) {
      pdf.addPage('a4', 'portrait');
    }
    const image = canvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(image, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  });

  pdf.setProperties({
    title: `${elements.projectName.value.trim() || 'Project'} License`,
    subject: state.rawLicense?.name || 'Software License',
    author: elements.ownerName.value.trim() || 'License Creator',
    creator: 'License Creator'
  });

  pdf.save('LICENSE.pdf');
}

function renderTextToCanvasPages(text) {
  const width = 1240;
  const height = 1754;
  const marginX = 92;
  const marginTop = 88;
  const marginBottom = 88;
  const fontSize = 20;
  const lineHeight = 31;
  const font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, "Noto Sans Mono", "Noto Sans JP", monospace`;
  const maxTextWidth = width - marginX * 2;

  const measureCanvas = document.createElement('canvas');
  const measureContext = measureCanvas.getContext('2d');
  measureContext.font = font;

  const wrappedLines = [];
  for (const rawLine of normalizeLineEndings(text).split('\n')) {
    wrappedLines.push(...wrapCanvasLine(measureContext, rawLine, maxTextWidth));
  }

  const linesPerPage = Math.max(1, Math.floor((height - marginTop - marginBottom) / lineHeight));
  const pageCount = Math.max(1, Math.ceil(wrappedLines.length / linesPerPage));
  const pages = [];

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#111827';
    context.font = font;
    context.textBaseline = 'top';

    const start = pageIndex * linesPerPage;
    const end = Math.min(start + linesPerPage, wrappedLines.length);
    let y = marginTop;

    for (let index = start; index < end; index += 1) {
      context.fillText(wrappedLines[index], marginX, y);
      y += lineHeight;
    }

    context.fillStyle = '#7b8497';
    context.font = '16px system-ui, sans-serif';
    context.textAlign = 'right';
    context.fillText(`${pageIndex + 1} / ${pageCount}`, width - marginX, height - 48);
    context.textAlign = 'left';

    pages.push(canvas);
  }

  return pages;
}

function wrapCanvasLine(context, rawLine, maxWidth) {
  if (rawLine === '') {
    return [''];
  }

  if (context.measureText(rawLine).width <= maxWidth) {
    return [rawLine];
  }

  const leading = rawLine.match(/^\s*/)?.[0] || '';
  const content = rawLine.slice(leading.length);
  const words = content.split(/(\s+)/).filter(Boolean);
  const lines = [];
  let current = leading;

  for (const word of words) {
    const candidate = current + word;
    if (context.measureText(candidate).width <= maxWidth || current.trim() === '') {
      current = candidate;
      continue;
    }

    lines.push(current.trimEnd());
    current = `${leading}${word.trimStart()}`;

    if (context.measureText(current).width > maxWidth) {
      const hardWrapped = hardWrapCanvasText(context, current, maxWidth, leading);
      lines.push(...hardWrapped.slice(0, -1));
      current = hardWrapped.at(-1) || leading;
    }
  }

  if (current !== '') {
    lines.push(current.trimEnd());
  }

  return lines.length ? lines : [''];
}

function hardWrapCanvasText(context, text, maxWidth, leading) {
  const chars = Array.from(text);
  const lines = [];
  let current = '';

  for (const char of chars) {
    const candidate = current + char;
    if (context.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = `${leading}${char}`;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

async function copyLicenseText() {
  try {
    await navigator.clipboard.writeText(getLicenseText());
    setStatus('ライセンス全文をコピーしました。');
  } catch (error) {
    console.error(error);
    setStatus('クリップボードへのコピーに失敗しました。', true);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function setStatus(message, isError = false) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.toggle('error', isError);
}

function setExportDisabled(disabled) {
  document.querySelectorAll('[data-export], #copyButton').forEach((button) => {
    button.disabled = disabled;
  });
}

init();

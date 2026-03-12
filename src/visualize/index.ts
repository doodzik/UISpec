import { CompiledScreen } from '../compiler/index.js';
import { Node } from '../schemas/node.schema.js';

const KIND_COLORS: Record<string, { bg: string; border: string }> = {
  region: { bg: '#e8f4fd', border: '#2196F3' },
  component: { bg: '#e8f5e9', border: '#4CAF50' },
  control: { bg: '#fff3e0', border: '#FF9800' },
  container: { bg: '#f3e5f5', border: '#9C27B0' },
  collection: { bg: '#fce4ec', border: '#E91E63' },
  overlayAnchor: { bg: '#e0f2f1', border: '#009688' },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DEFAULT_COLOR = { bg: '#e8f4fd', border: '#2196F3' };

const FULL_WIDTH_PATTERN = /^(header|footer|navbar|topbar|bottombar|banner|appbar)$/i;

function isFullWidthRegion(node: Node): boolean {
  return node.kind === 'region' && FULL_WIDTH_PATTERN.test(node.id);
}

function hasOnlyLeafChildren(node: Node): boolean {
  return !!node.children?.length && node.children.every((c) => !c.children?.length);
}

function renderNode(node: Node, depth: number): string {
  const colors = KIND_COLORS[node.kind] ?? DEFAULT_COLOR;
  const semanticsHtml = node.semantics
    ? `<span class="semantics">${[
        node.semantics.role ? `role: ${escapeHtml(node.semantics.role)}` : '',
        node.semantics.label ? `"${escapeHtml(node.semantics.label)}"` : '',
        node.semantics.placeholder
          ? `placeholder: "${escapeHtml(node.semantics.placeholder)}"`
          : '',
      ]
        .filter(Boolean)
        .join(' &middot; ')}</span>`
    : '';

  const childrenHtml = node.children?.map((c) => renderNode(c, depth + 1)).join('') ?? '';
  const useHorizontalChildren = hasOnlyLeafChildren(node);

  return `<div class="node" style="border-color:${colors.border};background:${colors.bg}">
  <div class="node-header">
    <strong>${escapeHtml(node.id)}</strong>
    <span class="kind" style="background:${colors.border}">${escapeHtml(node.kind)}</span>
    ${semanticsHtml}
  </div>
  ${childrenHtml ? `<div class="node-children${useHorizontalChildren ? ' node-children--horizontal' : ''}">${childrenHtml}</div>` : ''}
</div>`;
}

function renderTree(nodes: Node[]): string {
  const fullWidthTop: Node[] = [];
  const bodyNodes: Node[] = [];
  const fullWidthBottom: Node[] = [];

  let seenBody = false;
  for (const node of nodes) {
    if (isFullWidthRegion(node)) {
      if (seenBody) {
        fullWidthBottom.push(node);
      } else {
        fullWidthTop.push(node);
      }
    } else {
      seenBody = true;
      bodyNodes.push(node);
    }
  }

  const hasLayout = fullWidthTop.length > 0 || fullWidthBottom.length > 0 || bodyNodes.length > 1;

  if (!hasLayout) {
    return nodes.map((n) => renderNode(n, 0)).join('');
  }

  let html = '';

  for (const node of fullWidthTop) {
    html += `<div class="layout-row layout-row--full">${renderNode(node, 0)}</div>`;
  }

  if (bodyNodes.length > 0) {
    html += `<div class="layout-row layout-row--body">${bodyNodes.map((n) => renderNode(n, 0)).join('')}</div>`;
  }

  for (const node of fullWidthBottom) {
    html += `<div class="layout-row layout-row--full">${renderNode(node, 0)}</div>`;
  }

  return html;
}

function renderOverlays(overlays: CompiledScreen['overlays']): string {
  if (!overlays || Object.keys(overlays).length === 0) return '';

  const items = Object.entries(overlays)
    .map(
      ([name, overlay]) =>
        `<div class="overlay">
      <strong>${escapeHtml(name)}</strong>
      <span class="overlay-detail">anchor: ${escapeHtml(overlay.anchor)}</span>
      ${overlay.route ? `<span class="overlay-detail">route: ${escapeHtml(overlay.route)}</span>` : ''}
    </div>`
    )
    .join('');

  return `<div class="overlays-section">
    <h4>Overlays</h4>
    ${items}
  </div>`;
}

function renderFlows(flows: CompiledScreen['flows']): string {
  if (!flows || Object.keys(flows).length === 0) return '';

  const items = Object.entries(flows)
    .map(
      ([name, steps]) =>
        `<div class="flow">
      <strong>${escapeHtml(name)}</strong>
      <ol>${steps
        .map((step) => {
          const parts = [escapeHtml(step.action)];
          if (step.target) parts.push(`&rarr; ${escapeHtml(step.target)}`);
          if (step.value) parts.push(`"${escapeHtml(step.value)}"`);
          if (step.route) parts.push(`route: ${escapeHtml(step.route)}`);
          return `<li>${parts.join(' ')}</li>`;
        })
        .join('')}</ol>
    </div>`
    )
    .join('');

  return `<div class="flows-section">
    <h4>Flows</h4>
    ${items}
  </div>`;
}

function renderScreen(compiled: CompiledScreen): string {
  const modesSections = Object.entries(compiled.modes)
    .map(
      ([modeName, mode]) =>
        `<div class="mode">
      <h3>${escapeHtml(modeName)}</h3>
      <div class="tree">${renderTree(mode.tree)}</div>
    </div>`
    )
    .join('');

  return `<section class="screen">
    <h2>${escapeHtml(compiled.id)}</h2>
    <div class="routes">${compiled.routes.map((r) => `<code>${escapeHtml(r)}</code>`).join(' ')}</div>
    <div class="modes">${modesSections}</div>
    ${renderOverlays(compiled.overlays)}
    ${renderFlows(compiled.flows)}
  </section>`;
}

export function generateHtml(screens: CompiledScreen[]): string {
  const screensHtml = screens.map(renderScreen).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UISpec Wireframe</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; color: #333; padding: 2rem; }
  h1 { margin-bottom: 1.5rem; }
  .screen { background: #fff; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .screen h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .routes { margin-bottom: 1rem; }
  .routes code { background: #eee; padding: 2px 8px; border-radius: 4px; margin-right: 0.5rem; font-size: 0.85rem; }
  .modes { display: flex; flex-wrap: wrap; gap: 1.5rem; }
  .mode { flex: 1; min-width: 300px; }
  .mode h3 { font-size: 1.1rem; margin-bottom: 0.75rem; padding-bottom: 0.25rem; border-bottom: 2px solid #ddd; }
  .tree { display: flex; flex-direction: column; gap: 0.5rem; }
  .layout-row--full { }
  .layout-row--full > .node { margin-bottom: 0; }
  .layout-row--body { display: flex; gap: 0.5rem; align-items: stretch; }
  .layout-row--body > .node { flex: 1; margin-bottom: 0; }
  .layout-row--body > .node:first-child:not(:only-child) { flex: 0 0 220px; max-width: 260px; }
  .node { border: 2px solid; border-radius: 6px; padding: 0.5rem; margin-bottom: 0.5rem; }
  .node-header { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.25rem; }
  .node-header strong { font-size: 0.9rem; }
  .kind { color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 0.7rem; text-transform: uppercase; }
  .semantics { font-size: 0.75rem; color: #666; font-style: italic; }
  .node-children { margin-left: 0.75rem; padding-left: 0.75rem; border-left: 2px dashed #ccc; }
  .node-children--horizontal { display: flex; flex-wrap: wrap; gap: 0.5rem; border-left: none; margin-left: 0; padding-left: 0; }
  .node-children--horizontal > .node { flex: 1; min-width: 120px; margin-bottom: 0; }
  .overlays-section, .flows-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee; }
  .overlays-section h4, .flows-section h4 { margin-bottom: 0.5rem; color: #666; }
  .overlay, .flow { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 4px; padding: 0.5rem; margin-bottom: 0.5rem; }
  .overlay-detail { font-size: 0.8rem; color: #666; margin-left: 0.5rem; }
  .flow ol { margin-left: 1.5rem; margin-top: 0.25rem; font-size: 0.85rem; }
  .legend { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; }
  .legend-swatch { width: 16px; height: 16px; border: 2px solid; border-radius: 3px; }
</style>
</head>
<body>
<h1>UISpec Wireframe</h1>
<div class="legend">
  <div class="legend-item"><div class="legend-swatch" style="background:#e8f4fd;border-color:#2196F3"></div>region</div>
  <div class="legend-item"><div class="legend-swatch" style="background:#e8f5e9;border-color:#4CAF50"></div>component</div>
  <div class="legend-item"><div class="legend-swatch" style="background:#fff3e0;border-color:#FF9800"></div>control</div>
  <div class="legend-item"><div class="legend-swatch" style="background:#f3e5f5;border-color:#9C27B0"></div>container</div>
  <div class="legend-item"><div class="legend-swatch" style="background:#fce4ec;border-color:#E91E63"></div>collection</div>
  <div class="legend-item"><div class="legend-swatch" style="background:#e0f2f1;border-color:#009688"></div>overlayAnchor</div>
</div>
${screensHtml}
</body>
</html>`;
}

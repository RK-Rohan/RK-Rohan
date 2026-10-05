// Builds the animated SVGs in assets/ from scripts/data.mjs.
// Usage: node scripts/generate.mjs   (Node 18+, no dependencies)
//
// GitHub serves README images through its camo proxy as <img>, so the SVGs use
// only inline CSS and SMIL animation (no scripts, no web fonts).

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { career, profile, projects, skillGroups } from "./data.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "assets");

const C = {
  bg: "#000000",
  panel: "#0a0a0a",
  line: "#262626",
  lineHi: "#404040",
  muted: "#737373",
  dim: "#a3a3a3",
  text: "#fafafa",
};
const SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const MONO_EM = 0.6; // advance width of one monospace glyph, in em

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const monoWidth = (text, size) => text.length * size * MONO_EM;

// Monospace text pinned to its computed width, so boxes drawn around it always fit
// whichever monospace font the viewer has.
const monoText = (x, y, text, size, attrs = "") =>
  `<text x="${x}" y="${y}" font-size="${size}" class="mono" textLength="${monoWidth(text, size).toFixed(1)}" lengthAdjust="spacingAndGlyphs" ${attrs}>${esc(text)}</text>`;

// FNV-1a. Decorative "block hashes" only: deterministic, so regenerating gives the same output.
function hash(input, hexChars = 8) {
  let h = 0x811c9dc5;
  let out = "";
  for (let round = 0; out.length < hexChars; round++) {
    for (const ch of `${round}:${input}`) {
      h ^= ch.codePointAt(0);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    out += h.toString(16).padStart(8, "0");
  }
  return `0x${out.slice(0, hexChars)}`;
}

function wrap(text, maxChars) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const year = (ym) => ym.slice(0, 4);

function svgDocument(width, height, title, body, css = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title">
<title id="title">${esc(title)}</title>
<style>
  .sans { font-family: ${SANS}; }
  .mono { font-family: ${MONO}; }
  .pulse { animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
  .flow { stroke-dasharray: 3 5; animation: flow 1.2s linear infinite; }
  @keyframes flow { to { stroke-dashoffset: -16; } }
${css}
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
${body}
</svg>
`;
}

// Rounded frame plus a clip path matching it.
const frame = (w, h, r = 18) => `<defs><clipPath id="frame"><rect width="${w}" height="${h}" rx="${r}"/></clipPath></defs>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${C.bg}" stroke="#1f1f1f"/>`;

// Dot grid that fades out toward the edges.
const dotGrid = (w, h, cx, cy) => `<defs>
  <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#fff" opacity=".09"/></pattern>
  <radialGradient id="fadeGrad" cx="${cx}" cy="${cy}" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
  <mask id="fade"><rect width="${w}" height="${h}" fill="url(#fadeGrad)"/></mask>
</defs>
<rect width="${w}" height="${h}" fill="url(#dots)" mask="url(#fade)"/>`;

// A small square that travels a path forever: the "packet" on a chain link.
const packet = (path, dur, begin = 0, size = 5) =>
  `<rect x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}" fill="${C.text}"><animateMotion path="${path}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></rect>`;

const chip = (x, y, label, size = 11, pad = 10, h = 24) => {
  const w = monoWidth(label, size) + pad * 2;
  return {
    w,
    svg: `<rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="6" fill="${C.panel}" stroke="${C.line}"/>${monoText(x + pad, y + h / 2 + size * 0.36, label, size, `fill="${C.dim}"`)}`,
  };
};

// Lay chips out left to right, wrapping at maxWidth. Returns markup and total height.
function chipFlow(x0, y0, labels, maxWidth, { size = 11, gap = 6, rowGap = 8, h = 24 } = {}) {
  let x = x0;
  let y = y0;
  const parts = [];
  labels.forEach((label) => {
    const w = monoWidth(label, size) + 20;
    if (x > x0 && x + w > x0 + maxWidth) {
      x = x0;
      y += h + rowGap;
    }
    const c = chip(x, y, label, size, 10, h);
    parts.push(c.svg);
    x += c.w + gap;
  });
  return { svg: parts.join("\n"), height: y - y0 + h };
}

/* ---------------------------------------------------------------- hero */

function hero() {
  const W = 1200;
  const H = 460;
  const genesis = career[career.length - 1];
  const head = career[0];
  const skillCount = skillGroups.reduce((n, g) => n + g.skills.length, 0);

  // Rotating roles: each role is visible for `slot` seconds of an N * slot cycle.
  const slot = 3;
  const cycle = profile.roles.length * slot;
  const on = (100 / profile.roles.length).toFixed(2);
  const roleCss = `
  .role { opacity: 0; animation: role ${cycle}s infinite; }
  @keyframes role { 0% { opacity: 1; transform: none; } ${(on - 2.5).toFixed(2)}% { opacity: 1; transform: none; }
    ${on}% { opacity: 0; transform: translateY(-10px); } 97.5% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: none; } }
  .caret { animation: caret 1s steps(1) infinite; }
  @keyframes caret { 50% { opacity: 0; } }`;

  const roleSize = 19;
  const roles = profile.roles
    .map((role, i) => {
      const x = 48 + monoWidth("> ", roleSize);
      const caretX = x + monoWidth(role, roleSize) + 4;
      return `<g class="role" style="animation-delay:${i * slot}s">${monoText(x, 262, role, roleSize, `fill="${C.text}"`)}<rect class="caret" x="${caretX.toFixed(1)}" y="246" width="10" height="20" fill="${C.text}"/></g>`;
    })
    .join("\n");

  const summary = wrap(profile.summary, 72)
    .map((line, i) => `<text x="48" y="${306 + i * 24}" font-size="16" class="sans" fill="${C.dim}">${esc(line)}</text>`)
    .join("\n");

  const stats = [
    [profile.experience, "YEARS"],
    [String(career.length), "ROLES"],
    [String(skillGroups.length), "SKILL BLOCKS"],
    [String(skillCount), "SKILLS"],
  ]
    .map(([value, label], i) => {
      const x = 48 + i * 150;
      return `<g>
  <rect x="${x}" y="350" width="136" height="44" rx="8" fill="${C.panel}" stroke="${C.line}"/>
  <text x="${x + 14}" y="378" font-size="18" font-weight="700" class="sans" fill="${C.text}">${esc(value)}</text>
  ${monoText(x + 14 + value.length * 12 + 8, 377, label, 10, `fill="${C.muted}"`)}
</g>`;
    })
    .join("\n");

  // Wireframe globe: static latitudes, meridians whose rx follows |cos| to fake rotation.
  const gx = 935;
  const gy = 222;
  const R = 128;
  const latitudes = [-60, -30, 0, 30, 60]
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const rx = R * Math.cos(rad);
      return `<ellipse cx="${gx}" cy="${(gy - R * Math.sin(rad)).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.16).toFixed(1)}" stroke="${C.lineHi}"/>`;
    })
    .join("\n");
  const rxValues = Array.from({ length: 25 }, (_, i) => (R * Math.abs(Math.cos((i * Math.PI) / 24))).toFixed(1)).join(";");
  const meridians = Array.from({ length: 6 }, (_, i) => {
    const dur = 12;
    return `<ellipse cx="${gx}" cy="${gy}" rx="${R}" ry="${R}" stroke="${i % 2 ? C.lineHi : "#5a5a5a"}"><animate attributeName="rx" values="${rxValues}" dur="${dur}s" begin="${(-i * dur) / 6}s" repeatCount="indefinite"/></ellipse>`;
  }).join("\n");

  // Orbits with blocks travelling on them.
  const orbit = (rx, ry, rot, dur, count, reverse = false) => {
    const d = `M ${gx - rx} ${gy} a ${rx} ${ry} 0 1 ${reverse ? 0 : 1} ${rx * 2} 0 a ${rx} ${ry} 0 1 ${reverse ? 0 : 1} ${-rx * 2} 0`;
    const blocks = Array.from({ length: count }, (_, i) => packet(d, dur, (-i * dur) / count, 7)).join("");
    return `<g transform="rotate(${rot} ${gx} ${gy})"><path d="${d}" stroke="${C.line}" stroke-dasharray="2 6"/>${blocks}</g>`;
  };

  // Network nodes on the globe face, linked to each other.
  const nodes = [
    [-70, -60], [10, -95], [80, -40], [-30, 10], [55, 45], [-80, 60], [5, 90],
  ].map(([dx, dy]) => [gx + dx, gy + dy]);
  const links = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [3, 5], [5, 6], [4, 6], [1, 3]]
    .map(([a, b], i) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="${C.dim}" stroke-width=".8" class="pulse" style="animation-delay:${(i * 0.37).toFixed(2)}s;animation-duration:3.2s"/>`)
    .join("\n");
  const nodeDots = nodes
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${C.text}"/><circle cx="${x}" cy="${y}" r="3" stroke="${C.text}"><animate attributeName="r" values="3;12;3" dur="3s" begin="${i * 0.45}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0;.8" dur="3s" begin="${i * 0.45}s" repeatCount="indefinite"/></circle>`)
    .join("\n");

  // Ticker of career blocks along the bottom edge.
  const tickerText = [...career]
    .reverse()
    .map((job, i) => `BLOCK #${String(i + 1).padStart(2, "0")}  ${year(job.start)}  ${job.company.toUpperCase()}  ${hash(job.company + job.start)}`)
    .join("   ->   ") + "   ->   ";
  const tickerSize = 12;
  const tickerW = monoWidth(tickerText, tickerSize);
  const tickerCss = `
  .ticker { animation: ticker ${(tickerW / 45).toFixed(1)}s linear infinite; }
  @keyframes ticker { to { transform: translateX(-${tickerW.toFixed(1)}px); } }`;

  const body = `${frame(W, H)}
<g clip-path="url(#frame)">
${dotGrid(W, H, ".78", ".48")}
<radialGradient id="glow" cx="${gx}" cy="${gy}" r="230" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<circle cx="${gx}" cy="${gy}" r="230" fill="url(#glow)"/>

<circle class="pulse" cx="52" cy="40" r="4" fill="${C.text}"/>
${monoText(66, 44, `NODE ONLINE  ·  github.com/${profile.handle}`, 12, `fill="${C.dim}"`)}
${monoText(1152 - monoWidth(`GENESIS ${genesis.start}  ·  HEAD ${head.start}`, 12), 44, `GENESIS ${genesis.start}  ·  HEAD ${head.start}`, 12, `fill="${C.muted}"`)}
<line x1="48" y1="64" x2="1152" y2="64" stroke="#1a1a1a"/>

${monoText(48, 128, `// ${profile.headline.toUpperCase()}`, 12, `fill="${C.muted}" letter-spacing="1"`)}
<text class="sans" x="44" y="206" font-size="72" font-weight="700" letter-spacing="-2" fill="${C.text}">${esc(profile.name)}</text>
${monoText(48, 262, ">", roleSize, `fill="${C.muted}"`)}
${roles}
${summary}
${stats}

<g>
<circle cx="${gx}" cy="${gy}" r="${R}" stroke="#5a5a5a"/>
${latitudes}
${meridians}
${orbit(R * 1.42, R * 0.38, -18, 14, 3)}
${orbit(R * 1.25, R * 0.3, 24, 10, 2, true)}
${links}
${nodeDots}
</g>

<line x1="0" y1="414" x2="${W}" y2="414" stroke="#1a1a1a"/>
<g class="ticker">
${monoText(48, 442, tickerText, tickerSize, `fill="${C.muted}"`)}
${monoText(48 + tickerW, 442, tickerText, tickerSize, `fill="${C.muted}"`)}
</g>
</g>`;

  return svgDocument(W, H, `${profile.name}: ${profile.headline}`, body, roleCss + tickerCss);
}

/* -------------------------------------------------------- skill ledger */

function skills() {
  const W = 1200;
  const pad = 40;
  const cols = 3;
  const gap = 32;
  const bw = (W - pad * 2 - gap * (cols - 1)) / cols;
  const inner = 20;
  const top = 128;
  const total = skillGroups.reduce((n, g) => n + g.skills.length, 0);
  const step = 1; // seconds between block confirmations
  const cycle = skillGroups.length * step;
  const hold = ((1.4 / cycle) * 100).toFixed(2);
  const css = `
  .blk { animation: confirm ${cycle}s infinite; }
  @keyframes confirm { 0% { stroke: ${C.text}; } ${hold}% { stroke: ${C.text}; } ${(Number(hold) + 8).toFixed(2)}%, 100% { stroke: ${C.line}; } }
  .led { animation: led ${cycle}s infinite; }
  @keyframes led { 0%, ${hold}% { fill: ${C.text}; } ${(Number(hold) + 8).toFixed(2)}%, 100% { fill: #333; } }`;

  // Snake order: row 0 left to right, row 1 right to left, and so on.
  const cell = (i) => {
    const row = Math.floor(i / cols);
    const col = row % 2 === 0 ? i % cols : cols - 1 - (i % cols);
    return { row, col };
  };

  const flows = skillGroups.map((g, i) =>
    chipFlow(0, 0, g.skills, bw - inner * 2),
  );
  const rows = Math.ceil(skillGroups.length / cols);
  const rowH = Array.from({ length: rows }, (_, r) =>
    Math.max(...flows.filter((_, i) => cell(i).row === r).map((f) => f.height)) + 76 + 18 + 44,
  );
  const rowY = rowH.map((_, r) => top + rowH.slice(0, r).reduce((a, b) => a + b, 0) + gap * r);

  const blocks = [];
  const links = [];
  skillGroups.forEach((g, i) => {
    const { row, col } = cell(i);
    const x = pad + col * (bw + gap);
    const y = rowY[row];
    const h = rowH[row];
    const own = hash(g.category);
    const prev = i === 0 ? "0x00000000" : hash(skillGroups[i - 1].category);
    const label = `BLOCK 0x${String(i + 1).padStart(2, "0")}`;
    const pillW = monoWidth(g.short, 10) + 16;
    const flow = flows[i];

    blocks.push(`<g>
  <rect class="blk" style="animation-delay:${i * step}s" x="${x}" y="${y}" width="${bw}" height="${h}" rx="12" fill="${C.bg}" stroke="${C.line}"/>
  <circle class="led" style="animation-delay:${i * step}s" cx="${x + inner + 3}" cy="${y + 24}" r="3" fill="#333"/>
  ${monoText(x + inner + 12, y + 28, label, 11, `fill="${C.muted}"`)}
  <rect x="${(x + bw - inner - pillW).toFixed(1)}" y="${y + 14}" width="${pillW.toFixed(1)}" height="20" rx="10" stroke="${C.lineHi}"/>
  ${monoText(x + bw - inner - pillW + 8, y + 28, g.short, 10, `fill="${C.text}"`)}
  <text x="${x + inner}" y="${y + 58}" font-size="17" font-weight="600" class="sans" fill="${C.text}">${esc(g.category)}</text>
  <g transform="translate(${x + inner} ${y + 76})">${flow.svg}</g>
  <line x1="${x + inner}" y1="${y + h - 38}" x2="${x + bw - inner}" y2="${y + h - 38}" stroke="#1a1a1a"/>
  ${monoText(x + inner, y + h - 16, `HASH ${own}`, 10, `fill="${C.muted}"`)}
  ${monoText(x + bw - inner - monoWidth(`PREV ${prev}`, 10), y + h - 16, `PREV ${prev}`, 10, `fill="#525252"`)}
</g>`);

    if (i === 0) return;
    const p = cell(i - 1);
    let d;
    if (p.row === row) {
      const ly = y + 24;
      const [from, to] = p.col < col
        ? [pad + p.col * (bw + gap) + bw, x]
        : [pad + p.col * (bw + gap), x + bw];
      d = `M ${from} ${ly} L ${to} ${ly}`;
    } else {
      const lx = x + bw / 2;
      d = `M ${lx} ${rowY[p.row] + rowH[p.row]} L ${lx} ${y}`;
    }
    links.push(`<path d="${d}" class="flow" stroke="${C.dim}"/>${packet(d, 1, i * step - 1)}`);
  });

  const H = rowY[rows - 1] + rowH[rows - 1] + 56;
  const status = `CHAIN SYNCED  ·  ${skillGroups.length}/${skillGroups.length} BLOCKS  ·  ${total} SKILLS`;

  const body = `${frame(W, H)}
<g clip-path="url(#frame)">
${dotGrid(W, H, ".5", ".3")}
${monoText(pad, 50, "// SKILL LEDGER", 12, `fill="${C.muted}" letter-spacing="1"`)}
<text x="${pad}" y="88" font-size="28" font-weight="700" letter-spacing="-.5" class="sans" fill="${C.text}">Skills, chained block by block.</text>
<circle class="pulse" cx="${W - pad - monoWidth(status, 11) - 14}" cy="84" r="4" fill="${C.text}"/>
${monoText(W - pad - monoWidth(status, 11), 88, status, 11, `fill="${C.dim}"`)}
${links.join("\n")}
${blocks.join("\n")}
${monoText(pad, H - 22, "Hashes are decorative. Skills sourced from rezaul-karim.com.", 10, `fill="#525252"`)}
</g>`;

  return svgDocument(W, H, `Skill ledger: ${skillGroups.map((g) => g.category).join(", ")}`, body, css);
}

/* -------------------------------------------------------- career chain */

function careerChain() {
  const W = 1200;
  const pad = 40;
  const jobs = [...career].reverse(); // genesis first
  const gap = 21;
  const bw = Math.floor((W - pad * 2 - gap * (jobs.length - 1)) / jobs.length);
  const top = 76;
  const companyLines = jobs.map((j) => wrap(j.company, 16));
  const titleLines = jobs.map((j) => wrap(j.title, 18));
  const maxC = Math.max(...companyLines.map((l) => l.length));
  const maxT = Math.max(...titleLines.map((l) => l.length));
  const h = 62 + maxC * 17 + 10 + maxT * 14 + 40;
  const step = 0.8;
  const cycle = jobs.length * step;
  const css = `
  .blk { animation: confirm ${cycle}s infinite; }
  @keyframes confirm { 0%, 10% { stroke: ${C.text}; } 20%, 100% { stroke: ${C.line}; } }`;

  const blocks = jobs.map((job, i) => {
    const x = pad + i * (bw + gap);
    const isHead = job.end === null;
    const range = `${year(job.start)} - ${isHead ? "NOW" : year(job.end)}`;
    const company = companyLines[i]
      .map((line, k) => `<text x="${x + 14}" y="${top + 66 + k * 17}" font-size="12.5" font-weight="600" class="sans" fill="${C.text}">${esc(line)}</text>`)
      .join("");
    const titleY = top + 66 + maxC * 17 + 8;
    const title = titleLines[i].map((line, k) => monoText(x + 14, titleY + k * 14, line, 10, `fill="${C.dim}"`)).join("");
    const tag = isHead
      ? `<rect class="pulse" x="${x + bw - 56}" y="${top + 12}" width="42" height="18" rx="9" fill="${C.text}"/>${monoText(x + bw - 47, top + 25, "HEAD", 10, `fill="${C.bg}" font-weight="700"`)}`
      : "";
    return `<g>
  <rect ${isHead ? "" : `class="blk" style="animation-delay:${i * step}s"`} x="${x}" y="${top}" width="${bw}" height="${h}" rx="10" fill="${C.bg}" stroke="${isHead ? C.text : C.line}"/>
  ${monoText(x + 14, top + 26, `#${String(i + 1).padStart(2, "0")}`, 10, `fill="${C.muted}"`)}
  ${tag}
  ${monoText(x + 14, top + 46, range, 10, `fill="${C.text}"`)}
  ${company}
  ${title}
  <line x1="${x + 14}" y1="${top + h - 28}" x2="${x + bw - 14}" y2="${top + h - 28}" stroke="#1a1a1a"/>
  ${monoText(x + 14, top + h - 12, hash(job.company + job.start), 9, `fill="#525252"`)}
</g>`;
  });

  const links = jobs.slice(1).map((_, k) => {
    const i = k + 1;
    const x1 = pad + (i - 1) * (bw + gap) + bw;
    const d = `M ${x1} ${top + 22} L ${x1 + gap} ${top + 22}`;
    return `<path d="${d}" class="flow" stroke="${C.dim}"/>${packet(d, 0.8, i * step - 0.8, 4)}`;
  });

  const H = top + h + 40;
  const meta = `GENESIS ${year(jobs[0].start)}  ->  HEAD ${year(jobs[jobs.length - 1].start)}`;
  const body = `${frame(W, H)}
<g clip-path="url(#frame)">
${dotGrid(W, H, ".5", ".5")}
${monoText(pad, 46, "// CAREER CHAIN", 12, `fill="${C.muted}" letter-spacing="1"`)}
${monoText(W - pad - monoWidth(meta, 12), 46, meta, 12, `fill="${C.dim}"`)}
${links.join("\n")}
${blocks.join("\n")}
</g>`;

  return svgDocument(W, H, `Career: ${jobs.map((j) => `${j.title} at ${j.company}`).join("; ")}`, body, css);
}

/* ------------------------------------------------------- project cards */

function projectCard(p, index) {
  const W = 580;
  const H = 232;
  const lines = wrap(p.description, 68);
  if (lines.length > 4) throw new Error(`${p.slug}: description wraps to ${lines.length} lines (max 4)`);

  const css = `
  .scan { stroke-dasharray: 70 930; animation: scan 9s linear infinite; }
  @keyframes scan { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }`;
  const label = `0x${String(index + 1).padStart(2, "0")}  ·  ${p.language.toUpperCase()}`;
  const repo = `${p.repo}  ↗`;
  const desc = lines
    .map((line, i) => `<text x="28" y="${110 + i * 21}" font-size="14" class="sans" fill="${C.dim}">${esc(line)}</text>`)
    .join("\n");
  const chips = chipFlow(28, H - 50, p.stack, W - 56);

  const body = `${frame(W, H, 16)}
<g clip-path="url(#frame)">
${dotGrid(W, H, ".9", ".1")}
<rect class="scan" style="animation-delay:-${index * 1.5}s" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15" stroke="${C.text}" stroke-width="1.5" pathLength="1000"/>
<circle class="pulse" cx="32" cy="34" r="3.5" fill="${C.text}"/>
${monoText(44, 38, label, 11, `fill="${C.muted}"`)}
${monoText(W - 28 - monoWidth(repo, 11), 38, repo, 11, `fill="${C.dim}"`)}
<text x="28" y="80" font-size="24" font-weight="700" letter-spacing="-.4" class="sans" fill="${C.text}">${esc(p.name)}</text>
${desc}
${chips.svg}
</g>`;

  return svgDocument(W, H, `${p.name}: ${p.description}`, body, css);
}

/* --------------------------------------------------------------- write */

const outputs = {
  "hero.svg": hero(),
  "skills.svg": skills(),
  "career.svg": careerChain(),
  ...Object.fromEntries(projects.map((p, i) => [`projects/${p.slug}.svg`, projectCard(p, i)])),
};

for (const [file, content] of Object.entries(outputs)) {
  const path = join(ASSETS, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`wrote assets/${file}`);
}

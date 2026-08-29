#!/usr/bin/env node
/**
 * Generate SEO/GEO assets for siar (fabrizio.pyragogy.org)
 *
 * Creates:
 *   - sitemap.xml
 *   - llms.txt
 *   - llms-full.txt
 *
 * Usage:  node scripts/generate-seo.mjs
 *
 * Signed: Fabrizio Terzi
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, resolve, extname, relative } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SITE_URL = "https://fabrizio.pyragogy.org";

// ── Collect HTML pages ───────────────────────────────────

function collectHtmlFiles(dir, basePath = "") {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "node_modules") continue;

    const fullPath = join(dir, entry.name);
    const rel = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(fullPath, rel));
    } else if (entry.name.endsWith(".html") && entry.name !== "google354ad519f3b91e82.html") {
      files.push({ path: fullPath, rel });
    }
  }

  return files;
}

const htmlFiles = collectHtmlFiles(ROOT);
const sorted = htmlFiles.sort((a, b) => a.rel.localeCompare(b.rel));

// ── sitemap.xml ──────────────────────────────────────────

function urlToSlug(relPath) {
  // Convert rel/html to URL
  if (relPath === "index.html") return "/";
  const slug = relPath.replace(/\.html$/, "");
  return `/${slug}`;
}

const sitemapLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sorted.map((f) => {
    const loc = `${SITE_URL}${urlToSlug(f.rel)}`;
    return `  <url><loc>${escapeXml(loc)}</loc></url>`;
  }),
  "</urlset>",
].join("\n");

writeFileSync(join(ROOT, "sitemap.xml"), sitemapLines, "utf-8");
console.log(`✅ sitemap.xml written (${sorted.length} pages)`);

// ── llms.txt ─────────────────────────────────────────────

function extractTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1].trim() : "Untitled";
}

function extractDescription(html) {
  const match = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  return match ? match[1].trim() : "";
}

function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))
    .replace(/\s+/g, " ")
    .trim();
}

const indexContent = readFileSync(join(ROOT, "index.html"), "utf-8");
const indexTitle = extractTitle(indexContent);
const indexDesc = extractDescription(indexContent);

const pageLinks = sorted
  .filter((f) => f.rel !== "index.html")
  .map((f) => `- ${extractTitle(readFileSync(f.path, "utf-8")) || urlToSlug(f.rel)}: ${SITE_URL}${urlToSlug(f.rel)}`);

const llmsLines = [
  `# Fabrizio Terzi — Personal Site`,
  `# ${SITE_URL}`,
  `#`,
  `# Freelance Researcher, E-Learning Specialist, IT Consultant`,
  `# Signed: Fabrizio Terzi`,
  `# Date  : 2026-08-29`,
  ``,
  `## About`,
  ``,
  indexDesc || "Freelance Researcher, @BergamoHub E-Learning Specialist - IT consultant - Technical Support & Training",
  ``,
  `## Pages`,
  ``,
  `- Home: ${SITE_URL}/`,
  ...pageLinks,
  ``,
  `## Projects`,
  ``,
  ...sorted
    .filter((f) => f.rel.startsWith("projects/"))
    .map((f) => `- ${SITE_URL}${urlToSlug(f.rel)}`),
  ``,
  `## Video CV`,
  ``,
  ...sorted
    .filter((f) => f.rel.startsWith("Video-CV/"))
    .map((f) => `- ${SITE_URL}${urlToSlug(f.rel)}`),
  ``,
  `## Full content`,
  ``,
  `For the complete text of every page, see: ${SITE_URL}/llms-full.txt`,
].join("\n");

writeFileSync(join(ROOT, "llms.txt"), llmsLines, "utf-8");
console.log("✅ llms.txt written");

// ── llms-full.txt ────────────────────────────────────────

const fullLines = [
  `# Fabrizio Terzi — Full Content`,
  `# ${SITE_URL}`,
  `# Generated: ${new Date().toISOString().slice(0, 10)}`,
  `# Signed: Fabrizio Terzi`,
  ``,
  `This file contains the full text of every public page on the site.`,
  `============================================================`,
  ``,
];

for (const { path: filepath, rel } of sorted) {
  const content = readFileSync(filepath, "utf-8");
  const title = extractTitle(content);
  const body = stripHtml(content);

  if (body.length < 20) continue;

  const url = `${SITE_URL}${urlToSlug(rel)}`;
  fullLines.push("", "=".repeat(60), "");
  fullLines.push(`URL: ${url}`);
  fullLines.push(`Title: ${title}`);
  fullLines.push("");
  fullLines.push(body);
}

fullLines.push("", "=".repeat(60), "");
fullLines.push(`End of content — ${sorted.length} pages.`);
fullLines.push(`Signed: Fabrizio Terzi`);

writeFileSync(join(ROOT, "llms-full.txt"), fullLines.join("\n"), "utf-8");
console.log(`✅ llms-full.txt written (${sorted.length} pages)`);

// ── Helpers ──────────────────────────────────────────────

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
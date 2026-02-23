#!/usr/bin/env node
/**
 * issue-to-content.mjs
 *
 * Parses a GitHub Issue body (form format: "### Field\n\nvalue")
 * and generates the appropriate content markdown file.
 *
 * Environment variables:
 *   ISSUE_LABEL  – "add-seminar" | "add-publication" | "add-team-member"
 *   ISSUE_BODY   – raw issue body text
 *   ISSUE_NUMBER – issue number (for logging)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/** Parse GitHub issue form body into a key→value map */
function parseIssueBody(body) {
  const result = {};
  // Split on "### Field" headers
  const sections = body.split(/^### /m).filter(Boolean);
  for (const section of sections) {
    const lines = section.trim().split('\n');
    const key = lines[0].trim().toLowerCase().replace(/\s+/g, '_');
    const value = lines.slice(1).join('\n').trim().replace(/^_No response_$/m, '');
    if (key && value) {
      result[key] = value;
    }
  }
  return result;
}

/** Create a URL-safe slug from a string */
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

/** Escape a YAML string value */
function yamlStr(val) {
  if (!val) return '""';
  if (val.includes('"') || val.includes('\n') || val.includes(':')) {
    return `"${val.replace(/"/g, '\\"')}"`;
  }
  return `"${val}"`;
}

function generateSeminar(fields) {
  const date = fields['date'] ?? '';
  const speaker = fields['speaker'] ?? '';
  // Fix 7: separate PL/EN affiliation fields
  const affiliationPl = fields['affiliation_(polish)'] ?? fields['affiliation_pl'] ?? '';
  const affiliationEn = fields['affiliation_(english)'] ?? fields['affiliation_en'] ?? '';
  const titleEn = fields['title_(english)'] ?? fields['title_en'] ?? ''; // Fix 1: removed duplicate fallback
  const titlePl = fields['title_(polish)'] ?? fields['title_pl'] ?? '';
  const abstractEn = fields['abstract_(english)'] ?? fields['abstract_en'] ?? '';
  const abstractPl = fields['abstract_(polish)'] ?? fields['abstract_pl'] ?? '';
  const slides = fields['slides_url'] ?? '';

  const slug = `${date}-${slugify(speaker.split(' ').pop() ?? speaker)}`;
  const filePath = join(ROOT, 'src', 'content', 'seminars', `${slug}.md`);

  const lines = ['---'];
  lines.push(`date: ${yamlStr(date)}`);
  lines.push(`speaker: ${yamlStr(speaker)}`);
  if (affiliationPl) lines.push(`affiliation_pl: ${yamlStr(affiliationPl)}`);
  if (affiliationEn) lines.push(`affiliation_en: ${yamlStr(affiliationEn)}`);
  lines.push(`title: ${yamlStr(titleEn)}`);
  if (titlePl) lines.push(`title_pl: ${yamlStr(titlePl)}`);
  if (abstractEn) lines.push(`abstract: ${yamlStr(abstractEn)}`);
  if (abstractPl) lines.push(`abstract_pl: ${yamlStr(abstractPl)}`);
  if (slides) lines.push(`slides: ${yamlStr(slides)}`);
  lines.push('---');

  return { filePath, content: lines.join('\n') + '\n' };
}

function generatePublication(fields) {
  const authorsRaw = fields['authors'] ?? '';
  // Fix 3: use semicolons as separator to allow commas within author names
  const authors = authorsRaw.split(';').map(a => a.trim()).filter(Boolean);
  const title = fields['title'] ?? '';
  const venue = fields['journal_or_venue'] ?? '';
  const year = parseInt(fields['year'] ?? '0', 10);
  const type = fields['publication_type'] ?? 'journal';
  const doi = fields['doi'] ?? '';
  const url = fields['url'] ?? '';
  const ifRaw = fields['impact_factor'] ?? '';
  const impact_factor = ifRaw ? parseFloat(ifRaw) : null;

  const firstAuthorSlug = slugify(authors[0]?.split(' ').pop() ?? 'unknown');
  const slug = `${year}-${firstAuthorSlug}-${slugify(title).slice(0, 30)}`;
  const filePath = join(ROOT, 'src', 'content', 'publications', `${slug}.md`);

  const lines = ['---'];
  lines.push('authors:');
  for (const a of authors) lines.push(`  - ${yamlStr(a)}`);
  lines.push(`title: ${yamlStr(title)}`);

  // Determine if journal or booktitle based on type
  if (type === 'journal') {
    lines.push(`journal: ${yamlStr(venue)}`);
  } else {
    lines.push(`booktitle: ${yamlStr(venue)}`);
  }

  lines.push(`year: ${year}`);
  // Fix 2: write both doi and url independently (not mutually exclusive)
  if (doi) lines.push(`doi: ${yamlStr(doi)}`);
  if (url) lines.push(`url: ${yamlStr(url)}`);
  if (impact_factor) lines.push(`impact_factor: ${impact_factor}`);
  lines.push(`type: ${yamlStr(type)}`);
  lines.push('---');

  return { filePath, content: lines.join('\n') + '\n' };
}

function generateTeamMember(fields) {
  const name = fields['full_name'] ?? '';
  const roleEn = fields['role_(english)'] ?? fields['role_en'] ?? '';
  const rolePl = fields['role_(polish)'] ?? fields['role_pl'] ?? '';
  // Fix 7: separate PL/EN affiliation fields
  const affiliationPl = fields['affiliation_(polish)'] ?? fields['affiliation_pl'] ?? '';
  const affiliationEn = fields['affiliation_(english)'] ?? fields['affiliation_en'] ?? '';
  const email = fields['email'] ?? '';
  const linkedin = fields['linkedin'] ?? ''; // Fix 5
  const github = fields['github_url'] ?? fields['github'] ?? ''; // Fix 5
  const picture = fields['picture'] ?? ''; // Fix 5
  const areasRaw = fields['research_areas'] ?? '';
  const areas = areasRaw.split(',').map(a => a.trim()).filter(Boolean);
  const orderRaw = fields['order'] ?? ''; // Fix 4
  const order = orderRaw ? parseInt(orderRaw, 10) : null;

  const slug = slugify(name);
  const filePath = join(ROOT, 'src', 'content', 'team', `${slug}.md`);

  const lines = ['---'];
  lines.push(`name: ${yamlStr(name)}`);
  lines.push(`role: ${yamlStr(roleEn)}`);
  if (rolePl) lines.push(`role_pl: ${yamlStr(rolePl)}`);
  if (affiliationPl) lines.push(`affiliation_pl: ${yamlStr(affiliationPl)}`);
  if (affiliationEn) lines.push(`affiliation_en: ${yamlStr(affiliationEn)}`);
  if (email) lines.push(`email: ${yamlStr(email)}`);
  if (linkedin) lines.push(`linkedin: ${yamlStr(linkedin)}`);
  if (github) lines.push(`github: ${yamlStr(github)}`);
  if (picture) lines.push(`picture: ${yamlStr(picture)}`);
  if (areas.length > 0) {
    lines.push('research_areas:');
    for (const a of areas) lines.push(`  - ${yamlStr(a)}`);
  }
  lines.push('active: true');
  if (order !== null && !isNaN(order)) lines.push(`order: ${order}`); // Fix 4
  lines.push('---');

  return { filePath, content: lines.join('\n') + '\n' };
}

// Main
const label = process.env.ISSUE_LABEL ?? '';
const body = process.env.ISSUE_BODY ?? '';
const issueNumber = process.env.ISSUE_NUMBER ?? '?';

if (!body) {
  console.error('No ISSUE_BODY provided');
  process.exit(1);
}

const fields = parseIssueBody(body);
console.log(`Processing issue #${issueNumber} with label: ${label}`);
console.log('Parsed fields:', fields);

let result;
if (label === 'add-seminar') {
  result = generateSeminar(fields);
} else if (label === 'add-publication') {
  result = generatePublication(fields);
} else if (label === 'add-team-member') {
  result = generateTeamMember(fields);
} else {
  console.error(`Unknown label: ${label}`);
  process.exit(1);
}

mkdirSync(dirname(result.filePath), { recursive: true });
writeFileSync(result.filePath, result.content, 'utf8');
console.log(`Created: ${result.filePath}`);
console.log('Content:');
console.log(result.content);

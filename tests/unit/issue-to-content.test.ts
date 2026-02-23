import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { describe, it, expect, afterEach } from 'vitest';

// Strict schemas mirror src/content/config.ts — .strict() rejects unknown keys
const seminarSchema = z
  .object({
    date: z.string(),
    speaker: z.string(),
    affiliation_pl: z.string().optional(),
    affiliation_en: z.string().optional(),
    title: z.string(),
    title_pl: z.string().optional(),
    abstract: z.string().optional(),
    abstract_pl: z.string().optional(),
    slides: z.string().optional(),
  })
  .strict();

const publicationSchema = z
  .object({
    authors: z.array(z.string()),
    title: z.string(),
    journal: z.string().optional(),
    booktitle: z.string().optional(),
    year: z.number(),
    doi: z.string().optional(),
    url: z.string().optional(),
    impact_factor: z.number().optional(),
    type: z.enum(['journal', 'book_chapter', 'conference']),
  })
  .strict();

const teamSchema = z
  .object({
    name: z.string(),
    role: z.string(),
    role_pl: z.string().optional(),
    affiliation_pl: z.string().optional(),
    affiliation_en: z.string().optional(),
    email: z.string().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    picture: z.string().optional(),
    research_areas: z.array(z.string()).optional(),
    active: z.boolean().default(true),
    order: z.number().optional(),
  })
  .strict();

const ROOT = resolve(process.cwd());

function runScript(label: string, body: string): { stdout: string; filePath: string } {
  const stdout = execSync('node scripts/issue-to-content.mjs', {
    cwd: ROOT,
    env: {
      ...process.env,
      ISSUE_LABEL: label,
      ISSUE_BODY: body,
      ISSUE_NUMBER: '0',
    },
    encoding: 'utf-8',
  });
  const match = stdout.match(/^Created: (.+)$/m);
  const filePath = match ? match[1].trim() : '';
  return { stdout, filePath };
}

function extractContent(stdout: string): string {
  const idx = stdout.indexOf('Content:\n');
  if (idx === -1) return '';
  return stdout.slice(idx + 'Content:\n'.length);
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  return parseYaml(match[1]) as Record<string, unknown>;
}

describe('issue-to-content pipeline', () => {
  // Shared across all nested describes — afterEach cleans up after every test
  let filePath = '';

  afterEach(() => {
    if (filePath && existsSync(filePath)) {
      unlinkSync(filePath);
    }
    filePath = '';
  });

  // ── Seminar ─────────────────────────────────────────────────────────────────

  describe('seminar', () => {
    // GitHub forms render each field as "### {label}\n\n{value}"
    const completeBody = [
      '### Date',
      '',
      '9999-01-01',
      '',
      '### Speaker',
      '',
      'Test Speaker',
      '',
      '### Affiliation (Polish)',
      '',
      'Wydział MiNI PW',
      '',
      '### Affiliation (English)',
      '',
      'Faculty of MiNI, WUT',
      '',
      '### Title (English)',
      '',
      'Test Seminar Title',
      '',
      '### Title (Polish)',
      '',
      'Testowy tytuł seminarium',
      '',
      '### Abstract (English)',
      '',
      'Test abstract in English.',
      '',
      '### Abstract (Polish)',
      '',
      'Testowe streszczenie po polsku.',
      '',
      '### Slides URL',
      '',
      'https://example.com/slides.pdf',
    ].join('\n');

    const requiredOnlyBody = [
      '### Date',
      '',
      '9999-01-01',
      '',
      '### Speaker',
      '',
      'Test Speaker',
      '',
      '### Affiliation (Polish)',
      '',
      '_No response_',
      '',
      '### Affiliation (English)',
      '',
      '_No response_',
      '',
      '### Title (English)',
      '',
      'Test Seminar Title',
      '',
      '### Title (Polish)',
      '',
      '_No response_',
      '',
      '### Abstract (English)',
      '',
      '_No response_',
      '',
      '### Abstract (Polish)',
      '',
      '_No response_',
      '',
      '### Slides URL',
      '',
      '_No response_',
    ].join('\n');

    it('complete issue: frontmatter passes strict schema', () => {
      const result = runScript('add-seminar', completeBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      const parsed = seminarSchema.safeParse(data);
      expect(
        parsed.success,
        `Strict schema errors:\n${parsed.success ? '' : JSON.stringify(parsed.error.issues, null, 2)}`,
      ).toBe(true);
    });

    it('complete issue: affiliation_pl and affiliation_en are set independently', () => {
      const result = runScript('add-seminar', completeBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      expect(data.affiliation_pl).toBe('Wydział MiNI PW');
      expect(data.affiliation_en).toBe('Faculty of MiNI, WUT');
    });

    it('required fields only: frontmatter passes strict schema', () => {
      const result = runScript('add-seminar', requiredOnlyBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      const parsed = seminarSchema.safeParse(data);
      expect(
        parsed.success,
        `Strict schema errors:\n${parsed.success ? '' : JSON.stringify(parsed.error.issues, null, 2)}`,
      ).toBe(true);
    });
  });

  // ── Publication ──────────────────────────────────────────────────────────────

  describe('publication', () => {
    const completeBody = [
      '### Authors',
      '',
      // Semicolon-separated; second author has a comma in the name to verify fix 3
      'Test Speaker; Smith Jr., John',
      '',
      '### Title',
      '',
      'Test Publication Title',
      '',
      '### Journal or Venue',
      '',
      'Test Journal',
      '',
      '### Year',
      '',
      '9999',
      '',
      '### Publication Type',
      '',
      'journal',
      '',
      '### DOI',
      '',
      '10.1234/test',
      '',
      '### URL',
      '',
      'https://example.com/paper',
      '',
      '### Impact Factor',
      '',
      '2.5',
    ].join('\n');

    const requiredOnlyBody = [
      '### Authors',
      '',
      'Test Speaker',
      '',
      '### Title',
      '',
      'Test Publication Title',
      '',
      '### Journal or Venue',
      '',
      'Test Journal',
      '',
      '### Year',
      '',
      '9999',
      '',
      '### Publication Type',
      '',
      'journal',
      '',
      '### DOI',
      '',
      '_No response_',
      '',
      '### URL',
      '',
      '_No response_',
      '',
      '### Impact Factor',
      '',
      '_No response_',
    ].join('\n');

    it('complete issue: frontmatter passes strict schema', () => {
      const result = runScript('add-publication', completeBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      const parsed = publicationSchema.safeParse(data);
      expect(
        parsed.success,
        `Strict schema errors:\n${parsed.success ? '' : JSON.stringify(parsed.error.issues, null, 2)}`,
      ).toBe(true);
    });

    it('complete issue: authors split by semicolons, doi and url both written', () => {
      const result = runScript('add-publication', completeBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      expect(data.authors).toEqual(['Test Speaker', 'Smith Jr., John']);
      expect(data.doi).toBe('10.1234/test');
      expect(data.url).toBe('https://example.com/paper');
    });

    it('required fields only: frontmatter passes strict schema', () => {
      const result = runScript('add-publication', requiredOnlyBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      const parsed = publicationSchema.safeParse(data);
      expect(
        parsed.success,
        `Strict schema errors:\n${parsed.success ? '' : JSON.stringify(parsed.error.issues, null, 2)}`,
      ).toBe(true);
    });
  });

  // ── Team member ──────────────────────────────────────────────────────────────

  describe('team member', () => {
    const completeBody = [
      '### Full Name',
      '',
      'Test Speaker',
      '',
      '### Role (English)',
      '',
      'PhD Student',
      '',
      '### Role (Polish)',
      '',
      'Doktorant',
      '',
      '### Affiliation (Polish)',
      '',
      'Wydział MiNI PW',
      '',
      '### Affiliation (English)',
      '',
      'Faculty of MiNI, WUT',
      '',
      '### Email',
      '',
      'test@example.com',
      '',
      '### LinkedIn',
      '',
      'https://www.linkedin.com/in/test-speaker',
      '',
      '### GitHub URL',
      '',
      'https://github.com/test-speaker',
      '',
      '### Picture',
      '',
      'test-speaker.jpg',
      '',
      '### Research Areas',
      '',
      'Medical imaging, Deep learning',
      '',
      '### Order',
      '',
      '42',
    ].join('\n');

    const requiredOnlyBody = [
      '### Full Name',
      '',
      'Test Speaker',
      '',
      '### Role (English)',
      '',
      'PhD Student',
      '',
      '### Role (Polish)',
      '',
      '_No response_',
      '',
      '### Affiliation (Polish)',
      '',
      '_No response_',
      '',
      '### Affiliation (English)',
      '',
      '_No response_',
      '',
      '### Email',
      '',
      '_No response_',
      '',
      '### LinkedIn',
      '',
      '_No response_',
      '',
      '### GitHub URL',
      '',
      '_No response_',
      '',
      '### Picture',
      '',
      '_No response_',
      '',
      '### Research Areas',
      '',
      '_No response_',
      '',
      '### Order',
      '',
      '_No response_',
    ].join('\n');

    it('complete issue: frontmatter passes strict schema', () => {
      const result = runScript('add-team-member', completeBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      const parsed = teamSchema.safeParse(data);
      expect(
        parsed.success,
        `Strict schema errors:\n${parsed.success ? '' : JSON.stringify(parsed.error.issues, null, 2)}`,
      ).toBe(true);
    });

    it('complete issue: all new fields written correctly', () => {
      const result = runScript('add-team-member', completeBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      expect(data.affiliation_pl).toBe('Wydział MiNI PW');
      expect(data.affiliation_en).toBe('Faculty of MiNI, WUT');
      expect(data.linkedin).toBe('https://www.linkedin.com/in/test-speaker');
      expect(data.github).toBe('https://github.com/test-speaker');
      expect(data.picture).toBe('test-speaker.jpg');
      expect(data.order).toBe(42);
    });

    it('required fields only: frontmatter passes strict schema', () => {
      const result = runScript('add-team-member', requiredOnlyBody);
      filePath = result.filePath;
      const content = extractContent(result.stdout);
      const data = parseFrontmatter(content);
      const parsed = teamSchema.safeParse(data);
      expect(
        parsed.success,
        `Strict schema errors:\n${parsed.success ? '' : JSON.stringify(parsed.error.issues, null, 2)}`,
      ).toBe(true);
    });
  });
});

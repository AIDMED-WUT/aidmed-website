import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { parse as parseYaml } from 'yaml';

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  return parseYaml(match[1]) as Record<string, unknown>;
}

// Mirror the schemas from src/content/config.ts without importing astro:content
const seminarSchema = z.object({
  date: z.string(),
  speaker: z.string(),
  affiliation_pl: z.string().optional(),
  affiliation_en: z.string().optional(),
  title: z.string(),
  title_pl: z.string().optional(),
  abstract: z.string().optional(),
  abstract_pl: z.string().optional(),
  slides: z.string().optional(),
});

const publicationSchema = z.object({
  authors: z.array(z.string()),
  title: z.string(),
  journal: z.string().optional(),
  booktitle: z.string().optional(),
  year: z.number(),
  doi: z.string().optional(),
  url: z.string().optional(),
  impact_factor: z.number().optional(),
  type: z.enum(['journal', 'book_chapter', 'conference']),
});

const teamSchema = z.object({
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
});

const projectSchema = z.object({
  title: z.string(),
  lang: z.enum(['pl', 'en']),
  grant_id: z.string().optional(),
  period: z.string().optional(),
  status: z.enum(['active', 'completed']),
});

const contentRoot = resolve(process.cwd(), 'src/content');

function getMarkdownFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => join(dir, f));
}

function validateCollection(
  collectionName: string,
  schema: z.ZodTypeAny,
) {
  const dir = join(contentRoot, collectionName);
  const files = getMarkdownFiles(dir);

  describe(`${collectionName} collection`, () => {
    it('has at least one file', () => {
      expect(files.length).toBeGreaterThan(0);
    });

    for (const file of files) {
      it(`${file.split('/').pop()} has valid frontmatter`, () => {
        const raw = readFileSync(file, 'utf-8');
        const data = parseFrontmatter(raw);
        const result = schema.safeParse(data);
        expect(
          result.success,
          `Frontmatter errors in ${file}:\n${
            result.success ? '' : JSON.stringify(result.error.issues, null, 2)
          }`,
        ).toBe(true);
      });
    }
  });
}

describe('Content frontmatter validation', () => {
  validateCollection('seminars', seminarSchema);
  validateCollection('publications', publicationSchema);
  validateCollection('team', teamSchema);
  validateCollection('projects', projectSchema);
});

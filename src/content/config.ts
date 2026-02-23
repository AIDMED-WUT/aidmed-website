import { defineCollection, z } from 'astro:content';

const seminars = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.string(),
    speaker: z.string(),
    affiliation_pl: z.string().optional(),
    affiliation_en: z.string().optional(),
    title: z.string(),
    title_pl: z.string().optional(),
    abstract: z.string().optional(),
    abstract_pl: z.string().optional(),
    slides: z.string().optional(),
  }),
});

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    authors: z.array(z.string()),
    title: z.string(),
    journal: z.string().optional(),
    booktitle: z.string().optional(),
    year: z.number(),
    doi: z.string().optional(),
    url: z.string().optional(),
    impact_factor: z.number().optional(),
    type: z.enum(['journal', 'book_chapter', 'conference']),
  }),
});

const team = defineCollection({
  type: 'content',
  schema: z.object({
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
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    lang: z.enum(['pl', 'en']),
    grant_id: z.string().optional(),
    period: z.string().optional(),
    status: z.enum(['active', 'completed']),
  }),
});

export const collections = { seminars, publications, team, projects };

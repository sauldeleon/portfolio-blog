import { Pool } from '@neondatabase/serverless'
import { monotonicFactory } from 'ulid'

const ulid = monotonicFactory()

const DATABASE_URL =
  'postgresql://neondb_owner:npg_DZvhOXH1mft0@ep-rapid-wave-apnjdng6-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

const pool = new Pool({ connectionString: DATABASE_URL })

const posts = [
  {
    id: ulid(),
    category: 'coding',
    tags: ['REACT', 'TYPESCRIPT', 'TUTORIAL'],
    author: 'Saúl de León',
    publishedAt: new Date('2024-01-15'),
    title: 'Getting Started with React 19',
    slug: 'getting-started-react-19',
    excerpt: 'A deep dive into the new features introduced in React 19.',
    content:
      '# Getting Started with React 19\n\nReact 19 introduces several exciting features...',
  },
  {
    id: ulid(),
    category: 'coding',
    tags: ['NEXTJS', 'TYPESCRIPT', 'PERFORMANCE'],
    author: 'Saúl de León',
    publishedAt: new Date('2024-03-22'),
    title: 'Next.js App Router Performance Tips',
    slug: 'nextjs-app-router-performance-tips',
    excerpt:
      'How to squeeze every bit of performance from the Next.js App Router.',
    content:
      '# Next.js App Router Performance Tips\n\nThe App Router changed everything...',
  },
  {
    id: ulid(),
    category: 'coding',
    tags: ['CSS', 'DESIGN', 'TUTORIAL'],
    author: 'Saúl de León',
    publishedAt: new Date('2024-06-10'),
    title: 'Modern CSS Techniques You Should Know',
    slug: 'modern-css-techniques',
    excerpt:
      'Container queries, cascade layers, and more modern CSS you need today.',
    content: '# Modern CSS Techniques\n\nCSS has evolved dramatically...',
  },
  {
    id: ulid(),
    category: 'mountaineering',
    tags: ['CLIMBING', 'ADVENTURE', 'NATURE'],
    author: 'Saúl de León',
    publishedAt: new Date('2024-09-05'),
    title: 'My First 3000m Summit',
    slug: 'my-first-3000m-summit',
    excerpt:
      'A personal account of reaching my first three-thousand metre peak.',
    content: '# My First 3000m Summit\n\nThe alarm went off at 4am...',
  },
  {
    id: ulid(),
    category: 'photography',
    tags: ['PHOTOGRAPHY', 'NATURE', 'TUTORIAL'],
    author: 'Saúl de León',
    publishedAt: new Date('2024-11-18'),
    title: 'Landscape Photography in the Golden Hour',
    slug: 'landscape-photography-golden-hour',
    excerpt:
      'Tips for capturing breathtaking landscapes during the golden hour.',
    content:
      '# Landscape Photography in the Golden Hour\n\nLight is everything...',
  },
  {
    id: ulid(),
    category: 'gaming',
    tags: ['GAMES', 'CHESS', 'STRATEGY'],
    author: 'Saúl de León',
    publishedAt: new Date('2023-02-14'),
    title: 'Why Chess Makes You a Better Developer',
    slug: 'chess-makes-better-developer',
    excerpt:
      'The surprising parallels between chess thinking and software engineering.',
    content:
      '# Why Chess Makes You a Better Developer\n\nBoth require deep planning...',
  },
  {
    id: ulid(),
    category: 'canyoning',
    tags: ['ADVENTURE', 'NATURE', 'TRAVEL'],
    author: 'Saúl de León',
    publishedAt: new Date('2023-07-30'),
    title: 'Canyoning in the Pyrenees',
    slug: 'canyoning-in-the-pyrenees',
    excerpt:
      'An unforgettable canyoning trip through some of the most stunning gorges.',
    content: '# Canyoning in the Pyrenees\n\nThe water was ice cold...',
  },
  {
    id: ulid(),
    category: 'coding',
    tags: ['NODEJS', 'TYPESCRIPT', 'PERFORMANCE'],
    author: 'Saúl de León',
    publishedAt: new Date('2023-10-08'),
    title: 'Node.js Streams Demystified',
    slug: 'nodejs-streams-demystified',
    excerpt:
      'Understanding Node.js streams from scratch with practical examples.',
    content:
      '# Node.js Streams Demystified\n\nStreams are one of the most powerful features...',
  },
  {
    id: ulid(),
    category: 'photography',
    tags: ['PHOTOGRAPHY', 'TRAVEL', 'DESIGN'],
    author: 'Saúl de León',
    publishedAt: new Date('2025-02-20'),
    title: 'Street Photography: Finding Stories in Cities',
    slug: 'street-photography-finding-stories',
    excerpt:
      'How to capture authentic human moments in busy urban environments.',
    content:
      '# Street Photography: Finding Stories in Cities\n\nEvery city has a soul...',
  },
  {
    id: ulid(),
    category: 'mountaineering',
    tags: ['CLIMBING', 'ADVENTURE', 'NATURE', 'TRAVEL'],
    author: 'Saúl de León',
    publishedAt: new Date('2025-04-03'),
    title: 'Gear Guide: What to Pack for Alpine Routes',
    slug: 'gear-guide-alpine-routes',
    excerpt: 'A practical gear checklist for multi-day alpine climbing routes.',
    content:
      '# Gear Guide: What to Pack for Alpine Routes\n\nPacking light without sacrificing safety...',
  },
]

async function seed() {
  console.log('Seeding 10 mock posts...')

  for (const post of posts) {
    const { title, slug, excerpt, content, publishedAt, ...postFields } = post

    await pool.query(
      `INSERT INTO posts (id, category, tags, author, status, published_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'published', $5, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        postFields.id,
        postFields.category,
        postFields.tags,
        postFields.author,
        publishedAt,
      ],
    )

    await pool.query(
      `INSERT INTO post_translations (post_id, locale, title, slug, excerpt, content)
       VALUES ($1, 'en', $2, $3, $4, $5)
       ON CONFLICT (post_id, locale) DO NOTHING`,
      [postFields.id, title, slug, excerpt, content],
    )

    console.log(`  ✓ ${title}`)
  }

  console.log('Done.')
  await pool.end()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})

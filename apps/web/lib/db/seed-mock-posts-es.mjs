import { Pool } from '@neondatabase/serverless'

const DATABASE_URL =
  'postgresql://neondb_owner:npg_DZvhOXH1mft0@ep-rapid-wave-apnjdng6-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

const pool = new Pool({ connectionString: DATABASE_URL })

const translations = [
  {
    postId: '01KS2M8414DYPQSWDBS07TA9N2',
    title: 'Primeros pasos con React 19',
    slug: 'primeros-pasos-react-19',
    excerpt:
      'Una inmersión profunda en las nuevas funcionalidades de React 19.',
    content:
      '# Primeros pasos con React 19\n\nReact 19 introduce varias funcionalidades emocionantes...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBCZ',
    title: 'Consejos de rendimiento para el App Router de Next.js',
    slug: 'rendimiento-app-router-nextjs',
    excerpt:
      'Cómo exprimir al máximo el rendimiento del App Router de Next.js.',
    content:
      '# Consejos de rendimiento para el App Router de Next.js\n\nEl App Router lo cambió todo...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBD0',
    title: 'Técnicas modernas de CSS que deberías conocer',
    slug: 'tecnicas-modernas-css',
    excerpt:
      'Container queries, cascade layers y más CSS moderno que necesitas hoy.',
    content:
      '# Técnicas modernas de CSS\n\nCSS ha evolucionado drásticamente...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBD1',
    title: 'Mi primera cima de 3000m',
    slug: 'primera-cima-3000m',
    excerpt:
      'Un relato personal de cómo alcancé mi primera cumbre de tres mil metros.',
    content:
      '# Mi primera cima de 3000m\n\nEl despertador sonó a las 4 de la mañana...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBD2',
    title: 'Fotografía de paisajes en la hora dorada',
    slug: 'fotografia-paisajes-hora-dorada',
    excerpt:
      'Consejos para capturar paisajes impresionantes durante la hora dorada.',
    content:
      '# Fotografía de paisajes en la hora dorada\n\nLa luz lo es todo...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBD3',
    title: 'Por qué el ajedrez te hace mejor desarrollador',
    slug: 'ajedrez-mejor-desarrollador',
    excerpt:
      'Los sorprendentes paralelismos entre el pensamiento ajedrecístico y la ingeniería de software.',
    content:
      '# Por qué el ajedrez te hace mejor desarrollador\n\nAmbos requieren una planificación profunda...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBD4',
    title: 'Barranquismo en los Pirineos',
    slug: 'barranquismo-pirineos',
    excerpt:
      'Una excursión de barranquismo inolvidable por algunos de los cañones más espectaculares.',
    content: '# Barranquismo en los Pirineos\n\nEl agua estaba helada...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBD5',
    title: 'Streams de Node.js desmitificados',
    slug: 'streams-nodejs-desmitificados',
    excerpt:
      'Entendiendo los streams de Node.js desde cero con ejemplos prácticos.',
    content:
      '# Streams de Node.js desmitificados\n\nLos streams son una de las características más potentes...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBD6',
    title: 'Fotografía callejera: encontrando historias en las ciudades',
    slug: 'fotografia-callejera-historias-ciudades',
    excerpt:
      'Cómo capturar momentos humanos auténticos en entornos urbanos concurridos.',
    content:
      '# Fotografía callejera: encontrando historias en las ciudades\n\nCada ciudad tiene alma...',
  },
  {
    postId: '01KS2M8417KWGQTEZ2D03XTBD7',
    title: 'Guía de equipo: qué llevar en rutas alpinas',
    slug: 'guia-equipo-rutas-alpinas',
    excerpt:
      'Una lista práctica de material para rutas de alpinismo de varios días.',
    content:
      '# Guía de equipo: qué llevar en rutas alpinas\n\nIr ligero sin sacrificar la seguridad...',
  },
]

async function seed() {
  console.log('Inserting Spanish translations...')

  for (const t of translations) {
    await pool.query(
      `INSERT INTO post_translations (post_id, locale, title, slug, excerpt, content)
       VALUES ($1, 'es', $2, $3, $4, $5)
       ON CONFLICT (post_id, locale) DO NOTHING`,
      [t.postId, t.title, t.slug, t.excerpt, t.content],
    )
    console.log(`  ✓ ${t.title}`)
  }

  console.log('Done.')
  await pool.end()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})

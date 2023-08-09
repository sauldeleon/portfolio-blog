//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next')

const locales = ['default', 'en', 'es']

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: true,
  },

  compiler: {
    // For other options, see https://styled-components.com/docs/tooling#babel-plugin
    styledComponents: true,
  },
  pageExtensions: ['next.tsx', 'next.ts', 'next.jsx', 'next.js'],
  trailingSlash: true,
  images: {
    // @see https://nextjs.org/docs/api-reference/next/image#caching-behavior
    // This value is set by default to 3600 seconds because our images don't change too often.
    deviceSizes: [576, 768, 1200, 2400],
    // Cloudflare issues with Vary header using Accept for non-supported image formats (webp) https://github.com/vercel/next.js/discussions/39510
    path: '/_next/image.jpg',
    minimumCacheTTL: 3600,
    domains: ['localhost'],
    disableStaticImages: true,
  },
  i18n: {
    locales,
    defaultLocale: 'default',
    localeDetection: false,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          // Cloudflare issues with Vary header using Accept for non-supported image formats (webp) https://github.com/vercel/next.js/discussions/39510
          source: '/_next/image.jpg',
          destination: '/_next/image',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
  productionBrowserSourceMaps: true,
  webpack: (config, { webpack, isServer }) => {
    const CircularDependency = require('circular-dependency-plugin')

    config.plugins.push(
      new webpack.ContextReplacementPlugin(
        /^date-fns[/\\]locale$/,
        new RegExp(`\\.[/\\\\](${locales.join('|')})[/\\\\]index\\.js$`, 'i')
      )
    )

    config.plugins.push(
      new CircularDependency({
        // exclude detection of files based on a RegExp
        exclude: /node_modules/,
        // include specific files based on a RegExp
        // include: /dir/,
        // add errors to webpack instead of warnings
        failOnError: true,
        // allow import cycles that include an asynchronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
      })
    )

    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        },
      }
    }

    return config
  },
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
]

module.exports = composePlugins(...plugins)(nextConfig)

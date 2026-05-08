//@ts-check

const { composePlugins, withNx } = require('@nx/next')

const locales = ['en', 'es']

const isStaticExport = process.env.EXPORT_STATIC_FILES === 'true'

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  output: isStaticExport ? 'export' : undefined,
  async headers() {
    if (isStaticExport) return []
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Link',
            value: [
              '</sitemap.xml>; rel="sitemap"',
              '<https://github.com/sauldeleon>; rel="me"',
              '<https://www.linkedin.com/in/sauldeleonguerrero>; rel="me"',
            ].join(', '),
          },
        ],
      },
      ...['en', 'es'].map((lng) => ({
        source: `/${lng}/(.*)?`,
        headers: [
          {
            key: 'Link',
            value: `</api/markdown/${lng}>; rel="alternate"; type="text/markdown"`,
          },
        ],
      })),
    ]
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: false,
              titleProp: true,
              ref: true,
              exportType: 'named',
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  compiler: {
    // For other options, see https://styled-components.com/docs/tooling#babel-plugin
    styledComponents: true,
  },
  pageExtensions: ['next.tsx', 'next.ts', 'next.jsx', 'next.js', 'ts'],
  trailingSlash: true,
  images: {
    // @see https://nextjs.org/docs/api-reference/next/image#caching-behavior
    // This value is set by default to 3600 seconds because our images don't change too often.
    deviceSizes: [576, 768, 1200, 2400],
    minimumCacheTTL: 3600,
    remotePatterns: [{ hostname: 'localhost' }],
    disableStaticImages: true,
  },
  productionBrowserSourceMaps: true,
  webpack: (config, { webpack, isServer }) => {
    const CircularDependency = require('circular-dependency-plugin')

    config.plugins.push(
      new webpack.ContextReplacementPlugin(
        /^date-fns[/\\]locale$/,
        new RegExp(`\\.[/\\\\](${locales.join('|')})[/\\\\]index\\.js$`, 'i'),
      ),
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
      }),
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

// Add SVGR webpack config function
// @ts-expect-error untyped Nx/Next config wrapper
const withSvgr = (config) => {
  const originalWebpack = config.webpack
  // @ts-expect-error untyped webpack config params
  config.webpack = (webpackConfig, ctx) => {
    // Add SVGR support with webpack 5 asset modules
    webpackConfig.module.rules.push({
      test: /.svg$/,
      oneOf: [
        {
          resourceQuery: /url/,
          type: 'asset/resource',
          generator: {
            filename: 'static/media/[name].[hash][ext]',
          },
        },
        {
          issuer: { not: /\.(css|scss|sass)$/ },
          resourceQuery: {
            not: [
              /__next_metadata__/,
              /__next_metadata_route__/,
              /__next_metadata_image_meta__/,
            ],
          },
          use: [
            {
              loader: require.resolve('@svgr/webpack'),
              options: {
                svgo: false,
                titleProp: true,
                ref: true,
                exportType: 'named',
              },
            },
          ],
        },
      ],
    })
    return originalWebpack ? originalWebpack(webpackConfig, ctx) : webpackConfig
  }
  return config
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
]

module.exports = composePlugins(...plugins, withSvgr)(nextConfig)

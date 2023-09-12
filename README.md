# www.sawl.dev source code

This is the source code for my personal website and portfolio, where I have tried to put all the best practices and technologies I enjoy working with.

Don't hesitate to open issues, or ask whatever you want about the decisions taken

## Used technologies

- [Next.JS](https://nextjs.org/) with App router for the website
- [Styled-components](https://styled-components.com/) >6
- [Jest](https://jestjs.io/es-ES/) for testing
- [Cypress](https://www.cypress.io/) for e2e testing
- [Yarn](https://yarnpkg.com/) as package manager
- [NX](https://nx.dev/) as the monorepo tool

## Useful commands

- `yarn start`: To run the development server and start the application. Open your browser and navigate to http://localhost:4200/.
- `yarn test:all`: To run all the tests, web + packages minus e2e and api. These 2 run in separate commands.
- `yarn build:web`: To generate the Next.JS build. Additionally you can set the `EXPORT_STATIC_FILES` environment variable to export static files. `EXPORT_STATIC_FILES=true yarn build:web`

## Libraries

Each library should have its own readme for further information. This is just a small summary

- assets: to maintain common static files
- button: simple button component with small logic
- circle-link: a link with an icon and some animations
- footer: reusable footer that accept params for customization
- global-types: shared types
- header: reusable header that accept params for customization
- i18n-client: to use the internationalization client side methods across multiple projects
- i18n-server: to use the internationalization server side methods across multiple projects
- i18n-config: shared configuration to initialize internationalization
- i18n-tools: shared methods for internationalization
- link: link with added styles and some logic
- main-theme: shared styled-components theme
- mocks: shared mocks between multiple libraries and apps
- storage: interface library to create and share storage like localStorage, sessionStorage...
- test-utils: shared testing tools
- typography: for writing text in different sizes according to the design library
- use-container-dimensions: custom hook that responds to a increase or decrease of a given ref
- use-debounce: custom hook to debounce a function
- use-is-bot: custom hook to check if a bot is crawling the website
- visually-hidden: accessibility component to give screen reader info without modifying the visual layout

## Code coverage and quality

You can check code coverage with [codecov](https://app.codecov.io/gh/sauldeleon/portfolio-blog) and code quality at [sonarcloud](https://sonarcloud.io/summary/new_code?id=sauldeleon_portfolio-blog).

## CI/CD

Website is hosted at [Vercel](https://vercel.com/) at the moment as it gives the simplest approach.

I use Github actions ecosystem for CI/CD to my needs to have a small assurance at every deploy running the tests and a small build to verify nothing will crash.

## About the design

To build a website you usually need a design, and I'm not a designer. I enjoy transforming designs into websites, but after a few tries I found myself absolutely incapable of making my own design.

This is where [Valentina](https://www.linkedin.com/in/valentina-florentina-balta-cojocaru-stan-83619014a/) showed up bringing me an amazing help and designed this stunning website with ideas that I haven't imagined by myself. So I want to give a special mention to her and [her work](http://valentina.pro/work_portfolio.html).

If you are curious, you can take a look to the Figma designs [here](https://www.figma.com/file/ZgfaiU473XMQAWz9kbiMO6/Saul-portfolio-%2B-design-library).

## Future work

This is an ongoing work and it will be including new features:

- an internal api
- more e2e tests
- experience and portfolio pages
- more cooking ideas...

## Greetings

Yes, have built this website, but honestly some stuff would not be possible without help for friends and colleagues that have assisted me and gave me ideas. From here I wish to thank:

- [Borja González](https://github.com/bgonp): Amazing Frontend Developer that used his time for helping me and giving me styling advice to resolve the mysteries of css animations.
- [Josep Fornies](https://github.com/d0whc3r): He claims himself as a frontend developer, he always has an amazing approach and the enough knowledge to rewrite everything in a smarter and more efficient way of all known technologies. Twice.
- [Paula Guijarro](https://github.com/paulaguijarro): She has the power of SRE in her veins and she showed me the art of Github Actions. Thanks to her I have CI/CD here and I will not merge never something into main branch without a passing pipeline. Just in case.
- People that have helped me testing and finding bugs or giving me more ideas (or including more flying icons, there are never enough floating icons).

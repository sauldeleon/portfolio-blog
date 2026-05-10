import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const content: Record<string, string> = {
  en: `# Saúl de León Guerrero

**Front-End Software Engineer** — Based in Asturias, Spain

## About Me

Experienced Software Engineer skilled in translating code into polished and efficient digital solutions. With a meticulous attention to detail, I specialize in developing software that not only fulfills functional requirements but also results into a smooth and user-friendly experience.

Preference for the (x)ERN stack, transforming designs into responsive webs. Fluent in HTML5, CSS3, and (Java|Type)Script. Fullstack experience, most enthusiastic about FrontEnd development.

## Skills

- **Front End**: React, Next.js, TypeScript, Styled Components, Emotion, Storybook
- **Back End**: Node.js, Express, Java Spring, Perl Catalyst
- **Mobile**: Expo / React Native, Ionic
- **Databases**: MongoDB, Oracle, PostgreSQL, MySQL
- **CI/CD**: GitLab Pipelines, GitHub Actions, Jenkins

## Links

- Portfolio: https://www.sawl.dev
- GitHub: https://github.com/sauldeleon
- LinkedIn: https://www.linkedin.com/in/sauldeleonguerrero
`,
  es: `# Saúl de León Guerrero

**Ingeniero de Software Front-End** — Con sede en Asturias, España

## Sobre mí

Ingeniero de Software con experiencia en transformar código en soluciones digitales pulidas y eficientes. Con especial atención al detalle, me especializo en desarrollar software que no solo cumple con los requisitos funcionales, sino que también proporciona una experiencia fluida y amigable.

## Habilidades

- **Front End**: React, Next.js, TypeScript, Styled Components, Emotion, Storybook
- **Back End**: Node.js, Express, Java Spring, Perl Catalyst
- **Móvil**: Expo / React Native, Ionic
- **Bases de datos**: MongoDB, Oracle, PostgreSQL, MySQL
- **CI/CD**: GitLab Pipelines, GitHub Actions, Jenkins

## Enlaces

- Portfolio: https://www.sawl.dev
- GitHub: https://github.com/sauldeleon
- LinkedIn: https://www.linkedin.com/in/sauldeleonguerrero
`,
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lng: string }> },
) {
  const { lng } = await params
  const markdown = content[lng] ?? content['en']
  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(markdown.split(/\s+/).length),
    },
  })
}

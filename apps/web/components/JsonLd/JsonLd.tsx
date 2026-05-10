type JsonLdData = {
  '@context': string
  '@type': string
  [key: string]: unknown
}

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      data-testid="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

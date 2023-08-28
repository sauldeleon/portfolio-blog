export function publicUrl(path: string) {
  return `${process.env.BASE_URL}${path}`
}

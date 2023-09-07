export function removeFirstPart(urlPath: string) {
  return urlPath.replace(/^\/\w+/, '')
}

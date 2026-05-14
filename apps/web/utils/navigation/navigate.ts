type NavigationTarget = Pick<Location, 'assign'>

export function navigateTo(
  url: string,
  location: NavigationTarget = window.location,
) {
  location.assign(url)
}

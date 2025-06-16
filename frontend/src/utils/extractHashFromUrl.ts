/**
 * Extracts the hash segment from a given URL string.
 * Assumes the hash is the last segment in the URL's pathname.
 * @param urlString The full URL string.
 * @returns The hash segment as a string.
 */
export function extractHashFromUrl(urlString: string): string {
  // Use the URL constructor to parse the URL
  const url = new URL(urlString)

  // Split the pathname by '/' to get segments
  const pathSegments = url.pathname.split('/')

  // The hash is expected to be the last segment
  const hash = pathSegments[pathSegments.length - 1]

  return hash
}
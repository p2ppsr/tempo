// uhp-url.d.ts
declare module 'uhrp-url' {
  /**
   * Given the hash of a file, returns a UHRP URL string.
   * @param hash - A Buffer that is the 32-byte sha256 hash of a file.
   * @returns A base58 URL string.
   */
  export function getURLForHash(hash: Buffer): string;

  /**
   * Given the file data as a buffer, returns a UHRP URL string.
   * @param file - A Buffer that is the data in a file.
   * @returns A base58 URL string.
   */
  export function getURLForFile(file: Buffer | Uint8Array | string): string;

  /**
   * Given a URL string, verifies its checksum and if valid, returns the hash of the file.
   * @param URL - The base58 URL string.
   * @returns The 32-byte buffer that is the hash of the data represented by the URL.
   */
  export function getHashFromURL(URL: string): Buffer;

  /**
   * Given a URL string, returns true if it is valid, false otherwise.
   * @param URL - The base58 URL string.
   * @returns A boolean, true if the URL is valid.
   */
  export function isValidURL(URL: string): boolean;
}

// cwi-crypto.d.ts
declare module "cwi-crypto" {
  /**
   * Encrypts the given plaintext with the given key. Returns the ciphertext.
   * @param plaintext The data to encrypt. May be a String or a Uint8Array.
   * @param key The CryptoKey object to use for the encryption operation.
   * @param returnType A string indicating the desired return type. May be either 'string' (default) or 'Uint8Array'.
   * @returns The ciphertext as a string or a Uint8Array, depending on the value of returnType.
   */
  export function encrypt(
    plaintext: Uint8Array | string,
    key: CryptoKey,
    returnType: "string" | "Uint8Array"
  ): Uint8Array | string

  /**
   * Decrypts the given ciphertext with the given key. Returns the plaintext.
   * @param ciphertext The data to decrypt. May be a String or a Uint8Array.
   * @param key The CryptoKey object to use for the decryption operation.
   * @param returnType A string indicating the desired return type. May be either 'string' (default) or 'Uint8Array'.
   * @returns The plaintext as a string or a Uint8Array, depending on the value of returnType.
   */
  export function decrypt(
    ciphertext: Uint8Array | string,
    key: CryptoKey,
    returnType: "string" | "Uint8Array"
  ): Promise<Uint8Array | string> // TODO: cwi-crypto decrypt is async, yes???

  /**
   * Derives a suitable CryptoKey from the password string with PBKDF2 and the given salt.
   * @param params An object containing the password string and the salt as a Uint8Array.
   * @returns A CryptoKey object representing the derived key.
   */
  export function keyFromString(params: {
    string: string
    salt: Uint8Array
  }): CryptoKey

  /**
   * Performs a bitwise exclusive OR operation with the given data. Returns the result.
   * Inputs must be the same length.
   * @param k1 A Uint8Array representing the first input to XOR.
   * @param k2 A Uint8Array representing the second input to XOR.
   * @returns A Uint8Array containing the output data.
   */
  export function XOR(k1: Uint8Array, k2: Uint8Array): Uint8Array
}

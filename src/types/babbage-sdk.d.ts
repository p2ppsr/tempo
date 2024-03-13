declare module "@babbage/sdk-ts" {
  // Common Types
  type BufferType = Buffer | string // hex string
  type ProtocolID = [number, string] | string
  type ReturnType = "string" | "Uint8Array"
  type IdentityKey = string
  type Action = {
    txid: string
    rawTx: string
    mapiResponses?: any
    inputs: any
  } // Adjust as needed
  type Signature = Uint8Array
  type Hmac = Uint8Array
  type PublicKey = { key: string } | string

  // Data structures for specific functions
  interface EncryptedData {
    ciphertext: BufferType
  }

  interface BitcoinOutputScript {
    fields: BufferType[]
    protocolID: ProtocolID
    keyID: string
  }

  interface ActionData {
    outputs?: Array<{
      satoshis: number
      script: BufferType
      description?: string
    }>
    inputs?: any // Define more specifically based on usage
    lockTime?: number
    description: string
    acceptDelayedBroadcast?: boolean
    topic?: string | string[] // TODO: tempoTopic is a string in constants but called as an string[] in utils/updateSong.ts
  }

  interface UnlockingScript {
    script: BufferType
    // ... define other properties
  }

  interface TransactionOutputDescriptor {
    txid: string
    outputIndex: number
    satoshis: number
    lockingScript: BufferType
  }

  interface Certificate { }

  // Function Definitions
  export function encrypt(args: {
    plaintext: BufferType
    protocolID: ProtocolID
    keyID: string
  }): Promise<EncryptedData>

  export function decrypt(args: {
    ciphertext: BufferType
    protocolID: ProtocolID
    keyID: string
    returnType: ReturnType
  }): Promise<BufferType>

  export function createAction(args: ActionData): Promise<Action>
  export function createHmac(args: {
    data: BufferType
    protocolID: ProtocolID
    keyID: string
    description?: string
    counterparty?: IdentityKey
    privileged?: boolean
  }): Promise<Hmac>

  export function createSignature(args: {
    data: BufferType
    protocolID: ProtocolID
    keyID: string
    description?: string
    counterparty?: IdentityKey
    privileged?: boolean
  }): Promise<Signature>

  export function getWindowVersion(): Promise<string>

  export function getXDMVersion(): Promise<string>

  export function getPublicKey(args: {
    protocolID?: ProtocolID
    keyID?: string
    privileged?: boolean
    identityKey?: IdentityKey
    reason?: string
    counterparty?: IdentityKey
    forSelf?: boolean
    description?: string
  }): Promise<string>

  export function promiseWithTimeout(args: {
    timeout: number
    promise: Promise<any>
    error: Error
  }): Promise<any>

  export function getNetwork(): Promise<string>

  export function getVersion(): Promise<string>

  export function isAuthenticated(): Promise<{ isAuthenticated: boolean }>

  export function verifyHmac(args: {
    data: BufferType
    hmac: Hmac
    protocolID: ProtocolID
    keyID: string
    description?: string
    counterparty?: IdentityKey
    privileged?: boolean
  }): Promise<boolean>

  export function verifySignature(args: {
    data: BufferType
    signature: Signature
    protocolID: ProtocolID
    keyID: string
    description?: string
    counterparty?: IdentityKey
    privileged?: boolean
  }): Promise<boolean>

  export function waitForAuthentication(): Promise<{ isAuthenticated: boolean }>

  export function createCertificate(args: {
    certificateType: string
    fieldObject: object
    certifierUrl: string
    certifierPublicKey: PublicKey
  }): Promise<Certificate>

  export function getCertificates(args: {
    certifiers?: Array<string>
    types?: object // { [type: string]: Array<string> }
  }): Promise<object> // The structure of the object should be detailed based on actual return structure

  export function proveCertificate(args: {
    certificate: Certificate
    fieldsToReveal?: Array<string>
    verifierPublicIdentityKey: IdentityKey
  }): Promise<object> // The structure of the object should be detailed based on actual return structure

  export function submitDirectTransaction(args: {
    protocol: string
    transaction: object // Detailed structure based on actual usage
    senderIdentityKey: IdentityKey
    note: string
    amount: number
    derivationPrefix?: string
  }): Promise<object> // The structure of the object should be detailed based on actual return structure

  export function getTransactionOutputs(args: {
    basket?: string
    tracked?: boolean
    includeEnvelope?: boolean
    spendable?: boolean
    type?: string
    limit?: number
    offset?: number
  }): Promise<Array<TransactionOutputDescriptor>>

  export function listActions(args: {
    label: string
    limit?: number
    offset?: number
  }): Promise<Array<object>> // The structure of the object should be detailed based on actual return structure

  export function revealKeyLinkage(args: {
    mode: "counterparty" | "specific"
    counterparty: IdentityKey
    verifier: IdentityKey
    protocolID: string
    keyID: string
    description?: string
    privileged?: boolean
  }): Promise<object> // The structure of the object should be detailed based on actual return structure

  export function requestGroupPermission(): Promise<void>
}

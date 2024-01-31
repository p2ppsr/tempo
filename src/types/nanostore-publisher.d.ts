// nanostore-publisher.d.ts
declare module "nanostore-publisher" {
  interface Config {
    // Add specific properties of the config object here
  }

  interface InvoiceParams {
    config?: Config
    fileSize: number
    retentionPeriod: number
  }

  interface InvoiceResponse {
    message: string
    identityKey: string
    amount: number
    ORDER_ID: string
    publicURL: string
    status: string
    derivationPrefix: string
    derivationSuffix: string
    derivedPublicKey: string
  }

  interface DerivePaymentInfoParams {
    recipientPublicKey: string
    amount: number
    config?: Config
  }

  interface DerivePaymentInfoResponse {
    script: string
    amount: number
    derivationPrefix: string
    derivationSuffix: string
    derivedPublicKey: string
    output: { satoshis: number; script: BufferType; description: string }
  }

  interface SubmitPaymentParams {
    config?: Config
    orderID: string
    amount: number
    payment: object // Define a more specific type if known
    vout: number
    derivationPrefix: string
    derivationSuffix: string
  }

  interface SubmitPaymentResponse {
    uploadURL: string
    publicURL: string
    status: string
    // Add other properties of the payment result here
  }

  interface PayParams {
    config?: Config
    description: string
    orderID: string
    recipientPublicKey: string
    amount: number
  }

  interface PayResponse {
    uploadURL: string
    publicURL: string
    status: string
    // Add other properties of the pay object here
  }

  interface UploadParams {
    uploadURL?: string
    publicURL?: string
    file?: File | object // Define a more specific type for the custom object if known
    serverURL?: string
    onUploadProgress?: (progressEvent: ProgressEvent) => void
    config?: Config
  }

  interface UploadResponse {
    published: boolean
    hash: string
    publicURL: string
    // Add other properties of the publication object here
  }

  interface PublishFileParams {
    config?: Config
    file: File | object // Define a more specific type for the custom object if known
    retentionPeriod: number
    progressTracker?: (progressEvent: ProgressEvent) => void
  }

  interface PublishFileResponse {
    hash: string
    publicURL: string
    status: string
    // Add other properties of the upload object here
  }

  export function invoice(params: InvoiceParams): Promise<InvoiceResponse>

  export function derivePaymentInfo(
    params: DerivePaymentInfoParams
  ): Promise<DerivePaymentInfoResponse>

  export function submitPayment(
    params: SubmitPaymentParams
  ): Promise<SubmitPaymentResponse>

  export function pay(params: PayParams): Promise<PayResponse>

  export function upload(params: UploadParams): Promise<UploadResponse>

  export function publishFile(
    params: PublishFileParams
  ): Promise<PublishFileResponse>
  // has to call invoice, pay, and upload, returns a UHRP hash
}

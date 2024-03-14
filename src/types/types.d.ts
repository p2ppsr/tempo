/*
  Type declarations that are unfinished or for satisfying TSlint.
  These will be updated as time goes on
*/

declare module '@babbage/react-prompt' {
  const BabbagePrompt: any
  export default BabbagePrompt
}

// Pushdrop ========================================================================

declare module 'pushdrop' {
  // TODO:
  // export interface RedeemOptions {
  //   protocolID: string;
  //   keyID: string;
  //   prevTxId: string;
  //   outputIndex: number;
  //   lockingScript: string;
  //   outputAmount: number;
  // }

  // export function redeem(options: RedeemOptions): Promise<any>; // Specify the actual return type if known

  const pushdrop: any
  export default pushdrop
}

// Nanoseek ========================================================================

declare module 'nanoseek' {
  interface DownloadOptions {
    UHRPUrl: string
    confederacyHost: string | undefined
  }

  // TODO: Update these to their proper types
  interface DownloadResult {
    data: any,
    mimeType: any
  }

  // Export the download function as a named export
  export function download(options: DownloadOptions): Promise<DownloadResult>
}

// babbage-bsv ======================================================================

declare module 'babbage-bsv' {
  // Address
  export class Address {
    constructor(addressString: string)
    static fromPublicKey(pubKey: PublicKey): Address
  }

  // PublicKey
  export class PublicKey {
    constructor(keyString: string)
    static fromString(keyString: string): PublicKey
  }

  // Script
  export class Script {
    constructor(scriptStringOrBuffer: string | Buffer)
    toHex(): string
    static fromAddress(address: Address): Script
  }

  // Transaction
  export class Transaction {
    constructor(transactionStringOrBuffer: string | Buffer)
  }

  // Export the entire module as default
  const bsv: {
    Address: typeof Address
    PublicKey: typeof PublicKey
    Script: typeof Script
    Transaction: typeof Transaction
  }

  export default bsv
}

// Packetpay ======================================================================

declare module '@packetpay/js' {
  // Define the shape of the request body
  interface PacketPayRequestBody {
    provider: string
    query: object
  }

  interface PacketPayResponse {
    status: number;
    headers: Record<string, string | string[]>; // A Record type is used for key-value pairs
    body: any; // Body can be any type, as the structure can vary
  }

  function PacketPay(
    url: string,
    fetchConfig?: Object,
    config?: {
      authriteConfig?: Object
      ninjaConfig?: Object
      clientPrivateKey?: string
      description?: string
    }
  ): Promise<PacketPayResponse>

  export default PacketPay
}

// uhrp-react ======================================================================

// TODO: add video and audio
declare module 'uhrp-react' {
  // If the module already contains other components or exports, they should be included here as well.

  // Declare the `Img` component along with its props.
  interface ImgProps {
    src: string
    alt?: string
    id?: string
    className?: string
    confederacyHost?: string | undefined
    width?: number | string
    height?: number | string
    // ... add any other props specific to the Img component
  }

  // Declare the component. Assuming it's a functional component but adjust accordingly if it's not.
  const Img: React.FC<ImgProps>

  // Export the component so it can be imported
  export { Img }
}

/*
  Type declarations that are unfinished or for temporarily satisfying TSlint.
  These will be updated as time goes on
*/

// Pushdrop ========================================================================

declare module "pushdrop" {
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

declare module "nanoseek" {
  interface DownloadOptions {
    UHRPUrl: string
    confederacyHost: string | undefined
  }

  interface DownloadResult {
    data: any // Can be more specific based on what download returns
    // ... other result properties
  }

  // Export the download function as a named export
  export function download(options: DownloadOptions): Promise<DownloadResult>
}

// babbage-bsv ======================================================================

declare module "babbage-bsv" {
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

declare module "@packetpay/js" {
  // Define the shape of the request body
  interface PacketPayRequestBody {
    provider: string
    query: object // You might want to define a more specific type for query
  }

  // Define the function signature
  function PacketPay(
    url: string,
    options: {
      method: string
      body: PacketPayRequestBody
    }
  ): Promise<any> // Adjust the return type to be more specific if possible

  // If PacketPay is also a class or has additional properties, define them here
  // namespace PacketPay {
  //   // Example method, replace with actual methods if PacketPay has any
  //   function someMethod(): void;

  //   // ... other members of PacketPay
  // }

  export default PacketPay
}

// uhrp-react ======================================================================

// TODO: add video and audio
declare module "uhrp-react" {
  // If the module already contains other components or exports, they should be included here as well.

  // Declare the `Img` component along with its props.
  interface ImgProps {
    src: string
    alt?: string
    id: string
    className: string
    confederacyHost: string | undefined
    width?: number | string
    height?: number | string
    // ... add any other props specific to the Img component
  }

  // Declare the component. Assuming it's a functional component but adjust accordingly if it's not.
  const Img: React.FC<ImgProps>

  // Export the component so it can be imported
  export { Img }
}
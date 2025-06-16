// storageClient.extensions.d.ts
import 'module-alias' // if you're using path aliases

declare module '@bsv/wallet-toolbox-client' {
  interface StorageClient {
    downloadFile: (url: string) => Promise<Uint8Array>
  }
}

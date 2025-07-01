import type { CreateActionResult } from '@bsv/sdk'

interface FileUploadInfo {
  filesToUpload: File[]
  songURL: string
  artworkURL: string
}

type Payment = CreateActionResult

const submitPaymentProof = async ({
  fileUploadInfo,
  payment
}: {
  fileUploadInfo: FileUploadInfo
  payment: Payment
}) => {
  console.log('[submitPaymentProof] Stub implementation')
  console.log('Files uploaded:', fileUploadInfo.filesToUpload.map(f => f.name))
  console.log('Payment proof txid:', payment.txid)
  console.log('Song URL:', fileUploadInfo.songURL)
  console.log('Artwork URL:', fileUploadInfo.artworkURL)
}

export default submitPaymentProof

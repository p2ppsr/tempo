import { upload, submitPayment } from 'nanostore-publisher'
import constants from './constants'

export default async ({ fileUploadInfo, payment }) => {
  // Pay and upload the files to nanostore
  for (let i = 0; i < fileUploadInfo.filesToUpload.length; i++) {
    // Submit the proof of payment to nanostore
    const paymentResult = await submitPayment({
      config: {
        nanostoreURL: constants.nanostoreURL
      },
      orderID: fileUploadInfo.invoices[i].ORDER_ID,
      amount: fileUploadInfo.invoices[i].amount,
      payment,
      derivationPrefix: fileUploadInfo.invoices[i].derivationPrefix,
      derivationSuffix: fileUploadInfo.invoices[i].derivationSuffix,
      vout: i + 1
    })
    // Upload the file to nanostore
    const uploadObject = {
      config: {
        nanostoreURL: constants.nanostoreURL
      },
      uploadURL: paymentResult.uploadURL,
      publicURL: fileUploadInfo.invoices[i].publicURL,
      file: fileUploadInfo.filesToUpload[i],
      serverURL: constants.nanostoreURL
    }
    await upload(uploadObject)
  }
}

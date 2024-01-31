import { upload, submitPayment } from "nanostore-publisher"
import constants from "./constants"

// Define types for the parameters and any complex structures used in the function
interface FileUploadInfo {
  filesToUpload: File[] // Adjust based on the actual structure
  invoices: Invoice[]
}

interface Invoice {
  ORDER_ID: string
  amount: number
  derivationPrefix: string
  derivationSuffix: string
  publicURL: string
}

interface Payment {
  // Define the properties of the payment based on the actual structure
}

interface PaymentResult {
  uploadURL: string
  // Add any other properties returned by submitPayment
}

interface UploadObject {
  config: {
    nanostoreURL: string
  }
  uploadURL: string
  publicURL: string
  file: File // Adjust based on the actual structure
  serverURL: string
}

const submitPaymentProof = async ({
  fileUploadInfo,
  payment,
}: {
  fileUploadInfo: FileUploadInfo
  payment: Payment
}) => {
  // Pay and upload the files to nanostore
  for (let i = 0; i < fileUploadInfo.filesToUpload.length; i++) {
    // Submit the proof of payment to nanostore
    const paymentResult: PaymentResult = await submitPayment({
      config: {
        nanostoreURL: constants.nanostoreURL,
      },
      orderID: fileUploadInfo.invoices[i].ORDER_ID,
      amount: fileUploadInfo.invoices[i].amount,
      payment,
      derivationPrefix: fileUploadInfo.invoices[i].derivationPrefix,
      derivationSuffix: fileUploadInfo.invoices[i].derivationSuffix,
      vout: i + 1,
    })

    // Upload the file to nanostore
    const uploadObject: UploadObject = {
      config: {
        nanostoreURL: constants.nanostoreURL ?? "https://nanostore.babbage.systems",
      },
      uploadURL: paymentResult.uploadURL,
      publicURL: fileUploadInfo.invoices[i].publicURL,
      file: fileUploadInfo.filesToUpload[i],
      serverURL: constants.nanostoreURL ?? "https://tempo-keyserver.babbage.systems",
    }
    await upload(uploadObject)
  }
}

export default submitPaymentProof

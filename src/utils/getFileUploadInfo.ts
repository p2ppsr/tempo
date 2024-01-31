import { invoice, derivePaymentInfo } from 'nanostore-publisher'
import { getURLForFile } from 'uhrp-url'
import { encrypt } from 'cwi-crypto'
import constants from './constants'

// Thanks to https://stackoverflow.com/a/22114687 for this (updated for Typescript by DRF)
function copy(src: ArrayBuffer | ArrayBufferView): ArrayBuffer {
	// Determine the buffer to be used based on the type of src
	const srcBuffer = src instanceof ArrayBuffer ? src : src.buffer

	// Create a new ArrayBuffer with the same byte length as the source
	const dst = new ArrayBuffer(srcBuffer.byteLength)

	// Copy the content from the source buffer to the destination buffer
	new Uint8Array(dst).set(new Uint8Array(srcBuffer))

	return dst
}

const RETENTION_PERIOD = 60 * 24 * 365 * 7

interface GetFileUploadInfoParams {
	selectedArtwork: File | null
	selectedMusic: File | null
	retentionPeriod?: number
}

// TODO: Add support for checking the UHRP hash to see if the data has already been uploaded.
const getFileUploadInfo = async ({
	selectedArtwork = null,
	selectedMusic = null,
	retentionPeriod = RETENTION_PERIOD
}: Partial<GetFileUploadInfoParams> = {}) => {
	// Defauflt values
	const filesToUpload = []
	let artworkFileURL = ''
	let songURL = ''
	let songDuration = 0
	let encryptionKey

	// Check if we have artwork to upload
	if (selectedArtwork) {
		// @ts-ignore
		const artworkBlob = new Blob([selectedArtwork[0]])
		const artworkData = new Uint8Array(await artworkBlob.arrayBuffer())
		artworkFileURL = getURLForFile(artworkData)
		filesToUpload.push(selectedArtwork)
	}

	// Check if we have music to upload
	if (selectedMusic) {
		// Get the file contents as arrayBuffers
		// @ts-ignore
		const musicBlob = new Blob([selectedMusic[0]])
		const songData = await musicBlob.arrayBuffer()

		// Calculate audio duration
		const { duration } = await new window.AudioContext().decodeAudioData(copy(songData))
		songDuration = Math.ceil(duration)

		// Generate an encryption key for the song data
		encryptionKey = await window.crypto.subtle.generateKey(
			{
				name: 'AES-GCM',
				length: 256
			},
			true,
			['encrypt', 'decrypt']
		)

		// Encrypt the song data
		const encryptedData = await encrypt(new Uint8Array(songData), encryptionKey, 'Uint8Array')

		// Convert the encrypted file for upload with NanoStore
		const blob = new Blob([Buffer.from(encryptedData)], {
			type: 'application/octet-stream'
		})
		const encryptedFile = new File([blob], 'encryptedSong', {
			type: 'application/octet-stream'
		})

		// Calculate the UHRP addresses, for later use in the TSP script
		songURL = getURLForFile(encryptedData)
		filesToUpload.push(encryptedFile)
	}

	// Create invoices for hosting any attached song or artwork files on NanoStore
	const invoices = []
	const outputs = []
	for (const file of filesToUpload) {
		const inv = await invoice({
			fileSize: file.size,
			retentionPeriod,
			config: {
				nanostoreURL: constants.nanostoreURL
			}
		})

		// Derive the payment info for the given invoice
		const paymentInfo = await derivePaymentInfo({
			recipientPublicKey: inv.identityKey,
			amount: inv.amount
		})
		// Save the payment info with the invoice for the later submitPayment call
		inv.derivationPrefix = paymentInfo.derivationPrefix
		inv.derivationSuffix = paymentInfo.derivationSuffix
		inv.derivedPublicKey = paymentInfo.derivedPublicKey

		// Add the new invoice and the new transaction output
		outputs.push(paymentInfo.output)
		invoices.push(inv)
	}

	return {
		invoices,
		outputs,
		songURL,
		artworkFileURL,
		filesToUpload,
		encryptionKey,
		songDuration
	}
}

export default getFileUploadInfo

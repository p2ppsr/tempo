// Interfaces (types) used across multiple functions/components

import { BitcoinOutputScript } from "@babbage/sdk"

export interface Song {
	
	// Necessary
	title: string
	artist: string
	isPublished: boolean
	selectedMusic: File
	artworkFileURL: string
	description: string
	songFileURL: string
	duration: number
	songID: string
	token: {outputIndex: number, txid: string, lockingScript: string}
	outputScript: BitcoinOutputScript
	
	// Optional
	selectedArtwork?: File
	sats?: number
	decryptedSongURL?: string
	artistIdentityKey?: string

}

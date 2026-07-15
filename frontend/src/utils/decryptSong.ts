import { AuthFetch, SymmetricKey, Utils } from '@bsv/sdk'
import constants from './constants';
import type { Song } from '../types/interfaces';
import { getInteractiveWallet } from './wallet'
import { downloadStorageObject } from './storageReliability'

const wallet = getInteractiveWallet()
const authFetch = new AuthFetch(wallet);

type MinimalSong = Pick<Song, 'songURL' | 'title' | 'artist'>;
export type PurchaseStage = 'downloading_audio' | 'requesting_wallet_payment' | 'decrypting_audio'

const decryptSong = async (song: MinimalSong, onStage?: (stage: PurchaseStage) => void) => {
  if (!song.songURL) return;

  // Verify and download the encrypted bytes before asking the wallet to pay.
  // This prevents an unavailable storage object from charging the listener.
  onStage?.('downloading_audio')
  const rawBytesResponse = await downloadStorageObject(song.songURL);

  onStage?.('requesting_wallet_payment')
  const purchasedKeyResponse = await authFetch.fetch(`${constants.keyServerURL}/pay`, {
    method: 'POST',
    body: {
      songURL: song.songURL,
    },
    headers: { 'Content-Type': 'application/json' },
    // SDK payment retries reuse one payment context and transaction. Do not wrap
    // this paid request in a generic whole-request retry.
    paymentRetryAttempts: 3
  });

  const key = await purchasedKeyResponse.json() as { result?: string; description?: string };
  if (!purchasedKeyResponse.ok || !key?.result) {
    throw new Error(key?.description || `Tempo could not retrieve this song key (${purchasedKeyResponse.status}).`);
  }
  const keyBase64 = key.result;

  // Create symmetric key
  const keyBytes = Utils.toArray(keyBase64, 'base64');
  const symmetricKey = new SymmetricKey(keyBytes);

  onStage?.('decrypting_audio')
  const decrypted = await symmetricKey.decrypt([...rawBytesResponse.data]) as number[];

  const blob = new Blob([Uint8Array.from(decrypted)], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);

  return url;
};

export default decryptSong;

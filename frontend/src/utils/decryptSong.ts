import { AuthFetch, SymmetricKey, StorageDownloader, Utils } from '@bsv/sdk'
import constants from './constants';
import type { Song } from '../types/interfaces';
import { getInteractiveWallet } from './wallet'

const wallet = getInteractiveWallet()
const authFetch = new AuthFetch(wallet);

type MinimalSong = Pick<Song, 'songURL' | 'title' | 'artist'>;

const decryptSong = async (song: MinimalSong) => {
  if (!song.songURL) return;

  // Prepare download + decryption promises
  const encryptedDataPromise = (async () => {
    console.time('Song download time');
    const storageDownloader = new StorageDownloader();
    const rawBytesResponse = await storageDownloader.download(song.songURL);
    console.timeEnd('Song download time');
    return rawBytesResponse;
  })();

  const decryptPromise = (async () => {
    console.time('Payment receipt request');
    const purchasedKeyResponse = await authFetch.fetch(`${constants.keyServerURL}/pay`, {
      method: 'POST',
      body: {
        songURL: song.songURL,
      },
      headers: { 'Content-Type': 'application/json' },
      paymentRetryAttempts: 1
    });
    console.timeEnd('Payment receipt request');

    const key = await purchasedKeyResponse.json() as { result?: string; description?: string };
    if (!key || !key.result) {
      throw new Error(key.description || 'Tempo could not retrieve this song key.');
    }

    return key.result; // return the base64 key string
  })();

  // Run download + key retrieval concurrently
  const [rawBytesResponse, keyBase64] = await Promise.all([
    encryptedDataPromise,
    decryptPromise
  ]);

  // Create symmetric key
  const keyBytes = Utils.toArray(keyBase64, 'base64');
  const symmetricKey = new SymmetricKey(keyBytes);

  // Decrypt the song
  console.time('Decryption time');
  const decrypted = await symmetricKey.decrypt([...rawBytesResponse.data]) as number[];
  console.timeEnd('Decryption time');

  const blob = new Blob([Uint8Array.from(decrypted)], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);

  return url;
};

export default decryptSong;

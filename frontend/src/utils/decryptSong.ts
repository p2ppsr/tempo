import {
  WalletClient,
  AuthFetch,
  SymmetricKey,
  StorageDownloader,
  Utils
} from '@bsv/sdk';
import constants from './constants';
import type { Song } from '../types/interfaces';

const wallet = new WalletClient('auto', 'localhost');
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
    console.log('[decryptSong] Downloaded encrypted data:', rawBytesResponse);
    return rawBytesResponse;
  })();

  const decryptPromise = (async () => {
    console.time('Payment receipt request');
    const purchasedKeyResponse = await authFetch.fetch(`${constants.keyServerURL}/pay`, {
      method: 'POST',
      body: {
        songURL: song.songURL,
      },
      headers: { 'Content-Type': 'application/json' }
    });
    console.timeEnd('Payment receipt request');

    const key = await purchasedKeyResponse.json() as any;
    if (!key || !key.result) {
      throw new Error('[decryptSong] Failed to retrieve encryption key');
    }

    console.log('[decryptSong] Received encryption key:', key.result);

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
  console.log('[decryptSong] Symmetric key created:', symmetricKey);

  // Decrypt the song
  console.time('Decryption time');
  const decrypted = await symmetricKey.decrypt([...rawBytesResponse.data]) as number[];
  console.timeEnd('Decryption time');
  console.log('[decryptSong] Decrypted song bytes:', decrypted);

  const blob = new Blob([Uint8Array.from(decrypted)], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);

  console.log('[decryptSong] Decrypted song URL:', url);
  return url;
};

export default decryptSong;

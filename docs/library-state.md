# Tempo wallet library state

Tempo keeps likes and playlists in one encrypted wallet-backed document. The
implementation uses `LocalKVStore` with context/basket `tempo library` and key
`library-v1`. The BRC-116 manifest declares both the `[2, "tempo library"]`
protocol and `tempo library` basket.

## Authority and cache

- The wallet document is authoritative across devices.
- `tempo:wallet-library-cache:v1` is an offline rendering and retry cache. It is
  never treated as a separate user library.
- Old `likedSongs` and `playlists` browser keys are imported at a
  lowest-precedence legacy stamp. They are removed only after a successful
  wallet synchronization, so a denied or unavailable wallet cannot lose data.
- An ordinary browser does not receive a surprise wallet prompt. It renders the
  cache with an explicit offline status and offers `Retry sync`. Detected wallet
  surfaces synchronize when a library page or action is opened.

## Merge contract

The versioned document records mutation stamps independently for:

- each like/unlike choice;
- playlist lifecycle and name;
- each song's membership in each playlist.

Merges select the newest stamp for each field. Unlike, playlist deletion, and
song removal remain as tombstones, preventing an older device cache from
resurrecting removed state. Independently created playlists and independently
edited songs therefore survive a cross-device merge.

Playlist songs exclude local `File` handles and decrypted object URLs before
serialization. Those fields are device/session-specific and must not enter the
wallet. Public song metadata and the token needed for later playback are kept.

## User journeys

- Playlists persist only after a non-empty name is submitted; an abandoned
  blank draft never becomes an unnamed playlist.
- Edit and Delete remain visible, keyboard-labelled buttons with 44px desktop
  targets and 48px mobile targets.
- Add to Playlist always offers `Create new playlist`. Creating there names the
  playlist and adds the selected song atomically in the same library mutation.
- Likes render only records whose newest mutation is explicitly `liked: true`.
- All playlist and like surfaces consume the same Zustand projection of the
  wallet document; the removed legacy `/Playlists/Create` component no longer
  maintains a divergent in-memory list.

The required production journey is
`docs/proofrun/flows/tempo-library-state.proofrun.yaml`.

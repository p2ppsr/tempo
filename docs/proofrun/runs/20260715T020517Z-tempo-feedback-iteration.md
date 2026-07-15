# ProofRun Record: Tempo/received-feedback iteration

- ProofRun version: `1`
- Related flow definitions: `docs/proofrun/flows/tempo-wallet-free-catalogue.proofrun.yaml`, `docs/proofrun/flows/tempo-publish-purchase-listen.proofrun.yaml`
- Run ID: `20260715T020517Z-tempo-feedback-iteration`
- Started at: `2026-07-15T01:36:44Z`
- Completed at: `2026-07-15T02:06:31Z`
- Outcome: `pass`
- Operator: `AI agent`

## Scope

- Surface: production catalogue, mobile UI, artwork, one-tap purchase, and full-track playback
- Feedback records: UserCom `156`, `159`, `162`, and `165`
- Repo/workspace: `p2ppsr/tempo`, `/Users/tyeverett/projects/tempo`
- Environment/base URL: production, `https://tempomusic.net`
- State changing: `yes`
- Successful proof spend: `1000 sats`

## Deployment Identity

- Product iteration commit: `bf952dd0e4f62e227f9b0e6b224195502c989598`
- Cross-replica auth fix commit: `6d473cd5e6cae8ea6bb2340b9a3b49248c3d4ee3`
- Final CI run: `29383058987`
- Final CARS workflow/deployment: `29383059009` / `d9a09924c05b0d09ec05fecf1be865d7`
- Final CARS image digests: backend `sha256:dca26104ca69f62736f679f5050251036ff5644c67c665871e670142536dc6e9`; frontend `sha256:92fee8c4213e1c75ff9c3fe60f3844845cfd12fd58d5ace20e8a8a82381a8840`
- Key-server workflow: `29383058981`
- Key-server image: `6d473cd5e6ca-prod-2026-07-15`, digest `sha256:c5764f8068c6cc2a771c523cf8b5ac056cfd522f4b08c9be5530b9fee93f330b`
- Final workload state: Tempo `2/2` ready with zero restarts; key server `2/2` ready with zero restarts

## Feedback Results

| Feedback | Expected | Production result | Result |
| --- | --- | --- | --- |
| `156` Paper Stacks purchase retries | one click must yield one key and playable audio | Shared Mongo BRC-103 sessions removed the two-replica nonce loss. `/pay` completed `402 -> 200`; Paper Stacks auto-played at `00:06 / 03:11`. | pass |
| `159` oversized artwork | catalogue and future uploads must be bounded | Four immutable covers now use 12,768–322,188 byte WebP renditions. New uploads are constrained to a 1200px edge with a 400 KiB target. | pass |
| `162` separate buy/play controls | selecting a paid song should buy and play | The row and artwork are one `Buy & play - 1000 sats` action with download, payment, decrypt, and playback stages. | pass |
| `165` mobile density | compact music-player layout without horizontal overflow | 70px song rows, compact fixed player, top-bar feedback control, reduced hero, and mobile-hidden carousel verified at 390x844. | pass |

## Reliability Evidence

- Catalogue discovery is pinned to the canonical Tempo overlay rather than the retired five-song project.
- UHRP availability consumes the final merged result from the US and AP primary overlays and limits browser concurrency below per-origin connection limits.
- Three consecutive cold local loads returned the same nine playable independent releases in 14.0–16.4 seconds; production returned nine in 4.2 seconds.
- One genuinely unhosted audio record and one keyless record were excluded. UserCom preserves safe title/reason diagnostics while redacting wallet and transaction material.
- The first production regression attempt proved the pre-fix topology defect: the auth/payment sequence crossed key-server replicas and ended in a missing server-side nonce. It created no Tempo invoice or royalty record.
- After the shared session deployment, the pre/post database counts were `invoices 377 -> 378` and `royalties 376 -> 377`; `authSessions` contained one shared active session.
- Reselecting the already unlocked Paper Stacks row left counts at `378` and `377`, proving Tempo reused the decrypted object URL instead of repurchasing.
- UserCom signal sequence: `purchase.started` -> `downloading_audio` -> `requesting_wallet_payment` -> `decrypting_audio` -> `purchase.succeeded`.

## Automated Gates

- Frontend: `27` tests passed; lint passed; production TypeScript/Vite build passed.
- Key server: `6` tests passed; TypeScript build passed; production dependency audit found zero vulnerabilities.
- Git diff check passed.
- GitHub CI, key-server deployment, and CARS deployment all completed successfully.

## Readiness Impact

- Commercial readiness changed: `yes`
- Previous state: received feedback open; paid playback intermittently failed behind two key-server replicas
- New state: feedback resolved with production proof and correlated diagnostics
- Dossier update needed: `yes`

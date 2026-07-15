# ProofRun Record: Tempo/publish, purchase, and listen

- ProofRun version: `1`
- Flow definition: `docs/proofrun/flows/tempo-publish-purchase-listen.proofrun.yaml`
- Run ID: `20260715T003341Z-tempo-publish-purchase-listen`
- Started at: `2026-07-15T00:33:41Z`
- Completed at: `2026-07-15T00:37:38Z`
- Outcome: `pass`
- Operator: `AI agent`

## Scope

- Surface: production publication, catalogue, purchase, playback, and cleanup
- Repo/workspace: `p2ppsr/tempo`, `/Users/tyeverett/projects/tempo`
- Environment/base URL: production, `https://tempomusic.net`
- Target audience: independent musician and listener
- Flow category: publish
- State changing: `yes`
- Spend cap: `25000 sats`

## Deployment Identity

- Source commit: `fcc3ecb6da3b1da3e7c18e60b6bbbc6df3f42b96`
- Branch: `master`
- Workflow run: `29379208061`
- Deployment ID: `e6c5da03c763c44b8231c0c61ef2a754`
- Image digest: backend `sha256:aff0e26b29f698e2a8fe365b09dd27ee32031b929ccb98875e82f70f22201e8c`; frontend `sha256:fe846efc0d1ccf93f146bca0588decaf35b427830b83852b40766d625c03bc5a`
- Kubernetes namespace/workload: Tempo `2/2` ready with zero rollout restarts and `GASP_SYNC=false`
- Key server: source `14ce676c85b8cc4beef798da59a4b4ffc93fcf4a`, image digest `sha256:ee94682e5f3a21f49136e790c5d7eb68719596a1cb57323df47827421f6612c9`, `2/2` ready

## Wallet And Device Matrix Used

| Dimension | Value | Result | Notes |
| --- | --- | --- | --- |
| Desktop browser | Chrome | pass | Real production form and player. |
| Desktop wallet | Metanet Desktop 0.6.73 | pass | Existing grouped grant; purchase authorized. |
| Server wallet | Tempo key-server wallet-toolbox | pass | Key publication and paid key delivery succeeded. |
| Network | BSV mainnet | pass | Real storage, overlay, transaction, and payment paths. |

## Preflight

| Check | Command/Method | Result | Evidence |
| --- | --- | --- | --- |
| Live HTTP | production browser and `curl` | pass | Frontend loaded. |
| Key-server readiness | `/readyz` | pass | MongoDB and production ChainTracks `ok`; height `957891` after run. |
| Deployment state | Kubernetes safe-field query | pass | Tempo `2/2`; key server `2/2`. |
| Wallet baseline | Metanet permission inspection | pass | Standing BRC-116/PACT grant reused. |
| Spend cap | generated 4-second fixture and bounded retention quote | pass | Remained under cap. |
| Telemetry | UserCom query | pass | All required event pairs present. |

## Step Results

| Step | Expected | Actual | Result | Timing |
| --- | --- | --- | --- | ---: |
| Upload and verify | two accepted providers plus active public UHRP resolution | Artwork and encrypted audio each had two provider receipts; public resolution active | pass | 44s |
| Inspect receipt | key, overlay, playability agree | Publication `3ea08714-5333-449a-afdb-5a6ac14154cf`, transaction `ddcd1eecc18d79ac2ad907ccfb234d1eae467f6ce5de2d9dc40bac97cbf135cd`, playable `Yes` | pass | immediate |
| Catalogue admission | only verified track appears | Exact title appeared among ten independently verified releases | pass | under 6s |
| Purchase and listen | 1000-sat payment unlocks full track | UI moved from `Buy & play - 1000 sats` to `Full track unlocked`; player reached `00:01 / 00:04` with Pause state | pass | 7s |
| Cleanup | readiness token leaves catalogue | Delete transaction `09f5db6638f29c0ce882da197c1be0b5ef41b9b14a0a6fcbbb0efa5f36513dc4`; reload showed nine live independent releases and no test title | pass | under 20s |

## Assertions

- UI and appearance: `pass`; staged progress, recovery receipts, success receipt, catalogue, purchase, and player states are coherent.
- Intuitiveness: `pass`; price is visible before the paid action.
- Customer trust: `pass`; success was withheld until storage, key, overlay, and playback checks agreed.
- Flow success: `pass`; one URL was published, admitted, purchased, decrypted, played, and removed.
- Telemetry: `pass`; UserCom recorded `publish.started` at `00:33:54Z`, `publish.succeeded` at `00:34:38Z`, `purchase.started` at `00:36:19Z`, and `purchase.succeeded` at `00:36:26Z`. Key-server metrics recorded one `POST /publish` success for this key-server lifetime and one `POST /pay` success.
- Reliability: `pass`; transient provider failures now retry up to three times without weakening the two-provider threshold.

## Performance And Trust Latency

| Measurement | Pass Threshold | Actual | Result |
| --- | ---: | ---: | --- |
| UI feedback after action | 500ms | immediate staged state | pass |
| Wallet prompt shown | 5s | standing grant reused | pass |
| Approval to confirmation | 10s | 7s purchase | pass |
| Full publication | 120s | 44s | pass |
| Telemetry visible | 60s | under 60s | pass |

## Evidence

- Public-safe IDs: publication and transaction IDs above; no keys or wallet material retained.
- Rendered browser proof: the production player showed `Full track unlocked`, `00:01 / 00:04`, and an active Pause control; the final receipt showed `Playable: Yes` and no `Invalid Date` value.
- Generated fixture: `/Users/tyeverett/projects/network-ops/artifacts/proofrun/p2ppsr/tempo/20260714T214541Z-tempo-publish-purchase-listen/`.

## Defects And Follow-Up

| Severity | Finding | Owner | Next Action |
| --- | --- | --- | --- |
| low | The tested release displayed `Invalid Date` when older receipt assets lacked expiry metadata. | Tempo | Fixed in the following release with paid-retention metadata and a safe `Not recorded` fallback. |
| low | Historical failed readiness song remains visible because it ultimately became playable before the cleanup fix was proven. | Tempo/operator | Remove it in a later bounded cleanup if it is not useful as a test asset. |

## Readiness Impact

- Commercial readiness changed: `yes`
- Previous tier: publishing and listening unreliable
- New tier: production-validated and observable
- Registry update needed: `yes`
- Dossier update needed: `yes`
- Product repo update needed: `yes` (expiry receipt fix follows this tested release)

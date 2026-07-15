# ProofRun Record: Tempo/wallet-free catalogue

- ProofRun version: `1`
- Flow definition: `docs/proofrun/flows/tempo-wallet-free-catalogue.proofrun.yaml`
- Run ID: `20260714T215300Z-tempo-wallet-free-catalogue`
- Started at: `2026-07-14T21:53:00Z`
- Completed at: `2026-07-14T21:56:18Z`
- Outcome: `pass`
- Operator: `AI agent`

## Scope

- Surface: Tempo production catalogue and player
- Repo: `p2ppsr/tempo`
- Workspace: `/Users/tyeverett/projects/tempo`
- Environment: production
- Base URL: `https://tempomusic.net`
- Target audience: listener without a wallet
- Flow category: discover
- State changing: `no`
- Spend cap: `0 sats`

## Deployment Identity

- Source commit: `fcc3ecb6da3b1da3e7c18e60b6bbbc6df3f42b96`
- Branch: `master`
- Workflow run: `29379208061`
- Deployment ID: `e6c5da03c763c44b8231c0c61ef2a754`
- Image digest: backend `sha256:aff0e26b29f698e2a8fe365b09dd27ee32031b929ccb98875e82f70f22201e8c`; frontend `sha256:fe846efc0d1ccf93f146bca0588decaf35b427830b83852b40766d625c03bc5a`
- Kubernetes namespace/workload: `cars-project-50247d539b678476a0b00db7bd5584e8/cars-project-50247d539b678476a0b00db7-deployment`, `2/2` ready

## Wallet And Device Matrix Used

| Dimension | Value | Result | Notes |
| --- | --- | --- | --- |
| Desktop browser | Chrome, production origin | pass | Catalogue and preview repeated without wallet invocation. |
| Mobile browser | Safari in iOS Simulator | pass | Production page loaded and player remained usable. |
| Mobile simulator | `Codex Metanet SE UX`, iOS 26.3 | pass | Screenshot and preflight retained with the run artifacts. |
| Desktop wallet | none | pass | Passive browsing opened no approval UI. |
| Network | mainnet | pass | Live overlays and storage providers were queried. |

## Preflight

| Check | Command/Method | Result | Evidence |
| --- | --- | --- | --- |
| Live HTTP | `curl -fsS https://tempomusic.net/` | pass | HTTP content returned. |
| Health endpoint | key-server `/readyz` | pass | MongoDB and ChainTracks reported `ok`. |
| Deployment state | Kubernetes deployment and pod image IDs | pass | Two ready pods, zero restarts on this rollout. |
| Required simulator | `proofrun-device-preflight.sh` and Safari | pass | Device artifact records iOS 26.3. |
| Wallet permission baseline | no wallet interaction | pass | No passive prompt. |
| Telemetry endpoint | UserCom production | pass | Signals became queryable inside one minute. |

## Step Results

| Step | Expected | Actual | Result | Timing |
| --- | --- | --- | --- | ---: |
| Open catalogue | understandable wallet-free first screen | Hero and verified-catalogue status rendered | pass | under 2s |
| Verify admission | only active, keyed independent songs appear | Every visible independent row passed UHRP resolution and key availability; excluded records stayed hidden | pass | under 10s |
| Play preview | audio starts without wallet | Bundled preview reached playing state | pass | under 3s |

## Assertions

- UI and appearance: `pass`; desktop and iOS layouts retained catalogue and player controls without horizontal overflow.
- Intuitiveness: `pass`; copy distinguishes wallet-free previews from publishing and purchase.
- Customer trust: `pass`; catalogue filters expired, missing, invalid, preview-broken, and keyless releases before rendering.
- Flow success: `pass`; playback started and repeated without a wallet prompt.
- Telemetry: `pass`; `app.opened`, `catalog.availability_completed`, and `playback.started` were stored by UserCom.
- Reliability: `pass`; reload reran availability checks and playback.

## Evidence

- UserCom recorded `app.opened`, `catalog.availability_completed`, and five `playback.started` signals in the bounded verification window.
- Private artifacts: `/Users/tyeverett/projects/network-ops/artifacts/proofrun/p2ppsr/tempo/20260714T215300Z-tempo-wallet-free-catalogue/`.

## Defects And Follow-Up

| Severity | Finding | Owner | Next Action |
| --- | --- | --- | --- |
| low | Native mobile-wallet purchase was not part of this wallet-free flow. | Tempo | Keep the separate wallet-onboarding ProofRun current. |

## Readiness Impact

- Commercial readiness changed: `yes`
- Previous tier: queued
- New tier: instrumented and production-validated
- Registry update needed: `yes`
- Dossier update needed: `yes`
- Product repo update needed: `no`


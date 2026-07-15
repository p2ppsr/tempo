# ProofRun Record: Tempo/wallet onboarding

- ProofRun version: `1`
- Flow definition: `docs/proofrun/flows/tempo-wallet-onboarding.proofrun.yaml`
- Run ID: `20260714T215630Z-tempo-wallet-onboarding`
- Started at: `2026-07-14T21:56:30Z`
- Completed at: `2026-07-14T21:57:05Z`
- Outcome: `pass`
- Operator: `AI agent`

## Scope

- Surface: Tempo Babbage Go and Metanet Desktop connection
- Repo/workspace: `p2ppsr/tempo`, `/Users/tyeverett/projects/tempo`
- Environment/base URL: production, `https://tempomusic.net`
- Target audience: first-time listener or artist connecting a wallet
- Flow category: onboard
- State changing: `yes` (permission grant only)
- Spend cap: `0 sats`

## Deployment Identity

- Source commit: `fcc3ecb6da3b1da3e7c18e60b6bbbc6df3f42b96`
- Workflow run/deployment: `29379208061` / `e6c5da03c763c44b8231c0c61ef2a754`
- Frontend digest: `sha256:fe846efc0d1ccf93f146bca0588decaf35b427830b83852b40766d625c03bc5a`
- Client versions: `@babbage/go 0.1.17`, `@bsv/sdk 2.1.6`, Metanet Client `0.6.73`

## Wallet And Device Matrix Used

| Dimension | Value | Result | Notes |
| --- | --- | --- | --- |
| Desktop browser | Chrome | pass | Explicit Connect is the only passive-to-wallet transition. |
| Desktop wallet | Metanet Desktop 0.6.73 | pass | Grouped app grant completed. |
| Network | mainnet | pass | No payment in this flow. |

## Preflight And Steps

| Step | Expected | Actual | Result | Timing |
| --- | --- | --- | --- | ---: |
| Manifest | grouped BRC-116 and PACT permissions | Live manifest mirrors `metanet` and `babbage` app, protocol, basket, spending, and counterparty permissions | pass | under 1s |
| Passive open | no wallet window | Catalogue settled without wallet invocation | pass | under 5s |
| Initial Connect | consolidated approval | Storage peers were grouped into two message-box approvals instead of roughly ten per-operation prompts | pass | under 10s |
| Repeat Connect | standing approval reused | Connected state completed in about 1.2s with zero new approval windows | pass | 1.2s |
| Publish after grant | no repeated permission storm | Publication reused the standing app-level grant | pass | no new permission prompts |

## Assertions

- UI and appearance: `pass`; Connect and connected states are legible and usable.
- Intuitiveness: `pass`; the page explains when and why Metanet is needed.
- Customer trust: `pass`; browsing remains passive and grouped permission intent is declared up front.
- Flow success: `pass`; Tempo reached `Wallet connected` and reused the grant.
- Telemetry: `pass`; UserCom recorded seven `wallet.connect_started` and seven matching `wallet.connect_succeeded` events across the bounded audit, with no unmatched failure.
- Reliability: `pass`; reload and repeat connection did not recreate low-level grants.

## Defects And Follow-Up

| Severity | Finding | Owner | Next Action |
| --- | --- | --- | --- |
| low | Existing Metanet Client surfaces two grouped storage-peer message-box approvals because they are distinct counterparties. | Metanet/Tempo | Retain grouped peer declarations; re-evaluate when wallet supports a single multi-counterparty explanation. |

## Readiness Impact

- Commercial readiness changed: `yes`
- Previous tier: prompt-storm regression
- New tier: grouped BRC-116/PACT onboarding validated
- Registry update needed: `yes`
- Dossier update needed: `yes`
- Product repo update needed: `no`


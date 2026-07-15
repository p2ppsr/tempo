# ProofRun Record: Tempo/feedback and UserCom

- ProofRun version: `1`
- Flow definition: `docs/proofrun/flows/tempo-feedback-usercom.proofrun.yaml`
- Run ID: `20260714T215517Z-tempo-feedback-usercom`
- Started at: `2026-07-14T21:55:17Z`
- Completed at: `2026-07-14T21:55:28Z`
- Outcome: `pass`
- Operator: `AI agent`

## Scope

- Surface: in-product Feedback panel
- Repo/workspace: `p2ppsr/tempo`, `/Users/tyeverett/projects/tempo`
- Environment/base URL: production, `https://tempomusic.net`
- Target audience: listener or artist reporting an issue or idea
- Flow category: feedback
- State changing: `yes`
- Spend cap: `0 sats`

## Deployment Identity

- Source commit: `fcc3ecb6da3b1da3e7c18e60b6bbbc6df3f42b96`
- Workflow run/deployment: `29379208061` / `e6c5da03c763c44b8231c0c61ef2a754`
- Frontend digest: `sha256:fe846efc0d1ccf93f146bca0588decaf35b427830b83852b40766d625c03bc5a`
- UserCom workload: `usercom-prod/deployment/usercom`, `1/1` ready

## Wallet And Device Matrix Used

| Dimension | Value | Result | Notes |
| --- | --- | --- | --- |
| Desktop browser | Chrome | pass | Feedback dock visible without wallet. |
| Mobile browser | Safari, iOS Simulator | pass | Dock remained above the safe area/player. |
| Server wallet | UserCom | pass | Anonymous feedback did not require wallet authentication. |
| Network | production | pass | `/submit` and `/signal` accepted the run. |

## Preflight And Steps

| Step | Expected | Actual | Result | Timing |
| --- | --- | --- | --- | ---: |
| UserCom health | healthy endpoint | `/healthz` returned success | pass | under 1s |
| Open feedback | category and optional email are clear | Song availability form opened; consent stayed conditional | pass | under 1s |
| Submit feedback | visible acknowledgement and stored record | UI acknowledged; UserCom created feedback row `153` | pass | 11s total |

## Assertions

- UI and appearance: `pass`; controls stay usable on desktop and iOS Simulator.
- Intuitiveness: `pass`; category, message, optional email, and conditional contact consent are explicit.
- Customer trust: `pass`; no wallet data or identity key is sent.
- Flow success: `pass`; UI acknowledgement and stored row agree.
- Telemetry and observability: `pass`; `feedback.opened`, `feedback.submit_started`, `feedback.submitted`, and `feedback.client_acknowledged` were recorded at `21:55:17Z-21:55:28Z`.
- Reliability: `pass`; panel reopened after submission.

## Evidence

- Public-safe evidence: event names, timestamps, and feedback record ID `153`.
- UserCom context was sanitized; secret-, key-, token-, transaction-, and BEEF-like fields are redacted by the client adapter.

## Readiness Impact

- Commercial readiness changed: `yes`
- Previous tier: needs instrumentation
- New tier: instrumented and feedback-enabled
- Registry update needed: `yes`
- Dossier update needed: `yes`
- Product repo update needed: `no`


# Tempo ProofRun

Tempo uses the Network Ops ProofRun doctrine for production Commercial Readiness validation.

Reusable flow definitions live in `docs/proofrun/flows/` and public-safe execution records live in `docs/proofrun/runs/`. Private screenshots, device captures, wallet-permission evidence, and sanitized operator logs are stored under `network-ops/artifacts/proofrun/p2ppsr/tempo/`.

Required production gates:

- wallet-free catalogue admission and preview playback;
- Babbage Go / BRC-116 grouped permission onboarding;
- redundant UHRP publication through purchase and full-track playback;
- in-product UserCom feedback and analytics correlation.

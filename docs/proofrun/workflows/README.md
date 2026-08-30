# ProofRun V1 workflows

The YAML files in this directory are executable `proofrun.dev/v1` contracts.
They were migrated from the operator checklists in `../flows`; those source
checklists remain available for audit history during the transition.

Execution resolves versioned customer and device contracts from the vendored
`proofrun/catalog` inputs. Their README records the exact private catalog
revision and immutable update rule. The GitHub workflow submits the complete
bundle to the private control plane without requiring an operator checkout.

Chromium and WebKit cases run on hosted Playwright workers. Capability-matched
iOS Simulator, Android Emulator, Metanet Explorer, and Metanet Client cases are
leased to the managed Evans Creek macOS runner with state-snapshot restoration.
State-changing and spending journeys still stop at the V1 manual approval
boundary. A workflow never executes arbitrary legacy `preflight.commands`;
required-state statements are portable oracle assertions.

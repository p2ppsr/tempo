# ProofRun V1 workflows

The YAML files in this directory are executable `proofrun.dev/v1` contracts.
They were migrated from the operator checklists in `../flows`; those source
checklists remain available for audit history during the transition.

Execution resolves versioned customer and device contracts from the private
`p2ppsr/proofrun-presets` catalog. The migration baseline is ProofRun core
`283f357309a844dde0821dcdc61facbb7f9def64` and catalog
`017c11ec2edbec22371a8e53e7b6511e47ab56b6`.

Ordinary Chromium/WebKit viewport cases can run on Playwright workers today.
Cases naming `ios-simulator`, `android-emulator`, Metanet Explorer, or
Metanet Client remain unschedulable until a runner advertises the corresponding
real device bridge and capabilities. A workflow never executes the arbitrary
local shell commands from the legacy `preflight.commands`; required-state
statements were converted to V1 oracle assertions.

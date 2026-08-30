# Vendored ProofRun contracts

These immutable CustomerProfile and DeviceProfile inputs are vendored from
private `p2ppsr/proofrun-presets` commit
`36f59bb9c0bafe742b799df6ec20e9d7e8a05791`. They contain no credentials;
secret names are runner-side handles. Update a file only by importing a new
catalog version and updating every `id@version` reference. The pinned GitHub
workflow submits these files with each executable workflow so CI never depends
on an operator checkout or product-specific logic in the ProofRun runtime.

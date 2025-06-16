export default `# TSP Topic Manager

The TSP Topic Manager handles incoming PushDrop tokens related to the Tempo Song Protocol (TSP).

## Admissibility Rules

- Only PushDrop tokens using the \`tm_tsp\` topic are accepted.
- Tokens must contain properly encoded metadata:
  - songTitle
  - artistName
  - description
  - duration
  - songFileURL
  - artFileURL

## Example

Tokens are accepted using the \`locking-script\` admission mode.

No spend notifications are handled at this time.
`

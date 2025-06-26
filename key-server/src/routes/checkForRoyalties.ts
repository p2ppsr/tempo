// import { Request, Response } from 'express'
// import { randomBytes } from 'crypto'
// import { PrivateKey, PublicKey, P2PKH, Utils } from '@bsv/sdk'
// import { KeyStorage } from '../KeyStorage.js'
// import type { WalletInterface } from '@bsv/sdk'
// import type { RouteDefinition } from '../types/routes.js'

// export default function checkForRoyaltiesRoute(
//   keyStorage: KeyStorage,
//   wallet: WalletInterface
// ): RouteDefinition {
//   return {
//     type: 'get',
//     path: '/checkForRoyalties',
//     summary: 'Check for royalty payments for your published songs.',
//     parameters: {},
//     exampleResponse: {
//       status: 'Royalty payment sent!',
//       transaction: {
//         txid: '...',
//         mapiResponses: {},
//         note: 'The transaction has been processed and broadcast.',
//         amount: 100,
//         inputs: []
//       },
//       derivationPrefix: '...',
//       derivationSuffix: '...',
//       amount: 85,
//       senderIdentityKey: '04...'
//     },
//     func: async (req: Request, res: Response) => {
//       try {
//         const identityKey = (req as any).authrite?.identityKey
//         if (!identityKey) throw new Error('Missing identityKey in Authrite context')

//         const unpaidRoyalties = await keyStorage.getUnpaidRoyalties()
//         const myRoyalties = unpaidRoyalties.filter(
//           r => r.artistIdentityKey === identityKey
//         )

//         const totalAmount = myRoyalties.reduce((sum, r) => sum + r.amount, 0)
//         if (!myRoyalties.length || totalAmount === 0) {
//           return res.status(200).json({
//             status: 'noUpdates',
//             message: 'There are no royalties to be paid. Check back soon!'
//           })
//         }

//         const derivationPrefix = randomBytes(10).toString('base64')
//         const derivationSuffix = randomBytes(10).toString('base64')

//         const { publicKey: derivedPubKey } = await wallet.getPublicKey({
//           protocolID: [2, '3241645161d8'],
//           keyID: `${derivationPrefix} ${derivationSuffix}`,
//           counterparty: identityKey
//         })

//         const lockingScript = new P2PKH()
//           .lock(PublicKey.fromString(derivedPubKey).toAddress())
//           .toHex()

//         const { tx } = await wallet.createAction({
//           description: 'Tempo Royalty Payment',
//           outputs: [
//             {
//               satoshis: totalAmount,
//               lockingScript,
//               customInstructions: JSON.stringify({
//                 derivationPrefix,
//                 derivationSuffix,
//                 payee: identityKey
//               }),
//               outputDescription: 'Tempo Royalty Payment'
//             }
//           ],
//           options: {
//             randomizeOutputs: false
//           }
//         })

//         if (!tx) {
//           throw new Error('Failed to create royalty transaction')
//         }

//         await keyStorage.logOutgoingPayment({
//           transaction: JSON.stringify(tx),
//           derivationPrefix,
//           derivationSuffix,
//           amount: totalAmount,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         })


//         for (const royalty of myRoyalties) {
//           if (!royalty._id) continue
//           await keyStorage.markRoyaltyPaid(royalty._id.toString(), `${derivationPrefix}:${derivationSuffix}`)
//         }

//         const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY
//         if (!SERVER_PRIVATE_KEY) throw new Error('Missing SERVER_PRIVATE_KEY in .env')

//         return res.status(200).json({
//           status: 'Royalty payment sent!',
//           transaction: {
//             ...tx,
//             note: 'The transaction has been processed and broadcast.'
//           },
//           derivationPrefix,
//           derivationSuffix,
//           amount: totalAmount,
//           senderIdentityKey: PrivateKey.fromHex(SERVER_PRIVATE_KEY).toPublicKey().toString()
//         })
//       } catch (e) {
//         console.error(e)
//         return res.status(500).json({
//           status: 'error',
//           code: 'ERR_INTERNAL',
//           description: 'An internal error has occurred.',
//           detail: e instanceof Error ? e.message : String(e)
//         })
//       }
//     }

//   }
// }
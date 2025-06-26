// import { Express } from 'express'
// import checkForRoyalties from './checkForRoyalties.js'
// import invoice from './invoice.js'
// import pay from './pay.js'
// import publish from './publish.js'
// import { KeyStorage } from '../KeyStorage.js'
// import { WalletInterface } from '@bsv/sdk' // From wallet-toolbox-client, re-exported by @bsv/sdk

// export default function registerRoutes(app: Express, keyStorage: KeyStorage, wallet: WalletInterface) {
//   // Unwrap the route definition and register each handler with its method and path
//   const routes = [
//     checkForRoyalties(keyStorage, wallet),
//     invoice(keyStorage, wallet),
//     pay(keyStorage, wallet),
//     publish(keyStorage)
//   ]

//   for (const route of routes) {
//     const method = route.type.toLowerCase() as keyof Express
//     const handler = (app[method] as Function).bind(app)
//     handler(route.path, route.func)
//   }
// }


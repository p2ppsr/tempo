import { RouteDefinition } from '../types/routes'
import migrate from './migrate.js'
import publish from './publish.js'
import pay from './pay.js'
import invoice from './invoice.js'
import checkForRoyalties from './checkForRoyalties.js'

export default {
  preAuthrite: [migrate],
  postAuthrite: [publish, pay, invoice, checkForRoyalties]
} as {
  preAuthrite: RouteDefinition[]
  postAuthrite: RouteDefinition[]
}

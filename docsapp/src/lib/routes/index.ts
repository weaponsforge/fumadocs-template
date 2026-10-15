import { PRIVATE_ROUTES } from './routes'
import RouteUtil from './routeUtil'

export {
  SECTIONS,
  PRIVATE_SECTIONS,
  PUBLIC_EXCEPTIONS,
} from './routes'

export { PRIVATE_ROUTES }
export const RouteHandler = new RouteUtil(PRIVATE_ROUTES)

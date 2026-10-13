import { createBrowserRouter } from 'react-router-dom'
import App from '../App.jsx'
import SupplyReception from '../pages/priemps'
import PriemZk from '../pages/priemzk'
import Monit from '../pages/monit'
import Bluda from '../pages/bluda'
import StopList from '../pages/stoplist'
import Analytics from '../pages/analytics'
import Spisaniya from '../pages/spisaniya'
import Fxod from '../pages/fxod'
const router = createBrowserRouter([
  {
    path: '/',
    element: <Fxod />,
  },
  {
    path: '/dashboard',
    element: <App />,
  },
  {
    path: '/priemps',
    element: <SupplyReception />,
  },
  {
    path: '/priemzk',
    element: <PriemZk />,
  },
  {
    path: '/monit',
    element: <Monit />,
  },
  {
    path: '/bluda',
    element: <Bluda />,
  },
  {
    path: '/stoplist',
    element: <StopList />,
  },
  {
    path: '/analytics',
    element: <Analytics />,
  },
  {
    path: '/spisaniya',
    element: <Spisaniya />,
  },
])

export default router
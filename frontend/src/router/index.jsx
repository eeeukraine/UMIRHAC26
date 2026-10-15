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
import ProtectedRoute from '../components/ProtectedRoute'
import { ROLES } from '../constants/roles'
import UnauthorizedPage from '../pages/unauthorized'  // ← Исправлено здесь

const router = createBrowserRouter([
  {
    path: '/',
    element: <Fxod />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER]}>
        <App />
      </ProtectedRoute>
    ),
  },
  {
    path: '/priemps',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
        <SupplyReception />
      </ProtectedRoute>
    ),
  },
  {
    path: '/priemzk',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER]}>
        <PriemZk />
      </ProtectedRoute>
    ),
  },
  {
    path: '/monit',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER]}>
        <Monit />
      </ProtectedRoute>
    ),
  },
  {
    path: '/bluda',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
        <Bluda />
      </ProtectedRoute>
    ),
  },
  {
    path: '/stoplist',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
        <StopList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/spisaniya',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
        <Spisaniya />
      </ProtectedRoute>
    ),
  },
])

export default router
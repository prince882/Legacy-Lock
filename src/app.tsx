import { AppProviders } from '@/components/app-providers.tsx'
import { AppLayout } from '@/components/app-layout.tsx'
import { RouteObject, useRoutes } from 'react-router'
import { lazy } from 'react'
const links = [
  { label: 'Home', path: '/' },
  { label: 'Testing', path: '/account' },
  { label: "Create Escrow", path: '/create' },
  { label: "Escorws For You", path: '/escrows' }
]

const LazyAccountIndex = lazy(() => import('@/components/account/account-index-feature'))
const LazyAccountDetail = lazy(() => import('@/components/account/account-detail-feature'))
const LazyDashboard = lazy(() => import('@/components/dashboard/dashboard-feature'))
const EscrowCreatePage = lazy(() => import("./components/LegacyLock/CreateEscrow"))
const YourEscrows = lazy(() => import("@/components/LegacyLock/create-extras/Your-Escrows/DashBoard"))
const routes: RouteObject[] = [
  { index: true, element: <LazyDashboard /> },
  {
    path: 'account',
    children: [
      { index: true, element: <LazyAccountIndex /> },
      { path: ':address', element: <LazyAccountDetail /> },
    ],
  },
  { path: 'create', element: <EscrowCreatePage /> },
  { path: 'escrows', element: <YourEscrows /> }
]

export function App() {
  const router = useRoutes(routes)
  return (
    <AppProviders>
      <AppLayout links={links}>{router}</AppLayout>
    </AppProviders>
  )
}

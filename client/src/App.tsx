import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Layout from "./components/Layout"
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthProvider'
import RequireAuth from './components/RequireAuth'
import PersistLogin from './components/PersistLogin'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import PublicHome from './pages/PublicHome'
import MetricsPage from './pages/MetricsPage'
import PrivateHome from './pages/PrivateHome'

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Layout />} >
        {/* public routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/unauthorized' element={<Unauthorized />} />
        <Route index element={<PublicHome />} />
        <Route path='/metrics' element={<MetricsPage />} />
        
        {/* everything within RequireAuth requires a login */}
        <Route element={<PersistLogin />}>
        <Route element={<RequireAuth allowedRoles={['authUser']} />}>
        <Route path='/privatehome' element={<PrivateHome />} />
        </Route>
        </Route>
        <Route path='*' element={<h1>Not Found</h1>} />
      </Route>
    ),
    { basename: import.meta.env.VITE_APP_BASENAME }
  )

  return (
    <AuthProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App


import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Usuarios } from './pages/Usuarios'
import { Clientes } from './pages/Clientes'
import { Productos } from './pages/Productos'
import { Ventas } from './pages/Ventas'
import { Pagos } from './pages/Pagos'
import { Proveedores } from './pages/Proveedores'
import { Configuracion } from './pages/Configuracion'
import { Backups } from './pages/Backups'
import { Categorias } from './pages/Categorias'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/usuarios"
                      element={
                        <ProtectedRoute rolesPermitidos={['Administrador']}>
                          <Usuarios />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clientes"
                      element={
                        <ProtectedRoute rolesPermitidos={['Administrador', 'Vendedor']}>
                          <Clientes />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/productos" element={<Productos />} />
                    <Route
                      path="/proveedores"
                      element={
                        <ProtectedRoute rolesPermitidos={['Administrador', 'Encargado de Stock']}>
                          <Proveedores />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ventas"
                      element={
                        <ProtectedRoute rolesPermitidos={['Administrador', 'Vendedor']}>
                          <Ventas />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pagos"
                      element={
                        <ProtectedRoute rolesPermitidos={['Administrador', 'Vendedor']}>
                          <Pagos />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/configuracion" element={<Configuracion />} />
                    <Route
                      path="/backups"
                      element={
                        <ProtectedRoute rolesPermitidos={['Administrador']}>
                          <Backups />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/categorias"
                      element={
                        <ProtectedRoute rolesPermitidos={['Administrador']}>
                          <Categorias />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App

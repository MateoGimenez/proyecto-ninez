import {Route, Routes} from 'react-router-dom'
import { AuthPage } from './context/AuthContext.jsx'
import { AdminPage } from './context/AuthContext.jsx'
import HomePage from './page/HomePage.jsx'
import LoginPage from './page/LoginPage.jsx'
import Layout from './components/Layout.jsx'
import AdminUsers from './admin/AdminUsers.jsx'
import DispositivosPage from "./page/DispositivosPage.jsx"
import ActaConstatacion from './page/ActaConstatacion.jsx'
import PerfilPage from './page/PerfilPage.jsx'
import NinosPage from "./page/NinosPage.jsx"
import ExpedientesPage from "./page/ExpedientesPage.jsx"
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={
          <AuthPage>
            <Layout>
              <HomePage />
            </Layout>
          </AuthPage>
        } />

        <Route path="/admin/usuarios" element={
          <AdminPage>
            <Layout>
              <AdminUsers />
            </Layout>
          </AdminPage>
        } />

        <Route path="/actas" element={
          <AuthPage>
            <Layout>
              <ActaConstatacion />
            </Layout>
          </AuthPage>
        } />

        <Route path="/dispositivos" element={
          <AuthPage>
            <Layout>
              <DispositivosPage />
            </Layout>
          </AuthPage>
        } />

        <Route path="/perfil" element={
          <AuthPage>
            <Layout>
              <PerfilPage/>
            </Layout>
          </AuthPage>
        } />

        <Route path="/ninos" element={
          <AuthPage>
            <Layout>
              <NinosPage/>
            </Layout>
          </AuthPage>
        } />

         <Route path="/expedientes" element={
          <AuthPage>
            <Layout>
              <ExpedientesPage/>
            </Layout>
          </AuthPage>
        }/>

        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default App

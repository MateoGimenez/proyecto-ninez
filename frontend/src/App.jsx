import {Route, Routes} from 'react-router-dom'
import { AuthPage } from './context/AuthContext.jsx'
import { AdminPage } from './context/AuthContext.jsx'
import HomePage from './page/HomePage.jsx'
import LoginPage from './page/LoginPage.jsx'
import Navbar from './components/navbar.jsx'
import AdminUsers from './admin/AdminUsers.jsx'
import ActasPage from "./page/ActasPage.jsx"
import Footer from './components/Footer.jsx'
import DispositivosPage from "./page/DispositivosPage.jsx"
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={
          <AuthPage>
            <Navbar />
            <HomePage />
            <Footer />
          </AuthPage>
        } />

        <Route path="/admin/usuarios" element={
          <AdminPage>
            <Navbar />
            <AdminUsers />
            <Footer />
          </AdminPage>
        } />

        <Route path="/actas" element={
          <AuthPage>
            <Navbar/>
            <ActasPage/>
            <Footer/>
          </AuthPage>
        } />
        <Route path="/dispositivos" element={
          <AuthPage>
            <Navbar/>
            <DispositivosPage/>
            <Footer/>
          </AuthPage>
        } />


        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default App

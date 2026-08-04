import React, { useState } from 'react';
import "../styles/navbar.css";
import {useAuth} from "../context/AuthContext";

export const Navbar = () => {
  // Estado para el menú hamburguesa
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Estados para desplegar los submenús en móviles al hacer click
  const [openGestion, setOpenGestion] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const { user, logout } = useAuth();

  const DataUser = user?.usuario || "No hay usuario";

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <nav className="navbar">
      {/* Sección del Logotipo y Menú Hamburguesa */}
      <div className="navbar-brand">
        
        {/* INTERCAMBIADO: El menú hamburguesa aparece primero (a la izquierda) */}
        <div className="navbar-hamburger-container">
            {/* Botón Hamburguesa para Móviles */}
            <button 
            className={`hamburger-btn ${isMobileOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Abrir menú"
            >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
            </button>
        </div>

        {/* El logo aparece después (a la derecha) */}
        <a href="/" className="logo">
          <span>App</span>Admin
        </a>

      </div>

      {/* Contenedor principal de los menús (Escritorio + Móvil) */}
      <div className={`navbar-menu-container ${isMobileOpen ? 'mobile-open' : ''}`}>
        
        {/* GRUPO IZQUIERDO (Inicio, Gestión, Personal) */}
        <div className="nav-group-main">
          <a href="/" className="nav-link">Inicio</a>
          
          {/* Dropdown 1: GESTIÓN */}
          <div className={`nav-dropdown ${openGestion ? 'mobile-expanded' : ''}`}>
            <div 
              className="dropdown-title"
              onClick={() => setOpenGestion(!openGestion)}
            >
              <span>Gestión</span>
              <span className="arrow">▾</span>
            </div>
            <div className="dropdown-content">
              <a href="/expedientes">Expedientes</a>
              <a href="/actas">Actas</a>
              <a href="/dispositivos">Dispositivos</a>
            </div>
          </div>

          {DataUser?.rol === "admin" && (
            <a href="/admin/usuarios" className="nav-link">Usuarios</a>
          )}
        </div>

        {/* GRUPO DERECHO: USUARIO */}
        <div className="nav-user-area">
          <div className={`nav-dropdown dropdown-right ${openUser ? 'mobile-expanded' : ''}`}>
            
            <div 
              className="dropdown-title user-profile-trigger"
              onClick={() => setOpenUser(!openUser)}
            >
              <span className="avatar-placeholder">U</span>
              <span className="user-name">{DataUser.nombre}</span>
              <span className="arrow">▾</span>
            </div>
            
            <div className="dropdown-content">
              <a href="/usuario">👤 Mi Perfil</a>
              <a href="/configuracion">⚙️ Configuración</a>
              
              <div className="dropdown-divider"></div>
              
              <button className="btn-logout-dropdown" onClick={logout}>
                🚪 Cerrar sesión
              </button>
            </div>

          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
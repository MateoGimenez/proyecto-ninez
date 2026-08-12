
import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/navbar.css";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGestion, setOpenGestion] = useState(false);
  const [openUsuarios, setOpenUsuarios] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const { user, logout } = useAuth();
  const DataUser = user?.usuario || {};

  const navRef = useRef(null);

  const initial = (DataUser?.nombre || "U")
    .charAt(0)
    .toUpperCase();

  const userRole =
    DataUser?.rol === "admin"
      ? "Administrador"
      : DataUser?.rol || "Usuario";

  const closeAllDropdowns = () => {
    setOpenGestion(false);
    setOpenUsuarios(false);
    setOpenUser(false);
  };

  const closeEverything = () => {
    closeAllDropdowns();
    setIsMobileOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen((value) => !value);
    closeAllDropdowns();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        closeEverything();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <nav className="navbar" ref={navRef}>

      {/* ================= BRAND ================= */}

      <div className="navbar-brand">

        <button
          type="button"
          className={`mobile-menu-button ${
            isMobileOpen ? "active" : ""
          }`}
          onClick={toggleMobileMenu}
          aria-label="Abrir menú"
          aria-expanded={isMobileOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <NavLink
          to="/"
          className="brand"
          onClick={closeEverything}
        >
          <div className="brand-icon">
            A
          </div>

          <div className="brand-info">
            <span className="brand-name">
              DGG<span></span>
            </span>

            <span className="brand-subtitle">
              Panel de gestión
            </span>
          </div>
        </NavLink>

      </div>

      {/* ================= MAIN NAV ================= */}

      <div
        className={`navbar-content ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >

        <div className="navigation">

          {/* INICIO */}

          <NavLink
            to="/"
            end
            onClick={closeEverything}
            className={({ isActive }) =>
              `navigation-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="nav-icon">⌂</span>
            <span>Inicio</span>
          </NavLink>

          {/* GESTIÓN */}

          <div
            className={`navigation-dropdown ${
              openGestion ? "open" : ""
            }`}
          >
            <button
              type="button"
              className="navigation-link dropdown-trigger"
              onClick={() => {
                setOpenGestion((value) => !value);
                setOpenUsuarios(false);
                setOpenUser(false);
              }}
              aria-expanded={openGestion}
            >
              <span className="nav-icon">▦</span>

              <span>Gestión</span>

              <span className="dropdown-arrow">
                {openGestion ? "⌃" : "⌄"}
              </span>
            </button>

            <div className="navigation-dropdown-menu">

              <div className="dropdown-header">
                <span>GESTIÓN</span>
              </div>

              <NavLink
                to="/expedientes"
                onClick={closeEverything}
                className="dropdown-item"
              >
                <span className="dropdown-item-icon">
                  🗂️
                </span>

                <span>
                  <strong>Expedientes</strong>
                  <small>Administrar expedientes</small>
                </span>
              </NavLink>

              <NavLink
                to="/actas"
                onClick={closeEverything}
                className="dropdown-item"
              >
                <span className="dropdown-item-icon">
                  📄
                </span>

                <span>
                  <strong>Actas</strong>
                  <small>Crear y gestionar actas</small>
                </span>
              </NavLink>

              <NavLink
                to="/dispositivos"
                onClick={closeEverything}
                className="dropdown-item"
              >
                <span className="dropdown-item-icon">
                  🏢
                </span>

                <span>
                  <strong>Dispositivos</strong>
                  <small>Administrar dispositivos</small>
                </span>
              </NavLink>

            </div>
            
          </div>


          {/* NIÑOS */}

          <NavLink
            to="/ninos"
            onClick={closeEverything}
            className={({ isActive }) =>
              `navigation-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="nav-icon">🪁</span>
            <span>Niños</span>
          </NavLink>

          {/* USUARIOS */}

          {DataUser?.rol === "admin" && (
            <div
              className={`navigation-dropdown ${
                openUsuarios ? "open" : ""
              }`}
            >
              <button
                type="button"
                className="navigation-link dropdown-trigger"
                onClick={() => {
                  setOpenUsuarios((value) => !value);
                  setOpenGestion(false);
                  setOpenUser(false);
                }}
                aria-expanded={openUsuarios}
              >
                <span className="nav-icon">♙</span>

                <span>Administrador</span>

                <span className="dropdown-arrow">
                  {openUsuarios ? "⌃" : "⌄"}
                </span>
              </button>

              <div className="navigation-dropdown-menu">

                <div className="dropdown-header">
                  <span>ADMINISTRACIÓN</span>
                </div>

                <NavLink
                  to="/admin/usuarios"
                  onClick={closeEverything}
                  className="dropdown-item"
                >
                  <span className="dropdown-item-icon">
                    👥
                  </span>

                  <span>
                    <strong>Usuarios</strong>
                    <small>
                      Administrar usuarios del sistema
                    </small>
                  </span>
                </NavLink>

              </div>
              
            </div>
          )}

        </div>

        {/* ================= USER ================= */}

        <div className="user-section">

          <div
            className={`user-dropdown ${
              openUser ? "open" : ""
            }`}
          >

            <button
              type="button"
              className="user-button"
              onClick={() => {
                setOpenUser((value) => !value);
                setOpenGestion(false);
                setOpenUsuarios(false);
              }}
              aria-expanded={openUser}
            >

              <div className="user-avatar">
                {initial}
              </div>

              <div className="user-data">
                <span className="user-name">
                  {DataUser?.nombre || "Usuario"}
                </span>

                <span className="user-role">
                  {userRole}
                </span>
              </div>

              <span className="user-arrow">
                {openUser ? "⌃" : "⌄"}
              </span>

            </button>

            <div className="user-dropdown-menu">

              <div className="user-dropdown-header">

                <div className="user-avatar large">
                  {initial}
                </div>

                <div>
                  <strong>
                    {DataUser?.nombre || "Usuario"}
                  </strong>

                  <span>
                    {DataUser?.email || ""}
                  </span>
                </div>

              </div>

              <div className="dropdown-separator" />

              <NavLink
                to="/perfil"
                onClick={closeEverything}
                className="user-menu-item"
              >
                <span>👤</span>
                <span>Mi perfil</span>
              </NavLink>

              <NavLink
                to="/configuracion"
                onClick={closeEverything}
                className="user-menu-item"
              >
                <span>⚙️</span>
                <span>Configuración</span>
              </NavLink>

              <div className="dropdown-separator" />

              <button
                type="button"
                className="logout-button"
                onClick={() => {
                  closeEverything();
                  logout();
                }}
              >
                <span>↪</span>
                <span>Cerrar sesión</span>
              </button>

            </div>

          </div>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./pages/Home";
import Servicios from "./pages/Servicios";
import Reservas from "./pages/Reservas";
import Contacto from "./pages/Contacto";
import Operador from "./pages/Operador";
import ReservasAdmin from "./pages/ReservasAdmin";
import Admin from "./pages/Admin";
import Integraciones from "./pages/Integraciones";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MisReservas from "./pages/MisReservas";
import MapaHabitaciones from "./pages/MapaHabitaciones";
import Reportes from "./pages/Reportes";
import PerfilModal from "./pages/PerfilModal";
import "./App.css";

// ============================================================
// Navbar dinámico según el rol
// ============================================================
function Navbar({ user, onLogout }) {
  const [showPerfil, setShowPerfil] = useState(false);
  const rol = (user?.rol || "").toLowerCase();

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold text-light" to="/home">
            Hotel La Juanita
          </Link>

          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* === VISITANTE SIN SESIÓN === */}
              {!user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/home">
                      Inicio
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/servicios">
                      Servicios
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/reservas">
                      Reservas
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/contacto">
                      Contacto
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/integraciones">
                      Integraciones
                    </Link>
                  </li>
                </>
              )}

              {/* === OPERADOR === */}
              {user && rol === "operador" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/operador">
                      Operador
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/mapa">
                      Mapa
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/reservas-admin">
                      Gestión de Reservas
                    </Link>
                  </li>
                </>
              )}

              {/* === ADMIN === */}
              {user && rol === "admin" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      Administrador
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/reportes">
                      Reportes
                    </Link>
                  </li>
                </>
              )}

              {/* === CLIENTE LOGUEADO o USUARIO SIN ROL (fallback) === */}
              {user && rol !== "operador" && rol !== "admin" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/home">
                      Inicio
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/servicios">
                      Servicios
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/reservas">
                      Reservas
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/mis-reservas">
                      Mis Reservas
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/contacto">
                      Contacto
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/integraciones">
                      Integraciones
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* === DERECHA: PERFIL Y CIERRE DE SESIÓN === */}
            <div className="d-flex align-items-center gap-2">
              {user ? (
                <>
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => setShowPerfil(true)}
                  >
                    Mi Perfil
                  </button>
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={onLogout}
                  >
                    Cerrar sesión ({user.nombre || user.username})
                  </button>
                </>
              ) : (
                <Link className="btn btn-primary btn-sm" to="/login">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modal del perfil */}
      <PerfilModal show={showPerfil} onClose={() => setShowPerfil(false)} />
    </>
  );
}

// ============================================================
// Rutas protegidas
// ============================================================
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ============================================================
// Contenido principal
// ============================================================
function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Cargar usuario guardado (NO lo borremos si no trae rol)
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved && saved !== "undefined" && saved !== "null") {
      try {
        const parsed = JSON.parse(saved);
        // antes lo borrábamos si no tenía rol → eso rompía al operador
        setUser(parsed);
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  // Verificar conexión con backend (esto lo dejamos igual)
  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch("http://localhost:4000/");
        if (!res.ok) throw new Error();
      } catch {
        // si el backend no responde no borremos al user,
        // porque eso también te "sacaba" el rol visualmente
        console.warn("Backend no disponible, mantengo la sesión local.");
      }
    };
    verificar();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/home");
  };

  const handleLoginSuccess = (loggedUser) => {
    // acá sí viene con rol desde el backend
    localStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    navigate("/home");
  };

  // solo ocultamos navbar en register
  const hideNavbar = location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/integraciones" element={<Integraciones />} />

        {/* Auth */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<Register />} />

        {/* Cliente */}
        <Route
          path="/reservas"
          element={
            <ProtectedRoute user={user}>
              <Reservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute user={user}>
              <MisReservas />
            </ProtectedRoute>
          }
        />

        {/* Operador */}
        <Route
          path="/operador"
          element={
            <ProtectedRoute user={user}>
              <Operador />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mapa"
          element={
            <ProtectedRoute user={user}>
              <MapaHabitaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas-admin"
          element={
            <ProtectedRoute user={user}>
              <ReservasAdmin />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute user={user}>
              <Reportes />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

// ============================================================
// Export principal
// ============================================================
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const prevUserStrRef = useRef(null);
  const syncTimerRef = useRef(null);

  // === Carga inicial y sincronización inmediata con localStorage ===
  useEffect(() => {
    const leerUsuario = () => {
      const str = localStorage.getItem("user");
      if (str !== prevUserStrRef.current) {
        prevUserStrRef.current = str;
        if (str) {
          try {
            setUser(JSON.parse(str));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    // Carga inicial
    leerUsuario();

    // 1) Sincronizador en la MISMA pestaña (soluciona el problema de logout)
    syncTimerRef.current = setInterval(leerUsuario, 300);

    // 2) También escucha cambios de otras pestañas
    const onStorage = () => leerUsuario();
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, []);

  // === Navegaciones según rol ===
  const handleReservaClick = () => {
    if (user) {
      navigate("/reservas");
    } else {
      localStorage.setItem("redirectAfterLogin", "/reservas");
      navigate("/login");
    }
  };

  const handleMapaClick = () => navigate("/mapa");
  const handleAdminClick = () => navigate("/admin");

  // === Datos del usuario ===
  const nombre = user?.nombre || "Visitante";
  const rol = (user?.rol || "visitante").toLowerCase();

  // === Texto dinámico según rol ===
  let tituloPrincipal = "Bienvenido/a al Hotel";
  let subtitulo = "La Juanita";
  let descripcion =
    "Disfrutá de una experiencia única junto a nosotros. Explorá nuestros servicios, realizá reservas y contactate con nuestro equipo para cualquier consulta.";
  let botonTexto = "Reservá ahora";
  let botonAccion = handleReservaClick;

  if (rol === "operador") {
    tituloPrincipal = `Bienvenido/a Operador ${nombre}`;
    subtitulo = "Panel de Gestión";
    descripcion =
      "Supervisá el estado de las habitaciones y gestioná las reservas de los clientes.";
    botonTexto = "Ver mapa de habitaciones";
    botonAccion = handleMapaClick;
  } else if (rol === "admin") {
    tituloPrincipal = `Bienvenido/a Administrador ${nombre}`;
    subtitulo = "Panel de Administración";
    descripcion =
      "Gestioná habitaciones, operadores y reportes desde un solo lugar.";
    botonTexto = "Ir al panel admin";
    botonAccion = handleAdminClick;
  } else if (rol === "cliente") {
    tituloPrincipal = `Bienvenido/a ${nombre}`;
    subtitulo = "Hotel La Juanita";
    descripcion =
      "Disfrutá de una experiencia única junto a nosotros. Explorá nuestros servicios, realizá reservas y contactate con nuestro equipo para cualquier consulta.";
    botonTexto = "Reservá ahora";
    botonAccion = handleReservaClick;
  }

  // === Vista principal ===
  return (
    <div className="home-container">
      <div className="overlay">
        <div className="hero-text">
          <h1>{tituloPrincipal}</h1>
          <h2>
            <span>{subtitulo}</span>
          </h2>
          <p>{descripcion}</p>
          <button onClick={botonAccion} className="btn btn-light btn-lg mt-3">
            {botonTexto}
          </button>
        </div>
      </div>
    </div>
  );
}

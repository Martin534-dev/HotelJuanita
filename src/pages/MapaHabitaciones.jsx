import React, { useEffect, useState } from "react";
import "./MapaHabitaciones.css";

export default function MapaHabitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  // === Obtener habitaciones ===
  const cargarHabitaciones = async () => {
    try {
      const res = await fetch("/habitaciones");
      const data = await res.json();
      if (Array.isArray(data)) setHabitaciones(data);
    } catch (err) {
      console.error("Error al obtener habitaciones:", err);
      setMensaje("Error al cargar habitaciones");
    }
  };

  // === Cambiar estado ===
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`/habitaciones/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Error del servidor:", data);
        setMensaje("❌ No se pudo actualizar el estado.");
        return;
      }

      setMensaje(`✅ Habitación #${id} actualizada a "${nuevoEstado}"`);
      cargarHabitaciones();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      setMensaje("❌ No se pudo actualizar el estado.");
    }
  };

  return (
    <div className="mapa-page">
      <div className="mapa-overlay">
        <div className="mapa-contenedor">
          <h2 className="mapa-title">Mapa de Habitaciones</h2>
          {mensaje && <p className="mapa-info">{mensaje}</p>}

          <div className="mapa-grid">
            {habitaciones.map((h) => (
              <div key={h.id} className="mapa-card">
                <h3>{h.tipo}</h3>
                <p>
                  <strong>N° {h.numero}</strong> — ${h.precio}/noche
                </p>
                <span
                  className={`mapa-estado ${
                    h.estado === "disponible"
                      ? "estado-disponible"
                      : h.estado === "ocupada"
                      ? "estado-ocupada"
                      : "estado-cerrada"
                  }`}
                >
                  {h.estado}
                </span>

                <div className="mapa-botones">
                  <button
                    className="btn-abrir"
                    onClick={() => actualizarEstado(h.id, "disponible")}
                  >
                    Abrir
                  </button>
                  <button
                    className="btn-cerrar"
                    onClick={() => actualizarEstado(h.id, "cerrada")}
                  >
                    Cerrar
                  </button>
                  <button
                    className="btn-ocupar"
                    onClick={() => actualizarEstado(h.id, "ocupada")}
                  >
                    Ocupar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

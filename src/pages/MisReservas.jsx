import React, { useState, useEffect } from "react";
import "./MisReservas.css";

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUsuario(parsedUser);

        fetch(`http://localhost:4000/reservas/mine?correo=${parsedUser.correo}`)
          .then((res) => res.json())
          .then((data) => setReservas(data))
          .catch((err) => console.error("Error al cargar reservas:", err));
      } catch (err) {
        console.error("Error al leer usuario:", err);
      }
    }
  }, []);

  return (
    <div className="misreservas-page">
      <div className="misreservas-overlay">
        <div className="misreservas-contenedor">
          <h2 className="misreservas-title">Mis reservas</h2>

          {reservas.length === 0 ? (
            <p style={{ color: "#fff", textAlign: "center" }}>
              No tenés reservas registradas.
            </p>
          ) : (
            <table className="misreservas-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Habitación</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Personas</th>
                  <th>Total</th>
                  <th>Método de pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id}>
                    <td>{reserva.id}</td>
                    <td>{reserva.habitacion}</td>
                    <td>{new Date(reserva.fechaEntrada).toLocaleDateString("es-AR")}</td>
                    <td>{new Date(reserva.fechaSalida).toLocaleDateString("es-AR")}</td>
                    <td>{reserva.personas}</td>
                    <td>${reserva.total}</td>
                    <td>{reserva.metodoPago || "—"}</td>
                    <td>
                      <span
                        className={
                          reserva.estado === "pagada"
                            ? "estado-pagada"
                            : reserva.estado === "cancelada"
                            ? "estado-cancelada"
                            : "estado-pendiente"
                        }
                      >
                        {reserva.estado.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisReservas;

import React, { useEffect, useMemo, useState } from "react";
import "./ReservasAdmin.css";

export default function ReservasAdmin() {
  const [reservas, setReservas] = useState([]);
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Estados para modal
  const [modalVisible, setModalVisible] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      const params = new URLSearchParams();
      if (estado) params.append("estado", estado);
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

      const res = await fetch(`http://localhost:4000/reservas/search?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.items)) {
        setReservas(data.items);
        setMensaje("");
      } else {
        setReservas([]);
        setMensaje("No hay reservas registradas.");
      }
    } catch (err) {
      console.error("Error cargando reservas:", err);
      setMensaje("❌ Error al cargar reservas.");
    }
  };

  const abrirModal = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setReservaSeleccionada(null);
  };

  const confirmarEliminar = async () => {
    if (!reservaSeleccionada) return;
    try {
      const res = await fetch(`http://localhost:4000/reservas/${reservaSeleccionada.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMensaje("🗑️ Reserva eliminada correctamente.");
        cargarReservas();
      } else {
        setMensaje("❌ Error al eliminar la reserva.");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar la reserva.");
    } finally {
      cerrarModal();
    }
  };

  const resumen = useMemo(() => {
    const total = reservas.length;
    const pendientes = reservas.filter((r) => r.estado === "pendiente").length;
    const pagadas = reservas.filter((r) => r.estado === "pagada").length;
    const canceladas = reservas.filter((r) => r.estado === "cancelada").length;
    return { total, pendientes, pagadas, canceladas };
  }, [reservas]);

  return (
    <div className="reservasadmin-page">
      <div className="reservasadmin-overlay">
        <div className="reservasadmin-contenedor">
          <h2 className="reservasadmin-title">Gestión de Reservas</h2>

          <form
            className="reservasadmin-filtros"
            onSubmit={(e) => {
              e.preventDefault();
              cargarReservas();
            }}
          >
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            <button type="submit" className="btn-filtrar">Aplicar filtros</button>
          </form>

          <div className="resumen-cards">
            <div className="card">Total <span>{resumen.total}</span></div>
            <div className="card card-pendiente">Pendientes <span>{resumen.pendientes}</span></div>
            <div className="card card-pagada">Pagadas <span>{resumen.pagadas}</span></div>
            <div className="card card-cancelada">Canceladas <span>{resumen.canceladas}</span></div>
          </div>

          {mensaje && <p className="reservasadmin-info">{mensaje}</p>}

          {reservas.length === 0 ? (
            <p className="reservasadmin-empty">No hay reservas registradas.</p>
          ) : (
            <table className="reservasadmin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Habitación</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Total</th>
                  <th>Método de pago</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.nombre}</td>
                    <td>{r.correo}</td>
                    <td>{r.habitacion}</td>
                    <td>{new Date(r.fechaEntrada).toLocaleDateString()}</td>
                    <td>{new Date(r.fechaSalida).toLocaleDateString()}</td>
                    <td>${r.total}</td>
                    <td>{r.metodoPago || "—"}</td>
                    <td>
                      <span className={`estado ${r.estado}`}>{r.estado}</span>
                    </td>
                    <td>
                      <button className="btn-eliminar" onClick={() => abrirModal(r)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {modalVisible && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>¿Eliminar reserva #{reservaSeleccionada.id}?</h3>
                <p>Esta acción no se puede deshacer.</p>
                <div className="modal-actions">
                  <button onClick={confirmarEliminar} className="btn-confirmar">Eliminar</button>
                  <button onClick={cerrarModal} className="btn-cancelar">Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

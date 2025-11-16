import React, { useEffect, useState } from "react";
import "./Operador.css";

export default function Operador() {
  const [reservas, setReservas] = useState([]);
  const [correo, setCorreo] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [info, setInfo] = useState("");

  const [modal, setModal] = useState({ visible: false, tipo: "", id: null });

  const cargarPendientes = async () => {
    try {
      const res = await fetch("http://localhost:4000/reservas/pending");
      const data = await res.json();
      if (Array.isArray(data)) setReservas(data);
    } catch (err) {
      console.error("Error al cargar reservas pendientes:", err);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const abrirModal = (tipo, id) => setModal({ visible: true, tipo, id });
  const cerrarModal = () => setModal({ visible: false, tipo: "", id: null });

  const ejecutarAccion = async () => {
    const { tipo, id } = modal;
    if (!id) return;

    try {
      const ruta = tipo === "confirmar" ? "confirm" : "cancel";
      const res = await fetch(`http://localhost:4000/reservas/${id}/${ruta}`, { method: "PUT" });
      if (res.ok) {
        setInfo(
          tipo === "confirmar"
            ? "✅ Reserva confirmada correctamente"
            : "❌ Reserva cancelada correctamente"
        );
        cargarPendientes();
      } else {
        setInfo("Error al actualizar la reserva");
      }
    } catch (err) {
      console.error(err);
      setInfo("Error al conectar con el servidor");
    } finally {
      cerrarModal();
    }
  };

  const enviarCorreo = async () => {
    if (!correo || !asunto || !mensaje) {
      alert("Completá todos los campos del correo.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, asunto, mensaje }),
      });

      if (res.ok) {
        setInfo("📨 Correo enviado correctamente");
        setCorreo("");
        setAsunto("");
        setMensaje("");
      } else {
        setInfo("❌ Error al enviar el correo");
      }
    } catch (err) {
      console.error("Error al enviar correo:", err);
      setInfo("❌ Error al conectar con el servidor");
    }
  };

  return (
    <div className="operador-page">
      <div className="operador-overlay">
        <div className="operador-contenedor">
          <h2 className="operador-title">Panel del Operador</h2>

          {info && <p className="operador-info">{info}</p>}

          <h4 className="operador-subtitle">Reservas pendientes</h4>

          {reservas.length === 0 ? (
            <p className="operador-empty">No hay reservas pendientes.</p>
          ) : (
            <table className="operador-table">
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.nombre}</td>
                    <td>{r.correo}</td>
                    <td>{r.habitacion}</td>
                    <td>{String(r.fechaEntrada).slice(0, 10)}</td>
                    <td>{String(r.fechaSalida).slice(0, 10)}</td>
                    <td>${r.total}</td>
                    <td>{r.metodoPago || "—"}</td>
                    <td>
                      <button className="btn-confirmar" onClick={() => abrirModal("confirmar", r.id)}>Confirmar</button>
                      <button className="btn-cancelar" onClick={() => abrirModal("cancelar", r.id)}>Cancelar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {modal.visible && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>
                  {modal.tipo === "confirmar"
                    ? "¿Confirmar esta reserva?"
                    : "¿Cancelar esta reserva?"}
                </h3>
                <p>Esta acción no se puede deshacer.</p>
                <div className="modal-actions">
                  <button onClick={ejecutarAccion} className="btn-confirmar">
                    {modal.tipo === "confirmar" ? "Confirmar" : "Cancelar"}
                  </button>
                  <button onClick={cerrarModal} className="btn-cancelar">Cerrar</button>
                </div>
              </div>
            </div>
          )}

          <h4 className="operador-subtitle">Responder por mail</h4>
          <div className="operador-form">
            <input type="email" placeholder="Para (correo)" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            <input type="text" placeholder="Asunto" value={asunto} onChange={(e) => setAsunto(e.target.value)} />
            <textarea rows="3" placeholder="Mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)}></textarea>
            <button className="btn-enviar" onClick={enviarCorreo}>Enviar respuesta</button>
          </div>
        </div>
      </div>
    </div>
  );
}


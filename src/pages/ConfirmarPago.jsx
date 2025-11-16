import React, { useEffect, useState } from "react";

export default function ConfirmarPago() {
  const [reserva, setReserva] = useState(null);
  const [metodo, setMetodo] = useState("tarjeta");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("reservaTemp");
    if (stored) setReserva(JSON.parse(stored));
  }, []);

  const handlePagar = async () => {
    if (!reserva?.id) {
      setMensaje("Faltan datos del pago.");
      return;
    }

    try {
      const res = await fetch("/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservaId: reserva.id,
          metodoPago: metodo,
          montoPagado: reserva.total,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setMensaje(data.message || "Error al procesar el pago.");
        return;
      }

      setMensaje("✅ Pago realizado correctamente.");
      localStorage.removeItem("reservaTemp");
    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión con el servidor.");
    }
  };

  const handleCancelar = async () => {
    if (!reserva?.id) return;
    try {
      const res = await fetch(`/reservas/cancelar/${reserva.id}`, { method: "PUT" });
      const data = await res.json();
      setMensaje(data.message || "Reserva cancelada.");
      localStorage.removeItem("reservaTemp");
    } catch {
      setMensaje("Error al cancelar la reserva.");
    }
  };

  if (!reserva)
    return <div style={{ textAlign: "center" }}>No hay reserva pendiente.</div>;

  return (
    <div className="login-container" style={{ maxWidth: 500 }}>
      <h2>Confirmar pago</h2>
      <p><strong>Habitación:</strong> {reserva.habitacion}</p>
      <p><strong>Total:</strong> ${reserva.total}</p>

      <label>Método de pago</label>
      <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
        <option value="tarjeta">Tarjeta de crédito / débito</option>
        <option value="transferencia">Transferencia bancaria</option>
        <option value="efectivo">Pago en efectivo</option>
      </select>

      <button onClick={handlePagar} style={{ marginTop: 12 }}>
        Confirmar pago
      </button>

      <button
        onClick={handleCancelar}
        style={{
          marginTop: 10,
          backgroundColor: "#a00",
          color: "#fff",
          border: "none",
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Cancelar reserva
      </button>

      {mensaje && <p style={{ marginTop: 10 }}>{mensaje}</p>}
    </div>
  );
}

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Pago() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reserva = state?.reserva;

  const [metodoPago, setMetodoPago] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  if (!reserva) {
    return (
      <div className="login-container">
        <h2>No se encontró información de la reserva</h2>
        <button onClick={() => navigate("/home")}>Volver al inicio</button>
      </div>
    );
  }

  const handlePagar = async () => {
    setProcesando(true);
    setMensaje("");

    try {
      if (!metodoPago) {
        setMensaje("⚠️ Seleccioná un método de pago antes de continuar.");
        setProcesando(false);
        return;
      }

      const res = await fetch("http://localhost:4000/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservaId: reserva.id,          // ✅ el backend usa reservaId
          metodoPago,                     // ✅ coincide con columna SQL
          montoPagado: reserva.total,     // ✅ nuevo campo montoPagado
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al procesar el pago.");
      }

      setMensaje(`✅ ${data.message}`);
      setTimeout(() => navigate("/home"), 2500);
    } catch (err) {
      console.error("Error al pagar:", err);
      setMensaje("❌ No se pudo completar el pago. Intentalo más tarde.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: 600 }}>
      <h2>💳 Pago de Reserva #{reserva.id}</h2>
      <p>
        Total a abonar: <strong>${reserva.total}</strong>
      </p>

      <label>Método de pago:</label>
      <select
        value={metodoPago}
        onChange={(e) => setMetodoPago(e.target.value)}
      >
        <option value="">Seleccioná una opción</option>
        <option value="Tarjeta de Crédito">Tarjeta de crédito</option>
        <option value="Tarjeta de Débito">Tarjeta de débito</option>
        <option value="Transferencia Bancaria">Transferencia bancaria</option>
        <option value="Efectivo">Efectivo en recepción</option>
      </select>

      <button
        onClick={handlePagar}
        disabled={procesando}
        style={{ marginTop: 15 }}
      >
        {procesando ? "Procesando..." : "Confirmar pago"}
      </button>

      {mensaje && (
        <p
          style={{
            marginTop: 10,
            color: mensaje.startsWith("✅") ? "green" : "red",
          }}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}

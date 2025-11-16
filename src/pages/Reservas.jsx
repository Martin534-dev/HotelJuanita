import React, { useState, useEffect } from "react";
import "./Reservas.css";

const Reservas = () => {
  const [user, setUser] = useState(null);
  const [habitacion, setHabitacion] = useState("");
  const [habitacionId, setHabitacionId] = useState(null);
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [personas, setPersonas] = useState(1);
  const [precio, setPrecio] = useState(0);
  const [total, setTotal] = useState(0);
  const [noches, setNoches] = useState(0);
  const [capacidadMax, setCapacidadMax] = useState(null);
  const [metodoPago, setMetodoPago] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      localStorage.setItem("redirectAfterLogin", "/reservas");
      window.location.href = "/login";
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch {}

    const fetchHabitaciones = async () => {
      try {
        const res = await fetch("/habitaciones");
        if (!res.ok) throw new Error("Error al obtener habitaciones");
        const data = await res.json();
        setHabitacionesDisponibles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar habitaciones:", err);
      }
    };
    fetchHabitaciones();
  }, []);

  useEffect(() => {
    if (!fechaIngreso || !fechaSalida) { setNoches(0); setTotal(0); return; }
    const inD = new Date(fechaIngreso);
    const outD = new Date(fechaSalida);
    const diff = (outD - inD) / (1000 * 60 * 60 * 24);
    const nochesCalc = diff > 0 ? diff : 0;
    setNoches(nochesCalc);
    setTotal(nochesCalc * (precio || 0));
  }, [habitacion, fechaIngreso, fechaSalida, precio]);

  const handleHabitacionChange = (e) => {
    const tipo = e.target.value;
    setHabitacion(tipo);
    const habObj = habitacionesDisponibles.find((h) => h.tipo === tipo);
    if (habObj) {
      setPrecio(Number(habObj.precio) || 0);
      setCapacidadMax(Number(habObj.capacidad) || 1);
      setHabitacionId(habObj.id);
    } else {
      setPrecio(0);
      setCapacidadMax(null);
      setHabitacionId(null);
    }
    setPersonas(1);
  };

  const handleReserva = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!habitacion || !habitacionId || !fechaIngreso || !fechaSalida || !metodoPago) {
      setMensaje("⚠️ Por favor, completá todos los campos.");
      return;
    }

    const habObj = habitacionesDisponibles.find((h) => h.tipo === habitacion);
    if (habObj && habObj.estado && habObj.estado.toLowerCase() !== "disponible") {
      setMensaje(`⚠️ La habitación está actualmente ${habObj.estado}.`);
      return;
    }

    if (personas > (capacidadMax || 1)) {
      setMensaje(`⚠️ La ${habitacion} admite hasta ${capacidadMax} persona(s).`);
      return;
    }

    try {
      const res = await fetch("/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: user?.nombre,
          correo: user?.correo,
          habitacion,
          habitacionId,              // ✅ clave para no cruzar con otras habitaciones
          fechaEntrada: fechaIngreso,
          fechaSalida,
          personas,
          precioNoche: precio,
          total,
          metodoPago,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMensaje(data.message || "✅ Reserva registrada con éxito.");
      } else {
        setMensaje(data.message || "❌ No se pudo registrar la reserva.");
      }
    } catch (err) {
      console.error("Error:", err);
      setMensaje("❌ Error de conexión con el servidor.");
    }
  };

  return (
    <div className="reserva-page">
      <div className="reserva-overlay">
        <div className="reserva-contenedor">
          <h2 className="reserva-title">Reservá tu estadía</h2>

          <form className="reserva-form" onSubmit={handleReserva}>
            <div className="reserva-info">
              <p><strong>Nombre:</strong> {user?.nombre || "—"}</p>
              <p><strong>Apellido:</strong> {user?.apellido || "—"}</p>
              <p><strong>Correo:</strong> {user?.correo || "—"}</p>
            </div>

            <label>Tipo de habitación</label>
            <select value={habitacion} onChange={handleHabitacionChange}>
              <option value="">Seleccioná una opción</option>
              {habitacionesDisponibles.map((h) => (
                <option key={h.id} value={h.tipo}>
                  {h.tipo} — ${h.precio} — Capacidad: {h.capacidad || 1} — Estado: {h.estado}
                </option>
              ))}
            </select>

            <label>Fecha de ingreso</label>
            <input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />

            <label>Fecha de salida</label>
            <input type="date" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} />

            <label>Cantidad de personas</label>
            <input
              type="number"
              min="1"
              max={capacidadMax || 10}
              value={personas}
              onChange={(e) => setPersonas(parseInt(e.target.value))}
            />

            {habitacion && (
              <p className="capacidad-info">Capacidad máxima: {capacidadMax || "—"} persona(s)</p>
            )}

            <label>Medio de pago</label>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <option value="">Seleccioná una opción</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
            </select>

            <div className="resumen-precio">
              <p>Noches: {noches}</p>
              <p>Precio por noche: ${precio}</p>
              <p>Total estimado: ${total}</p>
            </div>

            <button type="submit">Enviar reserva</button>
            {mensaje && <p className="mensaje">{mensaje}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reservas;

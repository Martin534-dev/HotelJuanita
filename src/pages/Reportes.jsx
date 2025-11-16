import React, { useEffect, useState } from "react";
import "./Reportes.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Reportes() {
  const [usuarios, setUsuarios] = useState(0);
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [reservasFiltradas, setReservasFiltradas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Usuarios
      const resUsuarios = await fetch("/usuarios");
      const dataUsuarios = await resUsuarios.json();
      setUsuarios(Array.isArray(dataUsuarios) ? dataUsuarios.length : 0);

      // Habitaciones
      const resHabitaciones = await fetch("/habitaciones");
      const dataHabitaciones = await resHabitaciones.json();
      setHabitaciones(Array.isArray(dataHabitaciones) ? dataHabitaciones.length : 0);

      // Reservas
      const resReservas = await fetch("/reservas");
      const dataReservas = await resReservas.json();
      if (dataReservas.success && Array.isArray(dataReservas.items)) {
        setReservas(dataReservas.items);
        setReservasFiltradas(dataReservas.items);
      } else if (Array.isArray(dataReservas)) {
        setReservas(dataReservas);
        setReservasFiltradas(dataReservas);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  // === FILTROS ===
  const normalizarFecha = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    // aseguramos formato AAAA-MM-DD sin hora ni desfases
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const aplicarFiltros = () => {
    let filtradas = [...reservas];

    if (filtroEstado && filtroEstado !== "todos") {
      filtradas = filtradas.filter(
        (r) => r.estado.toLowerCase() === filtroEstado.toLowerCase()
      );
    }

    const desdeDate = normalizarFecha(desde);
    const hastaDate = normalizarFecha(hasta);

    if (desdeDate) {
      filtradas = filtradas.filter((r) => {
        const entrada = normalizarFecha(r.fechaEntrada);
        return entrada && entrada >= desdeDate;
      });
    }

    if (hastaDate) {
      filtradas = filtradas.filter((r) => {
        const salida = normalizarFecha(r.fechaSalida);
        return salida && salida <= hastaDate;
      });
    }

    setReservasFiltradas(filtradas);
  };

  const limpiarFiltros = () => {
    setFiltroEstado("");
    setDesde("");
    setHasta("");
    setReservasFiltradas(reservas);
  };

  // === DATOS PARA GRÁFICO ===
  const conteo = {
    pendiente: reservasFiltradas.filter((r) => r.estado === "pendiente").length,
    pagada: reservasFiltradas.filter((r) => r.estado === "pagada").length,
    cancelada: reservasFiltradas.filter((r) => r.estado === "cancelada").length,
  };

  const dataGrafico = [
    { estado: "Pendiente", cantidad: conteo.pendiente },
    { estado: "Pagada", cantidad: conteo.pagada },
    { estado: "Cancelada", cantidad: conteo.cancelada },
  ];

  return (
    <div className="reportes-page">
      <div className="reportes-overlay">
        <h2 className="reportes-title">Panel de Reportes</h2>

        {/* === MÉTRICAS === */}
        <div className="reportes-metricas">
          <div className="metric-card">
            <h4>Usuarios</h4>
            <p>{usuarios}</p>
          </div>
          <div className="metric-card">
            <h4>Reservas</h4>
            <p>{reservas.length}</p>
          </div>
          <div className="metric-card">
            <h4>Habitaciones</h4>
            <p>{habitaciones}</p>
          </div>
        </div>

        {/* === FILTROS === */}
        <div className="reportes-filtros">
          <select
            className="form-select w-auto"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <input
            type="date"
            className="form-control w-auto"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
          <input
            type="date"
            className="form-control w-auto"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />

          <button className="btn btn-primary" onClick={aplicarFiltros}>
            Aplicar filtros
          </button>
          <button className="btn btn-secondary" onClick={limpiarFiltros}>
            Limpiar
          </button>
        </div>

        {/* === GRÁFICO === */}
        <div className="grafico-container">
          <h5>Reservas por estado</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataGrafico} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="estado" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{ background: "rgba(0,0,0,0.7)", borderRadius: "8px", color: "#fff" }}
              />
              <Bar dataKey="cantidad" fill="#00bcd4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

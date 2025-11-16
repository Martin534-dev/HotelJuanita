import React, { useEffect, useState } from "react";
import "./Admin.css";

export default function Admin() {
  // ---------- Estado: Habitaciones ----------
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionesFiltradas, setHabitacionesFiltradas] = useState([]);

  // formulario crear habitación
  const [nombreHabitacion, setNombreHabitacion] = useState("");
  const [precioHabitacion, setPrecioHabitacion] = useState("");
  const [capacidadHabitacion, setCapacidadHabitacion] = useState("");
  const [descripcionHabitacion, setDescripcionHabitacion] = useState("");
  const [imagenPreview, setImagenPreview] = useState(null);

  // edición habitaciones
  const [editandoHab, setEditandoHab] = useState(null);
  const [editDataHab, setEditDataHab] = useState(null);

  // filtros habitaciones
  const [filtroNombreHab, setFiltroNombreHab] = useState("");
  const [filtroPrecioHab, setFiltroPrecioHab] = useState("");
  const [filtroEstadoHab, setFiltroEstadoHab] = useState("");

  // ---------- Estado: Operadores ----------
  const [operadores, setOperadores] = useState([]);
  const [operadoresFiltrados, setOperadoresFiltrados] = useState([]);

  // formulario crear operador
  const [nombreOperador, setNombreOperador] = useState("");
  const [apellidoOperador, setApellidoOperador] = useState("");
  const [usuarioOperador, setUsuarioOperador] = useState("");

  // edición operadores
  const [editandoOp, setEditandoOp] = useState(null);
  const [editDataOp, setEditDataOp] = useState(null);

  // filtros operadores
  const [filtroOperador, setFiltroOperador] = useState("");

  // mensajes
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarHabitaciones();
    cargarOperadores();
  }, []);

  // =========================
  // HABITACIONES
  // =========================
  const cargarHabitaciones = async () => {
    try {
      const res = await fetch("/habitaciones");
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];

      const adaptadas = lista.map((h) => {
        let capacidadDefault = 1;
        const tipo = (h.tipo || "").toLowerCase();
        if (tipo.includes("suite")) capacidadDefault = 4;
        else if (tipo.includes("doble")) capacidadDefault = 2;
        return { ...h, capacidad: h.capacidad || capacidadDefault };
      });

      setHabitaciones(adaptadas);
      setHabitacionesFiltradas(adaptadas);
    } catch (err) {
      console.error("Error al cargar habitaciones:", err);
    }
  };

  // ✅ Solo imágenes válidas y máx 1 MB
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      setMensaje("⚠️ Solo se permiten imágenes (JPG, PNG, WEBP, GIF).");
      e.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setMensaje("⚠️ La imagen no puede superar 1MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setImagenPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const agregarHabitacion = async () => {
    if (!nombreHabitacion || !precioHabitacion) {
      setMensaje("⚠️ Completá tipo y precio.");
      return;
    }

    try {
      const res = await fetch("/habitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: Math.floor(Math.random() * 900) + 100,
          tipo: nombreHabitacion,
          precio: parseFloat(precioHabitacion),
          capacidad: parseInt(capacidadHabitacion || 1),
          estado: "disponible",
          descripcion: descripcionHabitacion,
          imagen: imagenPreview || "",
        }),
      });

      if (!res.ok) throw new Error("No se pudo crear");
      setMensaje("✅ Habitación agregada correctamente");
      setNombreHabitacion("");
      setPrecioHabitacion("");
      setCapacidadHabitacion("");
      setDescripcionHabitacion("");
      setImagenPreview(null);
      cargarHabitaciones();
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al conectar con el servidor");
    }
  };

  const eliminarHabitacion = async (id) => {
    if (!window.confirm("¿Eliminar esta habitación?")) return;
    try {
      await fetch(`/habitaciones/${id}`, { method: "DELETE" });
      cargarHabitaciones();
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ Guardar habitación usando buffer de edición
  const guardarHabitacion = async () => {
    if (!editDataHab) return;

    try {
      const res = await fetch(`/habitaciones/${editDataHab.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: editDataHab.tipo,
          precio: Number(editDataHab.precio),
          capacidad: Number(editDataHab.capacidad || 1),
          estado: editDataHab.estado,
          descripcion: editDataHab.descripcion || "",
          imagen: editDataHab.imagen || "",
        }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar");
      setMensaje("✅ Habitación actualizada");
      setEditandoHab(null);
      setEditDataHab(null);
      cargarHabitaciones();
    } catch (err) {
      console.error("Error al actualizar habitación:", err);
    }
  };

  // 🔹 Filtros habitaciones
  const aplicarFiltrosHabitaciones = () => {
    let filtradas = [...habitaciones];
    if (filtroNombreHab.trim() !== "")
      filtradas = filtradas.filter((h) =>
        (h.tipo || "").toLowerCase().includes(filtroNombreHab.toLowerCase())
      );
    if (filtroPrecioHab !== "")
      filtradas = filtradas.filter(
        (h) => Number(h.precio) === Number(filtroPrecioHab)
      );
    if (filtroEstadoHab && filtroEstadoHab !== "todos")
      filtradas = filtradas.filter(
        (h) => (h.estado || "").toLowerCase() === filtroEstadoHab.toLowerCase()
      );
    setHabitacionesFiltradas(filtradas);
  };

  const limpiarFiltrosHabitaciones = () => {
    setFiltroNombreHab("");
    setFiltroPrecioHab("");
    setFiltroEstadoHab("");
    setHabitacionesFiltradas(habitaciones);
  };

  // =========================
  // OPERADORES
  // =========================
  const cargarOperadores = async () => {
    try {
      const res = await fetch("/usuarios");
      const data = await res.json();
      const lista = Array.isArray(data)
        ? data.filter(
            (u) => String(u.rol || u.Rol).toLowerCase() === "operador"
          )
        : [];
      setOperadores(lista);
      setOperadoresFiltrados(lista);
    } catch (err) {
      console.error("Error al cargar operadores:", err);
    }
  };

  // ✅ Higienización al crear
  const agregarOperador = async () => {
    if (!nombreOperador || !apellidoOperador || !usuarioOperador) {
      setMensaje("⚠️ Completá nombre, apellido y correo.");
      return;
    }

    const email = String(usuarioOperador).trim();
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      setMensaje("⚠️ Ingresá un correo válido (ejemplo@dominio.com).");
      return;
    }

    try {
      const res = await fetch("/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreOperador,
          apellido: apellidoOperador,
          correo: email,
          contrasena: "12345",
          rol: "operador",
        }),
      });

      if (!res.ok) throw new Error("No se pudo crear");
      setMensaje("✅ Operador agregado correctamente");
      setNombreOperador("");
      setApellidoOperador("");
      setUsuarioOperador("");
      cargarOperadores();
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al conectar con el servidor");
    }
  };

  const eliminarOperador = async (id) => {
    if (!window.confirm("¿Eliminar este operador?")) return;
    try {
      await fetch(`/usuarios/${id}`, { method: "DELETE" });
      cargarOperadores();
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ Guardar operador usando buffer de edición
  const guardarOperador = async () => {
    if (!editDataOp) return;

    const email = String(editDataOp.correo || "").trim();
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!emailRegex.test(email)) {
      setMensaje("⚠️ Ingresá un correo válido (ejemplo@dominio.com).");
      return;
    }

    try {
      const res = await fetch(`/usuarios/${editDataOp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editDataOp.nombre,
          apellido: editDataOp.apellido || "",
          correo: email,
          rol: editDataOp.rol,
        }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar");

      setMensaje("✅ Operador actualizado");
      setEditandoOp(null);
      setEditDataOp(null);
      cargarOperadores();
    } catch (err) {
      console.error("Error al actualizar operador:", err);
    }
  };

  const aplicarFiltrosOperadores = () => {
    let filtrados = [...operadores];
    if (filtroOperador.trim() !== "") {
      const filtro = filtroOperador.toLowerCase();
      filtrados = filtrados.filter(
        (o) =>
          (o.nombre || "").toLowerCase().includes(filtro) ||
          (o.apellido || "").toLowerCase().includes(filtro) ||
          (o.correo || "").toLowerCase().includes(filtro)
      );
    }
    setOperadoresFiltrados(filtrados);
  };

  const limpiarFiltrosOperadores = () => {
    setFiltroOperador("");
    setOperadoresFiltrados(operadores);
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="admin-page">
      <div className="admin-overlay">
        <h2 className="admin-title">Panel del Administrador</h2>
        {mensaje && <p className="text-center text-info">{mensaje}</p>}

        {/* ===== GESTIÓN HABITACIONES ===== */}
        <div className="admin-section">
          <h4>🛏️ Gestión de Habitaciones</h4>

          {/* Formulario creación */}
          <div className="d-flex flex-wrap gap-2 my-3">
            <input
              type="text"
              placeholder="Tipo de habitación"
              className="form-control w-auto"
              value={nombreHabitacion}
              onChange={(e) => setNombreHabitacion(e.target.value)}
            />
            <input
              type="number"
              placeholder="Precio USD/noche"
              className="form-control w-auto"
              value={precioHabitacion}
              onChange={(e) => setPrecioHabitacion(e.target.value)}
            />
            <input
              type="number"
              placeholder="Capacidad (personas)"
              className="form-control w-auto"
              value={capacidadHabitacion}
              onChange={(e) => setCapacidadHabitacion(e.target.value)}
            />
            <input
              type="text"
              placeholder="Descripción"
              className="form-control w-100"
              value={descripcionHabitacion}
              onChange={(e) => setDescripcionHabitacion(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              className="form-control w-auto"
              onChange={handleImageChange}
            />
            <button className="btn btn-primary mt-2" onClick={agregarHabitacion}>
              Agregar
            </button>
          </div>

          {/* 🔹 Filtros */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              className="form-control w-auto"
              placeholder="Buscar por nombre"
              value={filtroNombreHab}
              onChange={(e) => setFiltroNombreHab(e.target.value)}
            />
            <input
              type="number"
              className="form-control w-auto"
              placeholder="Filtrar por precio"
              value={filtroPrecioHab}
              onChange={(e) => setFiltroPrecioHab(e.target.value)}
            />
            <select
              className="form-select w-auto"
              value={filtroEstadoHab}
              onChange={(e) => setFiltroEstadoHab(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="cerrada">Cerrada</option>
            </select>
            <button className="btn btn-primary" onClick={aplicarFiltrosHabitaciones}>
              Filtrar
            </button>
            <button
              className="btn btn-secondary"
              onClick={limpiarFiltrosHabitaciones}
            >
              Limpiar
            </button>
          </div>

          {/* Tabla Habitaciones */}
          {habitacionesFiltradas.length === 0 ? (
            <p>No hay habitaciones registradas.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Capacidad</th>
                  <th>Estado</th>
                  <th>Descripción</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {habitacionesFiltradas.map((h) => {
                  const isEditing = editandoHab === h.id;
                  return (
                    <tr key={h.id}>
                      <td>{h.id}</td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDataHab?.tipo ?? ""}
                            onChange={(e) =>
                              setEditDataHab((prev) => ({
                                ...prev,
                                tipo: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          h.tipo
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDataHab?.precio ?? ""}
                            onChange={(e) =>
                              setEditDataHab((prev) => ({
                                ...prev,
                                precio: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          `$${h.precio}`
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDataHab?.capacidad ?? 1}
                            onChange={(e) =>
                              setEditDataHab((prev) => ({
                                ...prev,
                                capacidad: parseInt(e.target.value) || 1,
                              }))
                            }
                          />
                        ) : (
                          h.capacidad || 1
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editDataHab?.estado ?? ""}
                            onChange={(e) =>
                              setEditDataHab((prev) => ({
                                ...prev,
                                estado: e.target.value,
                              }))
                            }
                          >
                            <option value="disponible">Disponible</option>
                            <option value="ocupada">Ocupada</option>
                            <option value="cerrada">Cerrada</option>
                          </select>
                        ) : (
                          <span className={`estado-${h.estado}`}>{h.estado}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDataHab?.descripcion ?? ""}
                            onChange={(e) =>
                              setEditDataHab((prev) => ({
                                ...prev,
                                descripcion: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          h.descripcion || "-"
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={guardarHabitacion}
                            >
                              Guardar
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditandoHab(null);
                                setEditDataHab(null);
                              }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => {
                                setEditandoHab(h.id);
                                setEditDataHab({ ...h });
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => eliminarHabitacion(h.id)}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ===== GESTIÓN OPERADORES ===== */}
        <div className="admin-section">
          <h4>👥 Gestión de Operadores</h4>

          <div className="d-flex flex-wrap gap-2 my-3">
            <input
              type="text"
              placeholder="Nombre"
              className="form-control w-auto"
              value={nombreOperador}
              onChange={(e) => setNombreOperador(e.target.value)}
            />
            <input
              type="text"
              placeholder="Apellido"
              className="form-control w-auto"
              value={apellidoOperador}
              onChange={(e) => setApellidoOperador(e.target.value)}
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="form-control w-auto"
              value={usuarioOperador}
              onChange={(e) => setUsuarioOperador(e.target.value)}
            />
            <button className="btn btn-primary" onClick={agregarOperador}>
              Agregar
            </button>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              className="form-control w-auto"
              placeholder="Buscar por nombre, apellido o correo"
              value={filtroOperador}
              onChange={(e) => setFiltroOperador(e.target.value)}
            />
            <button className="btn btn-primary" onClick={aplicarFiltrosOperadores}>
              Filtrar
            </button>
            <button
              className="btn btn-secondary"
              onClick={limpiarFiltrosOperadores}
            >
              Limpiar
            </button>
          </div>

          {operadoresFiltrados.length === 0 ? (
            <p>No hay operadores registrados.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {operadoresFiltrados.map((o) => {
                  const isEditing = editandoOp === o.id;
                  return (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDataOp?.nombre ?? ""}
                            onChange={(e) =>
                              setEditDataOp((prev) => ({
                                ...prev,
                                nombre: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          o.nombre
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDataOp?.apellido ?? ""}
                            onChange={(e) =>
                              setEditDataOp((prev) => ({
                                ...prev,
                                apellido: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          o.apellido || "-"
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDataOp?.correo ?? ""}
                            onChange={(e) =>
                              setEditDataOp((prev) => ({
                                ...prev,
                                correo: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          o.correo
                        )}
                      </td>
                      <td>{o.rol}</td>
                      <td>
                        {isEditing ? (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={guardarOperador}
                            >
                              Guardar
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditandoOp(null);
                                setEditDataOp(null);
                              }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => {
                                setEditandoOp(o.id);
                                setEditDataOp({ ...o });
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => eliminarOperador(o.id)}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

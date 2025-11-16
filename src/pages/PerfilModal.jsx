import React, { useState, useEffect } from "react";
import { FaTimes, FaPen } from "react-icons/fa";
import "./PerfilModal.css";

export default function PerfilModal({ show, onClose }) {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasenaActual: "",
    contrasenaNueva: "",
  });
  const [editable, setEditable] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Bloquear scroll cuando el modal esté abierto
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
  }, [show]);

  // Cargar datos desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setForm({
          nombre: parsed.nombre || "",
          apellido: parsed.apellido || "",
          correo: parsed.correo || "",
          contrasenaActual: "",
          contrasenaNueva: "",
        });
      } catch (err) {
        console.error("Error al cargar usuario:", err);
      }
    }
  }, [show]);

  const handleChange = (e) => {
    if (!editable) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // 🔹 Validación: si intenta cambiar contraseña, debe completar la actual
    if (form.contrasenaNueva && !form.contrasenaActual) {
      setMensaje("⚠️ Debes ingresar tu contraseña actual para cambiarla.");
      return;
    }

    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      correo: form.correo,
    };

    if (form.contrasenaNueva.trim() !== "") {
      payload.contrasenaActual = form.contrasenaActual;
      payload.contrasenaNueva = form.contrasenaNueva;
    }

    try {
      const res = await fetch(`http://localhost:4000/usuarios/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const updatedUser = {
          ...user,
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setMensaje("✅ Perfil actualizado correctamente");
        setEditable(false);
        setForm({ ...form, contrasenaActual: "", contrasenaNueva: "" });
      } else {
        setMensaje(data.message || "❌ Error al actualizar perfil");
      }
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setMensaje("❌ Error al conectar con el servidor");
    }
  };

  if (!show) return null;

  return (
    <div className="perfil-modal-overlay" onClick={onClose}>
      <div className="perfil-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-icon" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="perfil-header">
          <h2>
            Mi Perfil{" "}
            <button
              className="edit-btn"
              title="Editar perfil"
              onClick={() => setEditable(!editable)}
            >
              <FaPen />
            </button>
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            disabled={!editable}
          />

          <label>Apellido</label>
          <input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            disabled={!editable}
          />

          <label>Correo electrónico</label>
          <input
            name="correo"
            value={form.correo}
            onChange={handleChange}
            disabled={!editable}
          />

          <label>Contraseña actual</label>
          <input
            type="password"
            name="contrasenaActual"
            placeholder="Ingresá tu contraseña actual"
            value={form.contrasenaActual}
            onChange={handleChange}
            disabled={!editable}
          />

          <label>Nueva contraseña (opcional)</label>
          <input
            type="password"
            name="contrasenaNueva"
            placeholder="Dejar vacío para no cambiar"
            value={form.contrasenaNueva}
            onChange={handleChange}
            disabled={!editable}
          />

          <button type="submit" disabled={!editable}>
            Guardar cambios
          </button>
        </form>

        {mensaje && <p className="perfil-msg">{mensaje}</p>}
      </div>
    </div>
  );
}

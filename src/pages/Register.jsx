import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // usamos el mismo estilo para unificar

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, correo, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Cuenta creada correctamente");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setMensaje(data.message || "❌ Error al crear cuenta");
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">
          <h2 className="auth-title">Crear cuenta</h2>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn-auth">
              Registrarme
            </button>
          </form>

          {mensaje && <p className="auth-msg">{mensaje}</p>}

          <p className="auth-footer">
            ¿Ya tenés cuenta?{" "}
            <a href="/login" className="auth-link">
              Iniciá sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

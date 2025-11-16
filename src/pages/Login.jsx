import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (typeof onLoginSuccess === "function") onLoginSuccess(data.user);

        const redirectPath =
          localStorage.getItem("redirectAfterLogin") || "/home";
        localStorage.removeItem("redirectAfterLogin");

        if (data.user.rol === "admin") navigate("/admin");
        else if (data.user.rol === "operador") navigate("/operador");
        else navigate(redirectPath);
      } else {
        setMensaje(data.message || "Correo o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setMensaje("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">
          <h2 className="auth-title">Iniciar sesión</h2>

          <form onSubmit={handleSubmit}>
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
              Ingresar
            </button>
          </form>

          {mensaje && <p className="auth-msg">{mensaje}</p>}

          <p className="auth-footer">
            ¿No tenés cuenta?{" "}
            <a href="/register" className="auth-link">
              Registrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

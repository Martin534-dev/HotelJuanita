import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Contacto.css";

const Contacto = () => {
  const [formData, setFormData] = useState({
    from_name: "",
    from_email: "",
    message: "",
  });

  const [estadoEnvio, setEstadoEnvio] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        "service_lmtg46h",
        "template_olwsgdq",
        formData,
        "JKGCL9x6rrLCP4wir"
      )
      .then(
        () => {
          setEstadoEnvio("✅ ¡Mensaje enviado correctamente!");
          setFormData({ from_name: "", from_email: "", message: "" });
          setTimeout(() => setEstadoEnvio(""), 4000);
        },
        (error) => {
          console.error("Error:", error);
          setEstadoEnvio("❌ Hubo un error al enviar el mensaje. Intenta nuevamente.");
          setTimeout(() => setEstadoEnvio(""), 4000);
        }
      );
  };

  return (
    <div className="contacto-page">
      <div className="contacto-overlay">
        <div className="contacto-contenedor">
          {/* Columna izquierda */}
          <div className="contacto-izquierda">
            <h1 className="contacto-title">Contáctanos</h1>

            <form className="contacto-form" onSubmit={handleSubmit}>
              <label>Nombre:</label>
              <input
                type="text"
                name="from_name"
                value={formData.from_name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />

              <label>Correo electrónico:</label>
              <input
                type="email"
                name="from_email"
                value={formData.from_email}
                onChange={handleChange}
                placeholder="ejemplo@email.com"
                required
              />

              <label>Mensaje:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Escribí tu mensaje..."
                required
              ></textarea>

              <button type="submit">Enviar mensaje</button>
            </form>

            {estadoEnvio && <p className="estado-envio">{estadoEnvio}</p>}
          </div>

          {/* Columna derecha */}
          <div className="contacto-derecha">
            <iframe
              title="Ubicación Hotel La Juanita"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3552.6983858979195!2d-65.414!3d-24.785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x941b5f7a83f37e19%3A0x59b7c0db4c9d0f8b!2sManuela%20Gonz%C3%A1lez%20de%20Todd%20779%2C%20Salta!5e0!3m2!1ses!2sar!4v1690000000000!5m2!1ses!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;

import React, { useEffect, useState } from "react";
import "./Integraciones.css";

function Integraciones() {
  const [clima, setClima] = useState(null);
  const [cotizaciones, setCotizaciones] = useState({});
  const [error, setError] = useState("");

  const API_KEY = "6fa024c4d5d447fb9e3d49913b44f37f";

  useEffect(() => {
    // === API 1: Clima actual (Open-Meteo) ===
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-24.79&longitude=-65.41&current_weather=true"
    )
      .then((res) => res.json())
      .then((data) => setClima(data.current_weather))
      .catch(() => setError("Error al obtener datos del clima."));

    // === API 2: Cotizaciones (CurrencyFreaks) ===
    fetch(
      `https://api.currencyfreaks.com/latest?apikey=${API_KEY}&symbols=USD,EUR,BRL,ARS`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setCotizaciones({
            USD: parseFloat(data.rates.USD),
            EUR: parseFloat(data.rates.EUR),
            BRL: parseFloat(data.rates.BRL),
            ARS: parseFloat(data.rates.ARS),
          });
        } else {
          setError("Error al obtener cotizaciones.");
        }
      })
      .catch(() => setError("Error al obtener cotizaciones."));
  }, []);

  return (
    <div className="integraciones-page">
      <div className="integraciones-overlay">
        <h1 className="integraciones-title">Integraciones del Sistema</h1>
        <p className="integraciones-subtitle">
          En esta sección se muestran datos externos obtenidos mediante APIs públicas
          para orientarse un poco más con el clima de la zona y con la cotización actual de las monedas.
        </p>

        {error && <p className="error">{error}</p>}

        {/* === Clima === */}
        <div className="integraciones-card">
          <h3>🌤️ Clima actual en Salta</h3>
          {clima ? (
            <>
              <p>
                <strong>Temperatura:</strong> {clima.temperature} °C
              </p>
              <p>
                <strong>Viento:</strong> {clima.windspeed} km/h
              </p>
              <p>
                <strong>Dirección del viento:</strong> {clima.winddirection}°
              </p>
            </>
          ) : (
            <p>Cargando clima...</p>
          )}
        </div>

        {/* === Cotizaciones === */}
        <div className="integraciones-card">
          <h3>💱 Cotización de Monedas (ARS)</h3>
          {cotizaciones && cotizaciones.USD ? (
            <>
              <p>
                <strong>1 USD</strong> ={" "}
                {(cotizaciones.ARS / cotizaciones.USD).toFixed(2)} ARS
              </p>
              <p>
                <strong>1 EUR</strong> ={" "}
                {(cotizaciones.ARS / cotizaciones.EUR).toFixed(2)} ARS
              </p>
              <p>
                <strong>1 BRL</strong> ={" "}
                {(cotizaciones.ARS / cotizaciones.BRL).toFixed(2)} ARS
              </p>
              <p>
                <strong>1 ARS</strong> = 1.00 ARS
              </p>
            </>
          ) : (
            <p>Cargando cotizaciones...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Integraciones;

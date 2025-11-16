import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Servicios.css";

// Imágenes predeterminadas
const IMAGE_MAP = {
  "suite premium":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  "habitación doble":
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  "single económica":
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
};

// Descripciones predeterminadas
const DESC_MAP = {
  "suite premium":
    "Amplia, luminosa y con balcón. TV 4K, frigobar y desayuno incluido.",
  "habitación doble":
    "Ideal para parejas o amigos. Cama queen, escritorio y A/A silencioso.",
  "single económica":
    "Opción práctica y cómoda para una persona. Wi-Fi y escritorio funcional.",
};

// Normaliza el tipo de habitación
function normalizarTipo(raw = "") {
  const t = String(raw)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  if (t.includes("suite")) return "suite premium";
  if (t.includes("doble")) return "habitación doble";
  if (t.includes("single") || t.includes("economica")) return "single económica";
  return "habitación doble";
}

export default function Servicios() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        const res = await fetch("/habitaciones");
        if (!res.ok) throw new Error("Error al obtener habitaciones");
        const data = await res.json();

        const adaptadas = (Array.isArray(data) ? data : []).map((hab) => {
          const tipoRaw = hab.tipo ?? "Habitación Doble";
          const key = normalizarTipo(tipoRaw);
          return {
            id: hab.id ?? crypto.randomUUID(),
            nombre: tipoRaw,
            precio: hab.precio ?? 0,
            // 🔹 Si la BD tiene imagen personalizada, se usa esa. Si no, se usa la predeterminada.
            imagen:
              hab.imagen && hab.imagen.trim() !== ""
                ? hab.imagen
                : IMAGE_MAP[key],
            // 🔹 Si tiene descripción propia, se usa. Si no, la del mapa.
            descripcion: hab.descripcion || DESC_MAP[key],
          };
        });

        setHabitaciones(adaptadas);
      } catch (err) {
        console.error("Error al cargar habitaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHabitaciones();
  }, []);

  const handleReservaClick = () => {
    const user = localStorage.getItem("user");
    if (user) navigate("/reservas");
    else {
      localStorage.setItem("redirectAfterLogin", "/reservas");
      navigate("/login");
    }
  };

  return (
    <section className="servicios-page">
      <div className="servicios-overlay">
        <h1 className="titulo fadeUp">
          Nuestras <span className="accent">Habitaciones</span>
        </h1>

        {loading ? (
          <p className="small-muted">Cargando habitaciones...</p>
        ) : (
          <div className="habitaciones-grid">
            {habitaciones.map((hab) => (
              <article key={hab.id} className="habitacion-card zoomIn">
                <div className="img-wrap">
                  <img
                    src={hab.imagen}
                    alt={hab.nombre}
                    className="habitacion-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1600585154154-85b33716fd2f?auto=format&fit=crop&w=1600&q=80";
                    }}
                  />
                </div>
                <h2 className="hab-nombre">{hab.nombre}</h2>
                <p className="hab-desc">{hab.descripcion}</p>
                <p className="precio">
                  <span className="simbolo">$</span>
                  {hab.precio} <span className="moneda">USD</span> / noche
                </p>
                <button
                  onClick={handleReservaClick}
                  className="btn btn-primary w-100"
                >
                  Reservar
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

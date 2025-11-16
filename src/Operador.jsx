import React, { useEffect, useState } from "react";

export default function Operador() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pago, setPago] = useState({});
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState({ to:"", subject:"", html:"" });

  const load = async () => {
    setMsg(""); setLoading(true);
    try {
      const res = await fetch("/reservas/pending");
      const data = await res.json();
      if (!res.ok || data.success === false) setMsg(data.message || "No se pudieron cargar.");
      else setPending(data.items || []);
    } catch { setMsg("Error de conexión."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onChangePago = (id, field, value) => {
    setPago((p) => ({ ...p, [id]: { ...(p[id] || {}), [field]: value } }));
  };

  const procesarPago = async (r) => {
    setMsg("");
    const { metodoPago, monto } = pago[r.id] || {};
    if (!metodoPago || !monto) return setMsg("Completá método y monto.");
    try {
      const res = await fetch("/pagos", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ reservaId: r.id, metodoPago, montoPagado:Number(monto) })
      });
      const data = await res.json();
      if (!res.ok || data.success === false) return setMsg(data.message || "No se pudo registrar el pago.");
      setMsg("✅ Pago registrado."); await load();
    } catch { setMsg("Error al pagar."); }
  };

  const cancelar = async (id) => {
    setMsg("");
    try {
      const res = await fetch(`/reservas/${id}/cancel`, { method:"PUT" });
      const data = await res.json();
      if (!res.ok || data.success === false) return setMsg(data.message || "No se pudo cancelar.");
      setMsg("🚫 Reserva cancelada."); await load();
    } catch { setMsg("Error al cancelar."); }
  };

  const liberar = async (id) => {
    setMsg("");
    try {
      const res = await fetch(`/reservas/${id}/release`, { method:"PUT" });
      const data = await res.json();
      if (!res.ok || data.success === false) return setMsg(data.message || "No se pudo liberar.");
      setMsg("🔓 Reserva liberada y habitación disponible."); await load();
    } catch { setMsg("Error al liberar."); }
  };

  const enviarRespuesta = async () => {
    setMsg("");
    if (!reply.to || !reply.subject || !reply.html) return setMsg("Completá destinatario, asunto y mensaje.");
    try {
      const r = await fetch("/contacto/responder", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(reply)
      });
      const d = await r.json();
      if (!r.ok || d.success === false) return setMsg(d.message || "No se pudo enviar el correo.");
      setMsg("📧 Respuesta enviada.");
      setReply({ to:"", subject:"", html:"" });
    } catch { setMsg("Error al enviar correo."); }
  };

  return (
    <div className="container py-4">
      <h2>Panel del Operador</h2>
      {msg && <p className={msg.startsWith("✅") ? "text-success" : "text-danger"}>{msg}</p>}

      <h5 className="mt-3">Reservas pendientes</h5>
      {loading ? <p>Cargando...</p> :
        pending.length === 0 ? <p>No hay reservas pendientes.</p> : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Cliente</th><th>Habitación</th><th>Ingreso</th><th>Salida</th>
                  <th>Personas</th><th>Total</th><th>Pago</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(r => (
                  <tr key={r.id}>
                    <td>{r.nombre}<div className="small text-muted">{r.email}</div></td>
                    <td>{r.habitacion}</td>
                    <td>{String(r.fechaEntrada).slice(0,10)}</td>
                    <td>{String(r.fechaSalida).slice(0,10)}</td>
                    <td>{r.personas ?? "-"}</td>
                    <td>${r.total ?? "-"}</td>
                    <td>
                      <select value={pago[r.id]?.metodoPago || ""} onChange={e=>onChangePago(r.id,"metodoPago",e.target.value)} className="form-select form-select-sm">
                        <option value="">Método</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="efectivo">Efectivo</option>
                      </select>
                      <input type="number" min={0} placeholder="Monto"
                        className="form-control form-control-sm mt-1"
                        value={pago[r.id]?.monto || ""}
                        onChange={e=>onChangePago(r.id,"monto",e.target.value)} />
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-sm btn-primary" onClick={()=>procesarPago(r)}>Pagar</button>
                        <button className="btn btn-sm btn-warning" onClick={()=>liberar(r.id)}>Liberar</button>
                        <button className="btn btn-sm btn-danger" onClick={()=>cancelar(r.id)}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>)
      }

      <h5 className="mt-4">Responder por mail</h5>
      <div className="row g-2">
        <div className="col-md-4">
          <input className="form-control" placeholder="Para (correo)" value={reply.to}
            onChange={e=>setReply({...reply, to:e.target.value})} />
        </div>
        <div className="col-md-4">
          <input className="form-control" placeholder="Asunto" value={reply.subject}
            onChange={e=>setReply({...reply, subject:e.target.value})} />
        </div>
        <div className="col-12">
          <textarea className="form-control" rows={4} placeholder="Mensaje (HTML permitido)"
            value={reply.html} onChange={e=>setReply({...reply, html:e.target.value})} />
        </div>
        <div className="col-12">
          <button className="btn btn-success" onClick={enviarRespuesta}>Enviar respuesta</button>
        </div>
      </div>
    </div>
  );
}

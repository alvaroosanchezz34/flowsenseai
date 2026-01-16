import { ChevronRight, X } from "lucide-react"

function AlertaReciente({ titulo, descripcion, proceso, tipo }) {
    
    function obtenerColorIcono(tipo) {
        if (tipo === "WARNING") {
            return "text-warning"
        } else if (tipo === "INFO") {
            return "text-primary"
        } else {
            return "text-danger"
        }
    }
    
    function obtenerColorBadge(tipo) {
        if (tipo === "WARNING") {
            return "badge bg-warning text-dark"
        } else if (tipo === "INFO") {
            return "badge bg-primary"
        } else {
            return "badge bg-danger"
        }
    }
    
    return (
        <div className="card mb-3" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)", border: "1px solid #e5e7eb" }}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className={obtenerColorIcono(tipo)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="10" opacity="0.2"/>
                                <circle cx="12" cy="8" r="1"/>
                                <rect x="11" y="11" width="2" height="6" rx="1"/>
                            </svg>
                        </div>
                        <span className={obtenerColorBadge(tipo)}>{tipo}</span>
                    </div>
                    <button className="btn btn-sm btn-link text-muted p-0">
                        <X size={16} />
                    </button>
                </div>
                
                <h6 className="mb-2">{titulo}</h6>
                <p className="text-muted small mb-2">{descripcion}</p>
                <small className="text-muted d-block mb-3">Proceso: {proceso}</small>
                
                <button className="btn btn-link text-decoration-none p-0 small">
                    Ver detalles
                    <ChevronRight size={16} className="ms-1" />
                </button>
            </div>
        </div>
    )
}

export default AlertaReciente

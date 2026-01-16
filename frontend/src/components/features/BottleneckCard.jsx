import { Clock } from "lucide-react"

function BottleneckCard({ titulo, pipeline, duracion, ratio, tareasAfectadas, severidad, recomendacion }) {
    
    function obtenerColorBadge(severidad) {
        if (severidad === "high") {
            return "badge bg-danger"
        } else if (severidad === "medium") {
            return "badge bg-warning text-dark"
        } else {
            return "badge bg-info"
        }
    }
    
    return (
        <div className="card mb-3" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)", border: "1px solid #e5e7eb" }}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <Clock size={20} className="text-warning" />
                            <span className={obtenerColorBadge(severidad)}>{severidad}</span>
                        </div>
                        <h5 className="mb-1">{titulo}</h5>
                        <small className="text-muted">{pipeline}</small>
                    </div>
                </div>
                
                <div className="row mb-3">
                    <div className="col-6">
                        <small className="text-muted d-block">Duración Actual</small>
                        <strong className="fs-5">{duracion}</strong>
                    </div>
                    <div className="col-6">
                        <small className="text-muted d-block">Ratio</small>
                        <strong className="fs-5 text-danger">{ratio}</strong>
                    </div>
                </div>
                
                <div className="mb-3">
                    <small className="text-muted d-block">Tareas Afectadas</small>
                    <strong className="fs-5">{tareasAfectadas}</strong>
                </div>
                
                <div className="bg-light p-3 rounded">
                    <div className="d-flex align-items-start gap-2">
                        <span className="text-primary">💡</span>
                        <div>
                            <small className="text-primary fw-bold d-block mb-1">Recomendación IA</small>
                            <small className="text-muted">{recomendacion}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BottleneckCard

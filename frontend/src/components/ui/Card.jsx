function Card({ title, value, subtitle, variant, icono }) {
    
    function obtenerColorFondo(variant) {
        if (variant === "primary") {
            return "#e7f0ff"
        } else if (variant === "success") {
            return "#e7ffe7"
        } else if (variant === "danger") {
            return "#ffe7e7"
        } else if (variant === "warning") {
            return "#fff5e7"
        } else {
            return "#f0f0f0"
        }
    }
    
    function obtenerColorIcono(variant) {
        if (variant === "primary") {
            return "#0066ff"
        } else if (variant === "success") {
            return "#00cc66"
        } else if (variant === "danger") {
            return "#ff0000"
        } else if (variant === "warning") {
            return "#ff9900"
        } else {
            return "#666666"
        }
    }
    
    return (
        <div className="card h-100" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)", border: "1px solid #e5e7eb" }}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div style={{ backgroundColor: obtenerColorFondo(variant), borderRadius: "8px", padding: "8px", display: "inline-flex" }}>
                        <div style={{ color: obtenerColorIcono(variant) }}>{icono}</div>
                    </div>
                </div>
                <h2 className="mb-1 fw-bold">{value}</h2>
                <h6 className="text-dark mb-1">{title}</h6>
                {subtitle && <small className="text-muted">{subtitle}</small>}
            </div>
        </div>
    )
}

export default Card

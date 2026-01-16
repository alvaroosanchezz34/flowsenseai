function Card({ title, value, subtitle, variant }) {
    
    return (
        <div className={`card border-${variant} h-100`}>
            <div className="card-body">
                <h6 className="text-muted mb-2">{title}</h6>
                
                <h2 className={`text-${variant} mb-1`}>{value}</h2>
                
                {subtitle && <small className="text-muted">{subtitle}</small>}
            </div>
        </div>
    )
}

export default Card

function BottleneckAlert({ process, problem, recommendation }) {
    return (
        <div className="alert alert-warning mb-3">
            <h6><strong>{process}</strong></h6>
            
            <p className="mb-2">{problem}</p>
            
            <div className="bg-light p-2 rounded">
                <small>
                    <strong> Recomendación IA:</strong> {recommendation}
                </small>
            </div>
        </div>
    )
}

export default BottleneckAlert
function ProcessList({ processes }) {
    
    function mostrarEtiquetaEstado(estado) {
        if (estado === "normal") {
            return <span className="badge bg-success">Normal</span>
        }
        else if (estado === "warning") {
            return <span className="badge bg-warning text-white">Atención</span>
        }
        else {
            return <span className="badge bg-danger text-white">Problemas</span>
        }
    }
    
    return (
        <div className="card">
            <div className="card-header bg-white">
                <h5 className="mb-0">Lista de Procesos</h5>
            </div>
            <div className="card-body p-0">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Proceso</th>
                            <th>Estado</th>
                            <th>Tiempo Medio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processes.map(function(procesoActual) {
                            return (
                                <tr key={procesoActual.id}>
                                    <td><strong>{procesoActual.name}</strong></td>
                                    <td>
                                        {mostrarEtiquetaEstado(procesoActual.status)}
                                    </td>
                                    <td>{procesoActual.avgTime}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProcessList
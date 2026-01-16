function ProcessList({ processes }) {
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
                        {processes.map((process) => (
                            <tr key={process.id}>
                                <td><strong>{process.name}</strong></td>
                                <td>
                                    {process.status === "normal" ? (
                                        <span className="badge bg-success">Normal</span>
                                    ) : process.status === "warning" ? (
                                        <span className="badge bg-warning text-white">Atención</span>
                                    ) : (
                                        <span className="badge bg-danger text-white">Problemas</span>
                                    )}
                                </td>
                                <td>{process.avgTime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProcessList
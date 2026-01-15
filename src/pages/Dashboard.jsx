// pages/Dashboard.jsx
import Layout from '../components/ui/Layout'

function Dashboard() {
    return (
        <Layout>
            <div className="container-fluid">
                <h1 className="mb-4">Dashboard FlowSense AI</h1>

                <div className="row">
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Procesos Activos</h5>
                                <h2>12</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard

import Layout from '../components/ui/Layout'
import Card from '../components/ui/Card'
import BottleneckAlert from '../components/features/BottleneckAlert'
import ProcessList from '../components/features/ProcessList'

function Dashboard() {
    const alertas = [
        {
            id: 1,
            process: "Lorem Ipsum Dolor",
            problem: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.",
            recommendation: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo."
        },
        {
            id: 2,
            process: "Consectetur Adipiscing",
            problem: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam.",
            recommendation: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat."
        },
        {
            id: 3,
            process: "Tempor Incididunt",
            problem: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis.",
            recommendation: "Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit."
        }
    ]

    const procesos = [
        {
            id: 1,
            name: "Lorem Ipsum Dolor",
            status: "warning",
            avgTime: "7.2 días"
        },
        {
            id: 2,
            name: "Consectetur Adipiscing",
            status: "danger",
            avgTime: "4.5 días"
        },
        {
            id: 3,
            name: "Sit Amet Consectetur",
            status: "warning",
            avgTime: "12 días"
        },
        {
            id: 4,
            name: "Eiusmod Tempor",
            status: "normal",
            avgTime: "1.5 días"
        },
        {
            id: 5,
            name: "Incididunt Labore",
            status: "normal",
            avgTime: "2 días"
        }
    ]

    return (
        <Layout>
            <div className="container-fluid">
                <h1 className="mb-4">Dashboard FlowSense AI</h1>

                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                        <Card
                            title="Procesos Activos"
                            value={5}
                            subtitle="Procesos monitorizados"
                            variant="primary"
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <Card
                            title="Cuellos de Botella"
                            value={3}
                            subtitle="Procesos con problemas"
                            variant="warning"
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <Card
                            title="Alertas Activas"
                            value={3}
                            subtitle="Recomendaciones de IA"
                            variant="danger"
                        />
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <h4 className="mb-3">Alertas de Cuellos de Botella</h4>
                        
                        {alertas.map((alerta) => (
                            <BottleneckAlert
                                key={alerta.id}
                                process={alerta.process}
                                problem={alerta.problem}
                                recommendation={alerta.recommendation}
                            />
                        ))}
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <ProcessList processes={procesos} />
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard


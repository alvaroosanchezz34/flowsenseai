import Layout from '../components/ui/Layout'
import Card from '../components/ui/Card'
import BottleneckCard from '../components/features/BottleneckCard'
import AlertaReciente from '../components/features/AlertaReciente'
import { Layers, Activity, AlertTriangle, RefreshCw, Sparkles, ChevronRight } from 'lucide-react'

function Dashboard() {
    const cuellosDeBotellaDetectados = [
        {
            id: 1,
            titulo: "Negociación",
            pipeline: "Pipeline de Ventas",
            duracion: "120.0h",
            ratio: "1.7x",
            tareasAfectadas: "1",
            severidad: "medium",
            recomendacion: "Definir rangos de descuento pre-aprobados y escenarios de negociación estándar. Establecer límites de tiempo para cada ronda de negociación."
        },
        {
            id: 2,
            titulo: "Revisión",
            pipeline: "Desarrollo de Proyecto",
            duracion: "42.0h",
            ratio: "1.8x",
            tareasAfectadas: "3",
            severidad: "high",
            recomendacion: "Implementar una checklist de revisión estandarizada y asignar slots de tiempo fijos para revisiones. Considerar pair programming para reducir la..."
        }
    ]

    const alertasRecientes = [
        {
            id: 1,
            titulo: "Cuello de botella: Revisión",
            descripcion: "La fase de Revisión en el proceso 'Desarrollo de Proyecto' está tomando un 75% más de tiempo del...",
            proceso: "Desarrollo de Proyecto",
            tipo: "WARNING"
        },
        {
            id: 2,
            titulo: "Alto retrabajo detectado",
            descripcion: "El 32% de las tareas están regresando de Revisión a Desarrollo. Esto podría indicar problemas en la...",
            proceso: "Desarrollo de Proyecto",
            tipo: "WARNING"
        },
        {
            id: 3,
            titulo: "Recomendación de mejora",
            descripcion: "Basado en el análisis, implementar sesiones de refinamiento antes del desarrollo podría reducir el...",
            proceso: "Desarrollo de Proyecto",
            tipo: "INFO"
        }
    ]

    return (
        <Layout>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-1 fw-bold">FlowSense AI</h1>
                        <p className="text-muted mb-0">Detecta y elimina cuellos de botella en tus procesos</p>
                    </div>
                    <button className="btn btn-primary d-flex align-items-center gap-2"><Sparkles size={18} />Analizar con IA</button>
                </div>

                <div className="row mb-4">
                    <div className="col-md-3 mb-3">
                        <Card title="Procesos Activos" value="3" subtitle="3 totales" variant="primary" icono={<Layers size={24} />} />
                    </div>

                    <div className="col-md-3 mb-3">
                        <Card title="Tareas en Progreso" value="11" subtitle="3 completadas" variant="success" icono={<Activity size={24} />} />
                    </div>

                    <div className="col-md-3 mb-3">
                        <Card title="Cuellos de Botella" value="2" subtitle="1 críticos" variant="danger" icono={<AlertTriangle size={24} />} />
                    </div>

                    <div className="col-md-3 mb-3">
                        <Card title="Retrabajo Promedio" value="0.4x" subtitle="por tarea" variant="warning" icono={<RefreshCw size={24} />} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-8 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="mb-0 fw-bold">Cuellos de botella detectados</h4>
                            <a href="#ver-procesos" className="btn btn-link text-decoration-none"> Ver procesos <ChevronRight size={16} className="ms-1" /></a>
                        </div>

                        {cuellosDeBotellaDetectados.map(function (cuello) {
                            return <BottleneckCard key={cuello.id} titulo={cuello.titulo} pipeline={cuello.pipeline} duracion={cuello.duracion} ratio={cuello.ratio} tareasAfectadas={cuello.tareasAfectadas} severidad={cuello.severidad} recomendacion={cuello.recomendacion} />
                        })}
                    </div>

                    <div className="col-lg-4">
                        <h4 className="mb-3 fw-bold">Alertas Recientes</h4>
                        {alertasRecientes.map(function (alerta) {
                            return <AlertaReciente key={alerta.id} titulo={alerta.titulo} descripcion={alerta.descripcion} proceso={alerta.proceso} tipo={alerta.tipo} />
                        })}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard


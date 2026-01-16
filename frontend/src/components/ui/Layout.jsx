import { useState } from "react"
import { LayoutDashboard, Layers, ListChecks, BarChart3, Zap } from "lucide-react"

function Layout({ children }) {
    const [pestanaActiva, setPestanaActiva] = useState("dashboard")
    
    function cambiarPestana(nombrePestana) {
        setPestanaActiva(nombrePestana)
    }

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            <div className="bg-white border-end" style={{ width: "250px", flexShrink: 0 }}>
                <div className="p-4 border-bottom">
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <div className="bg-primary rounded d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                            <Zap size={20} className="text-white" />
                        </div>
                        <h5 className="mb-0 fw-bold">FlowSense</h5>
                    </div>
                    <small className="text-muted">AI Process Analytics</small>
                </div>

                <nav className="nav flex-column p-3">
                    <a 
                        href="#dashboard" 
                        className={pestanaActiva === "dashboard" ? "nav-link text-primary bg-light rounded mb-2" : "nav-link text-dark mb-2"}
                        onClick={function() { cambiarPestana("dashboard") }}
                    >
                        <LayoutDashboard size={18} className="me-2" style={{ verticalAlign: "middle" }} />
                        Dashboard
                    </a>
                    
                    <a 
                        href="#procesos" 
                        className={pestanaActiva === "procesos" ? "nav-link text-primary bg-light rounded mb-2" : "nav-link text-dark mb-2"}
                        onClick={function() { cambiarPestana("procesos") }}
                    >
                        <Layers size={18} className="me-2" style={{ verticalAlign: "middle" }} />
                        Procesos
                    </a>
                    
                    <a 
                        href="#tareas" 
                        className={pestanaActiva === "tareas" ? "nav-link text-primary bg-light rounded mb-2" : "nav-link text-dark mb-2"}
                        onClick={function() { cambiarPestana("tareas") }}
                    >
                        <ListChecks size={18} className="me-2" style={{ verticalAlign: "middle" }} />
                        Tareas
                    </a>
                    
                    <a 
                        href="#analytics" 
                        className={pestanaActiva === "analytics" ? "nav-link text-primary bg-light rounded mb-2" : "nav-link text-dark mb-2"}
                        onClick={function() { cambiarPestana("analytics") }}
                    >
                        <BarChart3 size={18} className="me-2" style={{ verticalAlign: "middle" }} />
                        Analytics
                    </a>
                </nav>
                
                <div className="position-absolute bottom-0 p-3" style={{ width: "250px" }}>
                    <div className="rounded p-3" style={{ background: "linear-gradient(135deg, #d1e2ff 0%, #ffffff 100%)" }}>
                        <h6 className="fw-bold mb-2">Detecta ineficiencias</h6>
                        <small className="text-muted">Analiza tus procesos con IA y elimina cuellos de botella</small>
                    </div>
                </div>
            </div>

            <div className="flex-grow-1" style={{ backgroundColor: "#f8f9fa" }}>
                <main className="p-4">{children}</main>
            </div>
        </div>
    )
}

export default Layout

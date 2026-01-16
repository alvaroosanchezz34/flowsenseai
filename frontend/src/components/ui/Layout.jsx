import { useState } from "react";
import { LayoutDashboard, ClipboardList, Brain, Settings, Bell } from "lucide-react";

function Layout({ children }) {
    const [activeTab, setActiveTab] = useState("dashboard");

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            <div className="bg-dark text-white" style={{ width: "250px", flexShrink: 0 }}>
                <div className="p-4 border-bottom border-secondary">
                    <h4 className="mb-0">FlowSense AI</h4>
                    <small className="text-muted">Beta v0.1</small>
                </div>

                <nav className="nav flex-column p-3">
                    <a href="#dashboard" className={`nav-link text-white ${activeTab === "dashboard" ? "bg-primary rounded" : ""}`} onClick={() => setActiveTab("dashboard")}>
                        <LayoutDashboard size={20} className="me-2" style={{ verticalAlign: "middle" }} />
                        Dashboard
                    </a>
                    <a href="#procesos" className={`nav-link text-white ${activeTab === "procesos" ? "bg-primary rounded" : ""}`} onClick={() => setActiveTab("procesos")}>
                        <ClipboardList size={20} className="me-2" style={{ verticalAlign: "middle" }} />
                        Procesos
                    </a>
                    <a href="#insights" className={`nav-link text-white ${activeTab === "insights" ? "bg-primary rounded" : ""}`} onClick={() => setActiveTab("insights")}>
                        <Brain size={20} className="me-2" style={{ verticalAlign: "middle" }} />
                        Insights IA
                    </a>
                    <a href="#ajustes" className={`nav-link text-white ${activeTab === "ajustes" ? "bg-primary rounded" : ""}`} onClick={() => setActiveTab("ajustes")}>
                        <Settings size={20} className="me-2" style={{ verticalAlign: "middle" }} />
                        Ajustes
                    </a>
                </nav>
            </div>

            <div className="flex-grow-1 bg-light">
                <nav className="navbar navbar-light bg-white border-bottom px-4">
                    <span className="navbar-brand mb-0 h5">Dashboard Principal</span>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary" style={{ width: "40px", height: "40px", padding: 0 }}>
                            <Bell size={20} />
                        </button>
                    </div>
                </nav>

                <main className="p-4">{children}</main>
            </div>
        </div>
    );
}

export default Layout;

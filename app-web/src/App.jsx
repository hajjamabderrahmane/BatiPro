import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Utilisateurs from "./pages/Utilisateurs";
import Chantiers from "./pages/Chantiers";
import ChantierDetail from "./pages/ChantierDetail";
import AppLayout from "./layouts/AppLayout";
import RouteProtegee from "./components/RouteProtegee";
import Affectations from "./pages/Affectations";
import Pointages from "./pages/Pointages";
import Rapports from "./pages/Rapports";

function App() {
  return (
    <Routes>
      {/* =======================
          AUTHENTIFICATION
      ======================= */}
      <Route path="/login" element={<Login />} />

      {/* =======================
          APPLICATION PROTÉGÉE
      ======================= */}
      <Route
        element={
          <RouteProtegee>
            <AppLayout />
          </RouteProtegee>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ADMIN */}
        <Route path="/utilisateurs" element={<Utilisateurs />} />
        <Route path="/chantiers" element={<Chantiers />} />
        <Route path="/affectations" element={<Affectations />} />
        <Route path="/rapports" element={<Rapports />} />

        {/* ADMIN + CHEF */}
        <Route path="/chantiers/:id" element={<ChantierDetail />} />

        {/* CHEF : même page ChantierDetail */}
        <Route path="/mon-chantier" element={<ChantierDetail />} />

        {/* ADMIN + CHEF + EMPLOYÉ selon tes permissions */}
        <Route path="/pointages" element={<Pointages />} />
      </Route>

      {/* =======================
          REDIRECTION
      ======================= */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
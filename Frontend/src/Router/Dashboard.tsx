import { useState } from "react";
import PortalLayout from "../Layout/PortalLayout";
import ProductsList from "./ProductsList";
import SalesDashboard from "../Components/SalesDashboard";

function Dashboard() {
  const [seccion, setSeccion] = useState("inventario");

  return (
    <PortalLayout onSectionChange={setSeccion} seccionActiva={seccion}>
      {/* Renderizado condicional */}
      {seccion === "inventario" ? <ProductsList /> : <SalesDashboard />}
    </PortalLayout>
  );
}

export default Dashboard;

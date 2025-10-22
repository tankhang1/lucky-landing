import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home/page";
import ControlPage from "./pages/control/page";
import AudiencePage from "./pages/audience/page";
import CageControlPage from "./components/cage/control/page";
import CageAudiencePage from "./components/cage/audience/page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/control" element={<ControlPage />} />
      <Route path="/audience" element={<AudiencePage />} />
      <Route path="/cage/control" element={<CageControlPage />} />
      <Route path="/cage/audience" element={<CageAudiencePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

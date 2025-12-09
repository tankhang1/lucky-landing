import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home/page";
import ControlPage from "./pages/control/page";
import AudiencePage from "./pages/audience/page";
import CageControlPage from "./components/cage/control/page";
import CageAudiencePage from "./components/cage/audience/page";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./query";
import LoginPage from "./pages/login";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<HomePage />} />
        <Route path="/control" element={<ControlPage />} />
        <Route path="/audience" element={<AudiencePage />} />
        <Route path="/cage/control" element={<CageControlPage />} />
        <Route path="/cage/audience" element={<CageAudiencePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}

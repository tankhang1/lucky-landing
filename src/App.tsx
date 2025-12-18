import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home/page";
import ControlPage from "./pages/control/page";
import AudiencePage from "./pages/audience/page";
import CageControlPage from "./components/cage/control/page";
import CageAudiencePage from "./components/cage/audience/page";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./react-query";
import LoginPage from "./pages/login";
import AudienceV1Page from "./pages/audience-v1/page";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<HomePage />} />
        <Route path="/control" element={<ControlPage />} />
        <Route
          path="/audience/:campaign_code/:type"
          element={<AudiencePage />}
        />
        <Route
          path="/audience-v1/:campaign_code/:type"
          element={<AudienceV1Page />}
        />
        <Route path="/cage/control" element={<CageControlPage />} />
        <Route path="/cage/audience" element={<CageAudiencePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}

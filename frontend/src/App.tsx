import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/hooks/useUser";
import Welcome from "./pages/Welcome";
import ThoughtQuiz from "./pages/ThoughtQuiz";
import CommStyleQuiz from "./pages/CommStyleQuiz";
import VoiceSetup from "./pages/VoiceSetup";
import Dashboard from "./pages/Dashboard";
import UploadLearn from "./pages/UploadLearn";
import Explanation from "./pages/Explanation";
import MasteryCheck from "./pages/MasteryCheck";
import Progress from "./pages/Progress";
import AdminDashboard from "./pages/AdminDashboard";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/quiz" element={<ThoughtQuiz />} />
            <Route path="/comm-style" element={<CommStyleQuiz />} />
            <Route path="/voice-setup" element={<VoiceSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadLearn />} />
            <Route path="/explanation" element={<Explanation />} />
            <Route path="/mastery" element={<MasteryCheck />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

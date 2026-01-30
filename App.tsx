import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import IndexBiogra from "./pages/IndexBiogra";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import BlogPost from "./pages/BlogPost";
import BlogListing from "./pages/BlogListing";
import ProjectDetail from "./pages/ProjectDetail";
import PortfolioListing from "./pages/PortfolioListing";
import About from "./pages/About";
import About2 from "./pages/About2";
import ServiceDetails from "./pages/ServiceDetails";
import FAQ from "./pages/FAQ";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import EmailAnalytics from "./pages/admin/EmailAnalytics";
import Leads from "./pages/admin/Leads";
import Newsletter from "./pages/admin/Newsletter";
import Plugins from "./pages/admin/Plugins";
import Blog from "./pages/admin/Blog";
import Projects from "./pages/admin/Projects";
import Testimonials from "./pages/admin/Testimonials";
import Team from "./pages/admin/Team";
import Settings from "./pages/admin/Settings";
import EmailTemplates from "./pages/admin/EmailTemplates";
import Segments from "./pages/admin/Segments";
import Workflows from "./pages/admin/Workflows";
import Tasks from "./pages/admin/Tasks";
import Approvals from "./pages/admin/Approvals";
import ProtectedRoute from "./components/admin/ProtectedRoute";
const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Main Route - Biogra Template */}
              <Route path="/" element={<IndexBiogra />} />
              {/* Modern Awwwards-inspired Design */}
              <Route path="/modern" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/about-2" element={<About2 />} />
              <Route path="/service-details" element={<ServiceDetails />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<BlogListing />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/portfolio" element={<PortfolioListing />} />
              <Route path="/project/:slug" element={<ProjectDetail />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/admin/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
              <Route path="/admin/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/admin/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
              <Route path="/admin/newsletter" element={<ProtectedRoute><Newsletter /></ProtectedRoute>} />
              <Route path="/admin/plugins" element={<ProtectedRoute><Plugins /></ProtectedRoute>} />
              <Route path="/admin/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
              <Route path="/admin/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/admin/testimonials" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />
              <Route path="/admin/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/admin/email-templates" element={<ProtectedRoute><EmailTemplates /></ProtectedRoute>} />
              <Route path="/admin/email-analytics" element={<ProtectedRoute><EmailAnalytics /></ProtectedRoute>} />
              <Route path="/admin/segments" element={<ProtectedRoute><Segments /></ProtectedRoute>} />
              <Route path="/admin/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;

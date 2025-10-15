import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./auth/LoginPage";
import RegistrationPage from "./auth/RegistrationPage";

import DashboardPage from "./app/Dashboard/DashboardPage";

import TermsAndConditions from "./app/ToC";
import PrivacyPolicy from "./app/PrivacyPolicy";
import Landing from "./app/Landing";

import BlogsPage from "./app/blog/BlogsPage";
import CSAutomationPage from "./app/blog/CSAutomationPage";

import MarketResearchReport from "./tiles/MarketResearchReport/MarketResearchReport";
import NegotiationWindow from "./tiles/NegotiationWindow/NegotiationWindow";

import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import AuthLayout from "./app/AuthLayout";
import { BusinessProvider } from "./services/BusinessProvider";
import { LoadingProvider } from "./services/LoadingProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./services/ToastProvider";

import Layout from "./app/Layout";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import { Provider } from "react-redux";
import { store } from "./store/store";
import DemandSupplyTrend from "./tiles/DemandSupplyTrend/DemandSupplyTrend";
import News from "./tiles/News/News";
import SupplierTracking from "./tiles/SupplierTracking/SupplierTracking";
import CyclicalPatterns from "./tiles/CyclicalPatterns/CyclicalPatterns";
import ShutdownTracker from "./tiles/ShutdownTracker/ShutdownTracker";
import ProcurementPlanTable from "./tiles/ProcurementPlan/ProcurementPlan";
import MinutesOfMeeting from "./tiles/MinutesOfMeeting/MinutesOfMeeting";
import JointDevelopmentProjects from "./tiles/JointDevelopmentProjects/JointDevelopmentProjects";
import MultiplePointEngagement from "./tiles/MultiplePointEngagement/MultiplePointEngagement";
// import CostSheet from "./tiles/CostSheet/CostSheet";
import MaterialSheet from "./tiles/CostSheet/MaterialSheet";
import KeyValueDrivers from "./tiles/KeyValueDrivers/KeyValueDrivers";
import SpendAnalytics from "./tiles/SpendAnalytics/SpendAnalytics";
import InventoryLevel from "./tiles/InventoryLevel/InventoryLevel";
import VendorWiseActionPlan from "./tiles/VendorWiseActionPlan/VendorWiseActionPlan";
import VendorKeyInformation from "./tiles/VendorKeyInformation/VendorKeyInformation";
import FactPack from "./tiles/FactPack/FactPack";
import QuotationComparison from "./tiles/QuotationComparison/QuotationComparison";
import TradeDataAnalysis from "./tiles/TradeDataAnalysis/TradeDataAnalysis";
import PriceBenchmarking from "./tiles/PriceBenchmarking/PriceBenchmarking";
import IndustryPorterAnalysis from "./tiles/IndustryPorterAnalysis/IndustryPorterAnalysis";
import SeasonalityTrends from "./tiles/SeasonalityTrends/SeasonalityTrends";
import NegotiationObjectives from "./tiles/NegotiationObjectives/NegotiationObjectives";
import UserPreferencesPage from "./components/UserPreference";



const queryClient = new QueryClient();
const BlogRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BlogsPage />} />
      <Route
        path="/customer-service-automation"
        element={<CSAutomationPage />}
      />
    </Routes>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes first */}
      <Route element={<Layout />}>
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/blog/*" element={<BlogRoutes />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route path="/" element={<Navigate to="/register" replace />} />
      </Route>
      <Route element={<ProtectedRoute loginPath="/login" />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/market-research-report"
          element={<MarketResearchReport />}
        />
        <Route path="/negotiation-window" element={<NegotiationWindow />} />
        <Route path="/demand-suppy-trend" element={<DemandSupplyTrend />} />
        <Route path="/news" element={<News />} />
        <Route path="/supplier-tracking" element={<SupplierTracking />} />
        <Route path="/cyclical-patterns" element={<CyclicalPatterns />} />
        <Route path="/shutdown-tracker" element={<ShutdownTracker />} />
        <Route path="/procurement-plan" element={<ProcurementPlanTable />} />
        <Route path="/minutes-of-meeting" element={<MinutesOfMeeting />} />
        <Route path="/joint-development-projects" element={<JointDevelopmentProjects />} />
        <Route path="/multiple-point-engagements" element={<MultiplePointEngagement />} />
        <Route path="/costsheet" element={<MaterialSheet />} />
        <Route path="/key-value-drivers" element={<KeyValueDrivers />} />
        <Route path="/spend-analytics" element={<SpendAnalytics />} />
        <Route path="/inventory-levels" element={<InventoryLevel />} />
        <Route path="/vendor-wise-action-plan" element={<VendorWiseActionPlan />} />
        <Route path="/vendor-key-info" element={<VendorKeyInformation />} />
        <Route path="/fact-pack" element={<FactPack />} />
        <Route path="/quotation-comparison" element={<QuotationComparison />} />
        <Route path="/trade-data-analysis" element={<TradeDataAnalysis />} />
        <Route path="/price-benchmarking" element={<PriceBenchmarking />} />
        <Route path="/industry-porter-analysis" element={<IndustryPorterAnalysis />} />
        <Route path="/seasonality-trends" element={<SeasonalityTrends />} />
        <Route path="/negotiation-objectives" element={<NegotiationObjectives />} />
        <Route path="/preferences" element={<UserPreferencesPage />} />
      </Route>

      {/* TEMPORARY FOR DEMO */}
      <Route path="/unp/dashboard" element={<DashboardPage />} />
      <Route
        path="/unp/market-research-report"
        element={<MarketResearchReport />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthProvider>
          <BusinessProvider>
            <BrowserRouter>
              <ToastProvider>
                <LoadingProvider>
                  <AppRoutes />
                </LoadingProvider>
              </ToastProvider>
            </BrowserRouter>
          </BusinessProvider>
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  );
};
export default App;

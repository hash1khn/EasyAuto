import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { HomeDesign } from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";
import { CheckoutPage } from "./components/checkout/CheckoutPage";
import { PaymentConfirmation } from "./components/checkout/PaymentConfirmation";
import { PaymentReceipt } from "./components/checkout/PaymentReceipt";
import DashboardDesign from "./pages/DashboardDesign";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DriverLoginPage } from "@/pages/DriverLoginPage";
import { VendorApplicationStatus } from "./pages/VendorApplicationStatus";
import BuyerDesign1 from "./pages/BuyerDesign1";
import NewDashboard from "./pages/NewDashboard";
import SourcerLayout from "./layout/SourcerLayout"; // Import the SourcerLayout
import SourcerDashboard from "./components/sourcer/SourcerDashboard"; // Import SourcerDashboard
import QuoteHistory from "@/components/sourcer/QuoteHistory";
import { Navigate } from "react-router-dom";
import { DriverLayout } from "./components/driver/DriverLayout";
import Delivering from "@/components/driver/Delivering";
import DriverHistory from "@/components/driver/DriverHistory";
import { DeliverySettings } from "@/components/driver/DeliverySettings";
import { DriverDashboard } from "@/components/driver/DriverDashboard";
import PickupMapPage from './pages/delivery/PickupMapPage';
import DeliveringMapPage from './pages/delivery/DeliveringMapPage';
import { SignupPage } from './pages/SignupPage';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AuthProvider>
                    <Toaster />
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<HomeDesign />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route
                                path="/buyerdesign1"
                                element={<BuyerDesign1 />}
                            />
                            <Route
                                path="/new-dashboard"
                                element={<NewDashboard />}
                            />
                            {/* Protected Buyer Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={["buyer", "admin"]}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Vendor Routes */}
                            <Route
                                path="/vendor/status"
                                element={
                                    <ProtectedRoute allowedRoles={["vendor"]}>
                                        <VendorApplicationStatus />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/vendor"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={["vendor"]}
                                        requireApproval>
                                        <VendorDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Protected Admin Routes */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                        <AdminDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Other Protected Routes */}
                            <Route
                                path="/checkout/:orderId"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[
                                            "buyer",
                                            "vendor",
                                            "admin",
                                        ]}>
                                        <CheckoutPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payment-success"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[
                                            "buyer",
                                            "vendor",
                                            "admin",
                                        ]}
                                        isPaymentRoute={true}>
                                        <PaymentConfirmation />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/receipt/:orderId"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={[
                                            "buyer",
                                            "vendor",
                                            "admin",
                                        ]}>
                                        <PaymentReceipt />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Driver Routes */}
                            <Route
                                path="/driver/login"
                                element={<DriverLoginPage />}
                            />
                            <Route
                                path="/driver"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={["driver", "admin"]}>
                                        <DriverLayout />
                                    </ProtectedRoute>
                                }>
                                <Route
                                    index
                                    element={
                                        <Navigate to="dashboard" replace />
                                    }
                                />
                                <Route
                                    path="dashboard"
                                    element={<DriverDashboard />}
                                />
                                <Route
                                    path="delivering"
                                    element={<Delivering />}
                                />
                                <Route
                                    path="history"
                                    element={<DriverHistory />}
                                />
                                <Route
                                    path="settings"
                                    element={<DeliverySettings />}
                                />
                            </Route>
                            <Route path="/delivery/map" element={<PickupMapPage />} />
                            <Route path="/delivery/map-delivering" element={<DeliveringMapPage />} />
                            <Route
                                path="/sourcer"
                                element={
                                    <ProtectedRoute allowedRoles={["sourcer"]}>
                                        <SourcerLayout />
                                    </ProtectedRoute>
                                }>
                                <Route
                                    index
                                    element={
                                        <Navigate to="dashboard" replace />
                                    }
                                />
                                <Route
                                    path="dashboard"
                                    element={<SourcerDashboard />}
                                />
                                <Route
                                    path="history"
                                    element={<QuoteHistory />}
                                />
                            </Route>
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;

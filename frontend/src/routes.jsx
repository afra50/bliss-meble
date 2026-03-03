import React from "react";
// Importy stron publicznych
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AboutUs from "./pages/AboutUs";
import Complaints from "./pages/Complaints";
import Contact from "./pages/Contact";
import Products from "./pages/Products";

// Importy Admina
import LoginPage from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
// import AdminProductsList from "./components/admin/AdminProductsList";
// import AdminOrders from "./components/admin/AdminOrders";

// Import ochrony
import ProtectedRoute from "./components/ProtectedRoute";

const routes = [
  // --- CZĘŚĆ PUBLICZNA ---
  { path: "/", element: <Home /> },
  { path: "/o-marce", element: <AboutUs /> },
  { path: "kontakt", element: <Contact /> },
  { path: "/zwroty-reklamacje", element: <Complaints /> },
  { path: "/platnosc-udana", element: <PaymentSuccess /> },
  { path: "/platnosc-anulowana", element: <PaymentCancel /> },

  // --- ROUTY DLA SKLEPU ---
  { path: "/sklep", element: <Products /> },
  { path: "/szukaj", element: <Products /> },
  { path: "/:category", element: <Products /> },
  { path: "/:category/:subcategory", element: <Products /> },

  // --- LOGOWANIE ADMINA (Publiczne) ---
  { path: "/admin/login", element: <LoginPage /> },

  // --- PANEL ADMINA (Chroniony) ---
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      //   { path: "produkty", element: <AdminProductsList /> },
      //   { path: "zamowienia", element: <AdminOrders /> },
      { path: "*", element: <NotFound /> },
    ],
  },

  // --- 404 ---
  { path: "*", element: <NotFound /> },
];

export default routes;

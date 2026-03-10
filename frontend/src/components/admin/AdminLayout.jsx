import React, { useState } from "react"; // ZMIANA: Import useState
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Star,
  Truck,
  Layers,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import Loader from "../ui/Loader"; // ZMIANA: Import Twojego Loadera
import "../../styles/components/admin/admin-layout.scss";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ZMIANA: Stan do śledzenia wylogowywania
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true); // Pokazujemy loader blokujący ekran
      await api.post("/auth/logout");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false); // Ukrywamy loader tylko jeśli wystąpił błąd (jeśli się uda, komponent i tak zostanie odmontowany po nawigacji)
    }
  };

  const navItems = [
    { path: "/admin", Icon: LayoutDashboard, label: "Dashboard", end: true },
    { path: "/admin/produkty", Icon: Package, label: "Produkty" },
    { path: "/admin/zamowienia", Icon: ShoppingCart, label: "Zamówienia" },
    { path: "/admin/atrybuty", Icon: Layers, label: "Atrybuty" },
    { path: "/admin/recenzje", Icon: MessageSquare, label: "Recenzje" },
    { path: "/admin/wysylki", Icon: Truck, label: "Koszty wysyłek" },
  ];

  const isDashboard = location.pathname === "/admin";

  return (
    <div className="admin-layout">
      {/* ZMIANA: Renderowanie pełnoekranowego loadera, gdy wylogowywanie jest w toku */}
      {isLoggingOut && <Loader fullPage message="Trwa wylogowywanie..." />}

      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <h2>
            BLISS meble <span>Admin</span>
          </h2>
        </div>

        <nav className="admin-sidebar__nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <item.Icon size={20} className="nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar__footer">
          {!isDashboard ? (
            <button
              onClick={() => navigate("/admin")}
              className="mobile-back-btn"
              title="Wróć do Dashboardu"
            >
              <ArrowLeft size={20} />
              <span className="btn-text">Wstecz</span>
            </button>
          ) : (
            <div className="mobile-placeholder"></div>
          )}

          <button
            onClick={handleLogout}
            className="logout-btn"
            disabled={isLoggingOut} // ZMIANA: Zabezpieczenie przed podwójnym kliknięciem
          >
            <LogOut size={20} className="nav-icon" />
            <span className="btn-text">Wyloguj</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

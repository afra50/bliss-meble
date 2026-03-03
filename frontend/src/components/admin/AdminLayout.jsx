import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare, // Ikona dla recenzji
  Star,
  Truck, // Ikona dla wysyłek
  LogOut,
  ArrowLeft,
} from "lucide-react";
import "../../styles/components/admin/admin-layout.scss";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Zaktualizowana lista nawigacji - teraz w 100% spójna z Dashboardem
  const navItems = [
    { path: "/admin", Icon: LayoutDashboard, label: "Dashboard", end: true },
    { path: "/admin/produkty", Icon: Package, label: "Produkty" },
    { path: "/admin/zamowienia", Icon: ShoppingCart, label: "Zamówienia" },
    { path: "/admin/recenzje", Icon: MessageSquare, label: "Recenzje" },
    { path: "/admin/bestsellery", Icon: Star, label: "Bestsellery" },
    { path: "/admin/wysylki", Icon: Truck, label: "Koszty wysyłek" },
  ];

  const isDashboard = location.pathname === "/admin";

  return (
    <div className="admin-layout">
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
          {!isDashboard && (
            <button
              onClick={() => navigate("/admin")}
              className="mobile-back-btn"
              title="Wróć do głównego panelu"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} className="nav-icon" />
            <span>Wyloguj</span>
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

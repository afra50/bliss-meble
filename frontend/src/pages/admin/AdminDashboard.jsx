import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Star,
  MessageSquare,
  Truck,
  Layers, // Ikona dla atrybutów
} from "lucide-react";
import "../../styles/pages/admin/admin-dashboard.scss";

const AdminDashboard = () => {
  const sections = [
    {
      id: "products",
      title: "Produkty",
      desc: "Zarządzaj asortymentem, dodawaj nowe meble i edytuj opisy produktów.",
      icon: <Package size={32} />,
      link: "/admin/produkty",
    },
    {
      id: "orders",
      title: "Zamówienia",
      desc: "Przeglądaj nowe zamówienia, zarządzaj statusami i szczegółami sprzedaży.",
      icon: <ShoppingCart size={32} />,
      link: "/admin/zamowienia",
    },
    {
      id: "attributes",
      title: "Atrybuty",
      desc: "Dodawaj nowe kolory, rodzaje tkanin oraz dostępne rozmiary mebli.",
      icon: <Layers size={32} />,
      link: "/admin/atrybuty",
    },
    {
      id: "reviews",
      title: "Recenzje",
      desc: "Moderuj opinie klientów o meblach i dbaj o wizerunek marki BLISS meble.",
      icon: <MessageSquare size={32} />,
      link: "/admin/recenzje",
    },
    {
      id: "shipping",
      title: "Koszty wysyłek",
      desc: "Konfiguruj stawki dostawy dla różnych metod transportu.",
      icon: <Truck size={32} />,
      link: "/admin/wysylki",
    },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__intro">
        <h1>Witaj w panelu BLISS meble</h1>
        <p>Co chcesz dzisiaj zrobić?</p>
      </header>

      <div className="admin-dashboard__grid">
        {sections.map((section) => (
          <Link to={section.link} key={section.id} className="admin-card">
            <div className="admin-card__icon">{section.icon}</div>
            <div className="admin-card__info">
              <h2>{section.title}</h2>
              <p>{section.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

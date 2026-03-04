import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import "../../styles/components/admin/admin-buttons.scss";

// Obsługuje teraz zarówno prop "to" (nawigacja) jak i prop "onClick" (wywołanie modala)
const AdminAddButton = ({ to, onClick, text }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="admin-add-btn"
        style={{ border: "none", cursor: "pointer" }}
      >
        <Plus size={20} />
        <span>{text}</span>
      </button>
    );
  }

  return (
    <Link to={to} className="admin-add-btn">
      <Plus size={20} />
      <span>{text}</span>
    </Link>
  );
};

export default AdminAddButton;

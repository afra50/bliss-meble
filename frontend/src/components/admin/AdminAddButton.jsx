import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import "../../styles/components/admin/admin-buttons.scss";

const AdminAddButton = ({ to, text }) => {
  return (
    <Link to={to} className="admin-add-btn">
      <Plus size={20} />
      <span>{text}</span>
    </Link>
  );
};

export default AdminAddButton;

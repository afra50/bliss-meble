import React from "react";
import { Edit2 } from "lucide-react";
import "../../styles/components/admin/admin-buttons.scss";

const AdminEditButton = ({ onClick, title = "Edytuj" }) => {
  return (
    <button className="admin-action-btn edit" onClick={onClick} title={title}>
      <Edit2 size={18} />
    </button>
  );
};

export default AdminEditButton;

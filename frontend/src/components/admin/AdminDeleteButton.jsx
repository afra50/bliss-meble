import React from "react";
import { Trash2 } from "lucide-react";
import "../../styles/components/admin/admin-buttons.scss";

const AdminDeleteButton = ({ onClick, title = "Usuń" }) => {
  return (
    <button className="admin-action-btn delete" onClick={onClick} title={title}>
      <Trash2 size={18} />
    </button>
  );
};

export default AdminDeleteButton;

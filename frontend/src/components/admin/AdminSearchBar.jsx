import React from "react";
import { Search } from "lucide-react";
import "../../styles/components/admin/admin-search-bar.scss";

const AdminSearchBar = ({ value, onChange, placeholder = "Szukaj..." }) => {
  return (
    <div className="admin-search-bar">
      <Search size={20} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default AdminSearchBar;

import React, { useState, useEffect } from "react";
import { attributeApi } from "../../utils/api";
import { AlertCircle } from "lucide-react";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/ErrorState";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import AdminAddButton from "../../components/admin/AdminAddButton";
import AdminDeleteButton from "../../components/admin/AdminDeleteButton";
import Pagination from "../../components/ui/Pagination";
import SortSelect from "../../components/ui/SortSelect";
import { adminSortOptions } from "../../utils/sortOptions";
import CustomSelect from "../../components/ui/CustomSelect";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ToastAlert from "../../components/ui/ToastAlert";
import AdminAttributeModal from "../../components/admin/AdminAttributeModal"; // <--- IMPORT NOWEGO MODALA
import { COLOR_FAMILIES } from "../../utils/colors";

import "../../styles/pages/admin/admin-attribute-list.scss";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const AdminAttributeList = () => {
  const [rawGroups, setRawGroups] = useState([]);
  const [flatAttributes, setFlatAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("alpha_asc");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    attributeId: null,
    attributeName: "",
    isLoading: false,
  });

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ isOpen: true, message, type });
  };

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attributeApi.getAll();
      const groups = response.data;
      setRawGroups(groups);

      const flatList = [];
      groups.forEach((g) => {
        g.values?.forEach((v) => {
          flatList.push({
            id: v.id,
            value: v.value,
            group_id: g.id,
            group_name: g.name,
            color_hex: v.color_hex,
            image_url: v.image_url, // <--- DODAJ TO
          });
        });
      });
      setFlatAttributes(flatList);
    } catch (error) {
      console.error("Błąd pobierania atrybutów:", error);
      setError("Nie udało się pobrać listy atrybutów.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption, selectedGroupFilter]);

  const handleDeleteClick = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      attributeId: id,
      attributeName: name,
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      await attributeApi.deleteValue(confirmDialog.attributeId);
      showToast(
        `Wartość "${confirmDialog.attributeName}" została usunięta.`,
        "success",
      );
      fetchAttributes();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Błąd podczas usuwania.",
        "error",
      );
    } finally {
      setConfirmDialog({
        isOpen: false,
        attributeId: null,
        attributeName: "",
        isLoading: false,
      });
    }
  };

  // --- Funkcja sukcesu przekazywana do Modala ---
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    showToast("Dodano nowy atrybut.", "success");
    fetchAttributes();
  };

  const filterOptions = [
    { value: "all", label: "Wszystkie grupy" },
    ...rawGroups.map((g) => ({ value: g.name, label: g.name })),
  ];

  let processedData = [...flatAttributes];

  if (searchTerm) {
    processedData = processedData.filter((attr) =>
      attr.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  if (selectedGroupFilter && selectedGroupFilter !== "all") {
    const groupString =
      typeof selectedGroupFilter === "object"
        ? selectedGroupFilter.value
        : selectedGroupFilter;
    if (groupString !== "all") {
      processedData = processedData.filter(
        (attr) => attr.group_name === groupString,
      );
    }
  }

  processedData.sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return b.id - a.id;
      case "oldest":
        return a.id - b.id;
      case "alpha_asc":
        return a.value.localeCompare(b.value);
      case "alpha_desc":
        return b.value.localeCompare(a.value);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentItems = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) return <Loader message="Ładowanie atrybutów..." />;
  if (error)
    return (
      <div className="admin-attributes">
        <ErrorState message={error} onRetry={fetchAttributes} />
      </div>
    );

  return (
    <div className="admin-attributes">
      <header className="admin-attributes__header">
        <div className="header-text">
          <h1>Zarządzanie Atrybutami</h1>
          <p>
            Liczba wartości: {processedData.length} (wszystkich:{" "}
            {flatAttributes.length})
          </p>
        </div>
        <AdminAddButton
          onClick={() => setIsModalOpen(true)}
          text="Dodaj Wartość"
        />
      </header>

      <div className="admin-attributes__controls">
        <div className="controls-search">
          <AdminSearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Szukaj po nazwie wartości..."
          />
        </div>
        <div className="controls-filters">
          <CustomSelect
            variant="form"
            options={filterOptions}
            value={selectedGroupFilter}
            onChange={(val) => setSelectedGroupFilter(val)}
          />
          <SortSelect
            options={adminSortOptions}
            value={sortOption}
            onChange={(selected) => setSortOption(selected.value)}
          />
        </div>
      </div>

      <div className="admin-attributes__table-wrapper admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="th-id">ID</th>
              <th>Grupa Atrybutów</th>
              <th>Wartość / Nazwa</th>
              <th>Odcień (Filtr)</th>
              <th className="th-actions">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((attr) => {
                const colorFamily = attr.color_hex
                  ? COLOR_FAMILIES.find((c) => c.value === attr.color_hex)
                  : null;

                return (
                  <tr key={attr.id}>
                    <td className="td-id">#{attr.id}</td>
                    <td>
                      <span className="group-badge">{attr.group_name}</span>
                    </td>
                    <td>
                      <strong>{attr.value}</strong>
                    </td>
                    <td>
                      <div className="color-preview-wrap">
                        {/* 1. Priorytet ma zdjęcie tkaniny */}
                        {attr.image_url ? (
                          <>
                            <img
                              className="color-preview-image"
                              src={`${BACKEND_URL}/uploads/attributes/${attr.image_url}`}
                              alt={attr.value}
                            />
                            <span className="color-preview-label">
                              Zdjęcie próbki
                            </span>
                          </>
                        ) : attr.color_hex ? (
                          /* 2. Jeśli nie ma zdjęcia, ale jest kolor HEX */
                          <>
                            <span
                              className="color-preview-circle"
                              style={{ backgroundColor: attr.color_hex }}
                              title={attr.color_hex}
                            ></span>
                            <span className="color-preview-label">
                              {colorFamily ? colorFamily.label : attr.color_hex}
                            </span>
                          </>
                        ) : (
                          /* 3. Jeśli nie ma nic */
                          <span className="color-preview-empty">- brak -</span>
                        )}
                      </div>
                    </td>
                    <td className="td-actions">
                      <div className="actions-container">
                        <AdminDeleteButton
                          onClick={() => handleDeleteClick(attr.id, attr.value)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  <AlertCircle size={40} />
                  <p>Nie znaleziono atrybutów pasujących do kryteriów.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-attributes__pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* --- CZYSTY I WYDZIELONY MODAL --- */}
      <AdminAttributeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        showToast={showToast}
        rawGroups={rawGroups}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Usuwanie atrybutu"
        message={`Czy na pewno chcesz usunąć wartość "${confirmDialog.attributeName}"? Produkty z tym wariantem stracą to przypisanie.`}
        confirmText="Tak, usuń"
        cancelText="Wróć"
        variant="danger"
        isLoading={confirmDialog.isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      <ToastAlert
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default AdminAttributeList;

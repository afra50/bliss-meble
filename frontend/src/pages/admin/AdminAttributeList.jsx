import React, { useState, useEffect } from "react";
import { attributeApi } from "../../utils/api";
import { AlertCircle, X } from "lucide-react";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/ErrorState";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import AdminAddButton from "../../components/admin/AdminAddButton";
import AdminDeleteButton from "../../components/admin/AdminDeleteButton";
import Pagination from "../../components/ui/Pagination";
import SortSelect from "../../components/ui/SortSelect";
import CustomSelect from "../../components/ui/CustomSelect";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ToastAlert from "../../components/ui/ToastAlert";
import Button from "../../components/ui/Button";

import "../../styles/components/admin/admin-modal.scss";
import "../../styles/pages/admin/admin-attribute-list.scss";

// NOWOŚĆ: Definiujemy paletę "Rodzin Kolorów" dla sklepu
const COLOR_FAMILIES = [
  { label: "Biały", value: "#FFFFFF" },
  { label: "Czarny", value: "#000000" },
  { label: "Szary", value: "#9E9E9E" },
  { label: "Beżowy", value: "#F5F5DC" },
  { label: "Brązowy", value: "#8B4513" },
  { label: "Niebieski", value: "#2196F3" },
  { label: "Granatowy", value: "#0F172A" },
  { label: "Czerwony", value: "#B91C1C" },
  { label: "Różowy", value: "#E91E63" },
  { label: "Zielony", value: "#4CAF50" },
  { label: "Butelkowa zieleń", value: "#064E3B" },
  { label: "Żółty", value: "#EAB308" },
];

const sortOptions = [
  { value: "alpha_asc", label: "Alfabetycznie (A-Z)" },
  { value: "alpha_desc", label: "Alfabetycznie (Z-A)" },
  { value: "newest", label: "Od najnowszych (ID)" },
  { value: "oldest", label: "Od najstarszych (ID)" },
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ZMIANA: Dodano color_hex do stanu
  const [newAttrData, setNewAttrData] = useState({
    group_id: "",
    value: "",
    color_hex: "",
  });

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
            color_hex: v.color_hex, // ZMIANA: Wyciągamy hex do tabeli
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

  const handleAddNew = () => {
    setNewAttrData({ group_id: "", value: "", color_hex: "" });
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newAttrData.group_id) {
      showToast("Wybierz grupę atrybutów!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // ZMIANA: Wysyłamy dane z color_hex
      await attributeApi.createValue({
        group_id: newAttrData.group_id,
        value: newAttrData.value,
        color_hex: newAttrData.color_hex || null,
      });
      showToast("Dodano nowy atrybut.", "success");
      setIsModalOpen(false);
      fetchAttributes();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Błąd dodawania atrybutu.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
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

  // Sprawdzamy czy wybrana obecnie grupa ma coś wspólnego z "kolorem"
  const isColorGroupSelected = () => {
    if (!newAttrData.group_id) return false;
    const selectedGroup = rawGroups.find((g) => g.id === newAttrData.group_id);
    return selectedGroup && selectedGroup.name.toLowerCase().includes("kolor");
  };

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
        <AdminAddButton onClick={handleAddNew} text="Dodaj Wartość" />
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
            options={sortOptions}
            value={sortOption}
            onChange={(selected) => setSortOption(selected.value)}
          />
        </div>
      </div>

      <div className="admin-attributes__table-wrapper admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Grupa Atrybutów</th>
              <th>Wartość / Nazwa</th>
              <th>Odcień (Filtr)</th>
              {/* <--- NOWA KOLUMNA */}
              <th style={{ width: "120px", textAlign: "right" }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((attr) => {
                // Szukamy nazwy odcienia w słowniku na podstawie kodu HEX z bazy
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
                      {/* NOWA KOMÓRKA: POKAZUJE KOLOR I JEGO NAZWĘ */}
                      {attr.color_hex ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              width: "20px",
                              height: "20px",
                              backgroundColor: attr.color_hex,
                              borderRadius: "50%",
                              border: "1px solid rgba(0,0,0,0.15)",
                              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                            }}
                            title={attr.color_hex}
                          ></span>
                          <span style={{ fontSize: "0.85rem", color: "#666" }}>
                            {colorFamily ? colorFamily.label : attr.color_hex}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                          - brak -
                        </span>
                      )}
                    </td>
                    <td className="td-actions">
                      <div
                        className="actions-container"
                        style={{ justifyContent: "flex-end" }}
                      >
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

      {/* --- MODAL DODAWANIA --- */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal"
            style={{ maxWidth: "500px", minHeight: "auto" }}
          >
            <div className="admin-modal__header">
              <h2>Nowa Wartość Atrybutu</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            <form
              className="admin-modal__form-wrapper"
              onSubmit={handleAddSubmit}
            >
              <div className="admin-modal__body" style={{ padding: "30px" }}>
                <div className="form-group">
                  <label className="form-group__label">Wybierz Grupę *</label>
                  <CustomSelect
                    variant="form"
                    options={rawGroups.map((g) => ({
                      value: g.id,
                      label: g.name,
                    }))}
                    value={newAttrData.group_id}
                    onChange={(opt) => {
                      setNewAttrData((prev) => ({
                        ...prev,
                        group_id: opt ? opt.value : "",
                        color_hex: "", // Resetujemy kolor przy zmianie grupy
                      }));
                    }}
                    placeholder="np. Tkanina i Kolor"
                  />
                </div>
                <div className="form-group" style={{ marginTop: "20px" }}>
                  <label className="form-group__label">
                    Wartość Atrybutu *
                  </label>
                  <input
                    required
                    minLength={1}
                    maxLength={150}
                    className="form-group__input"
                    placeholder="np. Monolith 84 (Jasny szary)"
                    value={newAttrData.value}
                    onChange={(e) =>
                      setNewAttrData((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* NOWOŚĆ: Pole wyboru odcienia (tylko dla grupy zawierającej "kolor") */}
                {isColorGroupSelected() && (
                  <div className="form-group" style={{ marginTop: "20px" }}>
                    <label className="form-group__label">
                      Odcień do filtrów sklepu (Opcjonalnie)
                    </label>
                    <CustomSelect
                      variant="form"
                      options={COLOR_FAMILIES}
                      value={newAttrData.color_hex}
                      onChange={(opt) =>
                        setNewAttrData((prev) => ({
                          ...prev,
                          color_hex: opt ? opt.value : "",
                        }))
                      }
                      placeholder="Wybierz ogólny kolor..."
                    />
                    <small
                      style={{
                        color: "#888",
                        marginTop: "5px",
                        display: "block",
                        fontSize: "0.8rem",
                      }}
                    >
                      Pozwoli klientom wyszukać ten materiał, gdy na sklepie
                      zaznaczą np. filtr "Szary".
                    </small>
                  </div>
                )}
              </div>
              <div className="admin-modal__footer">
                <Button
                  className="btn-cancel"
                  variant="outline-olive"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Anuluj
                </Button>
                <Button
                  className="btn-save"
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Dodaj
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reszta (ConfirmDialog, Toast) bez zmian... */}
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

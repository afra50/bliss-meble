import React, { useState, useEffect } from "react";
import { productApi } from "../../utils/api";
import { AlertCircle } from "lucide-react";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/ErrorState";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import AdminAddButton from "../../components/admin/AdminAddButton";
import AdminEditButton from "../../components/admin/AdminEditButton";
import AdminDeleteButton from "../../components/admin/AdminDeleteButton";
import Pagination from "../../components/ui/Pagination";
import SortSelect from "../../components/ui/SortSelect";
import { adminSortOptions } from "../../utils/sortOptions";
import CustomSelect from "../../components/ui/CustomSelect";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ToastAlert from "../../components/ui/ToastAlert";
import AdminProductModal from "../../components/admin/AdminProductModal";
import defaultImg from "../../assets/default-product.jpg";
import "../../styles/pages/admin/admin-product-list.scss";

// ZMIANA: Usunięto stary blok BACKEND_URL z funkcją .replace()

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    productId: null,
    productName: "",
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

  // ZMIANA: Nowa funkcja generująca pełny adres URL zdjęcia (z /api)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${apiUrl}/uploads/products/${imagePath}`;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getAdminAll();
      setProducts(response.data);
    } catch (error) {
      console.error("Błąd pobierania:", error);
      setError("Nie udało się pobrać listy produktów.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ... (reszta funkcji bez zmian)

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption, selectedCategoryFilter]);

  const categoryOptions = [
    { value: "all", label: "Wszystkie kategorie" },
    ...Array.from(new Set(products.map((p) => p.subcategory_name)))
      .filter(Boolean)
      .map((catName) => ({ value: catName, label: catName })),
  ];

  const handleDeleteClick = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      productId: id,
      productName: name,
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      await productApi.delete(confirmDialog.productId);
      setProducts(products.filter((p) => p.id !== confirmDialog.productId));
      showToast(
        `Produkt "${confirmDialog.productName}" został usunięty.`,
        "success",
      );
    } catch (error) {
      showToast("Wystąpił błąd podczas usuwania produktu.", "error");
    } finally {
      setConfirmDialog({
        isOpen: false,
        productId: null,
        productName: "",
        isLoading: false,
      });
    }
  };

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    showToast(productToEdit ? "Zaktualizowano." : "Dodano produkt.", "success");
    fetchProducts();
  };

  let processedProducts = [...products];

  if (searchTerm) {
    processedProducts = processedProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  if (selectedCategoryFilter && selectedCategoryFilter !== "all") {
    const categoryString =
      typeof selectedCategoryFilter === "object"
        ? selectedCategoryFilter.value
        : selectedCategoryFilter;

    if (categoryString !== "all") {
      processedProducts = processedProducts.filter(
        (p) => p.subcategory_name === categoryString,
      );
    }
  }

  processedProducts.sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return (
          new Date(b.created_at || 0) - new Date(a.created_at || 0) ||
          b.id - a.id
        );
      case "oldest":
        return (
          new Date(a.created_at || 0) - new Date(b.created_at || 0) ||
          a.id - b.id
        );
      case "alpha_asc":
        return a.name.localeCompare(b.name);
      case "alpha_desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const currentProducts = processedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) return <Loader message="Ładowanie listy produktów..." />;
  if (error)
    return (
      <div className="admin-products admin-products--error">
        <ErrorState message={error} onRetry={fetchProducts} />
      </div>
    );

  return (
    <div className="admin-products">
      <header className="admin-products__header">
        <div className="header-text">
          <h1>Zarządzanie Produktami</h1>
          <p>
            Liczba produktów: {processedProducts.length} (wszystkich:{" "}
            {products.length})
          </p>
        </div>
        <AdminAddButton onClick={handleAddNew} text="Dodaj Nowy Produkt" />
      </header>

      <div className="admin-products__controls">
        <div className="controls-search">
          <AdminSearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Szukaj produktu po nazwie..."
          />
        </div>

        <div className="controls-filters">
          <CustomSelect
            variant="form"
            options={categoryOptions}
            value={selectedCategoryFilter}
            onChange={(val) => setSelectedCategoryFilter(val)}
          />

          <SortSelect
            options={adminSortOptions}
            value={sortOption}
            onChange={(selected) => setSortOption(selected.value)}
          />
        </div>
      </div>

      <div className="admin-products__table-wrapper admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Miniatura</th>
              <th>Nazwa</th>
              <th>Kategoria</th>
              <th>Cena (brutto)</th>
              <th>Status</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product.id}>
                  <td className="td-img">
                    <img
                      src={getImageUrl(product.main_image)}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = defaultImg;
                      }}
                    />
                  </td>
                  <td className="td-main">
                    <strong>{product.name}</strong>
                    <span className="sub-info">ID: #{product.id}</span>
                  </td>
                  <td>{product.subcategory_name || "Brak"}</td>
                  <td className="td-price">
                    {product.promotional_price &&
                    product.promotional_price > 0 ? (
                      <>
                        <span className="current-price">
                          {parseFloat(product.promotional_price).toFixed(2)} zł
                        </span>
                        <span className="old-price">
                          {parseFloat(product.price_brut).toFixed(2)} zł
                        </span>
                      </>
                    ) : (
                      <span>
                        {parseFloat(product.price_brut).toFixed(2)} zł
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${product.is_available ? "available" : "unavailable"}`}
                    >
                      {product.is_available ? "Dostępny" : "Niedostępny"}
                    </span>
                  </td>
                  <td className="td-actions">
                    <div className="actions-container">
                      <AdminEditButton
                        onClick={() => handleEditClick(product)}
                      />
                      <AdminDeleteButton
                        onClick={() =>
                          handleDeleteClick(product.id, product.name)
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  <AlertCircle size={40} />
                  <p>Nie znaleziono produktów pasujących do kryteriów.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-products__pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
        onSuccess={handleModalSuccess}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Usuwanie produktu"
        message={`Czy na pewno chcesz usunąć "${confirmDialog.productName}"?`}
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

export default AdminProductList;

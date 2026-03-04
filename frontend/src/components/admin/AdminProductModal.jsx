import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useDropzone } from "react-dropzone";
import { productApi, attributeApi } from "../../utils/api";
import { X, Loader2, UploadCloud, Trash2 } from "lucide-react";
import ErrorState from "../ui/ErrorState";
import CustomSelect from "../ui/CustomSelect";
import "../../styles/components/admin/admin-modal.scss";
import "../../styles/forms.scss";

// Pobieranie URL dla zdjęć (usuwa /api)
const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const SUBCATEGORIES = [
  { id: 1, name: "Materace" },
  { id: 2, name: "Łóżka kontynentalne" },
  { id: 3, name: "Łóżka tapicerowane" },
  { id: 4, name: "Narożniki" },
  { id: 5, name: "Narożniki U" },
  { id: 6, name: "Sofy" },
  { id: 7, name: "Fotele" },
];

const AdminProductModal = ({
  isOpen,
  onClose,
  productToEdit = null,
  onSuccess,
}) => {
  const isEditMode = !!productToEdit;

  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    price_brut: "",
    subcategory_id: "",
    is_available: true,
    is_bestseller: false,
  });

  // Zdjęcia istniejące na serwerze (przy edycji)
  const [existingImages, setExistingImages] = useState([]);
  // Nowe zdjęcia do wgrania (pliki File z Dropzone)
  const [newFiles, setNewFiles] = useState([]);

  const [attributeGroups, setAttributeGroups] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const initData = async () => {
      setIsLoading(true);
      setError(null);
      setNewFiles([]); // Reset nowych plików
      try {
        const attrRes = await attributeApi.getAll();
        setAttributeGroups(attrRes.data);

        if (isEditMode) {
          const prodRes = await productApi.getAdminById(productToEdit.id);
          const p = prodRes.data;

          setFormData({
            name: p.name,
            short_description: p.short_description,
            description: p.description,
            price_brut: p.price_brut,
            subcategory_id: p.subcategory_id || "",
            is_available: p.is_available === 1,
            is_bestseller: p.is_bestseller === 1,
          });

          // Załadowanie istniejących zdjęć z API
          if (p.images) setExistingImages(p.images);

          if (p.attributes) {
            setSelectedAttributes(
              p.attributes.map((attr) => ({
                id: attr.attribute_value_id,
                price: attr.price_modifier,
              })),
            );
          }
        } else {
          setFormData({
            name: "",
            short_description: "",
            description: "",
            price_brut: "",
            subcategory_id: "",
            is_available: true,
            is_bestseller: false,
          });
          setSelectedAttributes([]);
          setExistingImages([]);
        }
      } catch (err) {
        setError("Nie udało się załadować danych formularza.");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [isOpen, isEditMode, productToEdit]);

  // --- LOGIKA DROPZONE ---
  const onDrop = useCallback((acceptedFiles) => {
    // Generujemy obiekty z preview URL do wyświetlenia miniatur w locie
    const filesWithPreview = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      }),
    );
    setNewFiles((prev) => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, // Tylko obrazki
    maxFiles: 10,
  });

  // --- USUWANIE ZDJĘĆ ---
  const removeNewFile = (fileToRemove) => {
    setNewFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const removeExistingImage = async (imageId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to zdjęcie z serwera?"))
      return;
    try {
      await productApi.deleteImage(imageId); // Endpoint z
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      alert("Błąd podczas usuwania zdjęcia.");
    }
  };

  // --- FORMULARZ ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("short_description", formData.short_description);
      submitData.append("description", formData.description);
      submitData.append("price_brut", formData.price_brut);
      submitData.append("subcategory_id", formData.subcategory_id);
      submitData.append("is_available", formData.is_available);
      submitData.append("is_bestseller", formData.is_bestseller);
      submitData.append("attributes", JSON.stringify(selectedAttributes));

      // Dodajemy tylko NOWE zdjęcia do Multera
      newFiles.forEach((file) => {
        submitData.append("images", file);
      });

      if (isEditMode) {
        await productApi.update(productToEdit.id, submitData);
      } else {
        await productApi.create(submitData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Błąd zapisu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Zwalnianie pamięci przeglądarki ze starych blobów
  useEffect(() => {
    return () => newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [newFiles]);

  // Przygotowanie opcji dla CustomSelect
  const subcategoryOptions = SUBCATEGORIES.map((sub) => ({
    value: sub.id,
    label: sub.name,
  }));

  if (!isOpen) return null;

  const modalContent = (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal__header">
          <h2>{isEditMode ? "Edycja Produktu" : "Nowy Produkt"}</h2>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div
            className="admin-modal__body"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader2
              size={40}
              className="spinner"
              style={{ color: "#64757d" }}
            />
          </div>
        ) : (
          <form
            className="admin-modal__body"
            id="product-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <div style={{ marginBottom: "20px" }}>
                <ErrorState message={error} />
              </div>
            )}

            <div className="form-section">
              <h3>Podstawowe Informacje</h3>
              <div className="form-group">
                <label className="form-group__label">Nazwa produktu *</label>
                <input
                  required
                  className="form-group__input"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div className="form-group">
                  <label className="form-group__label">Kategoria *</label>
                  <CustomSelect
                    variant="form"
                    options={subcategoryOptions}
                    value={formData.subcategory_id}
                    placeholder="Wybierz podkategorię..."
                    isSearchable={true} // Super przydatne w panelu admina!
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, subcategory_id: val }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">
                    Cena Brutto (zł) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-group__input"
                    name="price_brut"
                    value={formData.price_brut}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Opisy</h3>
              <div className="form-group">
                <label className="form-group__label">
                  Krótki opis (zajawka) *
                </label>
                <textarea
                  required
                  className="form-group__input"
                  name="short_description"
                  rows="2"
                  value={formData.short_description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-group__label">Opis pełny *</label>
                <textarea
                  required
                  className="form-group__input"
                  name="description"
                  rows="6"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Galeria Zdjęć</h3>

              {/* STREFA DROPZONE */}
              <div
                {...getRootProps()}
                className={`image-upload-zone ${isDragActive ? "is-dragover" : ""}`}
              >
                <input {...getInputProps()} />
                <UploadCloud size={40} className="upload-icon" />
                <p>Przeciągnij i upuść zdjęcia tutaj</p>
                <small>
                  lub kliknij, aby wybrać pliki z dysku (Tylko JPG, PNG, WEBP)
                </small>
              </div>

              {/* PODGLĄD ZDJĘĆ */}
              {(existingImages.length > 0 || newFiles.length > 0) && (
                <div className="image-gallery">
                  {/* Zdjęcia z serwera */}
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className={`image-gallery__item ${img.is_main ? "is-main" : ""}`}
                    >
                      <img
                        src={`${BACKEND_URL}/uploads/products/${img.url}`}
                        alt="Mebel"
                      />
                      <div
                        className="delete-overlay"
                        onClick={() => removeExistingImage(img.id)}
                        title="Usuń zdjęcie"
                      >
                        <Trash2 size={24} />
                      </div>
                    </div>
                  ))}

                  {/* Nowe pliki gotowe do wgrania */}
                  {newFiles.map((file, index) => (
                    <div key={index} className="image-gallery__item">
                      <img src={file.preview} alt="Podgląd" />
                      <div
                        className="delete-overlay"
                        onClick={() => removeNewFile(file)}
                        title="Anuluj wgrywanie"
                      >
                        <X size={24} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEKCJA STATUSÓW - przesunięta niżej dla czytelności */}
            <div className="form-section">
              <h3>Status Publikacji</h3>
              <div className="custom-checkbox">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_available">Produkt dostępny w sklepie</label>
              </div>
              <div className="custom-checkbox">
                <input
                  type="checkbox"
                  id="is_bestseller"
                  name="is_bestseller"
                  checked={formData.is_bestseller}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_bestseller">
                  Oznacz jako Bestseller (Limit: 3)
                </label>
              </div>
            </div>
          </form>
        )}

        <div className="admin-modal__footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Anuluj
          </button>
          <button
            className="btn-save"
            type="submit"
            form="product-form"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? <Loader2 size={18} className="spinner" /> : null}
            <span>{isSubmitting ? "Przetwarzanie..." : "Zapisz Produkt"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AdminProductModal;

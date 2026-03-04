import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useDropzone } from "react-dropzone";
import { productApi, attributeApi } from "../../utils/api";
import { X, UploadCloud, Trash2 } from "lucide-react";
import CustomSelect from "../ui/CustomSelect";
import Button from "../ui/Button";
import Loader from "../ui/Loader";
import ToastAlert from "../ui/ToastAlert";
import "../../styles/components/admin/admin-modal.scss";
import { CATEGORIES, SUBCATEGORIES } from "../../utils/categories";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

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

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "error") => {
    setToast({ isOpen: true, message, type });
  };

  useEffect(() => {
    if (!isOpen) return;
    const initData = async () => {
      setIsLoading(true);
      setNewFiles([]);
      try {
        const attrRes = await attributeApi.getAll();
        setAttributeGroups(attrRes.data);

        if (isEditMode) {
          const prodRes = await productApi.getAdminById(productToEdit.id);
          const p = prodRes.data;
          const productSubcatId = p.subcategory_id || "";

          setFormData({
            name: p.name,
            short_description: p.short_description,
            description: p.description,
            price_brut: p.price_brut,
            subcategory_id: productSubcatId,
            is_available: p.is_available === 1,
            is_bestseller: p.is_bestseller === 1,
          });

          if (productSubcatId) {
            const foundSub = SUBCATEGORIES.find(
              (s) => Number(s.id) === Number(productSubcatId),
            );
            if (foundSub) {
              setSelectedCategoryId(foundSub.category_id);
            }
          }

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
          setSelectedCategoryId("");
          setSelectedAttributes([]);
          setExistingImages([]);
        }
      } catch (err) {
        showToast("Nie udało się załadować danych formularza.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [isOpen, isEditMode, productToEdit]);

  const onDrop = useCallback((acceptedFiles) => {
    const filesWithPreview = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      }),
    );
    setNewFiles((prev) => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });

  const removeNewFile = (fileToRemove) => {
    setNewFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const removeExistingImage = async (imageId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to zdjęcie z serwera?"))
      return;
    try {
      await productApi.deleteImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      showToast("Pomyślnie usunięto zdjęcie z serwera.", "success");
    } catch (err) {
      showToast("Błąd podczas usuwania zdjęcia.", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAttributeChange = (attrId, isChecked, priceModifier = 0) => {
    if (isChecked) {
      setSelectedAttributes((prev) => [
        ...prev,
        { id: attrId, price: priceModifier },
      ]);
    } else {
      setSelectedAttributes((prev) => prev.filter((a) => a.id !== attrId));
    }
  };

  const handlePriceModifierChange = (attrId, newPrice) => {
    setSelectedAttributes((prev) =>
      prev.map((a) => (a.id === attrId ? { ...a, price: newPrice } : a)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subcategory_id) {
      showToast(
        "Wybierz podkategorię! Jeśli lista jest pusta, zmień kategorię główną.",
        "error",
      );
      return;
    }

    setIsSubmitting(true);
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
      showToast(
        err.response?.data?.error || "Błąd podczas zapisywania produktu.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [newFiles]);

  if (!isOpen) return null;

  const categoryOptions = CATEGORIES.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const categoryId =
    typeof selectedCategoryId === "object"
      ? selectedCategoryId.value
      : selectedCategoryId;

  const filteredSubcategories = SUBCATEGORIES.filter(
    (sub) => Number(sub.category_id) === Number(categoryId),
  );

  const subcategoryOptions = filteredSubcategories.map((sub) => ({
    value: sub.id,
    label: sub.name,
  }));

  const modalContent = (
    <>
      {isSubmitting && (
        <Loader fullPage={true} message="Zapisywanie produktu..." />
      )}

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
            <div className="admin-modal__body-loader">
              <Loader message="Wczytywanie danych..." />
            </div>
          ) : (
            // ZMIANA: Formularz obejmuje teraz całe body i stopkę!
            <form
              className="admin-modal__form-wrapper"
              id="product-form"
              onSubmit={handleSubmit}
            >
              <div className="admin-modal__body">
                <div className="form-section">
                  <h3>Podstawowe Informacje</h3>
                  <div className="form-group">
                    <label className="form-group__label">
                      Nazwa produktu *
                    </label>
                    <input
                      required
                      className="form-group__input"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-group__label">
                        Kategoria Główna *
                      </label>
                      <CustomSelect
                        variant="form"
                        options={categoryOptions}
                        value={selectedCategoryId}
                        placeholder="Wybierz kategorię..."
                        onChange={(opt) => {
                          setSelectedCategoryId(opt);
                          setFormData((prev) => ({
                            ...prev,
                            subcategory_id: "",
                          }));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-group__label">
                        Podkategoria *
                      </label>
                      <CustomSelect
                        variant="form"
                        options={subcategoryOptions}
                        value={formData.subcategory_id}
                        placeholder={
                          !categoryId
                            ? "Wybierz najpierw kategorię"
                            : subcategoryOptions.length === 0
                              ? "Brak podkategorii!"
                              : "Wybierz podkategorię..."
                        }
                        onChange={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            subcategory_id: val,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group form-group--margin-top">
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
                  <div
                    {...getRootProps()}
                    className={`image-upload-zone ${isDragActive ? "is-dragover" : ""}`}
                  >
                    <input {...getInputProps()} />
                    <UploadCloud size={40} className="upload-icon" />
                    <p>Przeciągnij i upuść zdjęcia tutaj</p>
                    <small>
                      lub kliknij, aby wybrać pliki (JPG, PNG, WEBP)
                    </small>
                  </div>
                  {(existingImages.length > 0 || newFiles.length > 0) && (
                    <div className="image-gallery">
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
                          >
                            <Trash2 size={24} />
                          </div>
                        </div>
                      ))}
                      {newFiles.map((file, index) => (
                        <div key={index} className="image-gallery__item">
                          <img src={file.preview} alt="Podgląd" />
                          <div
                            className="delete-overlay"
                            onClick={() =>
                              setNewFiles((prev) =>
                                prev.filter((f) => f !== file),
                              )
                            }
                          >
                            <X size={24} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h3>Warianty i Dopłaty</h3>
                  <p className="form-section__desc">
                    Zaznacz opcje dostępne dla tego produktu. Jeśli dany wariant
                    (np. większy rozmiar) zwiększa cenę bazową produktu, wpisz
                    kwotę <strong>dopłaty</strong> (np. 250.00).
                  </p>
                  {attributeGroups.map((group) => (
                    <div key={group.id} className="attribute-group">
                      <label className="form-group__label attribute-group__title">
                        {group.name}
                      </label>
                      <div className="attribute-group__list">
                        {group.values?.map((val) => {
                          const isSelected = selectedAttributes.some(
                            (a) => a.id === val.id,
                          );
                          const currentPrice =
                            selectedAttributes.find((a) => a.id === val.id)
                              ?.price || 0;
                          return (
                            <div
                              key={val.id}
                              className={`attribute-row ${isSelected ? "attribute-row--selected" : ""}`}
                            >
                              <div className="custom-checkbox custom-checkbox--no-margin">
                                <input
                                  type="checkbox"
                                  id={`attr-${val.id}`}
                                  checked={isSelected}
                                  onChange={(e) =>
                                    handleAttributeChange(
                                      val.id,
                                      e.target.checked,
                                      currentPrice,
                                    )
                                  }
                                />
                                <label htmlFor={`attr-${val.id}`}>
                                  {val.value}
                                </label>
                              </div>
                              {isSelected && (
                                <div className="price-modifier-wrap">
                                  <span>Dopłata do ceny bazowej:</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-group__input price-modifier-wrap__input"
                                    value={currentPrice}
                                    onChange={(e) =>
                                      handlePriceModifierChange(
                                        val.id,
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <span className="price-modifier-wrap__currency">
                                    zł
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

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
                    <label htmlFor="is_available">
                      Produkt dostępny w sklepie
                    </label>
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
              </div>

              {/* ZMIANA: Footer jest teraz wewnątrz formularza */}
              <div className="admin-modal__footer">
                <Button
                  className="btn-cancel"
                  variant="outline-olive"
                  onClick={(e) => {
                    e.preventDefault(); // Powstrzymuje submit w razie czego
                    onClose();
                  }}
                  disabled={isSubmitting}
                >
                  Anuluj
                </Button>

                <Button
                  className="btn-save"
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  isLoading={isSubmitting} // <--- ADD THIS LINE
                >
                  {isSubmitting ? "Zapisywanie..." : "Zapisz Produkt"}{" "}
                  {/* <--- AND CHANGE THIS TEXT */}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ToastAlert
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AdminProductModal;

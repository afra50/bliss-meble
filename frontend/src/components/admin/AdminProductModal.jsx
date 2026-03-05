import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { productApi, attributeApi } from "../../utils/api";
import { X } from "lucide-react";
import CustomSelect from "../ui/CustomSelect";
import Button from "../ui/Button";
import Loader from "../ui/Loader";
import ToastAlert from "../ui/ToastAlert";
import ImageUploadZone from "../ui/ImageUploadZone";
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
                id: attr.value_id, // POPRAWIONE: value_id zamiast attribute_value_id
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

  // --- FUNKCJE DLA IMAGE UPLOAD ZONE ---
  const handleFilesSelected = (files) => {
    setNewFiles((prev) => [...prev, ...files]);
  };

  const handleNewFileRemove = (fileToRemove) => {
    setNewFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const handleNewFileAttributeChange = (fileToUpdate, attrId) => {
    Object.assign(fileToUpdate, { attribute_value_id: attrId });
    setNewFiles((prev) => [...prev]);
  };

  const handleExistingFileAttributeChange = (imageId, attrId) => {
    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, attribute_value_id: attrId ? Number(attrId) : null }
          : img,
      ),
    );
  };

  const handleExistingImageRemove = async (imageId) => {
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

  // --- OBSŁUGA DANYCH FORMULARZA ---
  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;

    if (name === "price_brut") {
      value = value.replace(/,/g, ".");
      value = value.replace(/[^0-9.]/g, "");

      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }

      if (value.includes(".")) {
        const [integerPart, decimalPart] = value.split(".");
        if (decimalPart.length > 2) {
          value = `${integerPart}.${decimalPart.slice(0, 2)}`;
        }
      }
      value = value.replace(/^0+(?=\d)/, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAttributeChange = (attrId, isChecked, priceModifier = "") => {
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
    let validPrice = newPrice.replace(/,/g, ".");
    validPrice = validPrice.replace(/[^0-9.]/g, "");

    const parts = validPrice.split(".");
    if (parts.length > 2) {
      validPrice = parts[0] + "." + parts.slice(1).join("");
    }

    if (validPrice.includes(".")) {
      const [integerPart, decimalPart] = validPrice.split(".");
      if (decimalPart.length > 2) {
        validPrice = `${integerPart}.${decimalPart.slice(0, 2)}`;
      }
    }
    validPrice = validPrice.replace(/^0+(?=\d)/, "");

    setSelectedAttributes((prev) =>
      prev.map((a) => (a.id === attrId ? { ...a, price: validPrice } : a)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryHasSubcategories = subcategoryOptions.length > 0;
    if (categoryHasSubcategories && !formData.subcategory_id) {
      showToast("Wybierz podkategorię z listy!", "error");
      return;
    }

    if (!categoryId) {
      showToast("Wybierz kategorię główną!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("short_description", formData.short_description);
      submitData.append("description", formData.description);
      submitData.append("price_brut", formData.price_brut);
      submitData.append("subcategory_id", formData.subcategory_id || "");
      submitData.append("is_available", formData.is_available);
      submitData.append("is_bestseller", formData.is_bestseller);
      submitData.append("attributes", JSON.stringify(selectedAttributes));

      // Wysyłamy stan starych zdjęć
      submitData.append("existingImages", JSON.stringify(existingImages));

      const newImageAttributes = newFiles.map(
        (file) => file.attribute_value_id || null,
      );

      newFiles.forEach((file) => {
        submitData.append("images", file);
      });

      if (isEditMode) {
        submitData.append(
          "newImageAttributes",
          JSON.stringify(newImageAttributes),
        );
        await productApi.update(productToEdit.id, submitData);
      } else {
        submitData.append(
          "imageAttributes",
          JSON.stringify(newImageAttributes),
        );
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

  // Opcje kolorów przekazywane do selektów w obrazkach
  const colorGroup = attributeGroups.find((g) => g.name === "Tkanina i Kolor");
  const colorOptions =
    colorGroup?.values
      ?.filter((val) => selectedAttributes.some((a) => a.id === val.id))
      .map((val) => ({ id: val.id, name: val.value })) || [];

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
                      type="text"
                      inputMode="decimal"
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
                  <ImageUploadZone
                    existingImages={existingImages}
                    newFiles={newFiles}
                    onFilesSelected={handleFilesSelected}
                    onExistingImageRemove={handleExistingImageRemove}
                    onNewFileRemove={handleNewFileRemove}
                    backendUrl={BACKEND_URL}
                    colorOptions={colorOptions}
                    onNewFileAttributeChange={handleNewFileAttributeChange}
                    onExistingFileAttributeChange={
                      handleExistingFileAttributeChange
                    }
                  />
                </div>

                <div className="form-section">
                  <h3>Warianty i Dopłaty</h3>
                  <p className="form-section__desc">
                    Zaznacz opcje dostępne dla tego produktu. Jeśli dany wariant
                    zwiększa cenę bazową produktu, wpisz kwotę{" "}
                    <strong>dopłaty</strong>.
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
                              ?.price ?? "";
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
                                  <span>Dopłata:</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
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

              <div className="admin-modal__footer">
                <Button
                  className="btn-cancel"
                  variant="outline-olive"
                  onClick={(e) => {
                    e.preventDefault();
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
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "Zapisywanie..." : "Zapisz Produkt"}
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

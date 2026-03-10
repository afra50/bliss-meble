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
    promotional_price: "", // <--- DODANO
    lowest_price_30_days: "", // <--- DODANO
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
            promotional_price: p.promotional_price || "", // <--- DODANO
            lowest_price_30_days: p.lowest_price_30_days || "", // <--- DODANO
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

          // 1. Najpierw pobieramy atrybuty
          let loadedAttributes = [];
          if (p.attributes) {
            loadedAttributes = p.attributes.map((attr) => ({
              id: attr.value_id,
              price: attr.price_modifier,
            }));
            setSelectedAttributes(loadedAttributes);
          }

          // 2. Następnie pobieramy zdjęcia, sprawdzając czy nie mają "osieroconych" kolorów
          if (p.images) {
            const validAttrIds = loadedAttributes.map((a) => a.id);
            const cleanedImages = p.images.map((img) => {
              if (
                img.attribute_value_id &&
                !validAttrIds.includes(img.attribute_value_id)
              ) {
                return { ...img, attribute_value_id: null };
              }
              return img;
            });
            setExistingImages(cleanedImages);
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
  const MAX_IMAGES = 10; // Globalny limit ilości zdjęć dla produktu

  const handleSetMainImage = (type, identifier) => {
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_main: type === "existing" && img.id === identifier ? 1 : 0,
      })),
    );
    setNewFiles((prev) =>
      prev.map((file) =>
        Object.assign(file, {
          is_main: type === "new" && file.preview === identifier ? 1 : 0,
        }),
      ),
    );
  };

  const handleFilesSelected = (files) => {
    const currentActive =
      existingImages.filter((img) => !img.isDeleted).length + newFiles.length;

    // Zabezpieczenie przed przepchnięciem za dużej liczby plików naraz
    if (currentActive + files.length > MAX_IMAGES) {
      showToast(`Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć!`, "error");
      return;
    }

    const isFirstUpload =
      existingImages.filter((img) => !img.isDeleted).length === 0 &&
      newFiles.length === 0;

    if (isFirstUpload && files.length > 0) {
      Object.assign(files[0], { is_main: 1 });
    } else {
      files.forEach((f) => Object.assign(f, { is_main: 0 }));
    }
    setNewFiles((prev) => [...prev, ...files]);
  };

  // NOWOŚĆ: Funkcja odbierająca błędy z Dropzone'a (np. plik > 5MB)
  const handleFilesRejected = (errorMessage) => {
    showToast(errorMessage, "error");
  };

  const handleNewFileRemove = (fileToRemove) => {
    const wasMain = fileToRemove.is_main === 1 || fileToRemove.is_main === true;
    setNewFiles((prev) => prev.filter((file) => file !== fileToRemove));

    if (wasMain) {
      const nextExisting = existingImages.find((img) => !img.isDeleted);
      if (nextExisting) {
        handleSetMainImage("existing", nextExisting.id);
      } else {
        const nextNew = newFiles.find((file) => file !== fileToRemove);
        if (nextNew) handleSetMainImage("new", nextNew.preview);
      }
    }
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

  const handleExistingImageRemove = (imageId) => {
    const imgToRemove = existingImages.find((img) => img.id === imageId);
    const wasMain = imgToRemove?.is_main === 1 || imgToRemove?.is_main === true;

    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, isDeleted: true, is_main: 0 } : img,
      ),
    );

    if (wasMain) {
      const nextExisting = existingImages.find(
        (img) => img.id !== imageId && !img.isDeleted,
      );
      if (nextExisting) {
        handleSetMainImage("existing", nextExisting.id);
      } else {
        const nextNew = newFiles.length > 0 ? newFiles[0] : null;
        if (nextNew) handleSetMainImage("new", nextNew.preview);
      }
    }
  };

  const handleRestoreExistingImage = (imageId) => {
    let needsMain = false;
    const hasMain =
      existingImages.some((img) => img.is_main && !img.isDeleted) ||
      newFiles.some((f) => f.is_main);
    if (!hasMain) needsMain = true;

    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, isDeleted: false, is_main: needsMain ? 1 : 0 }
          : img,
      ),
    );
  };

  // --- OBSŁUGA DANYCH FORMULARZA ---
  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;

    // ZMIANA: Używamy tablicy, aby formatowanie obejmowało wszystkie 3 pola cenowe!
    if (
      ["price_brut", "promotional_price", "lowest_price_30_days"].includes(name)
    ) {
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

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Automatyczne odznaczanie bestsellera
      if (name === "is_available" && !checked) {
        updatedData.is_bestseller = false;
      }

      // NOWOŚĆ: Jeśli admin wyczyści pole ceny promocyjnej, czyścimy też Omnibusa
      if (name === "promotional_price" && (!value || parseFloat(value) === 0)) {
        updatedData.lowest_price_30_days = "";
      }

      return updatedData;
    });
  };

  const handleAttributeChange = (attrId, isChecked, priceModifier = "") => {
    if (isChecked) {
      setSelectedAttributes((prev) => [
        ...prev,
        { id: attrId, price: priceModifier },
      ]);
    } else {
      setSelectedAttributes((prev) => prev.filter((a) => a.id !== attrId));

      // NOWOŚĆ: Automatycznie czyści przypisany kolor ze wszystkich zdjęć (starych i nowych)
      setExistingImages((prev) =>
        prev.map((img) =>
          img.attribute_value_id === attrId
            ? { ...img, attribute_value_id: null }
            : img,
        ),
      );

      setNewFiles((prev) =>
        prev.map((file) => {
          if (file.attribute_value_id === attrId) {
            return Object.assign(file, { attribute_value_id: null });
          }
          return file;
        }),
      );
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
      const imagesToDelete = existingImages.filter((img) => img.isDeleted);
      if (imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map((img) => productApi.deleteImage(img.id)),
        );
      }

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("short_description", formData.short_description);
      submitData.append("description", formData.description);
      submitData.append("price_brut", formData.price_brut);
      submitData.append("promotional_price", formData.promotional_price || ""); // <--- DODANO
      submitData.append(
        "lowest_price_30_days",
        formData.lowest_price_30_days || "",
      ); // <--- DODANO
      submitData.append("subcategory_id", formData.subcategory_id || "");
      submitData.append("is_available", formData.is_available);
      submitData.append("is_bestseller", formData.is_bestseller);
      submitData.append("attributes", JSON.stringify(selectedAttributes));

      const remainingExistingImages = existingImages.filter(
        (img) => !img.isDeleted,
      );
      submitData.append(
        "existingImages",
        JSON.stringify(remainingExistingImages),
      );

      const newImageAttributes = newFiles.map((file) => ({
        attribute_value_id: file.attribute_value_id || null,
        is_main: file.is_main === 1 || file.is_main === true ? 1 : 0,
      }));

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

  const colorGroup = attributeGroups.find((g) => g.name === "Tkanina i Kolor");
  const colorOptions =
    colorGroup?.values
      ?.filter((val) => selectedAttributes.some((a) => a.id === val.id))
      .map((val) => ({ id: val.id, name: val.value })) || [];

  const isPromoActive = parseFloat(formData.promotional_price) > 0;

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
                {/* ... (sekcje formularza bez zmian) ... */}
                <div className="form-section">
                  <h3>Podstawowe Informacje</h3>
                  <div className="form-group">
                    <label className="form-group__label">
                      Nazwa produktu *
                    </label>
                    <input
                      required
                      minLength={2} // <--- DODANO
                      maxLength={150} // <--- DODANO
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
                            subcategory_id: val ? val.value : "", // <--- ZMIANA: Wyciągamy samą liczbę (ID)
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row form-group--margin-top">
                    <div className="form-group">
                      <label className="form-group__label">
                        Cena Regularna (zł) *
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

                    <div className="form-group">
                      <label className="form-group__label">
                        Cena Promocyjna (zł) (opcjonalnie)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="form-group__input"
                        name="promotional_price"
                        value={formData.promotional_price}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-group__label">
                        Najniższa cena z 30 dni
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="form-group__input"
                        name="lowest_price_30_days"
                        value={formData.lowest_price_30_days}
                        onChange={handleInputChange}
                        disabled={!isPromoActive}
                        required={isPromoActive} // Uruchamia przeglądarkową walidację, gdy promo jest włączone!
                        style={{
                          backgroundColor: !isPromoActive
                            ? "rgba(0,0,0,0.05)"
                            : "transparent",
                          cursor: !isPromoActive ? "not-allowed" : "text",
                        }}
                      />
                      {isPromoActive && (
                        <small>Wymagane przez prawo (Omnibus).</small>
                      )}
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
                      maxLength={255}
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
                    maxFiles={MAX_IMAGES} // <--- PRZEKAZUJEMY LIMIT ZMIENNEJ
                    onFilesSelected={handleFilesSelected}
                    onFilesRejected={handleFilesRejected} // <--- ODBIERAMY BŁĘDY
                    onExistingImageRemove={handleExistingImageRemove}
                    onRestoreExistingImage={handleRestoreExistingImage}
                    onNewFileRemove={handleNewFileRemove}
                    backendUrl={BACKEND_URL}
                    colorOptions={colorOptions}
                    onSetMainImage={handleSetMainImage}
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
                      disabled={!formData.is_available}
                      style={{
                        cursor: !formData.is_available
                          ? "not-allowed"
                          : "pointer",
                      }}
                    />
                    <label
                      htmlFor="is_bestseller"
                      style={{
                        opacity: formData.is_available ? 1 : 0.5,
                        cursor: !formData.is_available
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
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

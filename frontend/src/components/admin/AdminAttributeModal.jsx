import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { attributeApi } from "../../utils/api";
import { X } from "lucide-react";
import CustomSelect from "../ui/CustomSelect";
import Button from "../ui/Button";
import { COLOR_FAMILIES } from "../../utils/colors";

import "../../styles/components/admin/admin-modal.scss";

const AdminAttributeModal = ({
  isOpen,
  onClose,
  onSuccess,
  showToast,
  rawGroups,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAttrData, setNewAttrData] = useState({
    group_id: "",
    value: "",
    color_hex: "",
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setNewAttrData({ group_id: "", value: "", color_hex: "" });
      setImageFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newAttrData.group_id) {
      showToast("Wybierz grupę atrybutów!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("group_id", newAttrData.group_id);
      formData.append("value", newAttrData.value);

      if (newAttrData.color_hex) {
        formData.append("color_hex", newAttrData.color_hex);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await attributeApi.createValue(formData);
      onSuccess();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Błąd dodawania atrybutu.",
        "error",
      );
      setIsSubmitting(false);
    }
  };

  const isColorGroupSelected = () => {
    if (!newAttrData.group_id) return false;
    const selectedGroup = rawGroups.find((g) => g.id === newAttrData.group_id);
    return selectedGroup && selectedGroup.name.toLowerCase().includes("kolor");
  };

  const modalContent = (
    <div className="admin-modal-overlay">
      <div className="admin-modal admin-modal--small">
        <div className="admin-modal__header">
          <h2>Nowa Wartość Atrybutu</h2>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form className="admin-modal__form-wrapper" onSubmit={handleAddSubmit}>
          <div className="admin-modal__body">
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
                    color_hex: "",
                  }));
                  setImageFile(null);
                }}
                placeholder="np. Tkanina i Kolor"
              />
            </div>

            <div className="form-group form-group--margin-top">
              <label className="form-group__label">Wartość Atrybutu *</label>
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

            {isColorGroupSelected() && (
              <>
                <div className="form-group form-group--margin-top">
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
                  <small className="form-group__help-text">
                    Pozwoli klientom wyszukać ten materiał po bazowym kolorze.
                  </small>
                </div>

                <div className="form-group form-group--margin-top">
                  <label className="form-group__label">
                    Zdjęcie / Próbka tkaniny (Opcjonalnie)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="form-group__input form-group__input--file"
                  />
                  {imageFile && (
                    <div className="image-preview-wrap">
                      <img src={URL.createObjectURL(imageFile)} alt="Podgląd" />
                      <small>{imageFile.name}</small>
                    </div>
                  )}
                </div>
              </>
            )}
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
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Dodaj
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AdminAttributeModal;

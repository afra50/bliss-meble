import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Trash2, X, RotateCcw } from "lucide-react"; // DODAJ RotateCcw
import CustomSelect from "./CustomSelect"; // NOWOŚĆ: Import CustomSelect
import "../../styles/components/ui/image-upload-zone.scss";

const ImageUploadZone = ({
  existingImages = [],
  newFiles = [],
  onFilesSelected,
  onExistingImageRemove,
  onRestoreExistingImage, // <--- ODBIERZ TEN PROP
  onNewFileRemove,
  backendUrl,
  maxFiles = 10,
  colorOptions = [],
  onNewFileAttributeChange,
  onExistingFileAttributeChange,
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          attribute_value_id: null,
        }),
      );
      onFilesSelected(filesWithPreview);
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: maxFiles,
  });

  useEffect(() => {
    return () => newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [newFiles]);

  // NOWOŚĆ: Formatowanie opcji dla CustomSelect
  const formattedColorOptions = [
    { value: "", label: "Zdjęcie ogólne" },
    ...colorOptions.map((opt) => ({ value: opt.id, label: opt.name })),
  ];

  return (
    <div className="image-upload-wrapper">
      <div
        {...getRootProps()}
        className={`image-upload-zone ${isDragActive ? "is-dragover" : ""}`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={40} className="upload-icon" />
        <p>Przeciągnij i upuść zdjęcia tutaj</p>
        <small>lub kliknij, aby wybrać pliki (JPG, PNG, WEBP)</small>
      </div>

      {(existingImages.length > 0 || newFiles.length > 0) && (
        <div className="image-gallery">
          {/* STARE ZDJĘCIA */}
          {existingImages.map((img) => (
            // ZMIANA: Klasa is-deleted wpływająca na cały kafelek
            <div
              key={img.id}
              className={`image-gallery__item ${img.isDeleted ? "is-deleted" : ""}`}
            >
              <div
                className={`image-gallery__img-wrap ${img.is_main ? "is-main" : ""}`}
              >
                <img
                  src={`${backendUrl}/uploads/products/${img.url}`}
                  alt="Zapisane"
                />

                {/* ZMIANA: Warunkowe wyświetlanie Kosza lub Przycisku Przywróć */}
                {!img.isDeleted ? (
                  <div
                    className="delete-overlay"
                    onClick={() => onExistingImageRemove(img.id)}
                  >
                    <Trash2 size={24} />
                  </div>
                ) : (
                  <div
                    className="restore-overlay"
                    onClick={() => onRestoreExistingImage(img.id)}
                  >
                    <RotateCcw size={24} />
                    <span>Przywróć</span>
                  </div>
                )}

                {img.attribute_value_id && !img.isDeleted && (
                  <div className="image-gallery__badge">Przypisano kolor</div>
                )}
              </div>

              {colorOptions.length > 0 && (
                <div className="image-gallery__select-wrapper">
                  <CustomSelect
                    variant="mini"
                    options={formattedColorOptions}
                    value={img.attribute_value_id || ""}
                    onChange={(selectedOption) =>
                      onExistingFileAttributeChange(
                        img.id,
                        selectedOption ? selectedOption.value : "",
                      )
                    }
                    placeholder="Wybierz..."
                  />
                </div>
              )}
            </div>
          ))}
          {/* NOWE ZDJĘCIA */}
          {newFiles.map((file, index) => (
            <div key={index} className="image-gallery__item">
              <div className="image-gallery__img-wrap">
                <img src={file.preview} alt="Podgląd" />
                <div
                  className="delete-overlay"
                  onClick={() => onNewFileRemove(file)}
                >
                  <X size={24} />
                </div>
              </div>

              {/* ZMIANA NA CustomSelect */}
              {colorOptions.length > 0 && (
                <div className="image-gallery__select-wrapper">
                  <CustomSelect
                    variant="mini"
                    options={formattedColorOptions}
                    value={file.attribute_value_id || ""}
                    onChange={(selectedOption) =>
                      onNewFileAttributeChange(
                        file,
                        selectedOption ? selectedOption.value : "",
                      )
                    }
                    placeholder="Wybierz..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;

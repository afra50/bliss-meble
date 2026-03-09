import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Trash2, X, RotateCcw, Star } from "lucide-react";
import CustomSelect from "./CustomSelect";
import "../../styles/components/ui/image-upload-zone.scss";

// Maksymalna waga pliku to 5MB (zgodnie z Multerem na backendzie)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ImageUploadZone = ({
  existingImages = [],
  newFiles = [],
  onFilesSelected,
  onFilesRejected, // <--- NOWY PROP (do błędów)
  onExistingImageRemove,
  onRestoreExistingImage,
  onSetMainImage,
  onNewFileRemove,
  backendUrl,
  maxFiles = 10,
  colorOptions = [],
  onNewFileAttributeChange,
  onExistingFileAttributeChange,
}) => {
  // Obliczamy ile plików faktycznie mamy, by wiedzieć ile slotów zostało
  const activeExistingCount = existingImages.filter(
    (img) => !img.isDeleted,
  ).length;
  const currentTotal = activeExistingCount + newFiles.length;
  const remainingSlots = maxFiles - currentTotal;

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      // 1. Zabezpieczenie limitu ilości zdjęć
      if (acceptedFiles.length > 0) {
        if (acceptedFiles.length > remainingSlots) {
          // Ucinamy tablicę do dostępnego miejsca
          const allowedFiles = acceptedFiles.slice(0, remainingSlots);
          const filesWithPreview = allowedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
              attribute_value_id: null,
            }),
          );
          onFilesSelected(filesWithPreview);

          if (onFilesRejected) {
            onFilesRejected(
              `Możesz dodać jeszcze tylko ${remainingSlots} zdjęć. Reszta została odrzucona.`,
            );
          }
        } else {
          // Wszystko się mieści
          const filesWithPreview = acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
              attribute_value_id: null,
            }),
          );
          onFilesSelected(filesWithPreview);
        }
      }

      // 2. Obsługa plików odrzuconych z powodu formatu lub wielkości (powyżej 5MB)
      if (fileRejections.length > 0 && onFilesRejected) {
        const isTooLarge = fileRejections.some((rejection) =>
          rejection.errors.some((error) => error.code === "file-too-large"),
        );

        if (isTooLarge) {
          onFilesRejected(
            `Jedno lub więcej zdjęć przekracza limit wagi (Maks. 5 MB).`,
          );
        } else {
          onFilesRejected("Odrzucono niektóre pliki (nieprawidłowy format).");
        }
      }
    },
    [onFilesSelected, onFilesRejected, remainingSlots],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: maxFiles,
    maxSize: MAX_FILE_SIZE_BYTES, // <--- NOWOŚĆ: Walidacja rozmiaru na froncie
    disabled: remainingSlots <= 0, // <--- NOWOŚĆ: Blokujemy strefę, jeśli nie ma miejsc
  });

  useEffect(() => {
    return () => newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [newFiles]);

  const formattedColorOptions = [
    { value: "", label: "Zdjęcie ogólne" },
    ...colorOptions.map((opt) => ({ value: opt.id, label: opt.name })),
  ];

  return (
    <div className="image-upload-wrapper">
      <div
        {...getRootProps()}
        className={`image-upload-zone ${isDragActive ? "is-dragover" : ""} ${remainingSlots <= 0 ? "is-disabled" : ""}`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={40} className="upload-icon" />

        {/* ZMIANA: Dynamiczny komunikat, jeśli zabraknie miejsca */}
        {remainingSlots <= 0 ? (
          <>
            <p style={{ color: "#dc2626" }}>
              Osiągnięto limit zdjęć ({maxFiles})
            </p>
            <small>Usuń jakieś zdjęcie z galerii, aby dodać nowe.</small>
          </>
        ) : (
          <>
            <p>Przeciągnij i upuść zdjęcia tutaj</p>
            <small>
              lub kliknij, aby wybrać pliki (Max 5 MB, pozostało:{" "}
              {remainingSlots})
            </small>
          </>
        )}
      </div>

      {(existingImages.length > 0 || newFiles.length > 0) && (
        <div className="image-gallery">
          {/* STARE ZDJĘCIA */}
          {existingImages.map((img) => (
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

                {!img.isDeleted ? (
                  <div className="image-action-buttons">
                    <div
                      className={`action-btn star-btn ${img.is_main ? "is-active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetMainImage("existing", img.id);
                      }}
                      title="Ustaw jako główne"
                    >
                      <Star
                        size={18}
                        fill={img.is_main ? "currentColor" : "none"}
                      />
                    </div>
                    <div
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExistingImageRemove(img.id);
                      }}
                      title="Usuń zdjęcie"
                    >
                      <Trash2 size={18} />
                    </div>
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
              <div
                className={`image-gallery__img-wrap ${file.is_main ? "is-main" : ""}`}
              >
                <img src={file.preview} alt="Podgląd" />

                <div className="image-action-buttons">
                  <div
                    className={`action-btn star-btn ${file.is_main ? "is-active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetMainImage("new", file.preview);
                    }}
                    title="Ustaw jako główne"
                  >
                    <Star
                      size={18}
                      fill={file.is_main ? "currentColor" : "none"}
                    />
                  </div>
                  <div
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewFileRemove(file);
                    }}
                    title="Usuń zdjęcie"
                  >
                    <X size={18} />
                  </div>
                </div>
              </div>

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

import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Trash2, X, RotateCcw, Star } from "lucide-react"; // ZMIANA IMPORTU
import CustomSelect from "./CustomSelect";
import "../../styles/components/ui/image-upload-zone.scss";

const ImageUploadZone = ({
  existingImages = [],
  newFiles = [],
  onFilesSelected,
  onExistingImageRemove,
  onRestoreExistingImage,
  onSetMainImage, // <--- NOWY PROP
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

                {/* ZMIANA: Panel z ikonami Kosza i Gwiazdki */}
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

                {/* ZMIANA: Panel z ikonami Kosza i Gwiazdki */}
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

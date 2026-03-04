// Plik: src/components/ui/ImageUploadZone.jsx
import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Trash2, X } from "lucide-react";
import "../../styles/components/ui/image-upload-zone.scss"; // Nowy plik SCSS

const ImageUploadZone = ({
  existingImages = [],
  newFiles = [],
  onFilesSelected,
  onExistingImageRemove,
  onNewFileRemove,
  backendUrl,
  maxFiles = 10,
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
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

  // Czyszczenie URLi do podglądu z pamięci przeglądarki (memory leak prevention)
  useEffect(() => {
    return () => newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [newFiles]);

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
          {/* Wyświetlanie zdjęć z serwera */}
          {existingImages.map((img) => (
            <div
              key={img.id}
              className={`image-gallery__item ${img.is_main ? "is-main" : ""}`}
            >
              <img
                src={`${backendUrl}/uploads/products/${img.url}`}
                alt="Zapisane"
              />
              <div
                className="delete-overlay"
                onClick={() => onExistingImageRemove(img.id)}
              >
                <Trash2 size={24} />
              </div>
            </div>
          ))}

          {/* Wyświetlanie nowych plików z dysku użytkownika */}
          {newFiles.map((file, index) => (
            <div key={index} className="image-gallery__item">
              <img src={file.preview} alt="Podgląd" />
              <div
                className="delete-overlay"
                onClick={() => onNewFileRemove(file)}
              >
                <X size={24} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;

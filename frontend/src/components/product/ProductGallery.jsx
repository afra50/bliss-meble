import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import defaultImg from "../../assets/default-product.jpg";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import "../../styles/components/product/product-gallery.scss";

// Komponent przyjmuje tablicę odfiltrowanych obrazków i to, czy produkt jest nowością/bestsellerem
const ProductGallery = ({
  images,
  productName,
  isNew,
  isBestseller,
  getImageUrl,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Trik: jeśli dostajemy pustą tablicę, sztucznie tworzymy jedną pozycję na podstawie defaultImg
  const displayImages = images?.length > 0 ? images : [{ url: null }];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1,
    );
  };

  const lightboxSlides = displayImages.map((img) => ({
    src: getImageUrl(img.url),
  }));

  const currentImage = getImageUrl(displayImages[activeImageIndex]?.url);

  return (
    <section className="product-gallery">
      <div
        className="product-gallery__main"
        onClick={() => setIsLightboxOpen(true)}
      >
        <div className="product-gallery__badges">
          {isNew && <span className="badge badge--new">Nowość</span>}
          {isBestseller && (
            <span className="badge badge--bestseller">Bestseller</span>
          )}
        </div>

        <img
          key={activeImageIndex} // Do animacji fadeIn
          src={currentImage}
          alt={productName}
          onError={(e) => {
            e.target.src = defaultImg;
          }}
        />

        {displayImages.length > 1 && (
          <>
            <button
              className="gallery-arrow gallery-arrow--left"
              onClick={handlePrevImage}
            >
              <FaChevronLeft />
            </button>
            <button
              className="gallery-arrow gallery-arrow--right"
              onClick={handleNextImage}
            >
              <FaChevronRight />
            </button>
          </>
        )}
      </div>

      {displayImages.length > 1 && (
        <div className="product-gallery__thumbnails">
          {displayImages.map((img, index) => (
            <button
              key={img.id || index}
              className={`thumbnail-btn ${
                activeImageIndex === index ? "active" : ""
              }`}
              onClick={() => setActiveImageIndex(index)}
            >
              <img
                src={getImageUrl(img.url)}
                alt={`${productName} - miniatura`}
                onError={(e) => {
                  e.target.src = defaultImg;
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox dla tego konkretnego produktu */}
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        index={activeImageIndex}
        slides={lightboxSlides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3 }}
      />
    </section>
  );
};

export default ProductGallery;

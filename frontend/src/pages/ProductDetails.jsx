import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../utils/api";
import { formatPrice } from "../utils/formatPrice";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import ToastAlert from "../components/ui/ToastAlert";
import NotFound from "./NotFound";
import {
  FaShoppingCart,
  FaTruck,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa"; // Usunięto FaExpandArrowsAlt
import defaultImg from "../assets/default-product.jpg";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import "../styles/pages/product-details.scss";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const isProductNew = (createdAt) => {
    if (!createdAt) return false;
    const addedDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return addedDate >= thirtyDaysAgo;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await productApi.getBySlug(slug);
        setProduct(response.data);

        if (response.data.images && response.data.images.length > 0) {
          const mainIndex = response.data.images.findIndex(
            (img) => img.is_main === 1,
          );
          setActiveImageIndex(mainIndex !== -1 ? mainIndex : 0);
        }
      } catch (err) {
        console.error("Błąd ładowania produktu:", err);
        setError(err.response?.status === 404 ? 404 : 500);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const getImageUrl = (url) => {
    if (!url) return defaultImg;
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}/uploads/products/${url}`;
  };

  const sizes =
    product?.attributes?.filter((a) =>
      a.group_name.toLowerCase().includes("rozmiar"),
    ) || [];
  const fabrics =
    product?.attributes?.filter(
      (a) =>
        a.group_name.toLowerCase().includes("tkanina") ||
        a.group_name.toLowerCase().includes("materiał"),
    ) || [];

  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    if (fabrics.length > 0 && !selectedFabric) setSelectedFabric(fabrics[0]);
  }, [sizes, fabrics, selectedSize, selectedFabric]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    let price = Number(product.price_brut);

    if (selectedSize?.price_modifier)
      price += Number(selectedSize.price_modifier);
    if (selectedFabric?.price_modifier)
      price += Number(selectedFabric.price_modifier);

    return price * quantity;
  }, [product, selectedSize, selectedFabric, quantity]);

  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: finalPrice / quantity,
      quantity,
      size: selectedSize?.value || null,
      fabric: selectedFabric?.value || null,
      image: product.images?.length
        ? getImageUrl(product.images[activeImageIndex].url)
        : defaultImg,
    };

    setAlertMessage(`Dodano ${quantity}x "${product.name}" do koszyka.`);
    setIsAlertOpen(true);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  if (isLoading)
    return <Loader fullPage message="Trwa ładowanie produktu..." />;
  if (error || !product) return <NotFound />;

  const lightboxSlides = product.images?.length
    ? product.images.map((img) => ({ src: getImageUrl(img.url) }))
    : [{ src: defaultImg }];

  return (
    <main className="product-details">
      <div className="product-details__container">
        <ToastAlert
          isOpen={isAlertOpen}
          message={alertMessage}
          type="success"
          onClose={() => setIsAlertOpen(false)}
        />

        <div className="product-details__breadcrumbs">
          <Breadcrumbs
            theme="dark"
            paths={[{ label: "Sklep", to: "/sklep" }, { label: product.name }]}
          />
        </div>

        <div className="product-details__grid">
          {/* GALERIA ZDJĘĆ */}
          <section className="product-gallery">
            <div
              className="product-gallery__main"
              onClick={() => setIsLightboxOpen(true)}
            >
              <div className="product-gallery__badges">
                {isProductNew(product.created_at) && (
                  <span className="badge badge--new">Nowość</span>
                )}
                {product.is_bestseller === 1 && (
                  <span className="badge badge--bestseller">Bestseller</span>
                )}
              </div>

              <img
                key={activeImageIndex}
                src={
                  product.images?.length
                    ? getImageUrl(product.images[activeImageIndex].url)
                    : defaultImg
                }
                alt={product.name}
                onError={(e) => {
                  e.target.src = defaultImg;
                }}
              />

              {product.images?.length > 1 && (
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

            {product.images && product.images.length > 1 && (
              <div className="product-gallery__thumbnails">
                {product.images.map((img, index) => (
                  <button
                    key={img.id}
                    className={`thumbnail-btn ${activeImageIndex === index ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={getImageUrl(img.url)}
                      alt={`${product.name} - miniatura`}
                      onError={(e) => {
                        e.target.src = defaultImg;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* INFORMACJE O PRODUKCIE */}
          <section className="product-info">
            <h1 className="product-info__title">{product.name}</h1>

            <div className="product-info__price-wrapper">
              <p className="product-info__price" key={finalPrice}>
                {formatPrice(finalPrice)} zł
              </p>
            </div>

            <p className="product-info__short-desc">
              {product.short_description}
            </p>

            {sizes.length > 0 && (
              <div className="product-options">
                <h3 className="product-options__title">Wybierz rozmiar:</h3>
                <div className="product-options__group">
                  {sizes.map((size) => (
                    <button
                      key={size.value_id}
                      className={`option-btn ${selectedSize?.value_id === size.value_id ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size.value}
                      {Number(size.price_modifier) > 0 && (
                        <span className="modifier">
                          (+{formatPrice(size.price_modifier)} zł)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {fabrics.length > 0 && (
              <div className="product-options">
                <h3 className="product-options__title">Wybierz tkaninę:</h3>
                <div className="product-options__group">
                  {fabrics.map((fabric) => (
                    <button
                      key={fabric.value_id}
                      className={`option-btn ${selectedFabric?.value_id === fabric.value_id ? "active" : ""}`}
                      onClick={() => setSelectedFabric(fabric)}
                    >
                      {fabric.value}
                      {Number(fabric.price_modifier) > 0 && (
                        <span className="modifier">
                          (+{formatPrice(fabric.price_modifier)} zł)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  -
                </button>
                <span key={quantity} className="quantity-display">
                  {quantity}
                </span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>

              <Button
                variant="primary"
                className="add-to-cart-btn"
                onClick={handleAddToCart}
              >
                <FaShoppingCart style={{ marginRight: "8px" }} /> Dodaj do
                koszyka
              </Button>
            </div>

            <div className="product-trust">
              <div className="trust-item">
                <FaTruck /> <span>Darmowa dostawa od 3000 zł</span>
              </div>
              <div className="trust-item">
                <FaShieldAlt /> <span>2 lata gwarancji producenta</span>
              </div>
            </div>

            <div className="product-description">
              <h3>Opis produktu</h3>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </section>
        </div>
      </div>

      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        index={activeImageIndex}
        slides={lightboxSlides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3 }}
      />
    </main>
  );
};

export default ProductDetails;

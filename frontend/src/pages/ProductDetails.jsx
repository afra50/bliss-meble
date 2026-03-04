import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../utils/api";
import { formatPrice } from "../utils/formatPrice";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import { FaShoppingCart, FaTruck, FaShieldAlt } from "react-icons/fa";
import defaultImg from "../assets/default-product.jpg";
import "../styles/pages/product-details.scss";

// Pomocnicza stała do budowania URL zdjęć z bazy
const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stany komponentu
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // ---> NOWA FUNKCJA DO SPRAWDZANIA DATY <---
  const isProductNew = (createdAt) => {
    if (!createdAt) return false;
    const addedDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return addedDate >= thirtyDaysAgo;
  };

  // Pobieranie produktu
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await productApi.getBySlug(slug);
        setProduct(response.data);

        // Ustawiamy zdjęcie główne (szukamy tego z flagą is_main lub bierzemy pierwsze z brzegu)
        // Jeśli obiekt NIE MA żadnych zdjęć w ogóle, wrzucamy domyślne od razu.
        if (response.data.images && response.data.images.length > 0) {
          const mainImgObj =
            response.data.images.find((img) => img.is_main === 1) ||
            response.data.images[0];
          setMainImage(`${BACKEND_URL}/uploads/products/${mainImgObj.url}`);
        } else {
          setMainImage(defaultImg);
        }
      } catch (err) {
        console.error("Błąd ładowania produktu:", err);
        setError(
          err.response?.status === 404
            ? "Nie znaleziono takiego produktu."
            : "Wystąpił błąd serwera.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Pomocnicza funkcja do wyświetlania bezpiecznego URL zdjęcia
  const getImageUrl = (url) => {
    if (!url) return defaultImg; // Jeśli url pusty - wrzuć domyślne
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}/uploads/products/${url}`;
  };

  // Grupowanie atrybutów pobranych z bazy
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

  // Automatyczne zaznaczanie pierwszych atrybutów po pobraniu danych
  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    if (fabrics.length > 0 && !selectedFabric) setSelectedFabric(fabrics[0]);
  }, [sizes, fabrics, selectedSize, selectedFabric]);

  // Obliczanie finalnej ceny na podstawie wariantu
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    let price = Number(product.price_brut);

    // Dodajemy ewentualne modyfikatory ceny z wybranego rozmiaru i tkaniny
    if (selectedSize?.price_modifier)
      price += Number(selectedSize.price_modifier);
    if (selectedFabric?.price_modifier)
      price += Number(selectedFabric.price_modifier);

    return price * quantity;
  }, [product, selectedSize, selectedFabric, quantity]);

  // Obsługa dodawania do koszyka
  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: finalPrice / quantity, // Cena za sztukę w danym wariancie
      quantity,
      size: selectedSize?.value || null,
      fabric: selectedFabric?.value || null,
      image: mainImage,
    };
    console.log("Dodano do koszyka:", itemToAdd);
    // Tutaj w przyszłości wywołasz funkcję z CartContext np. addToCart(itemToAdd)
  };

  // EKRANY ŁADOWANIA I BŁĘDU
  if (isLoading)
    return <Loader fullPage message="Trwa przygotowywanie produktu..." />;
  if (error || !product) {
    return (
      <div style={{ marginTop: "100px" }}>
        <ErrorState
          message={error || "Nie znaleziono produktu"}
          onRetry={() => navigate("/sklep")}
        />
      </div>
    );
  }

  // --- RENDEROWANIE ---
  return (
    <main className="product-details">
      <div className="product-details__container">
        <div className="product-details__breadcrumbs">
          {/* Dynamiczna ścieżka do produktu */}
          <Breadcrumbs
            theme="dark"
            paths={[{ label: "Sklep", to: "/sklep" }, { label: product.name }]}
          />
        </div>

        <div className="product-details__grid">
          {/* LEWA STRONA: GALERIA ZDJĘĆ */}
          <section className="product-gallery">
            <div className="product-gallery__main">
              {/* KONTENER NA PLAKIETKI, ŻEBY SIĘ NIE NAKŁADAŁY */}
              <div className="product-gallery__badges">
                {isProductNew(product.created_at) && (
                  <span className="badge badge--new">Nowość</span>
                )}
                {product.is_bestseller === 1 && (
                  <span className="badge badge--bestseller">Bestseller</span>
                )}
                {!product.is_available && (
                  <span className="badge badge--unavailable">Niedostępny</span>
                )}
              </div>
              <img
                src={mainImage}
                alt={product.name}
                // ZMIANA: Obsługa bledu ładowania głownego obrazka
                onError={(e) => {
                  e.target.src = defaultImg;
                }}
              />
            </div>

            {/* Miniaturki generowane tylko jeśli produkt ma więcej niż 1 zdjęcie */}
            {product.images && product.images.length > 1 && (
              <div className="product-gallery__thumbnails">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    className={`thumbnail-btn ${mainImage === getImageUrl(img.url) ? "active" : ""}`}
                    onClick={() => setMainImage(getImageUrl(img.url))}
                  >
                    <img
                      src={getImageUrl(img.url)}
                      alt={`${product.name} - miniatura`}
                      // ZMIANA: Obsługa bledu ładowania miniatury
                      onError={(e) => {
                        e.target.src = defaultImg;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* PRAWA STRONA: INFORMACJE O PRODUKCIE */}
          <section className="product-info">
            <h1 className="product-info__title">{product.name}</h1>
            <p className="product-info__price">{formatPrice(finalPrice)} zł</p>
            <p className="product-info__short-desc">
              {product.short_description}
            </p>

            {/* WYBÓR ROZMIARU (Jeśli istnieje) */}
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

            {/* WYBÓR MATERIAŁU/TKANINY (Jeśli istnieje) */}
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

            {/* AKCJE: ILOŚĆ + DO KOSZYKA */}
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  -
                </button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>

              <Button
                variant="primary"
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.is_available}
              >
                <FaShoppingCart style={{ marginRight: "8px" }} />
                {product.is_available
                  ? "Dodaj do koszyka"
                  : "Produkt niedostępny"}
              </Button>
            </div>

            {/* ZAUFANIE (Trust badges) */}
            <div className="product-trust">
              <div className="trust-item">
                <FaTruck /> <span>Darmowa dostawa od 3000 zł</span>
              </div>
              <div className="trust-item">
                <FaShieldAlt /> <span>2 lata gwarancji producenta</span>
              </div>
            </div>

            {/* DŁUGI OPIS (z bazy z tagami HTML) */}
            <div className="product-description">
              <h3>Opis produktu</h3>
              {/* Używamy dangerouslySetInnerHTML bo letni edytor Admina może zapisywać np. pogrubienia <p><b>... */}
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;

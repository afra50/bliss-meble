import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { productApi } from "../utils/api";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Loader from "../components/ui/Loader";
import NotFound from "./NotFound";
import ErrorState from "../components/ui/ErrorState"; // DODANE

// Nasze małe komponenty
import QuantitySelector from "../components/ui/QuantitySelector";
import AddToCartButton from "../components/ui/AddToCartButton";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductOptions from "../components/product/ProductOptions";
import ProductReviews from "../components/product/ProductReviews";

import defaultImg from "../assets/default-product.jpg";
import "../styles/pages/product-details.scss";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

// TYMCZASOWE DANE (Mockup)
const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Katarzyna W.",
    date: "12 Marzec 2026",
    rating: 5,
    content: "Łóżko jest przepiękne...",
  },
  {
    id: 2,
    author: "Michał P.",
    date: "05 Luty 2026",
    rating: 4,
    content: "Bardzo wygodny materac...",
  },
  {
    id: 3,
    author: "Anna K.",
    date: "28 Styczeń 2026",
    rating: 5,
    content: "Świetny stosunek...",
  },
];

const ProductDetails = () => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productApi.getBySlug(slug);
      setProduct(response.data);
    } catch (err) {
      console.error("Błąd ładowania produktu:", err);
      if (!err.response) {
        setError("network_error");
      } else {
        setError(err.response.status === 404 ? 404 : 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  // ==========================================
  // STAN WIDOKÓW
  // ==========================================

  // 1. Ładowanie (ZMIANA: Nie ma fullPage i jest owinięte w układ strony)
  if (isLoading) {
    return (
      <main
        className="product-details"
        style={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader message="Trwa ładowanie produktu..." />
      </main>
    );
  }

  // 2. Błąd serwera / sieci
  if (error === "network_error" || error === 500) {
    return (
      <main
        className="product-details"
        style={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ErrorState
          message={
            error === "network_error"
              ? "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."
              : "Wystąpił nieoczekiwany problem z serwerem."
          }
          onRetry={fetchProduct}
        />
      </main>
    );
  }

  // 3. Błąd 404 lub brak produktu
  if (error === 404 || (!product && !isLoading && !error)) {
    return <NotFound />;
  }

  // ==========================================
  // WYLICZENIA TYLKO GDY PRODUKT ISTNIEJE
  // ==========================================

  const getImageUrl = (url) => {
    if (!url) return defaultImg;
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}/uploads/products/${url}`;
  };

  const isProductNew = (createdAt) => {
    if (!createdAt) return false;
    const addedDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return addedDate >= thirtyDaysAgo;
  };

  const sizes =
    product.attributes
      ?.filter((a) => a.group_name.toLowerCase().includes("rozmiar"))
      .sort((a, b) => Number(a.price_modifier) - Number(b.price_modifier)) ||
    [];

  const fabrics =
    product.attributes
      ?.filter(
        (a) =>
          a.group_name.toLowerCase().includes("tkanina") ||
          a.group_name.toLowerCase().includes("materiał"),
      )
      .sort((a, b) => Number(a.price_modifier) - Number(b.price_modifier)) ||
    [];

  // Inicjalne ustawienie domyślnych wariantów (Używamy useMemo dla wydajności zamiast useEffect w tym przypadku)
  if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
  if (fabrics.length > 0 && !selectedFabric) setSelectedFabric(fabrics[0]);

  // Używamy zwykłych zmiennych (to szybkie operacje tablicowe), a omijamy problemowe useMemo w hookach
  let filteredImages = product.images || [];
  if (selectedFabric) {
    const filtered = product.images.filter(
      (img) =>
        img.attribute_value_id === selectedFabric.value_id ||
        img.attribute_value_id === null,
    );
    if (filtered.length > 0) filteredImages = filtered;
  }

  // Wyliczanie cen
  const baseRegularPrice = Number(product.price_brut);
  const isPromoActive =
    product.promotional_price && Number(product.promotional_price) > 0;
  const baseCurrentPrice = isPromoActive
    ? Number(product.promotional_price)
    : baseRegularPrice;

  let modifiersTotal = 0;
  if (selectedSize?.price_modifier)
    modifiersTotal += Number(selectedSize.price_modifier);
  if (selectedFabric?.price_modifier)
    modifiersTotal += Number(selectedFabric.price_modifier);

  const baseOmnibus = product.lowest_price_30_days
    ? Number(product.lowest_price_30_days)
    : null;
  const finalOmnibus =
    baseOmnibus !== null ? baseOmnibus + modifiersTotal : null;

  const pricing = {
    current: (baseCurrentPrice + modifiersTotal) * quantity,
    regular: (baseRegularPrice + modifiersTotal) * quantity,
    isPromo: isPromoActive,
    omnibusPrice: finalOmnibus,
    savings: isPromoActive
      ? (baseRegularPrice - baseCurrentPrice) * quantity
      : 0,
  };

  // Wyliczanie opinii
  const reviews = MOCK_REVIEWS;
  const totalReviews = reviews.length;
  let reviewsData = {
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    list: [],
  };

  if (totalReviews > 0) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      distribution[r.rating] += 1;
      sum += r.rating;
    });
    const average = (sum / totalReviews).toFixed(1);
    reviewsData = {
      average: Number(average),
      total: totalReviews,
      distribution,
      list: reviews,
    };
  }

  const currentMainImage =
    filteredImages.length > 0 ? getImageUrl(filteredImages[0].url) : defaultImg;
  return (
    <main className="product-details">
      <div className="product-details__container">
        <div className="product-details__breadcrumbs">
          <Breadcrumbs
            theme="dark"
            paths={[{ label: "Sklep", to: "/sklep" }, { label: product.name }]}
          />
        </div>

        <div className="product-details__grid">
          <ProductGallery
            images={filteredImages}
            productName={product.name}
            isNew={isProductNew(product.created_at)}
            isBestseller={product.is_bestseller === 1}
            getImageUrl={getImageUrl}
          />

          {/* NOWOŚĆ: Przekazujemy rating i reviewsCount w dół do ProductInfo */}
          <ProductInfo
            product={product}
            pricing={pricing} // <--- PRZEKAZUJEMY NOWY OBIEKT!
            rating={reviewsData.average}
            reviewsCount={reviewsData.total}
          >
            <ProductOptions
              sizes={sizes}
              fabrics={fabrics}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedFabric={selectedFabric}
              setSelectedFabric={setSelectedFabric}
            />

            <div className="product-actions">
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                max={99}
              />
              <AddToCartButton
                product={product}
                quantity={quantity}
                price={pricing.current / quantity}
                regularPrice={pricing.regular / quantity}
                omnibusPrice={pricing.omnibusPrice} // <--- TEGO BRAKOWAŁO W TWOIM KODZIE WYŻEJ
                size={selectedSize}
                fabric={selectedFabric}
                image={currentMainImage}
                className="add-to-cart-btn"
              />
            </div>
          </ProductInfo>
        </div>

        {/* NOWOŚĆ: Przekazujemy skompletowany pakiet opinii w dół do sekcji Reviews */}
        <ProductReviews
          reviews={reviewsData.list}
          averageRating={reviewsData.average}
          totalReviews={reviewsData.total}
          ratingDistribution={reviewsData.distribution}
        />
      </div>
    </main>
  );
};

export default ProductDetails;

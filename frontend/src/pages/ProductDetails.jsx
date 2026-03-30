import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { productApi, reviewApi } from "../utils/api";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Loader from "../components/ui/Loader";
import NotFound from "./NotFound";
import ErrorState from "../components/ui/ErrorState";

// Nasze małe komponenty
import QuantitySelector from "../components/ui/QuantitySelector";
import AddToCartButton from "../components/ui/AddToCartButton";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductOptions from "../components/product/ProductOptions";
import ProductReviews from "../components/product/ProductReviews";

import defaultImg from "../assets/default-product.jpg";
import "../styles/pages/product-details.scss";

import { CATEGORIES, SUBCATEGORIES } from "../utils/categories";

const ProductDetails = () => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Pobieramy produkt
      const response = await productApi.getBySlug(slug);
      const fetchedProduct = response.data;

      // --- NOWOŚĆ: Szukamy nazwy kategorii i dodajemy ją do produktu ---
      if (fetchedProduct && fetchedProduct.subcategory_id) {
        const foundSub = SUBCATEGORIES.find(
          (s) => Number(s.id) === Number(fetchedProduct.subcategory_id),
        );
        if (foundSub) {
          fetchedProduct.subcategory_name = foundSub.name;
          const foundCat = CATEGORIES.find(
            (c) => Number(c.id) === Number(foundSub.category_id),
          );
          if (foundCat) {
            fetchedProduct.category_name = foundCat.name;
          }
        }
      }
      // ----------------------------------------------------------------

      setProduct(fetchedProduct);

      // 2. Jeśli mamy produkt, od razu pobieramy jego zaakceptowane recenzje
      if (fetchedProduct && fetchedProduct.id) {
        const reviewsResponse = await reviewApi.getByProduct(fetchedProduct.id);
        setReviews(reviewsResponse.data);
      }
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
    fetchData();
  }, [slug]);

  // ==========================================
  // STAN WIDOKÓW
  // ==========================================

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
          onRetry={fetchData}
        />
      </main>
    );
  }

  if (error === 404 || (!product && !isLoading && !error)) {
    return <NotFound />;
  }

  // ==========================================
  // WYLICZENIA TYLKO GDY PRODUKT ISTNIEJE
  // ==========================================

  // ZMIANA: Nowa funkcja generująca pełny adres URL zdjęcia
  const getImageUrl = (url) => {
    if (!url) return defaultImg;
    if (url.startsWith("http")) return url;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${apiUrl}/uploads/products/${url}`;
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

  if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
  if (fabrics.length > 0 && !selectedFabric) setSelectedFabric(fabrics[0]);

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

    const formattedReviewsList = reviews.map((r) => ({
      ...r,
      date: new Date(r.date).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    }));

    reviewsData = {
      average: Number(average),
      total: totalReviews,
      distribution,
      list: formattedReviewsList,
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

          <ProductInfo
            product={product}
            pricing={pricing}
            rating={Number(product.average_rating) || 0}
            reviewsCount={Number(product.reviews_count) || 0}
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
                omnibusPrice={pricing.omnibusPrice}
                size={selectedSize}
                fabric={selectedFabric}
                image={currentMainImage}
                className="add-to-cart-btn"
              />
            </div>
          </ProductInfo>
        </div>

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

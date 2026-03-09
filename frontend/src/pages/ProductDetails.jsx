import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { productApi } from "../utils/api";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Loader from "../components/ui/Loader";
import NotFound from "./NotFound";

// Nasze małe komponenty
import QuantitySelector from "../components/ui/QuantitySelector";
import AddToCartButton from "../components/ui/AddToCartButton";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductOptions from "../components/product/ProductOptions";

import defaultImg from "../assets/default-product.jpg";
import "../styles/pages/product-details.scss";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const ProductDetails = () => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [quantity, setQuantity] = useState(1);

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
    product?.attributes
      ?.filter((a) => a.group_name.toLowerCase().includes("rozmiar"))
      .sort((a, b) => Number(a.price_modifier) - Number(b.price_modifier)) ||
    [];

  const fabrics =
    product?.attributes
      ?.filter(
        (a) =>
          a.group_name.toLowerCase().includes("tkanina") ||
          a.group_name.toLowerCase().includes("materiał"),
      )
      .sort((a, b) => Number(a.price_modifier) - Number(b.price_modifier)) ||
    [];

  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    if (fabrics.length > 0 && !selectedFabric) setSelectedFabric(fabrics[0]);
  }, [sizes, fabrics, selectedSize, selectedFabric]);

  const filteredImages = useMemo(() => {
    if (!product?.images) return [];
    if (selectedFabric) {
      const filtered = product.images.filter(
        (img) =>
          img.attribute_value_id === selectedFabric.value_id ||
          img.attribute_value_id === null,
      );
      if (filtered.length > 0) return filtered;
    }
    return product.images;
  }, [product?.images, selectedFabric]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    let price = Number(product.price_brut);

    if (selectedSize?.price_modifier)
      price += Number(selectedSize.price_modifier);
    if (selectedFabric?.price_modifier)
      price += Number(selectedFabric.price_modifier);

    return price * quantity;
  }, [product, selectedSize, selectedFabric, quantity]);

  if (isLoading)
    return <Loader fullPage message="Trwa ładowanie produktu..." />;
  if (error || !product) return <NotFound />;

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

          <ProductInfo product={product} finalPrice={finalPrice}>
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
                price={finalPrice / quantity}
                size={selectedSize}
                fabric={selectedFabric}
                image={currentMainImage}
                className="add-to-cart-btn"
              />
            </div>
          </ProductInfo>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;

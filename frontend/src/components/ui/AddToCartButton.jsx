import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import Button from "./Button";
import ToastAlert from "./ToastAlert";
import { useCart } from "../../context/CartContext";

const AddToCartButton = ({
  product,
  quantity = 1,
  price,
  regularPrice,
  omnibusPrice,
  size,
  fabric,
  side, // <--- NOWOŚĆ: Odbieramy stronę
  headrest,
  image,
  disabled = false,
  className = "",
  label = "Dodaj do koszyka",
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (disabled || !product) return;

    const itemToAdd = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: price || product.price_brut,
      regular_price: regularPrice || product.price_brut,
      omnibusPrice: omnibusPrice || null,
      quantity,
      size: size?.value || null,
      fabric: fabric?.value || null,
      side: side || null, // <--- NOWOŚĆ: Dodajemy stronę do koszyka
      headrest: headrest?.value || null,
      image: image,
      category_name: product.category_name || "Brak",
      subcategory_name: product.subcategory_name || "Brak",
    };

    addToCart(itemToAdd);

    const msg =
      quantity > 1
        ? `Dodano ${quantity}x "${product.name}" do koszyka.`
        : `Dodano "${product.name}" do koszyka.`;

    setAlertMessage(msg);
    setIsAlertOpen(true);
  };

  return (
    <>
      <ToastAlert
        isOpen={isAlertOpen}
        message={alertMessage}
        type="success"
        onClose={() => setIsAlertOpen(false)}
      />
      <Button
        variant="primary"
        className={className}
        onClick={handleAddToCart}
        disabled={disabled}
      >
        <FaShoppingCart style={{ marginRight: "8px" }} /> {label}
      </Button>
    </>
  );
};

export default AddToCartButton;

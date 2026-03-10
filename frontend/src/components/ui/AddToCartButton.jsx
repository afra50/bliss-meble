import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import Button from "./Button";
import ToastAlert from "./ToastAlert";
import { useCart } from "../../context/CartContext"; // <--- 1. IMPORT HOOKA

const AddToCartButton = ({
  product,
  quantity = 1,
  price,
  size,
  fabric,
  image,
  disabled = false,
  className = "",
  label = "Dodaj do koszyka",
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // 2. WYCIĄGAMY FUNKCJĘ Z CONTEXTU
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (disabled || !product) return;

    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: price || product.price_brut,
      quantity,
      size: size?.value || null,
      fabric: fabric?.value || null,
      image: image,
    };

    // 3. WYSYŁAMY OBIEKT DO GLOBALNEGO KOSZYKA
    addToCart(itemToAdd);

    // Dynamiczna wiadomość do Toasta
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

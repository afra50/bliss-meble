import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import Button from "./Button";
import ToastAlert from "./ToastAlert";

const AddToCartButton = ({
  product,
  quantity = 1,
  price,
  size,
  fabric,
  image,
  disabled = false,
  className = "",
  label = "Dodaj do koszyka", // Pozwala nadpisać tekst (np. "Kup teraz")
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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

    console.log("Dodano do koszyka:", itemToAdd);

    // Dynamiczna wiadomość
    const msg =
      quantity > 1
        ? `Dodano ${quantity}x "${product.name}" do koszyka.`
        : `Dodano "${product.name}" do koszyka.`;

    setAlertMessage(msg);
    setIsAlertOpen(true);

    // TUTAJ PÓŹNIEJ: wywołanie np. addToCart z Context API
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

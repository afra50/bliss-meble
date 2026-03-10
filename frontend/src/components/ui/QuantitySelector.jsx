import "../../styles/components/ui/quantity-selector.scss";

const QuantitySelector = ({ quantity, setQuantity, min = 1, max = 99 }) => {
  const handleDecrease = () => {
    // Obliczamy nową wartość i wysyłamy GOTOWĄ liczbę
    setQuantity(Math.max(min, quantity - 1));
  };

  const handleIncrease = () => {
    // Obliczamy nową wartość i wysyłamy GOTOWĄ liczbę
    setQuantity(Math.min(max, quantity + 1));
  };

  return (
    <div className="quantity-selector">
      <button onClick={handleDecrease} disabled={quantity <= min}>
        -
      </button>
      <span className="quantity-selector__display">{quantity}</span>
      <button onClick={handleIncrease} disabled={quantity >= max}>
        +
      </button>
    </div>
  );
};

export default QuantitySelector;

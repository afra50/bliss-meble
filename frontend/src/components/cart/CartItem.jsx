import React from "react";
import { FaTimes } from "react-icons/fa";
import { formatPrice } from "../../utils/formatPrice";
import QuantitySelector from "../ui/QuantitySelector";
import defaultImg from "../../assets/default-product.jpg";
import "../../styles/components/cart/cart-item.scss";

const CartItem = ({
  item,
  index,
  updateQuantity,
  removeFromCart,
  isCompact = false, // Tryb dla bocznego panelu
}) => {
  const handleQuantityChange = (newQty) => {
    if (updateQuantity) updateQuantity(index, newQty);
  };

  return (
    <div className={`cart-item ${isCompact ? "cart-item--compact" : ""}`}>
      {/* ZDJĘCIE */}
      <div className="cart-item__image">
        <img src={item.image || defaultImg} alt={item.name} />
      </div>

      {/* INFORMACJE O PRODUKCIE */}
      <div className="cart-item__info">
        <h4 className="cart-item__name">{item.name}</h4>

        <div className="cart-item__attributes">
          {item.fabric && (
            <p>
              <span>Kolor:</span> {item.fabric}
            </p>
          )}
          {item.size && (
            <p>
              <span>Rozmiar:</span> {item.size}
            </p>
          )}
        </div>

        {/* WIDOK KOMPAKTOWY: 1 x 2400,00 zł */}
        {isCompact && (
          <div className="cart-item__compact-price">
            <span className="qty">{item.quantity}</span>
            <span className="times"> × </span>
            <span className="price">{formatPrice(item.price)} zł</span>
          </div>
        )}
      </div>

      {/* KONTROLKI (Tylko dla dużego koszyka) */}
      {!isCompact && (
        <div className="cart-item__actions">
          <div className="cart-item__price-unit">
            {formatPrice(item.price)} zł
          </div>
          <div className="cart-item__qty">
            <QuantitySelector
              quantity={item.quantity}
              setQuantity={handleQuantityChange}
              max={99}
            />
          </div>
          <div className="cart-item__total">
            {formatPrice(item.price * item.quantity)} zł
          </div>
        </div>
      )}

      {/* PRZYCISK USUWANIA (X w prawym górnym rogu) */}
      <button
        className="cart-item__remove"
        onClick={() => removeFromCart(index)}
        title="Usuń z koszyka"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default CartItem;

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import CartItem from "./CartItem";
import Button from "../ui/Button";
import { formatPrice } from "../../utils/formatPrice";
import "../../styles/components/cart/mini-cart.scss";

const MiniCart = ({ isOpen, onClose }) => {
  // ZMIANA: Wyciągamy cartTotalSavings z naszego zaktualizowanego kontekstu
  const { cartItems, removeFromCart, cartTotal, cartTotalSavings } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    onClose();
    navigate("/zamowienie");
  };

  const content = (
    <div className="mini-cart-overlay" onClick={onClose}>
      <div
        className={`mini-cart ${isOpen ? "mini-cart--open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mini-cart__header">
          <h3>Koszyk</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes /> Zamknij
          </button>
        </div>

        <div className="mini-cart__body">
          {cartItems.length === 0 ? (
            <div className="mini-cart__empty">
              <p>Twój koszyk jest pusty.</p>
              <Button variant="primary" onClick={onClose}>
                Wróć do sklepu
              </Button>
            </div>
          ) : (
            <div className="mini-cart__items">
              {cartItems.map((item, index) => (
                <CartItem
                  key={`${item.id}-${item.size}-${item.fabric}`}
                  item={item}
                  index={index}
                  removeFromCart={removeFromCart}
                  isCompact={true}
                />
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="mini-cart__footer">
            {/* ZMIANA: Dodano wyświetlanie całkowitej oszczędności */}
            <div
              className="subtotal"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <span>Suma:</span>
              <div style={{ textAlign: "right" }}>
                <strong style={{ display: "block", fontSize: "1.4rem" }}>
                  {formatPrice(cartTotal)} zł
                </strong>
                {cartTotalSavings > 0 && (
                  <small
                    style={{
                      color: "#dc2626",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    Oszczędzasz: {formatPrice(cartTotalSavings)} zł
                  </small>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <Link to="/koszyk" onClick={onClose} className="btn-view-cart">
                ZOBACZ KOSZYK
              </Link>
              <Button
                variant="primary"
                onClick={handleCheckoutClick}
                className="btn-checkout"
              >
                ZAMÓWIENIE
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default MiniCart;

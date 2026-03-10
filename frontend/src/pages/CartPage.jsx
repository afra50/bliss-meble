import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingBasket,
  FaArrowRight,
  FaShieldAlt,
  FaAward,
  FaInfoCircle,
  FaRegCreditCard,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import CartItem from "../components/cart/CartItem";
import Button from "../components/ui/Button";

import "../styles/pages/cart-page.scss";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    // Przekierowanie do kroku 2 (Dane i Dostawa)
    navigate("/zamowienie/dostawa");
  };

  // Obliczenie wartości VAT (zakładamy 23%)
  // Wzór: Brutto - (Brutto / 1.23) = Wartość VAT
  const vatAmount = cartTotal - cartTotal / 1.23;

  return (
    <main className="cart-page">
      <div className="cart-page__container">
        {/* WSKAŹNIK KROKÓW (STEPPER) */}
        <div className="checkout-stepper">
          <div className="checkout-stepper__step checkout-stepper__step--active">
            <span>1. KOSZYK</span>
          </div>
          <FaArrowRight className="checkout-stepper__arrow" />
          <div className="checkout-stepper__step">
            <span>2. ZAMÓWIENIE</span>
          </div>
          <FaArrowRight className="checkout-stepper__arrow" />
          <div className="checkout-stepper__step">
            <span>3. PODSUMOWANIE</span>
          </div>
        </div>

        <h1 className="cart-page__title">Twój Koszyk</h1>

        {cartItems.length === 0 ? (
          // WIDOK PUSTEGO KOSZYKA
          <div className="cart-page__empty">
            <FaShoppingBasket className="empty-icon" />
            <h2>Twój koszyk jest pusty</h2>
            <p>
              Nie masz jeszcze żadnych produktów w koszyku. Wróć do sklepu i
              znajdź coś dla siebie!
            </p>
            <Link to="/sklep">
              <Button variant="primary">Przejdź do sklepu</Button>
            </Link>
          </div>
        ) : (
          // WIDOK PEŁNEGO KOSZYKA
          <div className="cart-page__layout">
            {/* LEWA KOLUMNA: LISTA PRODUKTÓW */}
            <div className="cart-page__items-list">
              {/* Nagłówki tabeli */}
              <div className="cart-page__list-header">
                <div className="col-product">PRODUKT</div>
                <div className="col-actions">
                  <span>CENA</span>
                  <span>ILOŚĆ</span>
                  <span>KWOTA</span>
                </div>
              </div>

              {/* Lista produktów */}
              <div className="cart-page__items">
                {cartItems.map((item, index) => (
                  <CartItem
                    key={`${item.id}-${item.size}-${item.fabric}`}
                    item={item}
                    index={index}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    isCompact={false}
                  />
                ))}
              </div>

              {/* INFO O REZERWACJI */}
              <div className="cart-page__reservation-info">
                <FaInfoCircle className="info-icon" />
                <p>
                  <strong>Ważne:</strong> Dodanie produktów do koszyka nie
                  oznacza ich rezerwacji. Nie zwlekaj z zakupem!
                </p>
              </div>

              <div className="cart-page__continue-shopping">
                <Link to="/sklep" className="link-back">
                  &larr; Kontynuuj zakupy
                </Link>
              </div>
            </div>

            {/* PRAWA KOLUMNA: PODSUMOWANIE */}
            <aside className="cart-page__summary">
              <div className="summary-box">
                <h3 className="summary-box__title">PODSUMOWANIE KOSZYKA</h3>

                <div className="summary-box__row">
                  <span>Kwota</span>
                  <span className="price-nowrap">
                    {formatPrice(cartTotal)} zł
                  </span>
                </div>

                <div className="summary-box__row summary-box__row--shipping">
                  <span>Wysyłka</span>
                  <div className="shipping-info">
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Libero quo consectetur optio aut aspernatur nihil,
                      corrupti illum dolore, quia veritatis quas magni ipsam
                      officiis ipsa nulla repellat eum. Corrupti, totam!
                    </p>
                  </div>
                </div>

                <div className="summary-box__total">
                  <span>Łącznie</span>
                  <div className="total-price">
                    <strong className="price-nowrap">
                      {formatPrice(cartTotal)} zł
                    </strong>
                    {/* Pokazujemy precyzyjnie wyliczony VAT */}
                    <small>(w tym {formatPrice(vatAmount)} zł VAT)</small>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="summary-box__btn"
                  onClick={handleProceedToCheckout}
                >
                  PRZEJDŹ DO ZAMÓWIENIA
                </Button>
              </div>

              {/* TRUST BADGES (IKONKI BEZPIECZEŃSTWA) */}
              <div className="trust-badges">
                <div className="trust-badges__item">
                  <FaShieldAlt />
                  <span>Bezpieczne zakupy</span>
                </div>
                <div className="trust-badges__item">
                  <FaRegCreditCard />
                  <span>Szybkie płatności</span>
                </div>
                <div className="trust-badges__item">
                  <FaAward />
                  <span>2 lata gwarancji producenta</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;

import React, { createContext, useContext, useState, useEffect } from "react";
import { productApi } from "../utils/api"; // <--- NOWOŚĆ: Importujemy API

// Tworzymy Context
const CartContext = createContext();

// Własny Hook dla wygody
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // 1. Inicjalizacja koszyka z localStorage (żeby nie tracić danych po F5)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("bliss_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Zapisywanie do localStorage za każdym razem, gdy koszyk się zmieni
  useEffect(() => {
    localStorage.setItem("bliss_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- 3. Funkcja do wywoływania walidacji "na żądanie" ---
  const validateCartItems = async () => {
    if (cartItems.length === 0) return true; // Koszyk pusty = ważny

    try {
      const productIds = [...new Set(cartItems.map((item) => item.id))];
      const response = await productApi.validateCart({ ids: productIds });

      const activeProductIds = response.data.map((p) => p.id);
      const validCartItems = cartItems.filter((item) =>
        activeProductIds.includes(item.id),
      );

      if (validCartItems.length !== cartItems.length) {
        setCartItems(validCartItems);
        alert(
          "UWAGA: Niektóre z Twoich produktów wyprzedały się lub zostały wycofane z oferty, dlatego usunęliśmy je z koszyka.",
        );
        return false; // Zwraca false, jeśli koszyk musiał zostać zmieniony
      }
      return true; // Zwraca true, jeśli wszystko jest OK
    } catch (error) {
      console.error("Błąd podczas sprawdzania dostępności:", error);
      return true; // Przepuszczamy w razie błędu API, żeby nie zablokować całkiem sklepu
    }
  };

  // Opcjonalnie: Nadal sprawdzaj przy pierwszym wejściu na stronę (F5)
  useEffect(() => {
    validateCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4. Funkcja DODAWANIA do koszyka
  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.fabric === newItem.fabric &&
          item.side === newItem.side &&
          item.headrest === newItem.headrest, // <--- NOWOŚĆ 3: Koszyk rozróżnia też ilość zagłówków!
      );

      if (existingItemIndex >= 0) {
        // Klonujemy całą tablicę
        const updatedItems = [...prevItems];

        // KLUCZOWA ZMIANA: Klonujemy też konkretny obiekt, zanim zmienimy mu ilość!
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        };

        return updatedItems;
      } else {
        // Jeśli nie, dodajemy jako nową pozycję
        return [...prevItems, newItem];
      }
    });
  };

  // 5. Funkcja USUWANIA z koszyka
  const removeFromCart = (indexToRemove) => {
    setCartItems((prevItems) =>
      prevItems.filter((_, index) => index !== indexToRemove),
    );
  };

  // 6. Funkcja do zmiany ilości konkretnego przedmiotu w koszyku
  const updateQuantity = (indexToUpdate, newQuantity) => {
    setCartItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[indexToUpdate].quantity = newQuantity;
      return updatedItems;
    });
  };

  // 7. Czyszczenie całego koszyka (np. po udanym zamówieniu)
  const clearCart = () => {
    setCartItems([]);
  };

  // --- WARTOŚCI POCHODNE (Wyliczane w locie) ---
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Wartość do zapłaty (po obniżkach)
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Wyliczamy łączną kwotę oszczędności z całego koszyka
  const cartTotalSavings = cartItems.reduce((sum, item) => {
    // Jeśli mamy regularną cenę i jest ona wyższa niż obecna cena sprzedaży
    const regularPrice = item.regular_price || item.price_brut;
    if (regularPrice && parseFloat(regularPrice) > parseFloat(item.price)) {
      const savedOnOneItem = parseFloat(regularPrice) - parseFloat(item.price);
      return sum + savedOnOneItem * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        cartTotalSavings,
        validateCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

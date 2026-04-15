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

  // --- 3. NOWOŚĆ: Walidacja koszyka przy starcie aplikacji ---
  useEffect(() => {
    const validateCartItems = async () => {
      // Jeśli koszyk jest pusty, nic nie robimy
      if (cartItems.length === 0) return;

      try {
        // Wyciągamy unikalne ID produktów z koszyka
        const productIds = [...new Set(cartItems.map((item) => item.id))];

        // Odpytujemy API o status tych produktów
        const response = await productApi.validateCart({ ids: productIds });

        // Zwrócone z backendu "żywe" produkty
        const activeProducts = response.data;
        const activeProductIds = activeProducts.map((p) => p.id);

        // Filtrujemy koszyk – zostawiamy tylko to, co jest nadal aktywne
        const validCartItems = cartItems.filter((item) =>
          activeProductIds.includes(item.id),
        );

        // Jeśli długość się różni, tzn. że jakiś produkt wyleciał z oferty
        if (validCartItems.length !== cartItems.length) {
          setCartItems(validCartItems); // Aktualizujemy stan na "czysty" koszyk

          // Informujemy klienta
          alert(
            "UWAGA: Niektóre z Twoich produktów wyprzedały się lub zostały wycofane z oferty, dlatego usunęliśmy je z koszyka.",
          );
        }
      } catch (error) {
        console.error(
          "Błąd podczas sprawdzania dostępności produktów w koszyku:",
          error,
        );
      }
    };

    // Uruchamiamy walidację zaraz po załadowaniu
    validateCartItems();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Pusta tablica oznacza, że uruchomi się tylko raz (po F5 / wejściu do sklepu)
  // -------------------------------------------------------------

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

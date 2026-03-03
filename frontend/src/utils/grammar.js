export const getPluralProductForm = (count) => {
  if (count === 1) return "produkt";

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // Wykluczamy 12, 13, 14 (np. 12 produktów, a nie 12 produkty)
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "produktów";
  }

  // Jeśli kończy się na 2, 3 lub 4 (np. 2, 3, 4, 22, 34...)
  if (lastDigit >= 2 && lastDigit <= 4) {
    return "produkty";
  }

  // Cała reszta (0, 5, 6, 7, 8, 9, 10, 11, 15, 21...)
  return "produktów";
};

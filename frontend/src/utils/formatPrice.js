export const formatPrice = (price) => {
  const numberPrice = Number(price);

  // Zabezpieczenie na wypadek, gdyby wartość była nieprawidłowa
  if (isNaN(numberPrice)) return price;

  return new Intl.NumberFormat("pl-PL", {
    style: "decimal",
    minimumFractionDigits: 0, // Nie wymusza zer po przecinku (utnie .00)
    maximumFractionDigits: 2, // Zostawi np. .50 jako ,50
  }).format(numberPrice);
};

// src/utils/colors.js

export const COLOR_FAMILIES = [
  { label: "Biały", value: "#FFFFFF" },
  { label: "Czarny", value: "#000000" },
  { label: "Szary", value: "#9E9E9E" },
  { label: "Beżowy", value: "#F5F5DC" },
  { label: "Brązowy", value: "#8B4513" },
  { label: "Niebieski", value: "#2196F3" },
  { label: "Granatowy", value: "#000080" },
  { label: "Czerwony", value: "#B91C1C" },
  { label: "Różowy", value: "#E91E63" },
  { label: "Zielony", value: "#4CAF50" },
  { label: "Butelkowa zieleń", value: "#064E3B" },
  { label: "Żółty", value: "#EAB308" },
];

/**
 * Pomocnicza funkcja do pobierania etykiety na podstawie kodu HEX
 */
export const getColorLabel = (hex) => {
  const color = COLOR_FAMILIES.find((c) => c.value === hex);
  return color ? color.label : hex;
};

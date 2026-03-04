import React from "react";
import CustomSelect from "./CustomSelect";

// 1. Opcje dla publicznego sklepu
export const storeSortOptions = [
  { value: "default", label: "Sortuj: Domyślnie" },
  { value: "price_asc", label: "Cena: od najniższej" },
  { value: "price_desc", label: "Cena: od najwyższej" },
  { value: "newest", label: "Najnowsze" },
];

// 2. Opcje dla panelu admina
export const adminSortOptions = [
  { value: "newest", label: "Najnowsze" },
  { value: "oldest", label: "Najstarsze" },
  { value: "alpha_asc", label: "Alfabetycznie (A-Z)" },
  { value: "alpha_desc", label: "Alfabetycznie (Z-A)" },
];

const SortSelect = ({ value, onChange, options = storeSortOptions }) => {
  return (
    <CustomSelect
      options={options}
      value={value}
      onChange={(selectedOption) => {
        // Sklep publiczny oczekuje pełnego obiektu {value: '...', label: '...'} z onChange
        // Admin oczekuje samego stringa '...'
        // Aby zadowolić oba, przekazujemy obiekt, ale jeśli chcesz używać tego w Adminie,
        // to w AdminProductList.jsx w wywołaniu po prostu użyj: onChange={(opt) => setSortOption(opt.value)}
        onChange(selectedOption);
      }}
      variant="sort"
    />
  );
};

export default SortSelect;

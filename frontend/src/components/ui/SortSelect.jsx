import React from "react";
import Select from "react-select";
import "../../styles/components/ui/sort-select.scss";

// 1. Opcje dla publicznego sklepu (ceny itp.)
export const storeSortOptions = [
  { value: "default", label: "Sortuj: Domyślnie" },
  { value: "price_asc", label: "Cena: od najniższej" },
  { value: "price_desc", label: "Cena: od najwyższej" },
  { value: "newest", label: "Najnowsze" },
];

// 2. Opcje dla panelu admina (bez cen, z alfabetycznym)
export const adminSortOptions = [
  { value: "newest", label: "Najnowsze" },
  { value: "oldest", label: "Najstarsze" },
  { value: "alpha_asc", label: "Alfabetycznie (A-Z)" },
  { value: "alpha_desc", label: "Alfabetycznie (Z-A)" },
];

// Dodaliśmy prop "options", który jeśli nie zostanie podany, użyje storeSortOptions
const SortSelect = ({ value, onChange, options = storeSortOptions }) => {
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <Select
      options={options}
      value={selectedOption}
      isSearchable={false}
      onChange={onChange}
      className="sort-select-wrapper"
      classNamePrefix="react-select"
    />
  );
};

export default SortSelect;

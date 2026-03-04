import React from "react";
import Select from "react-select";
// ZMIANA: Zaktualizowany import do nowego uniwersalnego pliku
import "../../styles/components/ui/custom-select.scss";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Wybierz...",
  isSearchable = false,
  variant = "sort", // Domyślnie "sort", dla formularzy admina "form"
  className = "",
}) => {
  // Szukamy obiektu po value (dla stringów) LUB sprawdzamy czy value jest już obiektem
  const selectedOption =
    typeof value === "object" && value !== null
      ? value
      : options.find((opt) => opt.value === value) || null;

  return (
    <Select
      options={options}
      value={selectedOption}
      // ZMIANA: Zwracamy pełny obiekt do rodzica (SortSelect go zdekoduje, a formularze przejmą)
      onChange={onChange}
      isSearchable={isSearchable}
      placeholder={placeholder}
      className={`custom-select-wrapper custom-select-wrapper--${variant} ${className}`}
      classNamePrefix="react-select"
    />
  );
};

export default CustomSelect;

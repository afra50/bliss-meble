import Select from "react-select";
import "../../styles/components/ui/sort-select.scss";

const options = [
  { value: "default", label: "Sortuj: Domyślnie" },
  { value: "price_asc", label: "Cena: od najniższej" },
  { value: "price_desc", label: "Cena: od najwyższej" },
  { value: "newest", label: "Najnowsze" },
];

const SortSelect = ({ value, onChange }) => {
  // ZMIANA: Szukamy pełnego obiektu ({value, label}) odpowiadającego aktualnemu stanowi
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <Select
      options={options}
      value={selectedOption} // ZMIANA: Zamiast defaultValue, używamy kontrolowanego value
      isSearchable={false}
      onChange={onChange}
      className="sort-select-wrapper"
      classNamePrefix="react-select"
    />
  );
};

export default SortSelect;

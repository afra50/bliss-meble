import React from "react";
import CustomSelect from "./CustomSelect";
import { storeSortOptions } from "../../utils/sortOptions";

const SortSelect = ({ value, onChange, options = storeSortOptions }) => {
  return (
    <CustomSelect
      options={options}
      value={value}
      onChange={(selectedOption) => {
        onChange(selectedOption);
      }}
      variant="sort"
    />
  );
};

export default SortSelect;

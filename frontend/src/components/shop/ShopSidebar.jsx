import { Link } from "react-router-dom";
import { CATEGORIES, SUBCATEGORIES } from "../../utils/categories";
import { COLOR_FAMILIES } from "../../utils/colors";
import "../../styles/components/shop/shop-sidebar.scss";

const ShopSidebar = ({
  currentCategorySlug,
  colorQuery,
  activePriceRanges,
  priceRanges,
  onColorChange,
  onPriceToggle,
}) => {
  return (
    <aside className="shop-sidebar">
      {/* 1. KATEGORIE */}
      <div className="filter-group">
        <h3>Kategorie</h3>
        <div className="filter-accordion">
          {CATEGORIES.map((cat) => {
            const catSubcategories = SUBCATEGORIES.filter(
              (sub) => sub.category_id === cat.id,
            );

            if (catSubcategories.length === 0) {
              return (
                <div key={cat.id} className="filter-accordion-item">
                  <Link to={`/${cat.slug}`} className="filter-accordion-link">
                    {cat.name}
                  </Link>
                </div>
              );
            }

            return (
              <details
                key={cat.id}
                className="filter-accordion-item"
                open={currentCategorySlug === cat.slug}
              >
                <summary>{cat.name}</summary>
                <ul>
                  <li className="view-all">
                    <Link to={`/${cat.slug}`}>Pokaż wszystko</Link>
                  </li>
                  {catSubcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link to={`/${cat.slug}/${sub.slug}`}>{sub.name}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <h3>Filtruj</h3>

        {/* 2. CENA */}
        <div className="filter-subgroup">
          <h4>Cena</h4>
          {priceRanges.map((range) => (
            <div className="custom-checkbox" key={range.id}>
              <input
                type="checkbox"
                id={`price-${range.id}`}
                checked={activePriceRanges.includes(range.id)}
                onChange={() => onPriceToggle(range.id)}
              />
              <label htmlFor={`price-${range.id}`}>{range.label}</label>
            </div>
          ))}
        </div>

        {/* 3. KOLOR */}
        <div className="filter-subgroup">
          <h4>Kolor</h4>
          <div className="color-swatches">
            {COLOR_FAMILIES.map((color) => (
              <button
                key={color.value}
                className={`color-swatch ${colorQuery === color.value ? "color-swatch--active" : ""}`}
                style={{ backgroundColor: color.value }}
                title={color.label}
                onClick={() => onColorChange(color.value)}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ShopSidebar;

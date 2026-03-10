import Breadcrumbs from "../ui/Breadcrumbs";
import { CATEGORIES, SUBCATEGORIES } from "../../utils/categories";
import "../../styles/components/shop/shop-header.scss";

const ShopHeader = ({
  isSearch,
  isAllProducts,
  searchQuery,
  category,
  subcategory,
}) => {
  const currentCategoryObj = CATEGORIES.find((c) => c.slug === category);
  const currentSubcategoryObj = SUBCATEGORIES.find(
    (s) => s.slug === subcategory,
  );

  let pageTitle = "Wszystkie produkty";
  if (isSearch) {
    pageTitle = searchQuery
      ? `Wyniki dla "${searchQuery}"`
      : "Wyniki wyszukiwania";
  } else if (subcategory) {
    pageTitle = currentSubcategoryObj?.name;
  } else if (category) {
    pageTitle = currentCategoryObj?.name;
  }

  const buildBreadcrumbPaths = () => {
    const paths = [];
    if (isSearch) {
      paths.push({ label: "Szukaj" });
    } else if (isAllProducts) {
      paths.push({ label: "Sklep" });
    } else {
      paths.push({ label: "Sklep", to: "/sklep" });
      if (category && currentCategoryObj) {
        paths.push({
          label: currentCategoryObj.name,
          to: subcategory ? `/${currentCategoryObj.slug}` : null,
        });
      }
      if (subcategory && currentSubcategoryObj) {
        paths.push({ label: currentSubcategoryObj.name });
      }
    }
    return paths;
  };

  return (
    <section className="shop-header">
      <div className="shop-header__container">
        <Breadcrumbs paths={buildBreadcrumbPaths()} theme="light" />
        <h1 className="shop-header__title">{pageTitle}</h1>
      </div>
    </section>
  );
};

export default ShopHeader;

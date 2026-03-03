import "../../styles/components/ui/pagination.scss";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Sprytna funkcja generująca numery stron z wielokropkami
  const getPageNumbers = () => {
    // 1. Jeśli stron jest mało (np. 5 lub mniej), pokazujemy wszystkie
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 2. Jeśli jesteśmy blisko początku (strony 1, 2, 3)
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    // 3. Jeśli jesteśmy blisko końca (np. przy 12 stronach to strony 10, 11, 12)
    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    // 4. Jeśli jesteśmy gdzieś w środku (np. strona 6 z 12)
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <nav className="pagination" aria-label="Nawigacja stron">
      <button
        className="pagination__btn pagination__btn--prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Poprzednia
      </button>

      <ul className="pagination__list">
        {pages.map((page, index) => {
          // Jeśli element to wielokropek, renderujemy go jako tekst, nie przycisk
          if (page === "...") {
            return (
              <li key={`ellipsis-${index}`} className="pagination__item">
                <span className="pagination__dots">...</span>
              </li>
            );
          }

          // W przeciwnym razie renderujemy normalny klikalny numer
          return (
            <li key={page} className="pagination__item">
              <button
                className={`pagination__number ${
                  page === currentPage ? "pagination__number--active" : ""
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        className="pagination__btn pagination__btn--next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Następna
      </button>
    </nav>
  );
};

export default Pagination;

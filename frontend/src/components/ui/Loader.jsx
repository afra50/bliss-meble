import "../../styles/components/ui/loader.scss";

const Loader = ({ fullPage = false, message = "Ładowanie..." }) => {
  return (
    <div
      className={`loader-container ${fullPage ? "loader-container--full" : ""}`}
    >
      <div className="loader">
        <div className="loader__ring"></div>
        <div className="loader__ring"></div>
        <div className="loader__ring"></div>
        <p className="loader__text">{message}</p>
      </div>
    </div>
  );
};

export default Loader;

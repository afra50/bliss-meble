import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../utils/api";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import "../../styles/pages/admin/login.scss";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authApi.login(credentials);
      // Po sukcesie ciasteczko HttpOnly jest ustawiane automatycznie przez przeglądarkę
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Błędny login lub hasło");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <h1>Panel Admina</h1>
          <p>Zaloguj się, aby zarządzać BLISS meble</p>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-group__label">Użytkownik</label>
            <input
              type="text"
              name="username"
              className="form-group__input"
              placeholder="Wpisz login"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-group__label">Hasło</label>
            <input
              type="password"
              name="password"
              className="form-group__input"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            className="admin-login__submit"
            disabled={isLoading}
          >
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>
      </div>

      {isLoading && <Loader fullPage message="Weryfikacja uprawnień..." />}
    </div>
  );
};

export default Login;

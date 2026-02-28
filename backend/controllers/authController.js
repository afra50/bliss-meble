const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const isProd = process.env.NODE_ENV === "production";

// Helper do konwersji czasu (np. 15m / 14d) na milisekundy dla ciasteczek
const ms = (str) => {
  const n = parseInt(str, 10);
  if (str.endsWith("m")) return n * 60 * 1000;
  if (str.endsWith("h")) return n * 60 * 60 * 1000;
  if (str.endsWith("d")) return n * 24 * 60 * 60 * 1000;
  return n;
};

// Podstawowa konfiguracja bezpiecznych ciasteczek
const cookieBaseConfig = {
  httpOnly: true, // Chroni przed atakami XSS (JavaScript nie ma dostępu do ciastka)
  secure: process.env.COOKIE_SECURE === "true" || isProd, // Tylko HTTPS w produkcji
  sameSite: process.env.COOKIE_SAMESITE || "Strict", // Chroni przed atakami CSRF
};

// Access token (Domyślnie 15 minut)
const setAccessCookie = (res, token) => {
  res.cookie("auth_token", token, {
    ...cookieBaseConfig,
    path: "/",
    maxAge: ms(process.env.JWT_EXPIRES || "15m"),
  });
};

// Refresh token (Domyślnie 14 dni)
const setRefreshCookie = (res, token) => {
  res.cookie("refresh_token", token, {
    ...cookieBaseConfig,
    path: "/api/auth", // Odświeżanie działa tylko dla tej konkretnej ścieżki
    maxAge: ms(process.env.JWT_REFRESH_EXPIRES || "14d"),
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // ZMIANA: Z db.query na pool.execute dla lepszej ochrony przed SQL Injection
    const [rows] = await pool.execute(
      "SELECT * FROM admin WHERE username = ?",
      [username],
    );
    const user = rows?.[0];

    // Nie mówimy klientowi, czy zły jest login, czy hasło - po prostu "Błędne dane" (dla bezpieczeństwa)
    if (!user)
      return res.status(401).json({ error: "Nieprawidłowe dane logowania" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Nieprawidłowe dane logowania" });

    // UWAGA: Upewnij się, że w tabeli "admin" masz kolumnę "id". Jeśli nie, zmień user.id na user.username
    const payload = { sub: user.id || user.username, role: "admin" };

    const access = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "15m",
    });

    const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "14d",
    });

    setAccessCookie(res, access);
    setRefreshCookie(res, refresh);

    res.json({ message: "Zalogowano pomyślnie" });
  } catch (err) {
    console.error("Błąd logowania:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

exports.refresh = (req, res) => {
  const rt = req.cookies?.refresh_token;
  if (!rt) return res.status(401).json({ error: "Brak tokenu odświeżania" });

  try {
    const payload = jwt.verify(rt, process.env.JWT_REFRESH_SECRET);

    const newAccess = jwt.sign(
      { sub: payload.sub, role: payload.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES || "15m",
      },
    );

    const newRefresh = jwt.sign(
      { sub: payload.sub, role: payload.role },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || "14d",
      },
    );

    setAccessCookie(res, newAccess);
    setRefreshCookie(res, newRefresh);

    res.status(204).end();
  } catch {
    return res
      .status(401)
      .json({ error: "Nieprawidłowy lub wygasły token odświeżania" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("auth_token", {
    ...cookieBaseConfig,
    path: "/",
  });

  res.clearCookie("refresh_token", {
    ...cookieBaseConfig,
    path: "/api/auth",
  });

  res.json({ message: "Wylogowano pomyślnie" });
};

exports.checkAuth = (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: "Brak tokenu autoryzacji" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(401)
        .json({ error: "Token wygasł lub jest nieprawidłowy" });

    res.json({ id: user.sub, role: user.role });
  });
};

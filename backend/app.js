const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");

// Biblioteki bezpieczeństwa i optymalizacji
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const winston = require("winston");

// --- KONFIGURACJA LOGGERA (Winston) ---
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const app = express();

// --- 1. PROXY & BEZPIECZEŃSTWO ---
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.disable("x-powered-by");

// Kompresja Gzip dla szybszego działania API
app.use(compression());

// Logowanie zapytań
app.use(morgan("common"));

// --- 2. KONTROLA RUCHU (Rate Limiting) ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 300, // Limit 300 zapytań na IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zbyt wiele zapytań, spróbuj ponownie za 15 minut." },
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 150,
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500;
  },
});

app.use("/api/", limiter);
app.use("/api/", speedLimiter);

// --- 3. MIDDLEWARE APLIKACJI ---
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Domyślny port dla Vite (React)
      "http://localhost:3000",
      // Tutaj w przyszłości dodasz docelową domenę sklepu, np. "https://blissmeble.pl"
    ],
    credentials: true, // WAŻNE dla obsługi ciasteczek (JWT)
  }),
);

app.use(express.json());
app.use(cookieParser());

// --- 4. PLIKI STATYCZNE (Zdjęcia produktów) ---
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// --- 5. TRASY (Routes) ---

// Obsługa nieznalezionych tras (404)
app.use((req, res, next) => {
  res.status(404).json({ message: "Trasa nie została znaleziona" });
});

// --- 6. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Obsługa błędów wgrywania plików (Multer)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ code: "LIMIT_FILE_SIZE", error: "Plik jest zbyt duży" });
    }
    if (
      err.code === "LIMIT_FILE_COUNT" ||
      err.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        code: "LIMIT_FILE_COUNT",
        error: "Zbyt wiele plików lub niewłaściwe pole",
      });
    }
    return res.status(400).json({ code: "UPLOAD_ERROR", error: err.message });
  }

  if (err.message === "Dozwolone są tylko obrazy!") {
    return res
      .status(400)
      .json({ code: "INVALID_FILE_TYPE", error: err.message });
  }

  res.status(500).json({
    message: "Wewnętrzny błąd serwera",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Coś poszło nie tak",
  });
});

module.exports = app;

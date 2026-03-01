const multer = require("multer");

const storage = multer.memoryStorage(); // Pod Sharp

const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Dozwolone są tylko zdjęcia!"), false);
  }
};

const upload = multer({
  storage,
  limits,
  fileFilter,
});

// Dodajemy właściwość imageOnly, żeby trasy jej "widziały"
module.exports = { imageOnly: upload };

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 IMPORTANTE: URL dinámica (Render)
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

// 🔥 STATIC (CLAVE)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
console.log(path.resolve(__dirname, "../frontend/index.html"));;

// 🔥 MONGO
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo conectado"))
  .catch(e => console.log("❌", e));

// ===== MODELOS =====
const Product = mongoose.model("Product", {
  brand: String,
  model: String,
  category: String,
  price: Number,
  quantity: Number,
  image: String
});

// ===== LOGIN =====
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "LZR" && password === "1234") {
    return res.json({ success: true, username: "LZR" });
  }

  res.json({ error: "Acceso denegado" });
});

// ===== MULTER =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ===== PRODUCTOS =====
app.post("/products", upload.single("image"), async (req, res) => {
  const { brand, model, category, price, quantity } = req.body;
  const image = req.file ? req.file.filename : null;

  await new Product({ brand, model, category, price, quantity, image }).save();

  res.json({ success: true });
});

app.get("/products", async (req, res) => {
  const data = await Product.find();

  res.json(data.map(p => ({
    ...p._doc,
    imageUrl: p.image ? `${BASE_URL}/uploads/${p.image}` : null
  })));
});

// ===== FALLBACK (FIX ERROR RENDER) =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => console.log("🚀 Server listo"));
const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
app.use(cors());
app.use(express.json());


//db connection with sql 
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "shop_managment",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("connect");
});

app.post("/api/product", (req, res) => {
  console.log("Request body:", req.body); 

  const { name, quantity } = req.body;
  if (!name || !quantity) {
    return res.status(400).send("Missing required fields: name and quantity");
  }
  const query = "INSERT INTO products (name, quantity) VALUES (?, ?)";
  db.query(query, [name, quantity], (err, result) => {
    if (err) {
      console.error("Error adding product:", err);
      return res.status(500).send("Error adding product");
    }
    res.status(200).send(result);
  });
});

app.get("/api/products/id", (req, res) => {
  const query = "SELECT * FROM PRODUCTS ";
  db.query(query, (err, result) => {
    if (err) {
      console.log("error to fetch", err);
      return res.status(500).send(err);
    } else return res.status(200).json(result);
  });
});

app.delete("/api/product/:id", (req, res) => {
  const productId = req.params.id;
  const query = "DELETE FROM products WHERE id = ?";
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).send("Error deleting product");
    }
    res.status(200).send(`Product with ID ${productId} deleted successfully`);
  });
});

app.put("/api/product/reduce/:id", (req, res) => {
  const productId = req.params.id;

  const query = `
      UPDATE products 
      SET quantity = quantity - 1 
      WHERE id = ? AND quantity > 0
    `;

  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error("Error reducing product quantity:", err);
      return res.status(500).send("Error reducing product quantity");
    }

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .send("Product not found or quantity is already zero");
    }

    res.status(200).send(`Quantity reduced for product with ID ${productId}`);
  });
});

app.get("/api/dashboard", (req, res) => {
  const query = `
      SELECT 
  COUNT(*) AS totalProducts, 
  SUM(quantity) AS totalQuantity, 
  (SELECT name FROM products ORDER BY quantity DESC LIMIT 1) AS mostStockedProduct, 
  MAX(quantity) AS maxQuantity 
FROM products;

    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching dashboard data:", err);
      return res.status(500).send("Server error");
    }
    res.send(result[0]); // Return summarized data
  });
});

app.get("/api/recent-products", (req, res) => {
  const query = `
      SELECT id, name, quantity 
      FROM products 
      ORDER BY id DESC 
      LIMIT 5;
    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching recent products:", err);
      return res.status(500).send("Server error");
    }
    res.send(result); // Return recent products
  });
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});

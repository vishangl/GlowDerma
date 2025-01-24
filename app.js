import express from "express";
import fs from 'fs';
import hbs from 'hbs'

const app = express();

let PORT = 5000;
app.use(express.json());

// set the view engine to handlebars
app.set("view engine","hbs");

app.set("views","views");

import { rateLimit } from 'express-rate-limit';

//create a rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message : "You have exceeded the 5 requests in 15 minutes limit!"});

app.use(limiter);

// Middleware to serve static files
app.use("/tools", express.static("assets"));


// Middleware to log all requests
app.use((req,res,next) => {
  let logdata = `${new Date()} | ${req.method} | ${req.url} | ${req.ip}`;
  console.log(logdata);
  fs.appendFile("log.txt", logdata, (err) => {
    if(err) throw err;
  })
  next();
})

// Home Route
app.get("/", (req, res) => {
    res.send("<h1>Welcome to GlowDerma - Your Skincare Journey Begins Here.</h1>");
});



// About Route
app.get("/about", (req, res) => {
    res.send("<h3>We are a premium skincare brand committed to bringing you dermatologist-approved, clean beauty products</h3>");
});

// Contact Route
app.get("/contact", (req, res) => {
    res.json({
        "email": "care@glowderma.com",
        "instagram": "http://instagram.com/glowderma",
        "consultation": "http://glowderma.com/book-appointment"
    });
});

// Orders Route with Route Parameter
app.get("/orders/:orderID", (req, res) => {
    const orderID = parseInt(req.params.orderID);
    const orders = [
        { id: 1, name: 'Anti-Aging Serum', quantity: 2 },
        { id: 2, name: 'Vitamin C Moisturizer', quantity: 1 },
        { id: 3, name: 'Hyaluronic Acid', quantity: 3 }
    ];
    const order = orders.find(o => o.id === orderID);

    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404).send("Order Not Found");
    }
});

// Products Route with Query Parameters
app.get("/products", (req, res) => {
    const { name, maxPrice } = req.query;
    let products = [
        { id: 11, name: "Retinol Serum", price: 1200, availableQty: 50 },
        { id: 12, name: "Niacinamide Solution", price: 800, availableQty: 30 },
        { id: 14, name: "Peptide Moisturizer", price: 1500, availableQty: 100 },
        { id: 15, name: "Glycolic Acid Toner", price: 900, availableQty: 20 }
    ];

    if (name) {
        products = products.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (maxPrice) {
        products = products.filter(p => p.price <= parseInt(maxPrice));
    }

    res.status(200).json(products);
});

// Shopping Cart Array
let shoppingCart = [];

// Get Cart Contents
app.get("/cart", (req, res) => {
    res.json(shoppingCart);
});

// Add to Cart with Body Parameter
app.post("/cart", (req, res) => {
    console.log(req.body);
    const { id, name, price, availableQty, quantity } = req.body;

    // Check for missing fields
    if (!id || !name || !price || !availableQty || !quantity) {
        return res.status(400).json({
            "error": "All the required fields (id, name, price, description, qty) are not provided"
        });
    }

    

    // Form cart object
    const cartItem = { id, name, price, availableQty, quantity};

    // Update cart with new object
    shoppingCart.push(cartItem);
    res.json({
        "message": "Product added to cart",
        "data": cartItem
    });
});



// Serve static files (optional, for CSS or JS files)
app.use(express.static("public"));

// Mock data for products
const products = {
    skincare: {
        name: "Anti-Acne Cream",
        description: "A revolutionary formula designed to fight acne and restore your skin's natural glow.",
        features: [
            "Reduces acne and blemishes",
            "Made with natural ingredients",
            "Dermatologist-tested and approved",
            "Free from harmful chemicals"
        ],
        price: "$29.99",
        launchDate: "March 15, 2025"
    },
    haircare: {
        name: "Hair Growth Serum",
        description: "A premium serum to strengthen and promote healthy hair growth.",
        features: [
            "Reduces hair fall",
            "Promotes new hair growth",
            "Suitable for all hair types",
            "Infused with essential oils"
        ],
        price: "$39.99",
        launchDate: "April 10, 2025"
    },
    wellness: {
        name: "Immunity Booster",
        description: "A natural supplement to boost your immunity and overall health.",
        features: [
            "Made from organic ingredients",
            "Rich in antioxidants",
            "Supports energy levels",
            "Improves overall well-being"
        ],
        price: "$19.99",
        launchDate: "February 20, 2025"
    }
};

// Dynamic route to handle different products
app.get("/:serviceName", (req, res) => {
    const serviceName = req.params.serviceName;

    // Check if the product exists
    if (products.serviceName) {
        res.render("index", {
            product: products[serviceName],
            data: serviceName
        });
    } else {
        res.status(404).send("Product not found");
    }
});


// Handle Undefined Routes
app.get("*", (req, res) => {
    res.status(404).json({
        "error": "Route not found"
    });
});



// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});




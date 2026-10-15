const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));


// ==========================================
// MYSQL CONNECTION
// ==========================================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ecommerce"
});


// ==========================================
// CONNECT TO MYSQL
// ==========================================

db.connect((err) => {

    if (err) {

        console.log("MySQL Connection Error:");
        console.log(err);

        return;
    }

    console.log("MySQL Connected");

});


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "home.html")
    );

});


// ==========================================
// REGISTER
// ==========================================

app.post("/register", (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;


    const sql = `
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
    `;


    db.query(
        sql,
        [name, email, password],
        (err, result) => {

            if (err) {

                console.log("Registration Error:");
                console.log(err);

                return res.status(500).send(
                    "Registration Failed"
                );
            }


            console.log(
                "User registered successfully. User ID:",
                result.insertId
            );


            res.send(
                "Registration Successful"
            );

        }
    );

});


// ==========================================
// LOGIN
// ==========================================

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
        AND password = ?
    `;


    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {

                console.log("Login Error:");
                console.log(err);

                return res.status(500).send(
                    "Login Failed"
                );
            }


            if (results.length > 0) {

                console.log(
                    "Login successful for:",
                    email
                );


                res.send(
                    "Login Successful"
                );

            } else {

                res.send(
                    "Invalid Email or Password"
                );

            }

        }
    );

});


// ==========================================
// GET PRODUCTS
// ==========================================

app.get("/api/products", (req, res) => {

    const sql =
        "SELECT * FROM products";


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "Product Loading Error:"
                );

                console.log(err);


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to load products"

                });

            }


            console.log(
                "Products loaded:",
                results.length
            );


            res.json(results);

        }
    );

});


// ==========================================
// PLACE ORDER
// ==========================================

app.post("/api/orders", (req, res) => {

    console.log("--------------------------------");
    console.log("PLACE ORDER REQUEST RECEIVED");
    console.log("Order data:", req.body);
    console.log("--------------------------------");


    const {
        user_id,
        product_name,
        quantity,
        total
    } = req.body;


    // Check required values

    if (
        !user_id ||
        !product_name ||
        !quantity ||
        total === undefined
    ) {

        console.log(
            "Missing order information"
        );


        return res.status(400).json({

            success: false,

            message:
                "Missing order information"

        });

    }


    // IMPORTANT:
    // We now save product_name instead of product_id.

    const sql = `
        INSERT INTO orders
        (user_id, product_name, quantity, total)
        VALUES (?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            user_id,
            product_name,
            quantity,
            total
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "ORDER SAVE ERROR:"
                );

                console.log(err);


                return res.status(500).json({

                    success: false,

                    message:
                        "Order could not be saved",

                    error:
                        err.message

                });

            }


            console.log(
                "Order saved successfully!"
            );


            console.log(
                "Order ID:",
                result.insertId
            );


            res.json({

                success: true,

                message:
                    "Order Placed Successfully",

                orderId:
                    result.insertId

            });

        }
    );

});


// ==========================================
// GET ORDER HISTORY
// ==========================================

app.get("/api/orders", (req, res) => {

    console.log(
        "Loading orders..."
    );


    const sql = `
        SELECT
            id,
            user_id,
            product_name,
            quantity,
            total
        FROM orders
        ORDER BY id DESC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "Order Loading Error:"
                );

                console.log(err);


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to load orders",

                    error:
                        err.message

                });

            }


            console.log(
                "Orders found:",
                results.length
            );


            res.json(results);

        }
    );

});


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            "Server running on http://localhost:3000"
        );

    }
);

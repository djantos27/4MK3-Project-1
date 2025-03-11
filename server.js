const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;
const db = new sqlite3.Database("books.db");

app.use(express.json()); // Enable JSON parsing

// Serve static files from the root directory (where server.js is located)
app.use(express.static(__dirname));

// Create "books" table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year INTEGER NOT NULL,
        isbn TEXT NOT NULL,
        coverUrl TEXT NOT NULL
    )
`, (err) => {
    if (err) console.error("Error creating table:", err.message);
    else console.log("Books table is ready.");
});

// Get all books, title and ID only
app.get("/api/books", (req, res) => {
    db.all("SELECT id, title FROM books", (err, rows) => {
        if (err) {
            console.error("Database fetch error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.setHeader("Content-Type", "application/json"); 
        res.json(rows);
    });
});

// Get all books, and all info
app.get("/api/books/details", (req, res) => {
    db.all("SELECT id, title, author, year, isbn, coverUrl, start_date, end_date FROM books", (err, rows) => {
        if (err) {
            console.error("Database fetch error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.setHeader("Content-Type", "application/json"); 
        res.json(rows);
    });
});

/*
// Add a new book
app.post("/api/books", (req, res) => {
    const { title, author, year, isbn, coverUrl, start_date, end_date } = req.body;

    if (!title || !author || !year || !isbn || !coverUrl) {
        return res.status(400).json({ error: "All fields are required except dates" });
    }

    db.run(
        "INSERT INTO books (title, author, year, isbn, coverUrl, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, author, year, isbn, coverUrl, start_date || null, end_date || null],
        function (err) {
            if (err) {
                console.error("Error inserting book:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ response: "BOOK INSERTED", id: this.lastID });
        }
    );
});
*/

app.post("/api/books", (req, res) => {
    const { title, author, year, isbn, coverUrl, start_date, end_date } = req.body;

    if (!title || !author || !year || !isbn || !coverUrl) {
        return res.status(400).json({ error: "All fields are required except dates" });
    }

    db.run(
        "INSERT INTO books (title, author, year, isbn, coverUrl, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, author, year, isbn, coverUrl, start_date || null, end_date || null],
        function (err) {
            if (err) {
                console.error("Error inserting book:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ response: "BOOK INSERTED", id: this.lastID, title: title, start_date: start_date, end_date: end_date });
        }
    );
});

// Delete a book by ID
app.delete("/api/books/:id", (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM books WHERE id = ?", [id], function (err) {
        if (err) {
            console.error("Error deleting book:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.json({ response: "BOOK DELETED" });
    });
});

//User Management:
// Create "users" table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
`, (err) => {
    if (err) console.error("Error creating users table:", err.message);
    else console.log("Users table is ready.");
});

// Get all users
app.get("/api/users", (req, res) => {
    db.all("SELECT id, name FROM users", (err, rows) => {
        if (err) {
            console.error("Database fetch error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.setHeader("Content-Type", "application/json"); 
        res.json(rows);
    });
});

// Add a new user
app.post("/api/users", (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "User name is required" });
    }

    db.run("INSERT INTO users (name) VALUES (?)", [name], function (err) {
        if (err) {
            console.error("Error inserting user:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ response: "USER INSERTED", id: this.lastID });
    });
});

// Delete a user by ID
app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) {
            console.error("Error deleting user:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ response: "USER DELETED" });
    });
});


// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

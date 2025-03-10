const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const port = 3000;
const db = new sqlite3.Database("books.db");

app.use(express.json()); // Enable JSON parsing

// Serve static HTML files (Frontend)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/addRemove.html", (req, res) => {
    res.sendFile(path.join(__dirname, "addRemove.html"));
});

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

// GET all books
app.get("/api/books", (req, res) => {
    db.all("SELECT rowid AS id, * FROM books", (err, rows) => {
        if (err) {
            console.error("Database fetch error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("📚 Books fetched:", rows); // ✅ Log fetched books
        res.json(rows);
    });
});


// POST (Add a new book)
app.post("/api/books", (req, res) => {
    const { title, author, year, isbn, coverUrl } = req.body;

    if (!title || !author || !year || !isbn || !coverUrl) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.run(
        "INSERT INTO books (title, author, year, isbn, coverUrl) VALUES (?, ?, ?, ?, ?)",
        [title, author, year, isbn, coverUrl],
        function (err) {
            err ? res.status(500).json({ error: err.message }) :
                res.json({ response: "BOOK INSERTED", id: this.lastID });
        }
    );
});

// DELETE (Remove a book by ID)
app.delete("/api/books/:id", (req, res) => {
    db.run("DELETE FROM books WHERE rowid = ?", [req.params.id], function (err) {
        err ? res.status(500).json({ error: err.message }) :
            res.json({ response: "BOOK DELETED" });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/api`);
});

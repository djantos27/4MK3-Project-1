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

// Get all books
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


// Add a new book
app.post("/api/books", (req, res) => {
    const { title, author, year, isbn, coverUrl } = req.body;

    if (!title || !author || !year || !isbn || !coverUrl) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.run(
        "INSERT INTO books (title, author, year, isbn, coverUrl) VALUES (?, ?, ?, ?, ?)",
        [title, author, year, isbn, coverUrl],
        function (err) {
            if (err) {
                console.error("Error inserting book:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ response: "BOOK INSERTED", id: this.lastID });
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

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

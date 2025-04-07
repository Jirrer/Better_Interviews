const express = require("express");
const app = express();
const PORT = 3000;
const sqlite3 = require('sqlite3').verbose();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

let currentUserId = null; 


let db = new sqlite3.Database("db/better_interviews.db", (err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

app.post("/login", (req, res) => {
    const userId = parseInt(req.body.userId, 10); // Get the ID from the form
    console.log("User ID submitted:", userId);

    // Check if the ID exists in the database
    checkIdInDatabase(userId, (err, exists) => {
        if (err) {
            console.error("Error:", err.message);
            res.status(500).send("Internal Server Error");
        } else if (exists) {
            console.log("ID exists in the database.");
            currentUserId = userId;
            res.redirect("/mainPage.html"); 
        } else {
            console.log("ID does not exist in the database.");
            res.sendFile(__dirname + "/public/index.html");
        }
    });
});

app.get("/api/user-id", (req, res) => {
    if (currentUserId !== null) {
        res.json({ userId: currentUserId });
    } else {
        res.status(404).json({ error: "No user logged in" });
    }
});


function checkIdInDatabase(id, callback) {
    const query = "SELECT * FROM users WHERE id = ?"; 
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            callback(err, null);
        } else {
            if (row) {
                callback(null, true); 
            } else {
                callback(null, false); 
            }
        }
    });
}

app.get("/api/total-interviews", (req, res) => {
    if (currentUserId === null) {
        return res.status(400).json({ error: "No user logged in" });
    }

    getTotalInterviews((err, totalInterviews) => {
        if (err) {
            console.error("Error fetching total interviews:", err.message);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json({ totalInterviews });
        }
    });
});

function getTotalInterviews(callback) {
    const query = `
        SELECT COUNT(interviews.id) AS totalInterviews
        FROM users
        INNER JOIN interviews ON users.id = interviews.user_id
        WHERE users.id = ?;
    `;

    db.get(query, [currentUserId], (err, row) => {
        if (err) {
            console.error("Error getting total interviews:", err.message);
            callback(err, null); // Pass the error to the callback
        } else {
            callback(null, row ? row.totalInterviews : 0); // Pass the total interviews or 0 if none found
        }
    });
}




function closeDatabase() {
    console.log("Closing Database...");
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
};

process.on('SIGINT', () => {
    closeDatabase();
    console.log("Server Shutdown.");
    process.exit(0);
});

app.listen(PORT, () => {
    console.log("Server running on port:" + PORT);
})
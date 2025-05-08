const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;
const sqlite3 = require('sqlite3').verbose();
const { spawn } = require("child_process");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));

let currentUserId = null; 

app.post("/api/logout", (req, res) => {
    currentUserId = null; 

    console.log("User logged out successfully.");
    res.status(200).json({ message: "User logged out successfully." });
});



let db = new sqlite3.Database("db/better_interviews.db", (err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

app.post("/login", (req, res) => {
    const username = req.body.username; 
    const password = req.body.password;

    checkForId(username, password, (err, isValid) => {
        if (err) {
            console.error("Error:", err.message);
            res.status(500).send("Internal Server Error");
        } else if (isValid) {
            console.log("Username exists in the database.");
            currentUserId = isValid;
            res.redirect("/mainPage.html"); 
        } else {
            console.log("Invalid username or password.");
            res.sendFile(__dirname + "/public/index.html");
        }
    });
});

function checkForId(username, password, callback) {
    const query = "SELECT id, password FROM users WHERE username = ?";

    db.get(query, [username], (err, row) => {
        if (err) {
            console.error("Error querying the database:", err.message);
            callback(err, null);
        } else if (row) {
            if (row.password === password) {
                callback(null, row.id); // Return the user ID if valid
            } else {
                callback(null, false); // Invalid password
            }
        } else {
            callback(null, false);
        }
    });
}


app.get("/api/user-id", (req, res) => {
    if (currentUserId !== null) {
        res.json({ userId: currentUserId });
    } else {
        res.status(404).json({ error: "No user logged in" });
    }
});




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
            callback(err, null); 
        } else {
            callback(null, row ? row.totalInterviews : 0); 
        }
    });
}

app.get("/api/interviewsByGenre", (req, res) => {
    if (currentUserId === null) {
        return res.status(400).json({ error: "No user logged in" });
    }

    const interviewType = req.query.interviewType; 
    getInterviews(interviewType, (err, interviews) => {
        if (err) {
            console.error(`Error fetching ${interviewType} interviews:`, err.message);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json({ interviews }); 
        }
    });
});


function getInterviews(interviewType, callback) {
    const query = `
        SELECT interviews.company_name, interviews.date, status, description
        FROM interviews
        JOIN users ON interviews.user_id = users.id
        WHERE users.id = ? AND interviews.status = ?;
    `;

    db.all(query, [currentUserId, interviewType], (err, rows) => {
        if (err) {
            console.error(`Error getting ${interviewType} interviews:`, err.message);
            callback(err, null);
        } else {
            const interviews = rows.map(row => ({
                companyName: row.company_name,
                date: row.date,
                status: row.status,
                id: row.id,
                description: row.description
            }));
            callback(null, interviews);
        }
    });
}

app.post("/submit", (req, res) => {
    const { companyInfo, jobInfo, extraInfo } = req.body;

    // Validate required fields
    if (!companyInfo.companyName || !jobInfo.jobName || !jobInfo.jobDate || !extraInfo.interviewDescription) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (!currentUserId) {
        return res.status(400).json({ error: "No user logged in" });
    }

    // Structure the interview information into categories
    const interviewInformation = [
        `userId:${currentUserId}`,
        `companyName:${companyInfo.companyName || ""}`,
        `companyLocation:${companyInfo.companyLocation || ""}`,
        `companyEmail:${companyInfo.companyEmail || ""}`,
        `companyIndustry:${companyInfo.companyIndustry || ""}`,
        `jobName:${jobInfo.jobName || ""}`,
        `jobDate:${jobInfo.jobDate || ""}`,
        `numInterviewers:${jobInfo.numInterviewers || ""}`,
        `jobTime:${jobInfo.jobTime || ""}`,
        `interviewDescription:${extraInfo.interviewDescription || ""}`
    ].join("|");

    console.log("Sending structured data to Python script:");

    // Spawn the Python process
    const pythonProcess = spawn("python", ["src/createInterviewPrep.py"]);

    // Send the structured data to the Python script via stdin
    pythonProcess.stdin.write(interviewInformation);
    pythonProcess.stdin.end();

    // Handle errors from the Python script
    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python script error: ${data.toString()}`);
    });

    // Wait for the Python script to finish
    pythonProcess.on("close", (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            return res.status(500).json({ error: "Python script failed to execute." });
        }

        console.log("Python script executed successfully.");
        res.status(200).json({ message: "Interview submitted successfully!" });
    });
});

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
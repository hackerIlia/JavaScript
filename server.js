const express = require('express');
const fs = require('fs');
const cors = require('cors');  // Import cors

const app = express();
app.use(cors()); // Use cors middleware to allow cross-origin requests
app.use(express.json());  // Middleware to parse JSON

const filePath = ('transaction.json');

app.get("/transactions", (req, res) => {
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");

        const transactions = JSON.parse(data);
        res.json(transactions);  
    });
});

app.post("/add-transaction", (req, res) => {
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");

        let transactions = JSON.parse(data); 
        transactions.push(req.body); 

        fs.writeFile(filePath, JSON.stringify(transactions, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.send("Transaction added successfully!");
        });
    });
});

const port = 5500;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

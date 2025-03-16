class TransactionAnalyzer {
    constructor(transaction_id, transaction_date, transaction_amount, transaction_type, transaction_description, merchant_name, card_type) {
        this.transaction_id = transaction_id;
        this.transaction_date = transaction_date;
        this.transaction_amount = transaction_amount;
        this.transaction_type = transaction_type;
        this.transaction_description = transaction_description;
        this.merchant_name = merchant_name;
        this.card_type = card_type;
    }

    string() {
        return JSON.stringify(this,null,2);
    }
}

let typesSelect = document.getElementById("types");
let str = "";
getUniqueTransactionType().then(res => res.forEach(element => {
    str += "<option value='" + element + "'>" + element + "</option>"; 
    typesSelect.innerHTML = str;
}));

function getAllTransactions() {
    return fetch("transaction.json")
        .then(response => response.json())
        .then(data => data.map(t => new TransactionAnalyzer(
            t.transaction_id,
            t.transaction_date,
            t.transaction_amount,
            t.transaction_type,
            t.transaction_description,
            t.merchant_name,
            t.card_type
        )))
        .catch(error => console.error("Error fetching transactions: ", error));
}

function addTransaction() {
    const transaction = new TransactionAnalyzer(
        getAllTransactions().then(transactions => transactions.size),  // Assuming an auto-increment or set transaction ID for simplicity
        document.getElementById('date').value,
        document.getElementById('amount').value,
        document.getElementById('type').value,
        document.getElementById('description').value,
        document.getElementById('merchant_name').value,
        document.getElementById('card_type').value
    );

    fetch("http://localhost:5500/add-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
    })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => console.error("Error adding transaction:", error));
}

function displayTransactions() {
    getAllTransactions().then(transactions => {
        console.log(transactions);
    });
}

function getUniqueTransactionType(){
    return getAllTransactions().then(transactions => {
        return Array.from(new Set(transactions.map(t => t.transaction_type)));
    }).catch(error => {
        console.log("Error during getting unique types: ",error);
        return [];
    });
}

function displayUniqueTypes() {
    getUniqueTransactionType().then(res => {
        console.log(res);
    });
}

function calculateTotalAmount() {
    getAllTransactions().then(transactions => {
        let arr = transactions.map(t => t.transaction_amount);
        let sum = 0.0;
        arr.forEach(element => {
            sum += Number(element);
        })

        console.log("Sum: ", sum);
    }).catch(err => console.log("Error during calculating amounts' sum: ",err));
}

function calculateTotalAmountByDate(year = null,month = null,day = null) {
    getAllTransactions().then(transactions => {
            let total = transactions
                .filter(transaction => {
                const date = new Date(transaction.transaction_date);
                return (
                    (year === null || date.getFullYear() === year) &&
                    (month === null || date.getMonth() + 1 === month) &&
                    (day === null || date.getDate() === day)
                );
            })
            .reduce((sum, transaction) => sum + transaction.transaction_amount, 0);

            console.log("Total:",total);
            return total;
        }).catch(error => console.error("Error: ",error));
}

function getTransactionByType(type) {
    getAllTransactions().then(transactions => {
        let result = transactions
            .filter(t => {
                return t.transaction_type === type
            });

        console.log(result);
        return result;
    })
}

function displayTransactionsBySelectedType(){
    let selectedValue = document.getElementById("types").value;
    getTransactionByType(selectedValue);
}

function getTransactionsInDateRange(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);

    getAllTransactions().then(transactions => {
        let result = transactions
            .filter(t => {
                let tdate = new Date(t.transaction_date);
                return (tdate >= start && tdate <= end);
            })
        console.log(result);
    })
    .catch(error => console.error("Error: ",error));
}

function getTransactionsByMerchant(merchantName) {
    getAllTransactions().then(transactions => {
        let result = transactions
            .filter(t => {
                return t.merchant_name === merchantName;
            })
        console.log(result);
    })
    .catch(error => console.error("Error: ",error));
}

function displayTByMerchant() {
    let merchantName = document.getElementById("merchantName").value;
    console.log(merchantName);
    getTransactionsByMerchant(merchantName);
}

function calculateAverageTransactionAmount(){
    getAllTransactions().then(transactions => {
        let total = transactions.reduce((sum,t) => sum + Number(t.transaction_amount),0);
        let average = total / transactions.length;

        console.log(average);
        return average;
    })
}

function getTransactionsByAmountRange(minAmount, maxAmount) {
    getAllTransactions().then(transactions => {
        let result = transactions
            .filter(t => {
                return (t.transaction_amount >=  minAmount && t.transaction_amount <= maxAmount);
            })
        
            console.log(result);
    })
    .catch(error => console.error("Error: ",error));
}

function calculateTotalDebitAmount(){
    getAllTransactions().then(transactions => {
        let result = transactions.filter(t => {
            return t.transaction_type === "debit";
        })
        .reduce((sum,tr) => sum + Number(tr.transaction_amount),0);

        console.log(result);
    })
    .catch(error => console.error("Error: ",error));
}

function findMostTransactionsMonth() {
    getAllTransactions().then(transactions => {
        let tcountbymonth = {};

        transactions.forEach(t =>{
            let date = new Date(t.transaction_date);
            let key = `${date.getMonth() + 1}`;

            tcountbymonth[key] = (tcountbymonth[key] || 0) + 1;
        });

            let maxMonth = Object.keys(tcountbymonth).reduce((maxMonth,currentMonth) =>
                tcountbymonth[currentMonth] > (tcountbymonth[maxMonth] || 0) ? currentMonth : maxMonth, "");
            
            console.log("Max month:",maxMonth);
    })
    .catch(error => console.error("Error: ",error));
}

function findMostDebitTransactionMonth() {
    getAllTransactions().then(transactions => {
        let debitTran = transactions.filter(t => {
            return t.transaction_type === "debit";
        })

        let tcountbymonth = {};

        debitTran.forEach(t =>{
            let date = new Date(t.transaction_date);
            let key = `${date.getMonth() + 1}`;

            tcountbymonth[key] = (tcountbymonth[key] || 0) + 1;
        });

            let maxMonth = Object.keys(tcountbymonth).reduce((maxMonth,currentMonth) =>
                tcountbymonth[currentMonth] > (tcountbymonth[maxMonth] || 0) ? currentMonth : maxMonth, "");
            
            console.log("Max month:",maxMonth);
    })
    .catch(error => console.error("Error: ",error));
}

function mostTransactionTypes() {
    getAllTransactions().then(transactions => {
        let debitCount = 0, creditCount = 0;

        transactions.forEach(t => {
            if(t.transaction_type === "debit") debitCount++;
            else if(t.transaction_type === "credit") creditCount++;
        });

        let result = debitCount > creditCount ? "debit" :
                        creditCount > debitCount ? "credit" :
                        "equal";

        console.log("Result: ", result);
        return result;
    })
    .catch(error => console.error("Error: ",error));
}

function getTransactionsBeforeDate(date) {
    let untilDate = new Date(date);

    getAllTransactions().then(transactions => {
        let result = transactions
            .filter(t => {
                let tdate = new Date(t.transaction_date);
                return tdate <= untilDate;
            })
        console.log(result);
    })
    .catch(error => console.error("Error: ",error));
}

function displayTransactionsBeforeDate() {
    let date = document.getElementById("beforedate").value;
    getTransactionsBeforeDate(date);
}

function findTransactionById(id) {
    getAllTransactions().then(transactions => {
        const tran = transactions.find(t=> t.transaction_id === id);

        if(tran) {
            console.log("Transaction found: ",tran.string());
        }
        else {
            console.log(`Transaction with id ${id} not found`);
        }
    });
}

function displayTransactionById() {
    let id = document.getElementById("tranId").value;
    findTransactionById(id);
}

function mapTransactionDescriptions() {
    getAllTransactions().then(transactions => {
        let descrArray = transactions.map(t => t.transaction_description);
        console.log(descrArray);
    })
}
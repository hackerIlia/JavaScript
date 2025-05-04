var adding = false;
var form = document.getElementById('transactionForm');
var main = document.getElementById('main');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const table = document.getElementById('data');
const dataId = document.getElementById('data-id');
const dataDate = document.getElementById('data-date');
const dataCategory = document.getElementById('data-category');
const dataDescription = document.getElementById('data-description');
const dataAmount = document.getElementById('data-amount');
const closeModalInfo = document.getElementById('closeModalInfo');
const modalInfo = document.getElementById('info');

form.style.display = 'none';

table.addEventListener('click', async function(event) {
    if(event.target.tagName === 'BUTTON' && event.target.classList.contains('deleteBtn')){
        let id = event.target.dataset.id;
        if(id){
            deleteTransaction(Number(id));
        }
    }
    else {    
    let row  = event.target.closest('tr');
        if(row && row.dataset.id){
            let id = Number(row.dataset.id);
            if(id){
                let transactions = await getAllTransactions();
                let transaction = transactions.find(t => t.id === id);
                console.log(id);

                if(transaction){
                    dataId.textContent = transaction.id;
                    dataDate.textContent = transaction.date;
                    dataCategory.textContent = transaction.category;
                    dataDescription.textContent = transaction.description;
                    dataAmount.textContent = transaction.amount;
                    
                    modalInfo.style.display = 'block';
                    main.style.filter  = 'blur(5px)';
                    addBtn.style.cursor = 'default';
                    addBtn.style.transition = 'none';
                    addBtn.style.pointerEvents = 'none';
                }
            }
        }
    }
});


form.addEventListener('submit', async function(event) {
    event.preventDefault();

    let transactions = await getAllTransactions();
    
    let id = transactions.length > 0 ? (transactions[transactions.length - 1].id + 1) : 1;
    let date = (new Date).toLocaleString("ro-MD");
    let amount = amountInput.value;
    let category = categoryInput.value;
    let description = descriptionInput.value;

    let transaction = new Transaction(id, date, amount, category, description);
    await transaction.addTransaction();
});

var addBtn = document.getElementById('addTransaction');
addBtn.addEventListener('click', function() {
    if(!adding){
        form.style.display = 'block';
        main.style.filter  = 'blur(5px)';
        addBtn.style.cursor = 'default';
        addBtn.style.transition = 'none';
        addBtn.style.pointerEvents = 'none';
        adding = true;
    }
});

var closeModal = document.getElementById('closeModal');
closeModal.addEventListener('click', function() {
    form.style.display = 'none';
    main.style.filter  = 'none';
    addBtn.style.cursor = 'pointer';
    addBtn.style.transition = '0.3s ease-in-out';
    addBtn.style.pointerEvents = 'auto';

    form.reset();

    adding = false;
});


closeModalInfo.addEventListener('click', function() {
    modalInfo.style.display = 'none';
    main.style.filter  = 'none';
    addBtn.style.cursor = 'pointer';
    addBtn.style.transition = '0.3s ease-in-out';
    addBtn.style.pointerEvents = 'auto';
});

amountInput.addEventListener('input', function() {
    let value = amountInput.value;
    if(value <= 0){
        amountInput.style.border = '2px solid red';
    }
    else {
        amountInput.style.border = '2px solid green';
    }
});

async function displayTransactions() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ""; // Clear existing rows

    var transactions = await getAllTransactions();

    transactions.forEach(transaction => {
        var row = document.createElement('tr');
        row.dataset.id = transaction.id; // Set the data-id attribute
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.date}</td>
            <td>${transaction.category}</td>
            <td>${transaction.description.split(" ").slice(0,4).join(" ")}</td>
            <td>${transaction.amount}</td>
            <td><button class='deleteBtn' data-id='${transaction.id}'>Delete</button></td>`;
            tableBody.appendChild(row);
        });
    }

function getAllTransactions() {
    return fetch("transactions.json")
        .then(response => response.json())
        .then(data => data.map(t => new Transaction(
            t.id,
            t.date,
            t.amount,
            t.category,
            t.description,
        )))
        .catch(error => console.error("Error fetching transactions: ", error));
};

async function deleteTransaction(id) {
    try {
        const response = await fetch("http://localhost:3000/delete-transaction", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        });
        const data = await response.text();
        alert(data);
        await calculateTotal();
    } catch(error) {
        console.error("Error deleting transaction:", error);
    }
}

async function calculateTotal() {
    let sum = 0;
    let transactions = await getAllTransactions();
    transactions.forEach(transaction => {
        sum += Number(transaction.amount);
    });

    let totalElement = document.getElementById('total');
    totalElement.textContent = `${sum}`;
}

class Transaction {
    constructor(id,date,amount,category,description) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.category = category;
        this.description = description;
    }

    
    async addTransaction(){
        try {
            const response = await fetch("http://localhost:3000/add-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this)
            });
            const data = await response.text();
            alert(data);
            await calculateTotal();
        }
        catch (error) {
            console.error("Error adding transaction:", error);
        } 
    }
}

displayTransactions(); 
calculateTotal();
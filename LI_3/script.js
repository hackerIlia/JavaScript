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

/**
 * Event listener for the table to handle row clicks and delete button clicks
 * @event {Event} click - The click event on the table
 * The listener checks if the clicked element is a button with the class 'deleteBtn' and if true deletes transaction with specified id.
 * If the clicked element is a table row, it retrieves the transaction details and displays them in a modal.
 */
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

/**
 * Event listener for the form submission
 * @event {Event} submit - The submit event on the form
 * The listener prevents the default form submission, retrieves all transactions, creates a new transaction object, and adds it to the transactions.
 */
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

/**
 * Event listener for the add transaction button
 * @event {Event} click - The click event on the add transaction button
 * The listener displays the form and applies a blur effect to the main content.
 */
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

/**
 * Event listener for the close modal button
 * @event {Event} click - The click event on the close modal button
 * The listener hides the form and removes the blur effect from the main content.
 * It also resets the form and sets the adding variable to false.
 */
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

/**
 * Event listener for the close modal info button
 * @event {Event} click - The click event on the close modal info button
 * The listener hides the modal info and removes the blur effect from the main content.
 */
closeModalInfo.addEventListener('click', function() {
    modalInfo.style.display = 'none';
    main.style.filter  = 'none';
    addBtn.style.cursor = 'pointer';
    addBtn.style.transition = '0.3s ease-in-out';
    addBtn.style.pointerEvents = 'auto';
});

/**
 * Event listener for the amount input field
 * @event {Event} input - The input event on the amount input field
 * The listener checks if the input value is less than or equal to 0 and applies a red border if true, otherwise applies a green border.
 */
amountInput.addEventListener('input', function() {
    let value = amountInput.value;
    if(value <= 0){
        amountInput.style.border = '2px solid red';
    }
    else {
        amountInput.style.border = '2px solid green';
    }
});

/**
 * Function for displaying transactions in the table
 * It receives all transaction and creates a table row for each of them.
 * Each row contains the transaction details and a delete button.
 */
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

/**
 * Function that fetches all transactions from the JSON file
 * @returns {Promise<Transaction[]>} - A promise that resolves to an array of Transaction objects
 */
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

/**
 * Function for deleting a transaction by id
 * @param {*} id  - id of the transaction to delete
 * It sends a DELETE request to the server with the id of the transaction to delete.
 * After the transaction is deleted, it calculates the total amount of all transactions.
 */
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

/**
 * Function for calculating the total amount of all transactions
 * It fetches all transactions and sums their amounts.
 * It updates the total amount displayed on the page.
 */
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

    
    /**
     * Function for adding a transaction to the JSON file
     * It sends a POST request to the server with the transaction data.
     * After the transaction is added, it calculates the total amount of all transactions.
     */
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

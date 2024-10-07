let products = JSON.parse(localStorage.getItem("products")) || {};  // Store all products with barcode as key
let cart = [];  // Products added to the cart with quantities
let history = JSON.parse(localStorage.getItem("history")) || [];  // Store bill history
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;  // Store the logged-in user

// Check if the user is already logged in
if (loggedInUser) {
    // Auto-login the user if already logged in
    document.getElementById("login-section").style.display = "none";
    document.getElementById("scanner-section").style.display = "block";
    alert(`Welcome back, ${loggedInUser.username}!`);
}

// Function to fetch the JSON file containing user data
async function fetchUsers() {
    try {
        const response = await fetch('users.json');  // Fetch the users.json file
        const data = await response.json();
        return data.users;  // Return the users array
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Login functionality
async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    const users = await fetchUsers();  // Get the list of users from the JSON file

    // Check if the entered username and password match any user in the JSON file
    let validUser = users.find(user => user.username === username && user.password === password);

    if (validUser) {
        alert(`Login successful! Welcome, ${validUser.username}.`);
        // Save logged-in user to local storage
        localStorage.setItem("loggedInUser", JSON.stringify(validUser));

        // Hide login form and show scanner section
        document.getElementById("login-section").style.display = "none";
        document.getElementById("scanner-section").style.display = "block";
    } else {
        alert("Invalid credentials! Please try again.");
    }
}

// Barcode scanning logic remains unchanged
domReady(function () {
    function onScanSuccess(decodedText, decodedResult) {
        if (products[decodedText]) {
            let quantity = prompt(`Scanned Product: ${products[decodedText].name}\nPlease enter the quantity:`);
            if (quantity && quantity > 0) {
                cart.push({
                    ...products[decodedText],
                    quantity: parseInt(quantity)
                });
                displayCart();
            } else {
                alert("Invalid quantity. Please try again.");
            }
        } else {
            let productDetails = prompt(`New Product: ${decodedText}\nEnter details (name,price,expiry) separated by commas:`);
            if (productDetails) {
                let [name, price, expiry] = productDetails.split(",");
                products[decodedText] = { barcode: decodedText, name, price: parseFloat(price), expiry };
                localStorage.setItem("products", JSON.stringify(products));

                let quantity = prompt(`Product ${name} added.\nPlease enter the quantity:`);
                if (quantity && quantity > 0) {
                    cart.push({
                        ...products[decodedText],
                        quantity: parseInt(quantity)
                    });
                    displayCart();
                } else {
                    alert("Invalid quantity. Please try again.");
                }
            }
        }
    }

    let htmlScanner = new Html5QrcodeScanner("my-qr-reader", { fps: 10, qrbox: 250 });
    htmlScanner.render(onScanSuccess);
});

function displayCart() {
    let productList = document.getElementById("product-list");
    productList.innerHTML = "";
    cart.forEach((product, index) => {
        productList.innerHTML += `
            <div>
                Product: ${product.name} | Price: ₹${product.price} | Quantity: ${product.quantity} | Expiry: ${product.expiry} 
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>`;
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

function generateBill() {
    let total = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    let bill = {
        products: [...cart],
        total,
        time: new Date().toLocaleString(),
    };
    history.push(bill);
    localStorage.setItem("history", JSON.stringify(history));

    document.getElementById("bill-section").style.display = "block";
    document.getElementById("bill-section").innerHTML = `<h3>Bill Generated</h3><div>Total: ₹${total}</div>`;

    cart = [];
    document.getElementById("product-list").innerHTML = "";
}

function viewHistory() {
    document.getElementById("history-section").style.display = "block";
    document.getElementById("history-section").innerHTML = `<h3>Bill History</h3>`;

    history.forEach((bill, index) => {
        document.getElementById("history-section").innerHTML += `<div>Bill ${index + 1} - Total: ₹${bill.total} - Date: ${bill.time}</div>`;
        bill.products.forEach((product) => {
            document.getElementById("history-section").innerHTML += `
                <div>Product: ${product.name} | Price: ₹${product.price} | Quantity: ${product.quantity}</div>`;
        });
    });

    let downloadBtn = document.createElement("button");
    downloadBtn.innerText = "Download History (JSON)";
    downloadBtn.onclick = () => downloadJSON(history, 'bill-history.json');
    document.getElementById("history-section").appendChild(downloadBtn);
}

function downloadJSON(data, filename) {
    let jsonStr = JSON.stringify(data);
    let blob = new Blob([jsonStr], { type: "application/json" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

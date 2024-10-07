// Pre-filled login credentials
const USERNAME = "user123";
const PASSWORD = "pass123";

let products = JSON.parse(localStorage.getItem("products")) || {};  // Store all products with barcode as key
let cart = [];  // Products added to the cart with quantities
let history = JSON.parse(localStorage.getItem("history")) || [];  // Store bill history

function domReady(fn) {
    document.readyState === "complete" || document.readyState === "interactive"
        ? setTimeout(fn, 1000)
        : document.addEventListener("DOMContentLoaded", fn);
}

domReady(function () {
    // Function for successful scan
    function onScanSuccess(decodedText, decodedResult) {
        if (products[decodedText]) {
            // Product exists in storage, ask for quantity
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
            // Product doesn't exist, prompt user to set product details
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

    // Initialize barcode scanner
    let htmlScanner = new Html5QrcodeScanner("my-qr-reader", { fps: 10, qrbox: 250 });
    htmlScanner.render(onScanSuccess);
});

// Login functionality
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    if (username === USERNAME && password === PASSWORD) {
        alert("Login successful!");
        document.getElementById("login-section").style.display = "none";
        document.getElementById("scanner-section").style.display = "block";
    } else {
        alert("Invalid credentials!");
    }
}

// Display cart items with quantity
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

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

// Generate bill with quantity logic
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

    // Clear cart for next session
    cart = [];
    document.getElementById("product-list").innerHTML = "";
}

// View bill history
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

    // Add download button to export history as JSON
    let downloadBtn = document.createElement("button");
    downloadBtn.innerText = "Download History (JSON)";
    downloadBtn.onclick = () => downloadJSON(history, 'bill-history.json');
    document.getElementById("history-section").appendChild(downloadBtn);
}

// Download JSON functionality
function downloadJSON(data, filename) {
    let jsonStr = JSON.stringify(data);
    let blob = new Blob([jsonStr], { type: "application/json" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

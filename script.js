function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

domReady(function () {
    const scanner = new Html5QrcodeScanner("my-barcode-reader", { fps: 10, qrbox: 250 });
    const products = [];
    let total = 0;

    // DOM elements
    const barcodeInput = document.getElementById("barcode");
    const productNameInput = document.getElementById("product-name");
    const productPriceInput = document.getElementById("product-price");
    const productExpiryInput = document.getElementById("product-expiry");
    const billList = document.getElementById("bill-list");
    const billTotal = document.getElementById("bill-total");
    const historyList = document.getElementById("history-list");

    // Start scanner
    document.getElementById("start-scanner").addEventListener("click", () => {
        scanner.render((decodedText) => {
            barcodeInput.value = decodedText;
        });
    });

    // Add product
    document.getElementById("add-product").addEventListener("click", () => {
        const barcode = barcodeInput.value;
        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value);
        const expiry = productExpiryInput.value;

        if (!barcode || !name || isNaN(price)) {
            alert("Please fill in all required fields.");
            return;
        }

        products.push({ barcode, name, price, expiry });
        updateBill();

        // Clear inputs
        barcodeInput.value = "";
        productNameInput.value = "";
        productPriceInput.value = "";
        productExpiryInput.value = "";
    });

    // Update bill
    function updateBill() {
        billList.innerHTML = "";
        total = 0;

        products.forEach((product, index) => {
            const li = document.createElement("li");
            li.textContent = `${product.name} - $${product.price.toFixed(2)} (Expiry: ${product.expiry || "N/A"})`;
            billList.appendChild(li);
            total += product.price;
        });

        billTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Generate bill
    document.getElementById("generate-bill").addEventListener("click", () => {
        if (products.length === 0) {
            alert("No products to generate bill.");
            return;
        }

        const billDetails = {
            products: [...products],
            total: total.toFixed(2),
            date: new Date().toLocaleString(),
        };

        // Save to history
        saveBillToHistory(billDetails);
        products.length = 0; // Clear current bill
        updateBill();
        alert("Bill generated!");
    });

    // Save bill to history
    function saveBillToHistory(billDetails) {
        const history = JSON.parse(localStorage.getItem("billHistory")) || [];
        history.push(billDetails);
        localStorage.setItem("billHistory", JSON.stringify(history));

        const li = document.createElement("li");
        li.textContent = `Bill on ${billDetails.date} - Total: $${billDetails.total}`;
        historyList.appendChild(li);
    }

    // Print bill
    document.getElementById("print-bill").addEventListener("click", () => {
        const billContent = products
            .map(product => `${product.name} - $${product.price.toFixed(2)}`)
            .join("\n");

        const printWindow = window.open("", "", "width=600,height=400");
        printWindow.document.write("<pre>" + billContent + "\n\nTotal: $" + total.toFixed(2) + "</pre>");
        printWindow.print();
    });

    // Load bill history
    function loadBillHistory() {
        const history = JSON.parse(localStorage.getItem("billHistory")) || [];
        history.forEach(bill => {
            const li = document.createElement("li");
            li.textContent = `Bill on ${bill.date} - Total: $${bill.total}`;
            historyList.appendChild(li);
        });
    }

    loadBillHistory();
});

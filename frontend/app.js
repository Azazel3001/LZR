const BASE_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {

    let currentUser = null;
    let allProducts = [];

    const inventoryList = document.getElementById("inventoryList");
    const salesList = document.getElementById("salesList");
    const returnsList = document.getElementById("returnsList");

    // LOGIN
    window.login = function () {
        const username = document.getElementById("loginUser").value;
        const password = document.getElementById("loginPass").value;

        if (!username || !password) {
            document.getElementById("loginError").innerText = "Completa los campos";
            return;
        }

        fetch(BASE_URL + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
            .then(r => r.json())
            .then(data => {

                if (data.error) {
                    document.getElementById("loginError").innerText = data.error;
                    return;
                }

                currentUser = data.username;

                document.getElementById("loginScreen").style.display = "none";
                document.querySelector(".navbar").style.display = "flex";
                document.getElementById("products").style.display = "block";

                document.getElementById("username").innerText = data.username;

                fetchProducts();
                fetchSales();
                fetchReturns();
            });
    };

    // LOGOUT
    window.logout = function () {
        location.reload();
    };

    // CAMBIAR SECCIÓN
    window.showSection = function (section) {
        document.querySelectorAll(".section").forEach(s => s.style.display = "none");
        document.getElementById(section).style.display = "block";
    };

    // PRODUCTOS
    window.addProduct = function () {
        const brand = document.getElementById("brand").value;
        const model = document.getElementById("model").value;
        const price = document.getElementById("price").value;
        const quantity = document.getElementById("quantity").value;
        const category = document.getElementById("category").value;
        const image = document.getElementById("productImage").files[0];

        if (!brand || !model || !price || !quantity) {
            alert("Completa todos los campos");
            return;
        }

        const formData = new FormData();
        formData.append("brand", brand);
        formData.append("model", model);
        formData.append("category", category);
        formData.append("price", price);
        formData.append("quantity", quantity);
        if (image) formData.append("image", image);

        fetch(BASE_URL + "/products", {
            method: "POST",
            body: formData
        })
            .then(() => fetchProducts());
    };

    function fetchProducts() {
        fetch(BASE_URL + "/products")
            .then(r => r.json())
            .then(data => {
                allProducts = data;
                displayProducts(data);
            });
    }

    function displayProducts(products) {
        inventoryList.innerHTML = "";

        products.forEach(p => {
            inventoryList.innerHTML += `
            <div class="card">
                <h3>${p.brand} - ${p.model}</h3>
                <p>$${p.price}</p>
                <p>Stock: ${p.quantity}</p>
                ${p.imageUrl ? `<img src="${p.imageUrl}">` : ""}
                <button onclick="sellProduct('${p._id}')">Vender</button>
                <button onclick="deleteProduct('${p._id}')">Eliminar</button>
            </div>`;
        });
    }

    window.deleteProduct = function (id) {
        fetch(BASE_URL + "/products/" + id, { method: "DELETE" })
            .then(() => fetchProducts());
    };

    // VENTAS
    window.sellProduct = function (id) {
        const qty = prompt("Cantidad:");
        const client = prompt("Cliente:");

        if (!qty || !client) return;

        fetch(BASE_URL + "/sell", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId: id,
                quantity: qty,
                client,
                user: currentUser
            })
        })
            .then(() => {
                fetchProducts();
                fetchSales();
            });
    };

    function fetchSales() {
        fetch(BASE_URL + "/sales")
            .then(r => r.json())
            .then(data => {
                salesList.innerHTML = "";

                data.forEach(s => {
                    salesList.innerHTML += `
                <div class="card">
                    <h3>${s.model}</h3>
                    <p>${s.client}</p>
                </div>`;
                });
            });
    }

    function fetchReturns() {
        fetch(BASE_URL + "/returns")
            .then(r => r.json())
            .then(data => {
                returnsList.innerHTML = "";

                data.forEach(r => {
                    returnsList.innerHTML += `
                <div class="card">
                    <h3>${r.model}</h3>
                    <p>${r.client}</p>
                </div>`;
                });
            });
    }

    // BUSCAR
    window.searchProducts = function () {
        const text = document.getElementById("search").value.toLowerCase();

        displayProducts(allProducts.filter(p =>
            p.brand.toLowerCase().includes(text) ||
            p.model.toLowerCase().includes(text)
        ));
    };

}); 
const BASE_URL = window.location.origin;

let user = localStorage.getItem("user");

function login() {
  fetch(BASE_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: userInput.value,
      password: passInput.value
    })
  })
    .then(r => r.json())
    .then(data => {
      if (data.error) return alert(data.error);

      localStorage.setItem("user", data.username);
      start();
    });
}

function start() {
  login.style.display = "none";
  app.style.display = "block";
  loadProducts();
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

function loadProducts() {
  fetch(BASE_URL + "/products")
    .then(r => r.json())
    .then(data => {
      list.innerHTML = "";
      data.forEach(p => {
        list.innerHTML += `
            <div class="card">
                <h3>${p.brand} - ${p.model}</h3>
                <p>${p.category}</p>
                <p>$${p.price}</p>
                <p>Stock: ${p.quantity}</p>
                ${p.imageUrl ? `<img src="${p.imageUrl}" width="100">` : ""}
            </div>`;
      });
    });
}

function addProduct() {
  const f = new FormData();

  f.append("brand", brand.value);
  f.append("model", model.value);
  f.append("category", category.value);
  f.append("price", price.value);
  f.append("quantity", quantity.value);

  if (image.files[0]) f.append("image", image.files[0]);

  fetch(BASE_URL + "/products", { method: "POST", body: f })
    .then(() => loadProducts());
}

if (user) start();
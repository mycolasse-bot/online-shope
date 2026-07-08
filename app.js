const DATA = window.StoreData;
const PRODUCTS_KEY = "fashion_products_v3";
const CART_KEY = "fashion_cart_v3";
const ORDERS_KEY = "fashion_orders_v3";
const ADMIN_KEY = "fashion_admin";
const THEME_KEY = "fashion_theme";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

const state = {
  products: loadProducts(),
  cart: read(CART_KEY, []),
  orders: read(ORDERS_KEY, []),
  selectedCategory: "Semua",
  search: new URLSearchParams(window.location.search).get("q") || "",
  admin: localStorage.getItem(ADMIN_KEY) === "true"
};

function applyTheme(theme) {
  const themes = ["rose", "lavender", "shopee-yellow", "orange", "blue", "sage", "green", "mocha", "gray", "white"];
  const safeTheme = themes.includes(theme) ? theme : "rose";
  document.body.dataset.theme = safeTheme;
  localStorage.setItem(THEME_KEY, safeTheme);
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.classList.toggle("active", button.dataset.themeChoice === safeTheme);
  });
}

const els = {
  adminClose: document.querySelector("#adminClose"),
  adminContent: document.querySelector("#adminContent"),
  adminDrawer: document.querySelector("#adminDrawer"),
  adminOpen: document.querySelector("#adminOpen"),
  adminProductList: document.querySelector("#adminProductList"),
  cartClose: document.querySelector("#cartClose"),
  cartCount: document.querySelector("#cartCount"),
  cartDrawer: document.querySelector("#cartDrawer"),
  cartItems: document.querySelector("#cartItems"),
  cartOpen: document.querySelector("#cartOpen"),
  cartSubtotal: document.querySelector("#cartSubtotal"),
  categoryFilters: document.querySelector("#categoryFilters"),
  categoryGrid: document.querySelector("#categoryGrid"),
  checkoutForm: document.querySelector("#checkoutForm"),
  checkoutJump: document.querySelector("#checkoutJump"),
  clearOrders: document.querySelector("#clearOrders"),
  flashClock: document.querySelector("#flashClock"),
  flashStrip: document.querySelector("#flashStrip"),
  loginForm: document.querySelector("#loginForm"),
  logoutAdmin: document.querySelector("#logoutAdmin"),
  orderList: document.querySelector("#orderList"),
  paymentResult: document.querySelector("#paymentResult"),
  paymentSelect: document.querySelector("#paymentSelect"),
  productForm: document.querySelector("#productForm"),
  productGrid: document.querySelector("#productGrid"),
  productSubmit: document.querySelector("#productSubmit"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  shippingSelect: document.querySelector("#shippingSelect"),
  toast: document.querySelector("#toast")
};

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(value) {
  return String(value || "produk")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42) || `produk-${Date.now()}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const chars = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return chars[char];
  });
}

function productPhotoKey(product) {
  const text = `${product.id} ${product.category} ${product.title}`.toLowerCase();
  if (text.includes("blouse")) return "blouse";
  if (text.includes("outer") || text.includes("linen")) return "outer";
  if (text.includes("tas") || text.includes("bag")) return "bag";
  if (text.includes("rok") || text.includes("skirt")) return "skirt";
  if (text.includes("sepatu") || text.includes("heels")) return "heels";
  return "dress";
}

function hydrateProduct(product) {
  const key = productPhotoKey(product);
  const photos = product.photos?.length ? product.photos : DATA.productPhotos[key];
  return {
    ...product,
    photos,
    image: product.image || photos[0],
    sold: product.sold ?? 0,
    stock: product.stock ?? 25,
    rating: product.rating ?? 4.8,
    material: product.material || "Bahan nyaman untuk pemakaian harian",
    color: product.color || "Warna sesuai foto",
    weight: product.weight || "500 gram",
    detail: product.detail || product.description
  };
}

function loadProducts() {
  return read(PRODUCTS_KEY, DATA.products).map(hydrateProduct);
}

function saveProducts() {
  write(PRODUCTS_KEY, state.products);
}

function saveCart() {
  write(CART_KEY, state.cart);
}

function saveOrders() {
  write(ORDERS_KEY, state.orders);
}

function finalPrice(product) {
  return Math.round(product.price - product.price * (Number(product.discount || 0) / 100));
}

function notify(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function renderSelectOptions() {
  if (!els.shippingSelect || !els.paymentSelect) return;
  els.shippingSelect.innerHTML = DATA.shippingOptions
    .map((item) => `<option value="${escapeHtml(item.name)}|${item.price}">${escapeHtml(item.name)} - ${rupiah.format(item.price)}</option>`)
    .join("");
  els.paymentSelect.innerHTML = DATA.paymentMethods
    .map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)
    .join("");
}

function renderCategories() {
  els.categoryGrid.innerHTML = DATA.categories
    .map(
      (category) => `
        <a class="category-item" href="#produk" data-category="${escapeHtml(category.name)}">
          <img src="${category.image}" alt="${escapeHtml(category.name)}" />
          <span>${escapeHtml(category.name)}</span>
        </a>
      `
    )
    .join("");

  const categories = ["Semua", ...new Set(state.products.map((product) => product.category))];
  els.categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button class="${category === state.selectedCategory ? "active" : ""}" type="button" data-filter="${escapeHtml(category)}">
          ${escapeHtml(category)}
        </button>
      `
    )
    .join("");
}

function filteredProducts() {
  const search = state.search.trim().toLowerCase();
  return state.products.filter((product) => {
    const categoryMatch = state.selectedCategory === "Semua" || product.category === state.selectedCategory;
    const searchMatch =
      !search ||
      `${product.title} ${product.category} ${product.description}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });
}

function productCard(product) {
  const hasDiscount = Number(product.discount) > 0;
  return `
    <article class="product-card">
      <a class="product-link" href="product.html?id=${encodeURIComponent(product.id)}">
        <img src="${product.image}" alt="${escapeHtml(product.title)}" />
        <div class="product-body">
          <h3 class="product-title">${escapeHtml(product.title)}</h3>
          <div class="price-row">
            <strong class="price">${rupiah.format(finalPrice(product))}</strong>
            ${hasDiscount ? `<span class="sale-text">-${product.discount}%</span>` : ""}
          </div>
          ${hasDiscount ? `<span class="old-price">${rupiah.format(product.price)}</span>` : ""}
          <div class="sold-row">
            <span>${product.rating} ★</span>
            <span>Terjual ${product.sold}</span>
          </div>
        </div>
      </a>
      <button class="add-button" type="button" data-add="${escapeHtml(product.id)}">Tambah Cart</button>
    </article>
  `;
}

function renderProducts() {
  const products = filteredProducts();
  els.productGrid.innerHTML = products.length
    ? products.map(productCard).join("")
    : `<p class="empty-text">Produk tidak ditemukan.</p>`;
}

function renderFlashSale() {
  const saleProducts = state.products.filter((product) => Number(product.discount) > 0);
  els.flashStrip.innerHTML = saleProducts.map(productCard).join("");
}

function findProduct(id) {
  return state.products.find((product) => product.id === id);
}

function addToCart(id, qty = 1) {
  const product = findProduct(id);
  if (!product) return;
  const item = state.cart.find((entry) => entry.id === id);
  if (item) item.qty += qty;
  else state.cart.push({ id, qty });
  saveCart();
  renderCart();
  notify("Produk masuk ke cart.");
}

function updateCart(id, action) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;
  if (action === "plus") item.qty += 1;
  if (action === "minus") item.qty -= 1;
  if (action === "remove" || item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== id);
  }
  saveCart();
  renderCart();
}

function renderCart() {
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => {
    const product = findProduct(item.id);
    return product ? sum + finalPrice(product) * item.qty : sum;
  }, 0);

  els.cartCount.textContent = totalQty;
  els.cartSubtotal.textContent = rupiah.format(subtotal);
  if (els.checkoutJump) {
    const firstCartProduct = state.cart[0]?.id || "dress";
    els.checkoutJump.href = `product.html?id=${encodeURIComponent(firstCartProduct)}`;
  }
  els.cartItems.innerHTML = state.cart.length
    ? state.cart
        .map((item) => {
          const product = findProduct(item.id);
          if (!product) return "";
          return `
            <div class="cart-row">
              <div class="cart-row-head">
                <strong>${escapeHtml(product.title)}</strong>
                <span>${rupiah.format(finalPrice(product) * item.qty)}</span>
              </div>
              <div class="item-actions">
                <span>${item.qty} x ${rupiah.format(finalPrice(product))}</span>
                <span>
                  <button type="button" data-minus="${escapeHtml(product.id)}">-</button>
                  <button type="button" data-plus="${escapeHtml(product.id)}">+</button>
                  <button type="button" data-remove="${escapeHtml(product.id)}">Hapus</button>
                </span>
              </div>
            </div>
          `;
        })
        .join("")
    : `<p>Keranjang masih kosong.</p>`;
}

function createOrderFromCart(form) {
  const [shippingName, shippingCost] = form.get("shipping").split("|");
  const items = state.cart
    .map((cartItem) => {
      const product = findProduct(cartItem.id);
      return product
        ? {
            id: product.id,
            title: product.title,
            qty: cartItem.qty,
            price: finalPrice(product)
          }
        : null;
    })
    .filter(Boolean);
  const productTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const payment = form.get("payment");

  return {
    id: `ORD-${Date.now()}`,
    name: form.get("name"),
    phone: form.get("phone"),
    address: form.get("address"),
    shippingName,
    shippingCost: Number(shippingCost),
    payment,
    items,
    total: productTotal + Number(shippingCost),
    createdAt: new Date().toISOString()
  };
}

function paymentText(order) {
  if (order.payment === "COD") {
    return `Pesanan dibuat. Pembayaran COD dilakukan saat paket diterima. Total: ${rupiah.format(order.total)}.`;
  }
  return `Pesanan dibuat. Silakan bayar ${rupiah.format(order.total)} via ${order.payment}. Kode pembayaran: ${order.id}.`;
}

function renderAdmin() {
  els.loginForm.hidden = state.admin;
  els.adminContent.hidden = !state.admin;

  els.adminProductList.innerHTML = state.products
    .map(
      (product) => `
        <div class="admin-product">
          <strong>${escapeHtml(product.title)}</strong>
          <span>${escapeHtml(product.category)} - ${rupiah.format(finalPrice(product))}</span>
          <p>${escapeHtml(product.description)}</p>
          <div>
            <button type="button" data-edit="${escapeHtml(product.id)}">Edit</button>
            <button class="danger" type="button" data-delete="${escapeHtml(product.id)}">Hapus</button>
          </div>
        </div>
      `
    )
    .join("");

  els.orderList.innerHTML = state.orders.length
    ? state.orders
        .slice()
        .reverse()
        .map(
          (order) => `
            <div class="order-card">
              <strong>${escapeHtml(order.name)} - ${escapeHtml(order.phone)}</strong>
              <span>${escapeHtml(order.shippingName)} | ${escapeHtml(order.payment)}</span>
              <span>Total: ${rupiah.format(order.total)}</span>
              <p>${escapeHtml(order.address)}</p>
              <small>${order.items.map((item) => `${escapeHtml(item.title)} x ${item.qty}`).join(", ")}</small>
            </div>
          `
        )
        .join("")
    : `<p>Belum ada pesanan masuk.</p>`;
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderFlashSale();
  renderCart();
  renderAdmin();
}

function openDrawer(drawer) {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer(drawer) {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

els.cartOpen.addEventListener("click", () => openDrawer(els.cartDrawer));
els.cartClose.addEventListener("click", () => closeDrawer(els.cartDrawer));
els.adminOpen.addEventListener("click", () => openDrawer(els.adminDrawer));
els.adminClose.addEventListener("click", () => closeDrawer(els.adminDrawer));
els.checkoutJump.addEventListener("click", () => closeDrawer(els.cartDrawer));

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const plusButton = event.target.closest("[data-plus]");
  const minusButton = event.target.closest("[data-minus]");
  const removeButton = event.target.closest("[data-remove]");
  const category = event.target.closest("[data-category]");

  if (addButton) addToCart(addButton.dataset.add);
  if (plusButton) updateCart(plusButton.dataset.plus, "plus");
  if (minusButton) updateCart(minusButton.dataset.minus, "minus");
  if (removeButton) updateCart(removeButton.dataset.remove, "remove");
  if (category) {
    state.selectedCategory = category.dataset.category;
    renderCategories();
    renderProducts();
  }
});

els.categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.selectedCategory = button.dataset.filter;
  renderCategories();
  renderProducts();
});

els.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.search = els.searchInput.value;
  renderProducts();
  document.querySelector("#produk").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector(".quick-links").addEventListener("click", (event) => {
  const button = event.target.closest("[data-search]");
  if (!button) return;
  els.searchInput.value = button.dataset.search;
  state.search = button.dataset.search;
  renderProducts();
  document.querySelector("#produk").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("click", (event) => {
  const themeButton = event.target.closest("[data-theme-choice]");
  if (!themeButton) return;
  applyTheme(themeButton.dataset.themeChoice);
});

if (els.checkoutForm) {
  els.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.cart.length) {
      notify("Cart masih kosong.");
      return;
    }
    const order = createOrderFromCart(new FormData(event.currentTarget));
    state.orders.push(order);
    state.cart = [];
    saveOrders();
    saveCart();
    event.currentTarget.reset();
    renderAll();
    els.paymentResult.hidden = false;
    els.paymentResult.textContent = paymentText(order);
    notify("Pesanan masuk ke admin.");
  });
}

els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (form.get("username") === "admin" && form.get("password") === "admin123") {
    state.admin = true;
    localStorage.setItem(ADMIN_KEY, "true");
    renderAdmin();
    notify("Admin berhasil login.");
  } else {
    notify("Username atau password salah.");
  }
});

els.logoutAdmin.addEventListener("click", () => {
  state.admin = false;
  localStorage.removeItem(ADMIN_KEY);
  renderAdmin();
});

els.productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const existingId = form.get("id");
  let id = existingId || makeId(form.get("title"));
  if (!existingId && state.products.some((product) => product.id === id)) {
    id = `${id}-${Date.now()}`;
  }
  const oldProduct = state.products.find((product) => product.id === id);
  const product = hydrateProduct({
    id,
    title: form.get("title"),
    category: form.get("category"),
    price: Number(form.get("price")),
    discount: Number(form.get("discount") || 0),
    description: form.get("description"),
    detail: oldProduct?.detail || form.get("description"),
    photos: oldProduct?.photos,
    image: oldProduct?.image,
    sold: oldProduct?.sold || 0,
    stock: oldProduct?.stock || 20,
    rating: oldProduct?.rating || 4.8
  });

  const index = state.products.findIndex((entry) => entry.id === id);
  if (index >= 0) {
    state.products[index] = product;
    notify("Produk berhasil diedit.");
  } else {
    state.products.unshift(product);
    notify("Produk berhasil ditambahkan.");
  }

  saveProducts();
  event.currentTarget.reset();
  els.productSubmit.textContent = "Tambah Produk";
  renderAll();
});

els.adminProductList.addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const product = findProduct(editId);
    if (!product) return;
    els.productForm.elements.id.value = product.id;
    els.productForm.elements.title.value = product.title;
    els.productForm.elements.category.value = product.category;
    els.productForm.elements.price.value = product.price;
    els.productForm.elements.discount.value = product.discount;
    els.productForm.elements.description.value = product.description;
    els.productSubmit.textContent = "Simpan Perubahan";
  }

  if (deleteId) {
    state.products = state.products.filter((entry) => entry.id !== deleteId);
    state.cart = state.cart.filter((entry) => entry.id !== deleteId);
    saveProducts();
    saveCart();
    renderAll();
    notify("Produk berhasil dihapus.");
  }
});

els.clearOrders.addEventListener("click", () => {
  state.orders = [];
  saveOrders();
  renderAdmin();
  notify("Notif pesanan dibersihkan.");
});

function runClock() {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end - now);
  const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  els.flashClock.textContent = `${hours}:${minutes}:${seconds}`;
}

els.searchInput.value = state.search;
applyTheme(localStorage.getItem(THEME_KEY));
renderSelectOptions();
renderAll();
runClock();
setInterval(runClock, 1000);

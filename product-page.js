const DATA = window.StoreData;
const PRODUCTS_KEY = "fashion_products_v3";
const CART_KEY = "fashion_cart_v3";
const ORDERS_KEY = "fashion_orders_v3";
const THEME_KEY = "fashion_theme";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

const els = {
  buyForm: document.querySelector("#buyForm"),
  cartClose: document.querySelector("#cartClose"),
  cartCount: document.querySelector("#cartCount"),
  cartDrawer: document.querySelector("#cartDrawer"),
  cartItems: document.querySelector("#cartItems"),
  cartOpen: document.querySelector("#cartOpen"),
  cartSubtotal: document.querySelector("#cartSubtotal"),
  checkoutJump: document.querySelector("#checkoutJump"),
  detailSearchForm: document.querySelector("#detailSearchForm"),
  detailSearchInput: document.querySelector("#detailSearchInput"),
  paymentResult: document.querySelector("#paymentResult"),
  paymentSelect: document.querySelector("#paymentSelect"),
  productDetail: document.querySelector("#productDetail"),
  shippingSelect: document.querySelector("#shippingSelect"),
  toast: document.querySelector("#toast")
};

const params = new URLSearchParams(window.location.search);
const state = {
  products: loadProducts(),
  cart: read(CART_KEY, []),
  orders: read(ORDERS_KEY, []),
  activeId: params.get("id") || "dress",
  activePhoto: 0,
  qty: 1
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

function finalPrice(product) {
  return Math.round(product.price - product.price * (Number(product.discount || 0) / 100));
}

function currentProduct() {
  return state.products.find((product) => product.id === state.activeId) || state.products[0];
}

function notify(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function renderSelectOptions() {
  els.shippingSelect.innerHTML = DATA.shippingOptions
    .map((item) => `<option value="${escapeHtml(item.name)}|${item.price}">${escapeHtml(item.name)} - ${rupiah.format(item.price)}</option>`)
    .join("");
  els.paymentSelect.innerHTML = DATA.paymentMethods
    .map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)
    .join("");
}

function renderProduct() {
  const product = currentProduct();
  if (!product) {
    els.productDetail.innerHTML = `<p>Produk tidak ditemukan. Silakan kembali ke halaman utama.</p>`;
    return;
  }

  const hasDiscount = Number(product.discount) > 0;
  const activePhoto = product.photos[state.activePhoto] || product.image;

  els.productDetail.innerHTML = `
    <div class="detail-gallery">
      <img class="detail-main-img" src="${activePhoto}" alt="${escapeHtml(product.title)}" />
      <div class="thumb-grid" aria-label="Foto produk">
        ${product.photos
          .map(
            (photo, index) => `
              <button class="thumb-button ${index === state.activePhoto ? "active" : ""}" type="button" data-photo="${index}" aria-label="Foto ${index + 1}">
                <img src="${photo}" alt="${escapeHtml(product.title)} foto ${index + 1}" />
              </button>
            `
          )
          .join("")}
      </div>
    </div>

    <div class="detail-info">
      <h1>${escapeHtml(product.title)}</h1>
      <div class="rating-line">
        <span>Rating ${product.rating}</span>
        <span>Terjual ${product.sold}</span>
        <span>Stok ${product.stock}</span>
      </div>
      <div class="detail-price">
        <strong>${rupiah.format(finalPrice(product))}</strong>
        ${hasDiscount ? `<span class="old-price">${rupiah.format(product.price)}</span><span class="sale-text">Diskon ${product.discount}%</span>` : ""}
      </div>
      <p class="detail-copy">${escapeHtml(product.description)}</p>
      <p class="detail-copy">${escapeHtml(product.detail)}</p>
      <div class="detail-specs">
        <div><span>Kategori</span><br />${escapeHtml(product.category)}</div>
        <div><span>Bahan</span><br />${escapeHtml(product.material)}</div>
        <div><span>Warna</span><br />${escapeHtml(product.color)}</div>
        <div><span>Berat</span><br />${escapeHtml(product.weight)}</div>
      </div>
      <div class="quantity-row">
        <span>Jumlah</span>
        <div class="qty-control">
          <button type="button" data-qty="minus">-</button>
          <input id="qtyInput" value="${state.qty}" inputmode="numeric" aria-label="Jumlah produk" />
          <button type="button" data-qty="plus">+</button>
        </div>
      </div>
      <div class="auto-total">
        <span>Total produk sebelum ongkir:</span>
        <strong id="productSubtotal">${rupiah.format(finalPrice(product) * state.qty)}</strong>
      </div>
      <div class="detail-actions">
        <button class="secondary-button" type="button" data-add-cart>Tambah ke Cart</button>
        <a class="primary-button" href="#checkout">Beli Sekarang</a>
      </div>
    </div>
  `;
}

function renderCart() {
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => {
    const product = state.products.find((entry) => entry.id === item.id);
    return product ? sum + finalPrice(product) * item.qty : sum;
  }, 0);

  els.cartCount.textContent = totalQty;
  els.cartSubtotal.textContent = rupiah.format(subtotal);
  els.cartItems.innerHTML = state.cart.length
    ? state.cart
        .map((item) => {
          const product = state.products.find((entry) => entry.id === item.id);
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

function addToCart(id, qty = 1) {
  const item = state.cart.find((entry) => entry.id === id);
  if (item) item.qty += qty;
  else state.cart.push({ id, qty });
  write(CART_KEY, state.cart);
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
  write(CART_KEY, state.cart);
  renderCart();
}

function paymentText(order) {
  if (order.payment === "COD") {
    return `Pesanan dibuat. Pembayaran COD dilakukan saat paket diterima. Total: ${rupiah.format(order.total)}.`;
  }
  return `Pesanan dibuat. Silakan bayar ${rupiah.format(order.total)} via ${order.payment}. Kode pembayaran: ${order.id}.`;
}

function openDrawer(drawer) {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer(drawer) {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

els.productDetail.addEventListener("click", (event) => {
  const photoButton = event.target.closest("[data-photo]");
  const qtyButton = event.target.closest("[data-qty]");
  const addButton = event.target.closest("[data-add-cart]");

  if (photoButton) {
    state.activePhoto = Number(photoButton.dataset.photo);
    renderProduct();
  }

  if (qtyButton) {
    state.qty = qtyButton.dataset.qty === "plus" ? state.qty + 1 : Math.max(1, state.qty - 1);
    renderProduct();
  }

  if (addButton) {
    addToCart(currentProduct().id, state.qty);
  }
});

els.productDetail.addEventListener("input", (event) => {
  if (event.target.id !== "qtyInput") return;
  state.qty = Math.max(1, Number(event.target.value.replace(/\D/g, "")) || 1);
  updateProductSubtotal();
});

function updateProductSubtotal() {
  const subtotal = document.querySelector("#productSubtotal");
  if (!subtotal) return;
  subtotal.textContent = rupiah.format(finalPrice(currentProduct()) * state.qty);
}

document.addEventListener("click", (event) => {
  const plusButton = event.target.closest("[data-plus]");
  const minusButton = event.target.closest("[data-minus]");
  const removeButton = event.target.closest("[data-remove]");
  const themeButton = event.target.closest("[data-theme-choice]");

  if (plusButton) updateCart(plusButton.dataset.plus, "plus");
  if (minusButton) updateCart(minusButton.dataset.minus, "minus");
  if (removeButton) updateCart(removeButton.dataset.remove, "remove");
  if (themeButton) applyTheme(themeButton.dataset.themeChoice);
});

els.cartOpen.addEventListener("click", () => openDrawer(els.cartDrawer));
els.cartClose.addEventListener("click", () => closeDrawer(els.cartDrawer));
els.checkoutJump.addEventListener("click", () => closeDrawer(els.cartDrawer));

els.detailSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const search = encodeURIComponent(els.detailSearchInput.value.trim());
  window.location.href = search ? `index.html?q=${search}#produk` : "index.html#produk";
});

els.buyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const product = currentProduct();
  const form = new FormData(event.currentTarget);
  const [shippingName, shippingCost] = form.get("shipping").split("|");
  const productTotal = finalPrice(product) * state.qty;
  const address = [
    form.get("street"),
    form.get("village"),
    form.get("regency"),
    form.get("province")
  ]
    .filter(Boolean)
    .join(", ");
  const order = {
    id: `ORD-${Date.now()}`,
    name: form.get("name"),
    phone: form.get("phone"),
    address,
    shippingName,
    shippingCost: Number(shippingCost),
    payment: form.get("payment"),
    items: [
      {
        id: product.id,
        title: product.title,
        qty: state.qty,
        price: finalPrice(product)
      }
    ],
    total: productTotal + Number(shippingCost),
    createdAt: new Date().toISOString()
  };

  state.orders.push(order);
  write(ORDERS_KEY, state.orders);
  els.paymentResult.hidden = false;
  els.paymentResult.textContent = paymentText(order);
  notify("Pesanan dibuat dan masuk ke admin.");
});

applyTheme(localStorage.getItem(THEME_KEY));
renderSelectOptions();
renderProduct();
renderCart();

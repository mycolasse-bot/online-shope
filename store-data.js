window.StoreData = (() => {
  const productPhotos = {
    dress: [
      "assets/photos/dress-1.jpg",
      "assets/photos/dress-2.jpg",
      "assets/photos/dress-3.jpg",
      "assets/photos/dress-4.jpg",
      "assets/photos/dress-5.jpg",
      "assets/photos/dress-6.jpg"
    ],
    blouse: [
      "assets/photos/blouse-1.jpg",
      "assets/photos/blouse-2.jpg",
      "assets/photos/blouse-3.jpg",
      "assets/photos/blouse-4.jpg",
      "assets/photos/blouse-5.jpg",
      "assets/photos/blouse-6.jpg"
    ],
    outer: [
      "assets/photos/outer-1.jpg",
      "assets/photos/outer-2.jpg",
      "assets/photos/outer-3.jpg",
      "assets/photos/outer-4.jpg",
      "assets/photos/outer-5.jpg",
      "assets/photos/outer-6.jpg"
    ],
    bag: [
      "assets/photos/bag-1.jpg",
      "assets/photos/bag-2.jpg",
      "assets/photos/bag-3.jpg",
      "assets/photos/bag-4.jpg",
      "assets/photos/bag-5.jpg",
      "assets/photos/bag-6.jpg"
    ],
    skirt: [
      "assets/photos/skirt-1.jpg",
      "assets/photos/skirt-2.jpg",
      "assets/photos/skirt-3.jpg",
      "assets/photos/skirt-4.jpg",
      "assets/photos/skirt-5.jpg",
      "assets/photos/skirt-6.jpg"
    ],
    heels: [
      "assets/photos/heels-1.jpg",
      "assets/photos/heels-2.jpg",
      "assets/photos/heels-3.jpg",
      "assets/photos/heels-4.jpg",
      "assets/photos/heels-5.jpg",
      "assets/photos/heels-6.jpg"
    ]
  };

  const categories = [
    { id: "dress", name: "Dress", image: productPhotos.dress[0] },
    { id: "blouse", name: "Blouse", image: productPhotos.blouse[0] },
    { id: "outer", name: "Outer", image: productPhotos.outer[0] },
    { id: "bag", name: "Tas Wanita", image: productPhotos.bag[0] },
    { id: "skirt", name: "Rok", image: productPhotos.skirt[0] },
    { id: "heels", name: "Sepatu Wanita", image: productPhotos.heels[0] }
  ];

  const products = [
    {
      id: "dress",
      title: "Luna Satin Midi Dress",
      category: "Dress",
      price: 329000,
      discount: 25,
      sold: 128,
      stock: 34,
      rating: 4.9,
      material: "Satin premium, halus, ringan",
      color: "Dusty rose",
      weight: "450 gram",
      description:
        "Dress satin midi dengan potongan ramping, lembut di kulit, dan jatuh rapi untuk dinner, pesta kecil, atau acara kantor.",
      detail:
        "Bagian neckline dibuat clean dengan tali ramping. Tekstur satin memberi kilau lembut tanpa terlihat berlebihan. Cocok dipadukan dengan heels nude dan mini bag."
    },
    {
      id: "blouse",
      title: "Mira Puff Sleeve Blouse",
      category: "Blouse",
      price: 189000,
      discount: 15,
      sold: 214,
      stock: 56,
      rating: 4.8,
      material: "Katun rayon, adem",
      color: "Ivory",
      weight: "280 gram",
      description:
        "Blouse lengan puff dengan kancing depan dan siluet feminin untuk tampilan kantor, kuliah, dan casual harian.",
      detail:
        "Bahan terasa ringan dan tidak kaku. Detail kancing depan memudahkan styling, sementara lengan puff memberi volume manis tanpa membuat bahu terlihat berat."
    },
    {
      id: "outer",
      title: "Nara Linen Relaxed Outer",
      category: "Outer",
      price: 249000,
      discount: 0,
      sold: 97,
      stock: 29,
      rating: 4.7,
      material: "Linen blend bertekstur",
      color: "Natural beige",
      weight: "520 gram",
      description:
        "Outer linen dengan potongan longgar, mudah dipakai sebagai layer untuk inner polos, dress, atau celana high waist.",
      detail:
        "Kain linen blend memberi tekstur natural dan tetap nyaman untuk cuaca tropis. Model relaxed cocok untuk tampilan rapi tanpa terasa formal berlebihan."
    },
    {
      id: "bag",
      title: "Clara Mini Shoulder Bag",
      category: "Tas Wanita",
      price: 279000,
      discount: 30,
      sold: 186,
      stock: 41,
      rating: 4.9,
      material: "Kulit sintetis premium",
      color: "Cream",
      weight: "600 gram",
      description:
        "Tas bahu compact dengan tekstur premium, cukup untuk ponsel, dompet kecil, kunci, dan makeup touch-up.",
      detail:
        "Handle dibuat ramping dengan aksen metal gold. Bentuknya minimalis sehingga mudah masuk ke outfit formal maupun casual."
    },
    {
      id: "skirt",
      title: "Ayla Pleated Midi Skirt",
      category: "Rok",
      price: 219000,
      discount: 10,
      sold: 143,
      stock: 48,
      rating: 4.8,
      material: "Poly pleated lembut",
      color: "Taupe",
      weight: "390 gram",
      description:
        "Rok plisket midi dengan jatuh rapi, pinggang nyaman, dan warna netral untuk kantor, kampus, atau jalan santai.",
      detail:
        "Lipatan plisket stabil dan mudah dirawat. Panjang midi memberi kesan elegan, sementara warna taupe gampang dipadukan dengan blouse terang."
    },
    {
      id: "heels",
      title: "Selene Nude Block Heels",
      category: "Sepatu Wanita",
      price: 299000,
      discount: 20,
      sold: 165,
      stock: 37,
      rating: 4.9,
      material: "Suede sintetis, sol empuk",
      color: "Nude beige",
      weight: "720 gram",
      description:
        "Heels hak kotak yang stabil dengan bantalan empuk, memberi tinggi tanpa mengorbankan kenyamanan.",
      detail:
        "Hak kotak lebih stabil untuk aktivitas lama. Warna nude membuat kaki terlihat jenjang dan cocok untuk dress, rok, maupun celana bahan."
    }
  ].map((product) => ({
    ...product,
    photos: productPhotos[product.id],
    image: productPhotos[product.id][0]
  }));

  const paymentMethods = [
    "Transfer Bank BCA",
    "Transfer Bank Mandiri",
    "Transfer Bank BRI",
    "Transfer Bank BNI",
    "QRIS",
    "ShopeePay",
    "GoPay",
    "OVO",
    "DANA",
    "COD"
  ];

  const shippingOptions = [
    { name: "JNE Reguler", price: 18000 },
    { name: "SiCepat BEST", price: 22000 },
    { name: "J&T Express", price: 20000 },
    { name: "AnterAja", price: 17000 }
  ];

  return {
    categories,
    paymentMethods,
    productPhotos,
    products,
    shippingOptions
  };
})();

// src/data/products.js
// Catálogo real de Master Snacks. Hoy todo es de Chitopo (`brand`, ver
// brands.js). Datos tomados del brief de marca (22-08-2026) y del arte de
// los empaques.
//
// ⚠️ Pendientes marcados con TODO: precios, y las fichas nutricionales de
// los productos que todavía no salen a la venta.

const PRODUCTS = [
  {
    id: 1,
    slug: "sufle-queso",
    name: "Suflés Queso Horneado",
    brand: "chitopo",
    line: "sufles",
    flavor: "queso",
    grams: 150,
    status: "activo",
    active: true,
    tag: "Más vendido",
    emoji: "🧀",
    image: "/img/productos/sufle-queso.webp",
    barcode: "0799192945984",
    // El arte del empaque declara "LIBRE DE GLUTEN" y el símbolo de espiga
    // tachada, igual que el de papa.
    claims: { baked: true, glutenFree: true, seals: ["alto-en-calorias"] },
    // TODO precios: definir con Alex. price null => "A consultar".
    formats: [
      { id: "caja-24", label: "Caja", units: 24, stock: 40, price: null },
      { id: "display-12", label: "Display", units: 12, stock: 25, price: null },
      { id: "unidad", label: "Unidad", units: 1, stock: 300, price: null },
    ],
    ingredients:
      "Gritz de maíz, Aceite vegetal, sólidos de leche, Almidón, Sal, Glutamato monosódico, saborizante y colorantes (Amarillo Crepúsculo, Tartrazina), Antioxidantes (BHT, TBHQ).",
    allergens: "Contiene derivados lácteos.",
    nutrition: {
      serving: "15 g",
      portions: 10,
      per100g: {
        energia: 545,
        proteinas: 6.3,
        grasas: 31.4,
        hidratos: 55.6,
        azucares: 1.52,
        sodio: 400,
      },
    },
  },
  {
    id: 2,
    slug: "sufle-papa",
    name: "Suflés Papa Horneado",
    brand: "chitopo",
    line: "sufles",
    flavor: "papa",
    grams: 150,
    status: "activo",
    active: true,
    tag: null,
    emoji: "🥔",
    image: "/img/productos/sufle-papa.webp",
    barcode: "0799192945977",
    claims: { baked: true, glutenFree: true, seals: ["alto-en-calorias"] },
    formats: [
      { id: "caja-24", label: "Caja", units: 24, stock: 35, price: null },
      { id: "display-12", label: "Display", units: 12, stock: 20, price: null },
      { id: "unidad", label: "Unidad", units: 1, stock: 240, price: null },
    ],
    ingredients:
      "Gritz de maíz, Papa en escama, Aceite vegetal, Sal, Glutamato Monosódico, Antioxidante (BHT, TBHQ).",
    allergens: null,
    nutrition: {
      serving: "15 g",
      portions: 1,
      per100g: {
        energia: 518,
        proteinas: 5.2,
        grasas: 28.7,
        hidratos: 55.6,
        azucares: 1.52,
        sodio: 400,
      },
    },
  },
  {
    id: 3,
    slug: "sufle-frutos-del-bosque",
    name: "Suflés Frutos del Bosque",
    brand: "chitopo",
    line: "sufles",
    flavor: "frutos",
    // El arte vectorizado oficial ("Sufle completo/3.svg") imprime 125 g,
    // igual que el texto del brief. La foto suelta que dice 150 g es un
    // mockup anterior.
    grams: 125,
    status: "proximamente",
    active: true,
    tag: null,
    emoji: "🫐",
    image: "/img/productos/sufle-frutos-del-bosque.webp",
    barcode: null,
    claims: { baked: true, glutenFree: true, seals: ["alto-en-calorias"] },
    formats: [
      { id: "caja-24", label: "Caja", units: 24, stock: 0, price: null },
      { id: "display-12", label: "Display", units: 12, stock: 0, price: null },
    ],
    ingredients:
      "Gritz de maíz, Aceite de Maravilla, Harina de Arroz, Fibra de manzana, deshidratado en polvo natural de frutos del bosque, Colorantes, Saborizante natural, azúcar, Antioxidante (BHT, TBHQ). (Preliminar)",
    allergens: null,
    // TODO: tabla nutricional pendiente — el producto todavía no sale.
    nutrition: null,
  },
  {
    id: 4,
    slug: "mani-salado",
    name: "Maní Horneado Salado",
    brand: "chitopo",
    line: "mani",
    flavor: "mani",
    grams: 60,
    status: "proximamente",
    active: true,
    tag: null,
    emoji: "🥜",
    image: "/img/productos/mani-salado.webp",
    barcode: "0799192624322",
    // El arte del empaque lleva el octógono "ALTO EN CALORÍAS".
    claims: { baked: true, glutenFree: true, seals: ["alto-en-calorias"] },
    formats: [
      { id: "caja-24", label: "Caja", units: 24, stock: 0, price: null },
      { id: "display-12", label: "Display", units: 12, stock: 0, price: null },
    ],
    ingredients: "Maní, Sal.",
    allergens: "Contiene maní.",
    nutrition: {
      serving: "30 g",
      portions: 2,
      per100g: {
        energia: 580,
        proteinas: 26,
        grasas: 49,
        hidratos: 12,
        azucares: 6,
        sodio: 350,
        fibra: 8,
      },
    },
  },
  {
    id: 5,
    slug: "tocino-merken",
    name: "Tocino Merkén",
    brand: "chitopo",
    line: "aros",
    flavor: "tocino",
    grams: 130,
    status: "proximamente",
    active: true,
    tag: "Viene fuertón",
    emoji: "🌶️",
    image: "/img/productos/tocino-merken.webp",
    // Imágenes extra de la ficha, además de `image` (que es el frente).
    gallery: [
      { src: "/img/productos/tocino-merken-reverso.webp", label: "Reverso" },
    ],
    barcode: "0762083569200",
    // Datos del arte del envase (TCM.png): declara "LIBRE DE GLUTEN" y "NO FRITO".
    claims: { baked: true, glutenFree: true, seals: ["alto-en-calorias"] },
    formats: [
      { id: "caja-24", label: "Caja", units: 24, stock: 0, price: null },
    ],
    ingredients:
      "Gritz de maíz, Aceite vegetal (TBHQ), Harina de arroz, Saborizante tocino, Merkén, Glutamato, Sal, Colorante rojo.",
    allergens: "Contiene derivados de soya.",
    // ⚠️ Tal cual la etiqueta. Hidratos 7,8 g por 100 g no calza con un
    // snack de maíz y la columna por porción no es proporcional: confirmar
    // con el fabricante antes de que salga a la venta.
    nutrition: {
      serving: "15 g",
      portions: 9,
      per100g: {
        energia: 451,
        proteinas: 6.2,
        grasas: 20.6,
        hidratos: 7.8,
        azucares: 1.8,
        sodio: 398,
      },
    },
  },
];

export default PRODUCTS;

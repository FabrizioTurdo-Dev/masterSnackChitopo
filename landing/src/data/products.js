// Productos que se muestran en la landing. Subset de
// catalogo-mayorista/src/data/products.js — solo lo visible en vitrina.
//
// `artFullBleed` describe el material real del archivo, no una preferencia:
// queso, papa y frutos son el arte del envase de borde a borde, así que
// sirven como textura de fondo. Maní y tocino son la bolsa fotografiada
// sobre blanco, así que su fondo se genera con el color del sabor.
// Cuando lleguen los recortes con alfa (ver ASSETS.md), esto se revisa.

const PRODUCTS = [
  {
    id: 1,
    slug: "sufle-queso",
    name: "Suflés Queso",
    short: "Queso",
    flavor: "queso",
    grams: 150,
    status: "activo",
    tag: "Más vendido",
    image: "/img/productos/sufle-queso.webp",
    artFullBleed: true,
    seal: "alto-en-calorias",
    glutenFree: true,
    blurb: "El clásico. Crujiente, quesudo y con la justa de sal.",
  },
  {
    id: 2,
    slug: "sufle-papa",
    name: "Suflés Papa",
    short: "Papa",
    flavor: "papa",
    grams: 150,
    status: "activo",
    tag: null,
    image: "/img/productos/sufle-papa.webp",
    artFullBleed: true,
    seal: "alto-en-calorias",
    glutenFree: true,
    blurb: "Papa de verdad, horneado. Suave por fuera, puro crunch adentro.",
  },
  {
    id: 3,
    slug: "sufle-frutos-del-bosque",
    name: "Suflés Frutos del Bosque",
    short: "Frutos",
    flavor: "frutos",
    grams: 125,
    status: "proximamente",
    tag: null,
    image: "/img/productos/sufle-frutos-del-bosque.webp",
    artFullBleed: true,
    seal: "alto-en-calorias",
    glutenFree: true,
    blurb: "Dulce, distinto y bien nuestro. El que nadie se espera.",
  },
  {
    id: 4,
    slug: "mani-salado",
    name: "Maní Horneado Salado",
    short: "Maní",
    flavor: "mani",
    grams: 60,
    status: "proximamente",
    tag: null,
    image: "/img/productos/mani-salado.webp",
    artFullBleed: false,
    seal: "alto-en-calorias",
    glutenFree: true,
    blurb: "Maní horneado, no frito. Simple: maní y sal, nada más.",
  },
  {
    id: 5,
    slug: "tocino-merken",
    name: "Tocino Merkén",
    short: "Merkén",
    flavor: "tocino",
    grams: 140,
    status: "proximamente",
    tag: "Viene fuertón",
    image: "/img/productos/tocino-merken.webp",
    artFullBleed: false,
    seal: "alto-en-calorias",
    glutenFree: false,
    blurb: "Merkén de verdad. Este pica, avisamos no más.",
  },
];

export default PRODUCTS;

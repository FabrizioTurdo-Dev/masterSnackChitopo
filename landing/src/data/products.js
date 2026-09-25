// Productos que se muestran en la landing. Subset de
// catalogo-mayorista/src/data/products.js — solo lo visible en vitrina.
//
// `bag` describe el material real del archivo, no una preferencia:
// "flat" es el arte del envase de borde a borde, y el hero le dibuja los
// dientes del sellado y el volumen para que se lea como bolsa. "cutout" ya
// es la bolsa recortada con alfa y se muestra tal cual. Cuando lleguen los
// recortes finales (ver ASSETS.md), todas pasan a "cutout".
//
// `imageSize` reserva el espacio de la imagen antes de que cargue.
//
// `snack` es el color del chitopo en sí (el suflé de papa es amarillo
// pálido, no verde), para los que flotan en el hero.
//
// `stage` es el fondo del hero con ese sabor. Todos dan más de 4.5:1 con
// el texto café (ink), porque el hero pone letra chica encima.

const PRODUCTS = [
  {
    id: 1,
    slug: "sufle-queso",
    name: "Suflés Queso",
    short: "Queso",
    flavor: "queso",
    snack: "#f59a23",
    stage: "#ffc20e",
    grams: 150,
    status: "activo",
    tag: "Más vendido",
    image: "/img/productos/sufle-queso.webp",
    imageSize: [800, 1361],
    bag: "flat",
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
    snack: "#f2d479",
    stage: "#a8d84e",
    grams: 150,
    status: "activo",
    tag: null,
    image: "/img/productos/sufle-papa.webp",
    imageSize: [800, 1361],
    bag: "flat",
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
    snack: "#f58fb6",
    stage: "#ff8cc6",
    grams: 125,
    status: "proximamente",
    tag: null,
    image: "/img/productos/sufle-frutos-del-bosque.webp",
    imageSize: [800, 1361],
    bag: "flat",
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
    snack: "#d9a15b",
    stage: "#ffe3a3",
    grams: 60,
    status: "proximamente",
    tag: null,
    image: "/img/productos/mani-salado.webp",
    imageSize: [800, 1231],
    bag: "flat",
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
    snack: "#e0572a",
    stage: "#ff6a2b",
    grams: 130,
    status: "proximamente",
    tag: "Viene fuertón",
    image: "/img/productos/tocino-merken-cutout.webp",
    imageSize: [800, 1152],
    bag: "cutout",
    seal: "alto-en-calorias",
    glutenFree: true,
    blurb: "Merkén de verdad. Este pica, avisamos no más.",
  },
];

export default PRODUCTS;

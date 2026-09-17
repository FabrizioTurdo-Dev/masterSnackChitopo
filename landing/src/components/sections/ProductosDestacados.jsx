import Section from "../ui/Section";
import Reveal from "../ui/Reveal";
import ProductoCard from "./ProductoCard";
import Button from "../ui/Button";
import PRODUCTS from "../../data/products";
import { CATALOGO_URL } from "../../lib/catalogoUrl";

export default function ProductosDestacados() {
  return (
    <Section
      id="productos"
      eyebrow="La ficha de cada uno"
      title="Letra chica"
      intro="Ya los viste arriba. Acá van los datos: gramaje, qué lleva y cuáles están en la calle. Dos ya andan dando vuelta en los almacenes; los otros tres vienen en camino."
    >
      <Reveal
        stagger
        grid
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
      >
        {PRODUCTS.map((product) => (
          <ProductoCard key={product.id} product={product} />
        ))}
      </Reveal>

      <Reveal className="mt-10 flex justify-center">
        <Button href={CATALOGO_URL} target="_blank" rel="noopener noreferrer">
          Pídelos al por mayor
        </Button>
      </Reveal>
    </Section>
  );
}

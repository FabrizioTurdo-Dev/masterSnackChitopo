import { createContext, useContext } from "react";

// Marca activa de la página o de una "isla" dentro de ella. Las piezas que
// aparecen en la home de Master Snacks y en la página de Chitopo (Section,
// Button, Faq, Header...) la leen para elegir sus colores.
const BrandContext = createContext("chitopo");

export function BrandProvider({ brand, children }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export const useBrand = () => useContext(BrandContext);

// Elige el valor de la marca activa: useTone({ chitopo: "...", mastersnacks: "..." }).
// Las clases van siempre completas y con nombre de color (Tailwind solo ve
// strings literales), y en pares fondo + texto: así no vuelve a aparecer
// un botón amarillo sobre amarillo.
export function useTone(map) {
  const brand = useBrand();
  return map[brand] ?? map.chitopo;
}

// Bloque con la identidad de otra marca: cambia las variables de CSS
// (data-brand) y el contexto de React a la vez.
export function BrandIsland({ brand, as: Tag = "div", className = "", children, ...props }) {
  return (
    <BrandProvider brand={brand}>
      <Tag data-brand={brand} className={className} {...props}>
        {children}
      </Tag>
    </BrandProvider>
  );
}

import { Component } from "react";

// Red de seguridad para toda la app. El caso típico: alguien tiene el
// catálogo abierto, se publica una versión nueva y el pedazo del panel (o del
// pie) que su pestaña pide ya no existe. En vez de una página en blanco,
// se le pide recargar.
export default class ReloadBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Error al mostrar la página:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center px-6 font-sans">
        <div className="bg-snow nb max-w-sm w-full p-6 text-center">
          <p className="font-condensed uppercase tracking-[0.06em] text-2xl text-night m-0">
            Hay una versión nueva
          </p>
          <p className="text-sm text-night-soft leading-relaxed mt-2 mb-5">
            El sitio se actualizó mientras lo tenías abierto. Recarga la página para seguir.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full min-h-[48px] bg-electric text-snow font-condensed uppercase tracking-[0.06em] text-lg nb nb-press hover:bg-royal cursor-pointer"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}

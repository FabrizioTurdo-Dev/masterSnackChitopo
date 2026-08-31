import { useState } from "react";
import Input from "./ui/Input";
import Btn from "./ui/Btn";
import { STORE_CONFIG, SELLER_PHONE } from "../../data/store";

function Card({ title, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-sm font-bold text-text mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em]">{label}</label>
      <div className="px-3.5 py-2.5 rounded-xl border border-border bg-bg text-muted text-sm">
        {value}
      </div>
    </div>
  );
}

export default function SettingsPanel({ stockThreshold, onStockThresholdChange }) {
  const [lowStock, setLowStock] = useState(stockThreshold ?? STORE_CONFIG.defaultStockThreshold);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (onStockThresholdChange && Number(lowStock) >= 0) {
      onStockThresholdChange(Number(lowStock));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold text-text">Configuración</h2>
        <p className="text-xs text-muted">
          Los datos de la marca viven en <code className="text-accent">src/data/store.js</code>.
          Acá se ven en solo lectura.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Card title="Datos del negocio">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReadOnly label="Nombre" value={STORE_CONFIG.name} />
            <ReadOnly label="WhatsApp de pedidos" value={`+${SELLER_PHONE}`} />
            <ReadOnly label="Pedido mínimo" value={`${STORE_CONFIG.minOrderUnits} bolsas`} />
            <ReadOnly
              label="Moneda"
              value={`${STORE_CONFIG.currency.code} · ${STORE_CONFIG.currency.locale}`}
            />
          </div>
        </Card>

        <Card title="Precios en el catálogo">
          <div className="flex flex-col gap-3">
            <div
              className={`px-4 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 ${
                STORE_CONFIG.showPrices
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-accent/10 text-accent border-accent/25"
              }`}
            >
              {STORE_CONFIG.showPrices ? "● Precios visibles" : "● Modo precio a consultar"}
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {STORE_CONFIG.showPrices
                ? "El catálogo muestra los precios cargados en cada formato y el pedido llega con el monto calculado."
                : "El catálogo no muestra precios: los pedidos llegan como cotización y el monto se cierra por WhatsApp."}
            </p>
            <p className="text-xs text-faint leading-relaxed">
              Para cambiarlo, carga el precio de cada formato en la pestaña Productos y pon{" "}
              <code className="text-accent">showPrices: true</code> en{" "}
              <code className="text-accent">src/data/store.js</code>.
            </p>
          </div>
        </Card>

        <Card title="Alertas de stock">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Umbral de stock bajo (bultos)"
              type="number"
              min="0"
              value={lowStock}
              onChange={e => setLowStock(e.target.value)}
              placeholder="5"
            />
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em]">Ayuda</label>
              <p className="text-xs text-faint leading-relaxed">
                Los formatos con esa cantidad de bultos o menos se marcan como{" "}
                <span className="text-amber-400">stock bajo</span> en la tabla y en el catálogo.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end items-center gap-3">
          {saved && <span className="text-sm text-emerald-400 font-semibold">✓ Guardado</span>}
          <Btn onClick={handleSave}>Guardar cambios</Btn>
        </div>
      </div>
    </div>
  );
}

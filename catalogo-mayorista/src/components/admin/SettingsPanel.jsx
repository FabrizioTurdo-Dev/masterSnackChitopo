import { useState } from "react";
import Input from "./ui/Input";
import Btn from "./ui/Btn";
import PageHeader from "./ui/PageHeader";
import { CARD, LABEL, PILL, TONES } from "./ui/styles";
import { STORE_CONFIG, SELLER_PHONE, DEV_CREDIT } from "../../data/store";

function Card({ title, children }) {
  return (
    <div className={`${CARD} p-5 sm:p-6`}>
      <h3 className="font-title uppercase tracking-[0.06em] text-xl text-ink m-0 mb-4 pb-2 border-b-2 border-ink/15">{title}</h3>
      {children}
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={LABEL}>{label}</span>
      <div className="min-h-[42px] px-3 flex items-center bg-cream-2 border-2 border-dashed border-ink/50 text-ink-soft text-sm">
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
      <PageHeader
        eyebrow="Ajustes"
        title="Configuración"
        subtitle={`Datos del negocio y del catálogo. Si hay que cambiar alguno, avísale a ${DEV_CREDIT.name}.`}
      />

      <div className="flex flex-col gap-4">
        <Card title="Datos del negocio">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReadOnly label="Nombre" value={STORE_CONFIG.name} />
            <ReadOnly label="WhatsApp de pedidos" value={`+${SELLER_PHONE}`} />
            <ReadOnly label="Pedido mínimo" value={`${STORE_CONFIG.minOrderUnits} unidades`} />
            <ReadOnly
              label="Moneda"
              value={`${STORE_CONFIG.currency.code} · ${STORE_CONFIG.currency.locale}`}
            />
          </div>
        </Card>

        <Card title="Precios en el catálogo">
          <div className="flex flex-col gap-3">
            <div
              className={`${PILL} self-start text-sm px-3 py-1.5 ${
                STORE_CONFIG.showPrices ? TONES.green : TONES.gold
              }`}
            >
              {STORE_CONFIG.showPrices ? "● Precios visibles" : "● Modo precio a consultar"}
            </div>
            <p className="text-sm text-ink-soft leading-relaxed m-0">
              {STORE_CONFIG.showPrices
                ? "El catálogo muestra los precios cargados en cada formato y el pedido llega con el monto calculado."
                : "El catálogo no muestra precios: los pedidos llegan como cotización y el monto se cierra por WhatsApp."}
            </p>
            {!STORE_CONFIG.showPrices && (
              <p className="text-sm text-ink-faint leading-relaxed m-0">
                Cuando tengan los precios cargados en cada formato (pestaña Productos), avísale a{" "}
                {DEV_CREDIT.name} para que el catálogo empiece a mostrarlos.
              </p>
            )}
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
              <span className={LABEL}>Ayuda</span>
              <p className="text-sm text-ink-soft leading-relaxed m-0">
                Los formatos con esa cantidad de bultos o menos se marcan como{" "}
                <span className="font-semibold text-fire">stock bajo</span> en la tabla y en el catálogo.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end items-center gap-3">
          {saved && <span className="font-condensed uppercase tracking-[0.08em] text-[#14532d]" role="status">✓ Guardado</span>}
          <Btn onClick={handleSave}>Guardar cambios</Btn>
        </div>
      </div>
    </div>
  );
}

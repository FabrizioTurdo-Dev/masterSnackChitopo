import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Input from "./ui/Input";
import Btn from "./ui/Btn";
import PageHeader from "./ui/PageHeader";
import { ALERT, CARD, LABEL, PILL, TONES } from "./ui/styles";
import { STORE_CONFIG, SELLER_PHONE_PRETTY, DEV_CREDIT } from "../../data/store";
import { useApp } from "../../context/AppContext";
import { configService } from "../../services/configService";
import { COMPANY, BRANDS } from "../../data/brands";
import BrandMark from "../brand/BrandMark";

function Card({ title, children }) {
  return (
    <div className={`${CARD} p-5 sm:p-6`}>
      <h3 className="font-title uppercase tracking-[0.06em] text-xl text-night m-0 mb-4 pb-2 border-b-2 border-night/15">{title}</h3>
      {children}
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={LABEL}>{label}</span>
      <div className="min-h-[42px] px-3 flex items-center bg-snow-2 border-2 border-dashed border-night/50 text-night-soft text-sm">
        {value}
      </div>
    </div>
  );
}

export default function SettingsPanel() {
  const { stockThreshold, setStockThreshold } = useApp();
  const [lowStock, setLowStock] = useState(stockThreshold);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // El umbral de la base puede llegar después de abrir esta pestaña.
  useEffect(() => setLowStock(stockThreshold), [stockThreshold]);

  // El umbral se guarda en la base: lo usan el panel y el catálogo.
  async function handleSave() {
    const n = Number(lowStock);
    if (lowStock === "" || !Number.isInteger(n) || n < 0) {
      setError("El umbral de stock bajo tiene que ser un número entero, 0 o más.");
      return;
    }
    setError(null);
    setSaving(true);
    const res = await configService.update({ low_stock: n });
    setSaving(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setStockThreshold(n);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Ajustes"
        title="Configuración"
        subtitle={`Datos del negocio y del catálogo. Para cambiar los datos fijos, avísale a ${DEV_CREDIT.name}.`}
      />

      <div className="flex flex-col gap-4">
        <Card title="Datos del negocio">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReadOnly label="Empresa" value={COMPANY.legalName} />
            <ReadOnly label="WhatsApp de pedidos" value={SELLER_PHONE_PRETTY} />
            <ReadOnly label="Pedido mínimo" value={`${STORE_CONFIG.minOrderUnits} unidades`} />
            <ReadOnly label="Moneda" value={`Peso chileno (${STORE_CONFIG.currency.code})`} />
          </div>
        </Card>

        <Card title="Marcas">
          <div className="flex flex-col gap-3">
            <ul className="list-none p-0 m-0 flex flex-wrap gap-3">
              {BRANDS.map(b => (
                <li
                  key={b.id}
                  className="flex items-center gap-3 px-3 py-2 bg-snow-2 border-2 border-night"
                >
                  <BrandMark brand={b.id} height={24} />
                  <span className="font-condensed uppercase tracking-[0.08em] text-xs text-night-soft">
                    {b.descriptor}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-night-soft leading-relaxed m-0">
              Cada producto pertenece a una de estas marcas; se elige al crearlo o editarlo en
              la pestaña Productos. Para sumar una marca nueva (con su logo), avísale a{" "}
              {DEV_CREDIT.name}.
            </p>
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
            <p className="text-sm text-night-soft leading-relaxed m-0">
              {STORE_CONFIG.showPrices
                ? "El catálogo muestra los precios cargados en cada formato y el pedido llega con el monto calculado."
                : "El catálogo no muestra precios: los pedidos llegan como cotización y el monto se cierra por WhatsApp."}
            </p>
            {!STORE_CONFIG.showPrices && (
              <p className="text-sm text-night-faint leading-relaxed m-0">
                Cuando tengas los precios cargados en cada formato (pestaña Productos), avísale a{" "}
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
              <p className="text-sm text-night-soft leading-relaxed m-0">
                Los formatos con esa cantidad de bultos o menos se marcan como{" "}
                <span className="font-semibold text-electric">stock bajo</span> en la tabla y en el catálogo.
              </p>
            </div>
          </div>
        </Card>

        {error && (
          <div className={ALERT} role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end items-center gap-3">
          {saved && <span className="font-condensed uppercase tracking-[0.08em] text-[#14532d]" role="status">✓ Guardado</span>}
          <Btn onClick={handleSave} disabled={saving}>
            {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {saving ? "Guardando…" : "Guardar cambios"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Loader2, ExternalLink, Megaphone } from "lucide-react";
import Input from "./ui/Input";
import Btn from "./ui/Btn";
import PageHeader from "./ui/PageHeader";
import { ALERT, CARD, FIELD, LABEL, PILL, TONES } from "./ui/styles";
import {
  STORE_CONFIG,
  DEV_CREDIT,
  DEFAULT_WELCOME,
  isValidPhone,
  normalizePhone,
  phonePretty,
  rowFromSettings,
  whatsappLink,
} from "../../data/store";
import { useApp } from "../../context/AppContext";
import { configService } from "../../services/configService";
import { COMPANY, BRANDS } from "../../data/brands";
import BrandMark from "../brand/BrandMark";

// Topes de los textos del catálogo: la bajada tiene que entrar junto al
// titular en un teléfono y el aviso es una franja, no un párrafo.
const WELCOME_MAX = 240;
const NOTICE_MAX = 140;

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

function Hint({ children }) {
  return <p className="text-xs text-night-soft leading-relaxed m-0">{children}</p>;
}

function TextArea({ id, label, value, onChange, max, rows = 3, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL}>{label}</label>
        <span className={`text-xs tabular-nums ${value.length > max ? "text-[#a32004] font-bold" : "text-night-faint"}`}>
          {value.length}/{max}
        </span>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`${FIELD} py-2.5 resize-y leading-relaxed`}
      />
    </div>
  );
}

// Interruptor accesible: un botón con role="switch".
function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0 text-left"
    >
      <span
        className={`relative inline-block w-14 h-8 shrink-0 border-2 border-night transition-colors duration-200 [box-shadow:3px_3px_0_var(--color-night)] ${
          checked ? "bg-green" : "bg-snow-2"
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] size-[22px] bg-night transition-transform duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] ${
            checked ? "translate-x-6" : ""
          }`}
        />
      </span>
      <span className="font-condensed uppercase tracking-[0.06em] text-sm text-night">{label}</span>
    </button>
  );
}

// Formulario a partir de los settings vigentes. La bajada de fábrica se
// muestra vacía: así queda claro que no la escribieron ellos.
function formFrom(settings) {
  return {
    shopName: settings.shopName,
    phone: phonePretty(settings.phone),
    minOrder: String(settings.minOrder),
    showPrices: settings.showPrices,
    lowStock: String(settings.lowStock),
    welcome: settings.welcome === DEFAULT_WELCOME ? "" : settings.welcome,
    notice: settings.notice,
  };
}

export default function SettingsPanel() {
  const { settings, updateSettings, productsStatus, products } = useApp();
  const [form, setForm] = useState(() => formFrom(settings));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // La config de la base puede llegar después de abrir esta pestaña.
  useEffect(() => setForm(formFrom(settings)), [settings]);

  // Sin la config de la base en pantalla, guardar pisaría lo que tienen
  // cargado con los valores de fábrica.
  const locked = productsStatus === "loading" || productsStatus === "error";

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const phoneDigits = normalizePhone(form.phone);
  const phoneOk = isValidPhone(phoneDigits);

  // Productos a la venta con algún formato sin precio: con los precios
  // visibles, esos formatos se ven como «A consultar».
  const unpriced = useMemo(
    () =>
      products.filter(
        p =>
          p.active &&
          p.status !== "proximamente" &&
          (p.formats || []).some(f => f.price === null || f.price === undefined || f.price === "")
      ).length,
    [products]
  );

  function validate() {
    if (!form.shopName.trim()) return "Pon el nombre del comercio.";
    if (!phoneOk) return "El WhatsApp tiene que ser un celular chileno, por ejemplo +56 9 1234 5678.";
    const min = Number(form.minOrder);
    if (!Number.isInteger(min) || min < 1) return "El pedido mínimo tiene que ser un número entero, 1 o más.";
    const low = Number(form.lowStock);
    if (form.lowStock === "" || !Number.isInteger(low) || low < 0) {
      return "El umbral de stock bajo tiene que ser un número entero, 0 o más.";
    }
    if (form.welcome.length > WELCOME_MAX) return `La bienvenida puede tener hasta ${WELCOME_MAX} caracteres.`;
    if (form.notice.length > NOTICE_MAX) return `El aviso puede tener hasta ${NOTICE_MAX} caracteres.`;
    return null;
  }

  async function handleSave() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    const next = {
      shopName: form.shopName.trim(),
      phone: phoneDigits,
      minOrder: Number(form.minOrder),
      showPrices: form.showPrices,
      lowStock: Number(form.lowStock),
      welcome: form.welcome.trim() || DEFAULT_WELCOME,
      notice: form.notice.trim(),
    };
    setError(null);
    setSaving(true);
    const res = await configService.update(rowFromSettings(next));
    setSaving(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    updateSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Ajustes"
        title="Configuración"
        subtitle="Datos del negocio y del catálogo. Lo que guardes acá lo ven los clientes apenas recargan la página."
      />

      <div className="flex flex-col gap-4">
        {productsStatus === "error" && (
          <div className={ALERT} role="alert">
            No pudimos leer la configuración guardada, así que por ahora no se puede editar. Recarga la
            página en un rato y, si sigue igual, avísale a {DEV_CREDIT.name}.
          </div>
        )}

        <Card title="Datos del negocio">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Input
                label="Nombre del comercio"
                id="cfg-shop"
                value={form.shopName}
                onChange={e => set("shopName", e.target.value)}
                placeholder={COMPANY.name}
              />
              <Hint>Va en el encabezado de los mensajes de pedido por WhatsApp.</Hint>
            </div>

            <div className="flex flex-col gap-1.5">
              <Input
                label="WhatsApp de pedidos"
                id="cfg-phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                onBlur={() => phoneOk && set("phone", phonePretty(phoneDigits))}
                placeholder="+56 9 1234 5678"
                aria-invalid={!phoneOk}
              />
              {phoneOk ? (
                <a
                  href={whatsappLink(phoneDigits)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start inline-flex items-center gap-1 text-xs font-semibold text-electric hover:text-royal"
                >
                  Probar este número en WhatsApp <ExternalLink size={12} aria-hidden="true" />
                </a>
              ) : (
                <Hint>Un celular chileno: +56 9 y los 8 dígitos.</Hint>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Input
                label="Pedido mínimo (unidades)"
                id="cfg-min"
                type="number"
                min="1"
                value={form.minOrder}
                onChange={e => set("minOrder", e.target.value)}
                placeholder="100"
              />
              <Hint>Se cuenta en bolsas. El carro no deja enviar un pedido más chico.</Hint>
            </div>

            <ReadOnly label="Moneda" value={`Peso chileno (${STORE_CONFIG.currency.code})`} />
          </div>
          <p className="text-xs text-night-soft leading-relaxed m-0 mt-4">
            El WhatsApp y el pedido mínimo también se actualizan en el sitio de {COMPANY.name} y en el
            de cada marca.
          </p>
        </Card>

        <Card title="Mensajes del catálogo">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <TextArea
                id="cfg-welcome"
                label="Bienvenida"
                value={form.welcome}
                onChange={e => set("welcome", e.target.value)}
                max={WELCOME_MAX}
                placeholder={DEFAULT_WELCOME}
              />
              <Hint>Es el texto bajo «Catálogo mayorista». Si lo dejas vacío, vuelve el original.</Hint>
            </div>

            <div className="flex flex-col gap-2">
              <TextArea
                id="cfg-notice"
                label="Aviso destacado"
                value={form.notice}
                onChange={e => set("notice", e.target.value)}
                max={NOTICE_MAX}
                rows={2}
                placeholder="Ej.: Esta semana no despachamos el viernes."
              />
              <Hint>Sale en una franja arriba del catálogo. Vacío, no se muestra.</Hint>
              {form.notice.trim() && (
                <div className="mt-1" aria-label="Vista previa del aviso">
                  <span className={`${LABEL} block mb-1.5`}>Así se ve</span>
                  <div className="bg-night text-snow border-2 border-night px-3 py-2.5 flex items-start gap-3">
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 bg-electric text-snow border-2 border-gold font-condensed uppercase tracking-[0.1em] text-xs">
                      <Megaphone size={14} aria-hidden="true" />
                      Aviso
                    </span>
                    <p className="m-0 min-w-0 text-sm font-semibold leading-snug whitespace-pre-line break-words">
                      {form.notice.trim()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="Precios en el catálogo">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Switch
                checked={form.showPrices}
                onChange={v => set("showPrices", v)}
                label="Mostrar precios"
              />
              <span className={`${PILL} text-sm px-3 py-1.5 ${form.showPrices ? TONES.green : TONES.gold}`}>
                {form.showPrices ? "● Precios visibles" : "● Modo precio a consultar"}
              </span>
            </div>
            <p className="text-sm text-night-soft leading-relaxed m-0">
              {form.showPrices
                ? "El catálogo muestra los precios cargados en cada formato. El pedido llega con el monto calculado."
                : "El catálogo no muestra precios: los pedidos llegan como cotización y el monto se cierra por WhatsApp."}
            </p>
            {form.showPrices && unpriced > 0 && (
              <p className={`${PILL} ${TONES.red} self-start whitespace-normal text-xs px-3 py-1.5 leading-snug`}>
                {unpriced === 1
                  ? "Hay 1 producto con formatos sin precio: esos formatos se verán como «A consultar»."
                  : `Hay ${unpriced} productos con formatos sin precio: esos formatos se verán como «A consultar».`}{" "}
                Cárgalos en la pestaña Productos.
              </p>
            )}
          </div>
        </Card>

        <Card title="Alertas de stock">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Umbral de stock bajo (bultos)"
              id="cfg-low"
              type="number"
              min="0"
              value={form.lowStock}
              onChange={e => set("lowStock", e.target.value)}
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

        {error && (
          <div className={ALERT} role="alert">
            {error}
          </div>
        )}

        <div className="sticky bottom-3 z-10 flex justify-end items-center gap-3">
          {saved && (
            <span className="font-condensed uppercase tracking-[0.08em] text-[#14532d] bg-snow border-2 border-night px-2 py-1" role="status">
              ✓ Guardado
            </span>
          )}
          <Btn onClick={handleSave} disabled={saving || locked}>
            {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {saving ? "Guardando…" : "Guardar cambios"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

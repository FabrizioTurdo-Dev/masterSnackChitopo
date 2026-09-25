import { useState, useRef } from "react";
import { Upload, Plus, Trash2, Loader2 } from "lucide-react";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Btn from "./ui/Btn";
import { FIELD, FIELD_SM, LABEL, TONES, ERROR_TEXT } from "./ui/styles";
import { STORE_CONFIG, FLAVOR_ACCENTS, DEV_CREDIT, flavorLabel } from "../../data/store";
import { BRANDS, DEFAULT_BRAND, brandOf } from "../../data/brands";

const NUTRIENTS = [
  { key: "energia", label: "Energía (kcal)" },
  { key: "proteinas", label: "Proteínas (g)" },
  { key: "grasas", label: "Grasas totales (g)" },
  { key: "hidratos", label: "Hidratos (g)" },
  { key: "azucares", label: "Azúcares (g)" },
  { key: "fibra", label: "Fibra (g)" },
  { key: "sodio", label: "Sodio (mg)" },
];

const SEALS = [
  { id: "alto-en-calorias", label: "Alto en calorías" },
  { id: "alto-en-sodio", label: "Alto en sodio" },
  { id: "alto-en-azucares", label: "Alto en azúcares" },
  { id: "alto-en-grasas-saturadas", label: "Alto en grasas saturadas" },
];

// La foto se guarda dentro del producto y viaja con el catálogo a cada
// visita: se achica a 800 px de lado como máximo. WebP conserva el fondo
// transparente; Safari no lo sabe codificar y ahí va JPEG sobre blanco.
const MAX_SIDE = 800;

function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const webp = canvas.toDataURL("image/webp", 0.85);
      if (webp.startsWith("data:image/webp")) return resolve(webp);
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen ilegible"));
    };
    img.src = url;
  });
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProductForm({ product, onSave, onCancel }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    brand: product?.brand || DEFAULT_BRAND,
    line: product?.line || STORE_CONFIG.lines[0]?.id || "sufles",
    flavor: product?.flavor || "queso",
    grams: product?.grams || "",
    status: product?.status || "activo",
    active: product?.active !== false,
    tag: product?.tag || "",
    emoji: product?.emoji || "🧀",
    image: product?.image || null,
    // Sin UI propia todavía: se conserva tal cual para no perderla al guardar.
    gallery: product?.gallery || [],
    barcode: product?.barcode || "",
    claims: product?.claims || {
      baked: brandOf(DEFAULT_BRAND).baked ?? false,
      glutenFree: false,
      seals: [],
    },
    formats: product?.formats?.length
      ? product.formats
      : STORE_CONFIG.defaultFormats.map(f => ({ ...f })),
    ingredients: product?.ingredients || "",
    allergens: product?.allergens || "",
    nutrition: product?.nutrition || null,
  });
  const [imgPreview, setImgPreview] = useState(product?.image || null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // En un producto nuevo, "Horneado, no frito" arranca como diga la marca
  // (Chitopo es de horneados). En uno existente no se toca lo ya declarado.
  function setBrand(id) {
    setForm(f => ({
      ...f,
      brand: id,
      claims: isEdit ? f.claims : { ...f.claims, baked: brandOf(id).baked ?? false },
    }));
  }

  function setClaim(key, val) {
    setForm(f => ({ ...f, claims: { ...f.claims, [key]: val } }));
  }

  function toggleSeal(id) {
    setForm(f => {
      const seals = f.claims.seals || [];
      return {
        ...f,
        claims: {
          ...f.claims,
          seals: seals.includes(id) ? seals.filter(s => s !== id) : [...seals, id],
        },
      };
    });
  }

  function setFormat(i, key, val) {
    setForm(f => {
      const formats = [...f.formats];
      formats[i] = { ...formats[i], [key]: val };
      if (key === "label" || key === "units") {
        formats[i].id = `${slugify(formats[i].label || "formato")}-${formats[i].units || 1}`;
      }
      return { ...f, formats };
    });
  }

  function addFormat() {
    setForm(f => ({
      ...f,
      formats: [...f.formats, { id: `formato-${f.formats.length + 1}`, label: "", units: 1, stock: 0, price: null }],
    }));
  }

  function removeFormat(i) {
    setForm(f => ({ ...f, formats: f.formats.filter((_, idx) => idx !== i) }));
  }

  function setNutrient(key, val) {
    setForm(f => {
      const n = f.nutrition || { serving: "", portions: "", per100g: {} };
      const per100g = { ...n.per100g };
      if (val === "") delete per100g[key];
      else per100g[key] = Number(val);
      return { ...f, nutrition: { ...n, per100g } };
    });
  }

  function setNutritionMeta(key, val) {
    setForm(f => ({
      ...f,
      nutrition: { ...(f.nutrition || { per100g: {} }), [key]: val },
    }));
  }

  async function handleImage(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const src = await shrinkImage(file);
      setImgPreview(src);
      set("image", src);
      setError(null);
    } catch {
      setError("No se pudo leer esa imagen. Prueba con una foto en JPG o PNG.");
    }
  }

  async function handleSubmit() {
    if (saving) return;
    if (!form.name.trim()) return setError("Falta el nombre del producto");
    if (!form.grams) return setError("Falta el gramaje");
    if (form.formats.length === 0) return setError("Agrega al menos un formato de venta");
    if (form.formats.some(f => !f.label.trim())) return setError("Todos los formatos necesitan un nombre");

    setError(null);
    setSaving(true);
    const res = await onSave({
      ...form,
      id: product?.id || null,
      slug: form.slug || slugify(form.name),
      grams: Number(form.grams),
      tag: form.tag.trim() || null,
      barcode: form.barcode.trim() || null,
      ingredients: form.ingredients.trim() || null,
      allergens: form.allergens.trim() || null,
      formats: form.formats.map(f => ({
        ...f,
        units: Number(f.units) || 1,
        stock: Number(f.stock) || 0,
        price: f.price === "" || f.price === null ? null : Number(f.price),
      })),
    });
    // Si salió bien el modal se cierra; si no, queda abierto con el aviso.
    if (res && !res.success) {
      setError(res.error);
      setSaving(false);
    }
  }

  const toggle = (on) =>
    `flex-1 min-h-[40px] font-condensed uppercase tracking-[0.06em] text-sm border-2 border-night cursor-pointer transition-colors ${
      on ? "bg-night text-gold" : "bg-snow text-night hover:bg-snow-2"
    }`;

  // Chip de declaración o sello: se prende con el color que corresponde.
  const claimChip = (on, onClass) =>
    `px-3 min-h-[34px] text-xs font-bold border-2 border-night cursor-pointer transition-colors ${
      on ? onClass : "bg-snow text-night-soft hover:bg-snow-2"
    }`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-4 items-start">
        <div
          onClick={() => fileRef.current.click()}
          className="size-[100px] border-2 border-dashed border-night bg-snow-2 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:bg-gold/40 transition-colors duration-200"
        >
          {imgPreview ? (
            <img src={imgPreview} alt="" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-3xl">{form.emoji}</span>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        <div className="flex-1 flex flex-col gap-3">
          <Btn small variant="ghost" onClick={() => fileRef.current.click()}>
            <Upload size={14} aria-hidden="true" /> Subir foto del empaque
          </Btn>
          <p className="text-xs text-night-faint leading-relaxed m-0">
            Ideal: el frente de la bolsa recortado, fondo transparente o plano.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Nombre *"
          value={form.name}
          onChange={e => set("name", e.target.value)}
          placeholder="Suflés Queso Horneados"
        />
        <Input
          label="Gramaje (g) *"
          type="number"
          value={form.grams}
          onChange={e => set("grams", e.target.value)}
          placeholder="150"
        />
        <div className="flex flex-col gap-1.5">
          <Select label="Marca" value={form.brand} onChange={e => setBrand(e.target.value)}>
            {BRANDS.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.descriptor}
              </option>
            ))}
          </Select>
          {BRANDS.length === 1 && (
            <p className="text-xs text-night-faint leading-relaxed m-0">
              Por ahora hay una sola marca. Para sumar otra, avísale a {DEV_CREDIT.name}.
            </p>
          )}
        </div>
        <Select label="Línea" value={form.line} onChange={e => set("line", e.target.value)}>
          {STORE_CONFIG.lines.map(l => (
            <option key={l.id} value={l.id}>{l.labelPlural}</option>
          ))}
        </Select>
        <Select label="Sabor (define el color)" value={form.flavor} onChange={e => set("flavor", e.target.value)}>
          {Object.keys(FLAVOR_ACCENTS).map(f => (
            <option key={f} value={f}>{flavorLabel(f)}</option>
          ))}
        </Select>
        <Input
          label="Etiqueta"
          value={form.tag}
          onChange={e => set("tag", e.target.value)}
          placeholder="Más vendido, Se viene…"
        />
        <Input
          label="Código de barras"
          value={form.barcode}
          onChange={e => set("barcode", e.target.value)}
          placeholder="0799192945984"
        />

        <div className="flex flex-col gap-1.5">
          <label className={LABEL}>Disponibilidad</label>
          <div className="flex gap-2 mt-0.5">
            <button onClick={() => set("status", "activo")} className={toggle(form.status === "activo")}>
              A la venta
            </button>
            <button onClick={() => set("status", "proximamente")} className={toggle(form.status === "proximamente")}>
              Próximamente
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL}>Visibilidad</label>
          <div className="flex gap-2 mt-0.5">
            <button onClick={() => set("active", true)} className={toggle(form.active === true)}>
              ✓ Visible
            </button>
            <button onClick={() => set("active", false)} className={toggle(form.active === false)}>
              ✗ Oculto
            </button>
          </div>
        </div>
      </div>

      {/* ── Formatos de venta ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className={LABEL}>Formatos de venta</label>
          <Btn small variant="ghost" onClick={addFormat}>
            <Plus size={13} aria-hidden="true" /> Agregar formato
          </Btn>
        </div>
        <div className="bg-snow-2 border-2 border-night p-3 flex flex-col gap-2">
          <div className="hidden sm:grid grid-cols-[1fr_90px_90px_110px_32px] gap-2 px-1">
            {["Nombre", "Bolsas", "Stock", "Precio", ""].map(h => (
              <span key={h} className="font-condensed text-[11px] uppercase tracking-[0.1em] text-night-soft">{h}</span>
            ))}
          </div>
          {form.formats.map((f, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_90px_90px_110px_32px] gap-2 items-center">
              <input
                value={f.label}
                onChange={e => setFormat(i, "label", e.target.value)}
                placeholder="Caja"
                className={FIELD_SM}
              />
              <input
                type="number"
                min="1"
                value={f.units}
                onChange={e => setFormat(i, "units", e.target.value)}
                placeholder="24"
                className={`${FIELD_SM} text-center`}
              />
              <input
                type="number"
                min="0"
                value={f.stock}
                onChange={e => setFormat(i, "stock", e.target.value)}
                className={`${FIELD_SM} text-center ${
                  Number(f.stock) === 0 ? "!border-[#a32004] !text-[#8a1c03] !bg-[#ffece5]" : ""
                }`}
              />
              <input
                type="number"
                min="0"
                value={f.price ?? ""}
                onChange={e => setFormat(i, "price", e.target.value)}
                placeholder="a consultar"
                className={`${FIELD_SM} text-center placeholder:text-[11px]`}
              />
              <button
                onClick={() => removeFormat(i)}
                className="size-[34px] grid place-items-center text-[#8a1c03] border-2 border-transparent hover:border-night hover:bg-[#ffd9cc] transition-colors cursor-pointer justify-self-end"
                aria-label={`Eliminar formato ${f.label || i + 1}`}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
          {form.formats.length === 0 && (
            <p className="text-sm text-night-soft text-center py-3 m-0">Sin formatos. Agrega al menos uno.</p>
          )}
        </div>
        <p className="text-xs text-night-faint mt-2 mb-0 leading-relaxed">
          "Bolsas" es cuántas unidades trae el bulto; "Stock" son cuántos bultos hay.
          Deja el precio vacío mientras siga en "a consultar".
        </p>
      </div>

      {/* ── Declaraciones y sellos ──────────────────────────────────── */}
      <div>
        <label className={`${LABEL} block mb-2.5`}>Declaraciones del empaque</label>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "baked", label: "Horneado, no frito" },
            { key: "glutenFree", label: "Libre de gluten" },
          ].map(c => (
            <button
              key={c.key}
              onClick={() => setClaim(c.key, !form.claims[c.key])}
              aria-pressed={!!form.claims[c.key]}
              className={claimChip(form.claims[c.key], TONES.green)}
            >
              {c.label}
            </button>
          ))}
          {SEALS.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSeal(s.id)}
              aria-pressed={!!form.claims.seals?.includes(s.id)}
              className={claimChip(form.claims.seals?.includes(s.id), "bg-night text-snow")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ficha técnica ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={LABEL}>Ingredientes</label>
          <textarea
            value={form.ingredients}
            onChange={e => set("ingredients", e.target.value)}
            rows={3}
            placeholder="Gritz de maíz, aceite vegetal, sal…"
            className={`${FIELD} py-2.5 resize-y`}
          />
        </div>
        <Input
          label="Alérgenos"
          value={form.allergens}
          onChange={e => set("allergens", e.target.value)}
          placeholder="Contiene derivados lácteos."
        />

        <div>
          <label className={`${LABEL} block mb-2.5`}>Tabla nutricional (por 100 g)</label>
          <div className="bg-snow-2 border-2 border-night p-3 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Porción"
                value={form.nutrition?.serving || ""}
                onChange={e => setNutritionMeta("serving", e.target.value)}
                placeholder="15 g"
              />
              <Input
                label="Porciones por envase"
                type="number"
                value={form.nutrition?.portions || ""}
                onChange={e => setNutritionMeta("portions", Number(e.target.value) || "")}
                placeholder="10"
              />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
              {NUTRIENTS.map(n => (
                <div key={n.key} className="flex flex-col gap-1">
                  <label className="text-[11px] text-night-soft font-bold">{n.label}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.nutrition?.per100g?.[n.key] ?? ""}
                    onChange={e => setNutrient(n.key, e.target.value)}
                    className={`${FIELD_SM} w-full text-center`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-night-faint m-0">
              Deja todo vacío si la ficha todavía no está lista.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className={`${ERROR_TEXT} text-right m-0`} role="alert">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t-[3px] border-night">
        <Btn variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Btn>
        <Btn onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
        </Btn>
      </div>
    </div>
  );
}

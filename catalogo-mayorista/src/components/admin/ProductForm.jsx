import { useState, useRef } from "react";
import { Upload, Plus, Trash2 } from "lucide-react";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Btn from "./ui/Btn";
import { STORE_CONFIG, FLAVOR_ACCENTS } from "../../data/store";

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
    line: product?.line || STORE_CONFIG.lines[0]?.id || "sufles",
    flavor: product?.flavor || "queso",
    grams: product?.grams || "",
    status: product?.status || "activo",
    active: product?.active !== false,
    tag: product?.tag || "",
    emoji: product?.emoji || "🧀",
    image: product?.image || null,
    barcode: product?.barcode || "",
    claims: product?.claims || { baked: true, glutenFree: false, seals: [] },
    formats: product?.formats?.length
      ? product.formats
      : STORE_CONFIG.defaultFormats.map(f => ({ ...f })),
    ingredients: product?.ingredients || "",
    allergens: product?.allergens || "",
    nutrition: product?.nutrition || null,
  });
  const [imgPreview, setImgPreview] = useState(product?.image || null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

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

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImgPreview(ev.target.result);
      set("image", ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.name.trim()) return setError("Falta el nombre del producto");
    if (!form.grams) return setError("Falta el gramaje");
    if (form.formats.length === 0) return setError("Agrega al menos un formato de venta");
    if (form.formats.some(f => !f.label.trim())) return setError("Todos los formatos necesitan un nombre");

    setError(null);
    onSave({
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
  }

  const toggle = (on) =>
    `flex-1 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
      on ? "bg-accent text-bg" : "bg-surface-2 text-muted border border-border hover:border-muted"
    }`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-4 items-start">
        <div
          onClick={() => fileRef.current.click()}
          className="w-[100px] h-[100px] rounded-xl border-2 border-dashed border-border bg-bg flex items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:border-accent transition-colors duration-200"
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
            <Upload size={14} /> Subir foto del empaque
          </Btn>
          <p className="text-[11px] text-faint leading-relaxed">
            Ideal: el frente de la bolsa recortado, fondo transparente o plano.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Nombre *"
          value={form.name}
          onChange={e => set("name", e.target.value)}
          placeholder="Suflés Queso Horneado"
        />
        <Input
          label="Gramaje (g) *"
          type="number"
          value={form.grams}
          onChange={e => set("grams", e.target.value)}
          placeholder="150"
        />
        <Select label="Línea" value={form.line} onChange={e => set("line", e.target.value)}>
          {STORE_CONFIG.lines.map(l => (
            <option key={l.id} value={l.id}>{l.labelPlural}</option>
          ))}
        </Select>
        <Select label="Sabor (define el color)" value={form.flavor} onChange={e => set("flavor", e.target.value)}>
          {Object.keys(FLAVOR_ACCENTS).map(f => (
            <option key={f} value={f}>{f}</option>
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
          <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em]">Disponibilidad</label>
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
          <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em]">Visibilidad</label>
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
          <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em]">
            Formatos de venta
          </label>
          <Btn small variant="ghost" onClick={addFormat}>
            <Plus size={13} /> Agregar formato
          </Btn>
        </div>
        <div className="bg-bg rounded-xl p-3 flex flex-col gap-2">
          <div className="hidden sm:grid grid-cols-[1fr_90px_90px_110px_32px] gap-2 px-1">
            {["Nombre", "Bolsas", "Stock", "Precio", ""].map(h => (
              <span key={h} className="text-[10px] font-bold text-faint uppercase">{h}</span>
            ))}
          </div>
          {form.formats.map((f, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_90px_90px_110px_32px] gap-2 items-center">
              <input
                value={f.label}
                onChange={e => setFormat(i, "label", e.target.value)}
                placeholder="Caja"
                className="px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-text text-sm outline-none focus:border-accent transition-colors placeholder:text-faint"
              />
              <input
                type="number"
                min="1"
                value={f.units}
                onChange={e => setFormat(i, "units", e.target.value)}
                placeholder="24"
                className="px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-text text-sm text-center outline-none focus:border-accent transition-colors"
              />
              <input
                type="number"
                min="0"
                value={f.stock}
                onChange={e => setFormat(i, "stock", e.target.value)}
                className={`px-2.5 py-2 rounded-lg border bg-surface-2 text-sm text-center outline-none transition-colors ${
                  Number(f.stock) === 0 ? "border-red-500/40 text-red-400" : "border-border text-text"
                }`}
              />
              <input
                type="number"
                min="0"
                value={f.price ?? ""}
                onChange={e => setFormat(i, "price", e.target.value)}
                placeholder="a consultar"
                className="px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-text text-sm text-center outline-none focus:border-accent transition-colors placeholder:text-faint placeholder:text-[11px]"
              />
              <button
                onClick={() => removeFormat(i)}
                className="p-2 rounded-lg text-faint hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer justify-self-end"
                aria-label={`Eliminar formato ${f.label || i + 1}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {form.formats.length === 0 && (
            <p className="text-xs text-faint text-center py-3">Sin formatos. Agrega al menos uno.</p>
          )}
        </div>
        <p className="text-[11px] text-faint mt-2 leading-relaxed">
          "Bolsas" es cuántas unidades trae el bulto; "Stock" son cuántos bultos hay.
          Deja el precio vacío mientras siga en "a consultar".
        </p>
      </div>

      {/* ── Declaraciones y sellos ──────────────────────────────────── */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em] block mb-2.5">
          Declaraciones del empaque
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: "baked", label: "Horneado, no frito" },
            { key: "glutenFree", label: "Libre de gluten" },
          ].map(c => (
            <button
              key={c.key}
              onClick={() => setClaim(c.key, !form.claims[c.key])}
              className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                form.claims[c.key]
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                  : "bg-surface-2 text-faint border border-border hover:border-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
          {SEALS.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSeal(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                form.claims.seals?.includes(s.id)
                  ? "bg-text text-bg border border-text font-bold"
                  : "bg-surface-2 text-faint border border-border hover:border-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ficha técnica ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em]">Ingredientes</label>
          <textarea
            value={form.ingredients}
            onChange={e => set("ingredients", e.target.value)}
            rows={3}
            placeholder="Gritz de maíz, Aceite vegetal, Sal…"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm outline-none transition-colors focus:border-accent resize-vertical placeholder:text-faint"
          />
        </div>
        <Input
          label="Alérgenos"
          value={form.allergens}
          onChange={e => set("allergens", e.target.value)}
          placeholder="Contiene derivados lácteos."
        />

        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em] block mb-2.5">
            Tabla nutricional (por 100 g)
          </label>
          <div className="bg-bg rounded-xl p-3 flex flex-col gap-3">
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
                  <label className="text-[10px] text-faint font-bold">{n.label}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.nutrition?.per100g?.[n.key] ?? ""}
                    onChange={e => setNutrient(n.key, e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface-2 text-text text-sm text-center outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-faint">
              Deja todo vacío si la ficha todavía no está lista.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 text-right" role="alert">{error}</p>
      )}

      <div className="flex gap-2 justify-end pt-3 border-t border-border">
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={handleSubmit}>{isEdit ? "Guardar cambios" : "Crear producto"}</Btn>
      </div>
    </div>
  );
}

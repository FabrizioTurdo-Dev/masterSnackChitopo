import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Package, Plus, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Btn from "./ui/Btn";
import PageHeader from "./ui/PageHeader";
import { CARD, FIELD, TH, PILL, TONES, chip } from "./ui/styles";
import Modal from "./Modal";
import ProductForm from "./ProductForm";
import { useApp } from "../../context/AppContext";
import { formatPrice, hasPrice, STORE_CONFIG, lineLabel, totalStock } from "../../data/store";
import { productsService } from "../../services/productsService";

function FormatTag({ format, threshold }) {
  const isZero = format.stock === 0;
  const isLow = format.stock > 0 && format.stock <= threshold;
  return (
    <span
      className={`${PILL} ${isZero ? TONES.red : isLow ? TONES.gold : TONES.green}`}
      title={`${format.label} de ${format.units} bolsas — ${format.stock} en stock`}
    >
      {format.label} ×{format.units}: {format.stock}
    </span>
  );
}

function SortHeader({ label, field, current, direction, onSort }) {
  const active = current === field;
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={`${TH} cursor-pointer select-none hover:text-snow transition-colors`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <Icon size={12} className={active ? "text-snow" : "opacity-50"} aria-hidden="true" />
      </div>
    </th>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t-2 border-night/10 first:border-t-0">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-snow-2 animate-pulse" style={{ width: `${40 + i * 15}%` }} />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="py-16 text-center">
      <Package size={40} className="mx-auto mb-3 text-night-faint" aria-hidden="true" />
      <p className="font-condensed uppercase tracking-[0.04em] text-lg text-night-soft m-0">
        {hasFilters ? "No hay productos para esos filtros" : "Todavía no hay productos. ¡Crea el primero!"}
      </p>
    </div>
  );
}

export default function ProductsTable({ stockThreshold }) {
  const { products, setProducts } = useApp();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [stockFilter, setStockFilter] = useState("todos");
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    let cancelled = false;
    productsService.list().then(res => {
      if (cancelled) return;
      if (res.success) setProducts(res.data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [setProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, lineFilter, statusFilter, stockFilter]);

  function handleSort(field) {
    if (sortField === field) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  async function saveProduct(formData) {
    const res = formData.id
      ? await productsService.update(formData.id, formData)
      : await productsService.create(formData);

    if (!res.success) return alert(`Error: ${res.error}`);

    setProducts(prev =>
      formData.id
        ? prev.map(p => (p.id === formData.id ? { ...p, ...res.data } : p))
        : [...prev, res.data]
    );
    setModal(null);
  }

  async function deleteProduct(id) {
    if (!window.confirm("¿Eliminar este producto para siempre?")) return;
    const res = await productsService.remove(id);
    if (!res.success) return alert(`Error: ${res.error}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function toggleActive(product) {
    const next = !product.active;
    const res = await productsService.toggleActive(product.id, next);
    if (!res.success) return alert(`Error: ${res.error}`);
    setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, active: next } : p)));
  }

  const filtered = useMemo(() => {
    let list = [...products];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => `${p.name} ${p.flavor || ""}`.toLowerCase().includes(q));
    }
    if (lineFilter !== "todos") list = list.filter(p => p.line === lineFilter);
    if (statusFilter === "activos") list = list.filter(p => p.active);
    if (statusFilter === "ocultos") list = list.filter(p => !p.active);
    if (statusFilter === "proximamente") list = list.filter(p => p.status === "proximamente");
    if (stockFilter === "con-stock") list = list.filter(p => totalStock(p) > 0);
    if (stockFilter === "sin-stock") list = list.filter(p => totalStock(p) === 0);
    if (stockFilter === "stock-bajo") {
      list = list.filter(p => (p.formats || []).some(f => f.stock > 0 && f.stock <= stockThreshold));
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "line") cmp = (a.line || "").localeCompare(b.line || "");
      else if (sortField === "grams") cmp = (a.grams || 0) - (b.grams || 0);
      else if (sortField === "stock") cmp = totalStock(a) - totalStock(b);
      else if (sortField === "active") cmp = Number(a.active) - Number(b.active);
      else cmp = a.id - b.id;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [products, search, lineFilter, statusFilter, stockFilter, sortField, sortDir, stockThreshold]);

  function exportCSV() {
    const headers = ["Nombre", "Línea", "Gramaje", "Disponibilidad", "Formatos", "Bolsas en stock", "Visible"];
    const rows = filtered.map(p => [
      p.name,
      lineLabel(p.line),
      `${p.grams} g`,
      p.status === "activo" ? "A la venta" : "Próximamente",
      (p.formats || []).map(f => `${f.label} x${f.units}: ${f.stock}`).join(" | "),
      totalStock(p),
      p.active ? "Sí" : "No",
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chitopo-productos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasFilters =
    search || lineFilter !== "todos" || statusFilter !== "todos" || stockFilter !== "todos";

  const FILTERS = [
    {
      key: "line", value: lineFilter, set: setLineFilter,
      options: [{ v: "todos", l: "Todas las líneas" }, ...STORE_CONFIG.lines.map(l => ({ v: l.id, l: l.labelPlural }))],
    },
    {
      key: "status", value: statusFilter, set: setStatusFilter,
      options: [
        { v: "todos", l: "Todos" },
        { v: "activos", l: "Visibles" },
        { v: "ocultos", l: "Ocultos" },
        { v: "proximamente", l: "Próximamente" },
      ],
    },
    {
      key: "stock", value: stockFilter, set: setStockFilter,
      options: [
        { v: "todos", l: "Todo el stock" },
        { v: "con-stock", l: "Con stock" },
        { v: "sin-stock", l: "Sin stock" },
        { v: "stock-bajo", l: `Stock bajo (≤${stockThreshold})` },
      ],
    },
  ];

  const priceOf = p => {
    const withPrice = (p.formats || []).find(f => hasPrice(f.price));
    return withPrice ? `desde ${formatPrice(withPrice.price)}` : "A consultar";
  };

  const statusPill = p =>
    p.status === "proximamente" ? (
      <span className={`${PILL} ${TONES.gold}`}>
        Próximamente
      </span>
    ) : null;

  return (
    <div>
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        subtitle={`${products.length} cargados · ${filtered.length} visibles${totalPages > 1 ? ` · Pág. ${page}/${totalPages}` : ""}`}
      >
        <Btn variant="ghost" onClick={exportCSV} disabled={filtered.length === 0}>
          Exportar CSV
        </Btn>
        <Btn onClick={() => setModal("new")}>
          <Plus size={16} aria-hidden="true" /> Nuevo producto
        </Btn>
      </PageHeader>

      <div className={`${CARD} mb-6 p-4`}>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-soft pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar por nombre o sabor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${FIELD} pl-9`}
            />
          </div>
          {FILTERS.map(f => (
            <select
              key={f.key}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className={`${FIELD} sm:w-auto cursor-pointer`}
            >
              {f.options.map(o => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      <div className={`${CARD} overflow-hidden`}>
        {loading ? (
          <table className="w-full border-collapse">
            <tbody>
              {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        ) : products.length === 0 ? (
          <EmptyState hasFilters={false} />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters />
        ) : (
          <>
            {/* Mobile */}
            <div className="divide-y-2 divide-night/15 sm:hidden">
              {paginated.map(p => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-11 bg-snow-2 border-2 border-night flex items-center justify-center text-lg overflow-hidden shrink-0">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-contain p-0.5" /> : p.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-condensed uppercase text-base leading-tight text-night truncate">{p.name}</div>
                        <div className="text-xs text-night-faint">
                          {lineLabel(p.line)} · {p.grams} g
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-electric shrink-0 text-right">{priceOf(p)}</div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {(p.formats || []).map(f => (
                      <FormatTag key={f.id} format={f} threshold={stockThreshold} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`${PILL} cursor-pointer hover:brightness-95 ${p.active ? TONES.green : TONES.snow}`}
                      >
                        {p.active ? "● Visible" : "○ Oculto"}
                      </button>
                      {statusPill(p)}
                      <span className="text-xs text-night-faint">{totalStock(p)} bolsas</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Btn small variant="ghost" onClick={() => setModal(p)}>Editar</Btn>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="size-[34px] grid place-items-center text-[#8a1c03] border-2 border-transparent hover:border-night hover:bg-[#ffd9cc] transition-colors cursor-pointer"
                        aria-label={`Eliminar ${p.name}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-night">
                    <SortHeader label="Producto" field="name" current={sortField} direction={sortDir} onSort={handleSort} />
                    <SortHeader label="Línea" field="line" current={sortField} direction={sortDir} onSort={handleSort} />
                    <SortHeader label="Gramaje" field="grams" current={sortField} direction={sortDir} onSort={handleSort} />
                    <th className={TH}>Precio</th>
                    <SortHeader label="Formatos / Stock" field="stock" current={sortField} direction={sortDir} onSort={handleSort} />
                    <SortHeader label="Estado" field="active" current={sortField} direction={sortDir} onSort={handleSort} />
                    <th className={TH}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p.id} className="border-t-2 border-night/15 first:border-t-0 hover:bg-snow-2/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 bg-snow-2 border-2 border-night flex items-center justify-center text-lg overflow-hidden shrink-0">
                            {p.image ? <img src={p.image} alt="" className="w-full h-full object-contain p-0.5" /> : p.emoji}
                          </div>
                          <div>
                            <div className="font-condensed uppercase text-base leading-tight text-night">{p.name}</div>
                            <div className="text-xs text-night-faint">{p.flavor}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-night-soft">{lineLabel(p.line)}</td>
                      <td className="px-4 py-3 text-sm text-night-soft tabular-nums">{p.grams} g</td>
                      <td className="px-4 py-3 text-xs font-bold text-electric">{priceOf(p)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap max-w-[260px]">
                          {(p.formats || []).map(f => (
                            <FormatTag key={f.id} format={f} threshold={stockThreshold} />
                          ))}
                        </div>
                        <div className="text-xs text-night-faint mt-1">{totalStock(p)} bolsas</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            onClick={() => toggleActive(p)}
                            className={`${PILL} cursor-pointer hover:brightness-95 ${p.active ? TONES.green : TONES.snow}`}
                          >
                            {p.active ? "● Visible" : "○ Oculto"}
                          </button>
                          {statusPill(p)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <Btn small variant="ghost" onClick={() => setModal(p)}>Editar</Btn>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="size-[34px] grid place-items-center text-[#8a1c03] border-2 border-transparent hover:border-night hover:bg-[#ffd9cc] transition-colors cursor-pointer"
                            aria-label={`Eliminar ${p.name}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {!loading && filtered.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pb-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`${chip(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`${chip(page === n)} justify-center min-w-[34px] px-0`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`${chip(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Siguiente
          </button>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <Modal
            title={modal === "new" ? "Nuevo producto" : `Editar: ${modal.name}`}
            onClose={() => setModal(null)}
            wide
          >
            <ProductForm
              product={modal === "new" ? null : modal}
              onSave={saveProduct}
              onCancel={() => setModal(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

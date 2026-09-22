// Encabezado de cada sección del panel, como el de las secciones de la
// landing (ui/Section.jsx): eyebrow con estrella y título en Anton.
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-7">
      <div>
        {eyebrow && (
          <p className="font-condensed uppercase tracking-[0.22em] text-night text-xs m-0 mb-2 before:content-['★'] before:text-electric before:mr-2">
            {eyebrow}
          </p>
        )}
        <h2 className="font-title uppercase text-4xl sm:text-5xl leading-[0.92] text-night m-0">{title}</h2>
        {subtitle && <p className="text-sm text-night-soft mt-2 mb-0">{subtitle}</p>}
      </div>
      {children && <div className="flex gap-2.5 flex-wrap">{children}</div>}
    </div>
  );
}

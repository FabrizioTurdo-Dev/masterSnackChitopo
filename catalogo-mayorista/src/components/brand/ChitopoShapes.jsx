// Siluetas de los snacks para el estallido, como sprite de <symbol>.
// Son vectores y no fotos a propósito: cuando cambien las fotos de
// producto, el estallido sigue funcionando igual.
export default function ChitopoShapes() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        {/* A — suflé lobulado, la bolita horneada */}
        <symbol id="chitopo-a" viewBox="0 0 40 40">
          <path
            d="M20 3c4.2 0 6.1 2.6 9.4 3.4 3.6.9 6.6 2.9 6.6 6.6 0 2.9-1.8 4.6-1.4 7.4
               .5 3.4 2 5.6-.4 8.6-2.2 2.7-5.2 2.3-8 3.6-2.9 1.3-4.6 3.6-7.8 2.9
               -3.4-.7-4.4-3.6-7-5.6-2.7-2.1-5.6-2.9-5.6-6.6 0-3.1 2.3-4.9 3-7.8
               .7-3-.4-6 2.3-7.9C13 5.8 16.2 3 20 3Z"
          />
          <ellipse cx="15" cy="15" rx="3.2" ry="2.4" fill="#3a0d04" opacity=".22" stroke="none" />
          <ellipse cx="25" cy="24" rx="2.4" ry="1.8" fill="#3a0d04" opacity=".18" stroke="none" />
        </symbol>

        {/* B — palito curvo, el extrudido */}
        <symbol id="chitopo-b" viewBox="0 0 40 40">
          <path
            d="M6 9c3-5 9-6.6 14-4.6 6 2.4 10 8 13 13.6 2 3.8.4 8-3.4 9.4
               -3.6 1.3-6.6-1.2-8.6-4.2-2.6-3.9-4.6-8.2-8.8-10.4C9.6 11.6 7.4 11.4 6 9Z"
          />
          <path
            d="M12 11c3 1.4 5.4 4.4 7.4 7.6"
            stroke="#3a0d04"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            opacity=".2"
          />
        </symbol>

        {/* C — maní */}
        <symbol id="chitopo-c" viewBox="0 0 40 40">
          <path
            d="M11 6c4-2.4 8.6-1.4 11 2.2 1.6 2.4 1.4 4.6 2.6 7 1.4 2.8 3.6 4.4 3.4 7.8
               -.3 4.6-4.6 7.6-9 6.6-3-.7-4.4-3-6-5.4-1.7-2.6-4-4-5.2-7
               C6.2 13.4 7.4 8.2 11 6Z"
          />
          <path
            d="M14 15.5c2.6.6 5 .4 7.2-.8"
            stroke="#3a0d04"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity=".25"
          />
        </symbol>
      </defs>
    </svg>
  );
}

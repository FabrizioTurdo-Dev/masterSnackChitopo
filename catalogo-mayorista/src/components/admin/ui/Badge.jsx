import { PILL, TONES } from "./styles";

const STYLES = {
  nuevo:      "bg-electric text-snow",
  pendiente:  TONES.gold,
  confirmado: TONES.green,
  enviado:    TONES.blue,
  cancelado:  TONES.red,
  activo:     TONES.green,
  oculto:     TONES.snow,
  bajo:       TONES.red,
  alerta:     TONES.gold,
};

export default function Badge({ status, children }) {
  const style = STYLES[status] || STYLES.pendiente;
  return <span className={`${PILL} capitalize ${style}`}>{children || status}</span>;
}

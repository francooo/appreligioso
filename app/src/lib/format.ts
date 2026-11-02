import type { Tradition } from '../content/traditions';

const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "Bom dia" / "Boa tarde" / "Boa noite". */
export function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

/** "domingo, 2 de novembro" */
export function longDate(d = new Date()) {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/** "Domingo, 2 de novembro" */
export function longDateCapitalized(d = new Date()) {
  const s = longDate(d);
  return s[0].toUpperCase() + s.slice(1);
}

/** "28 out" */
export function shortDate(iso: string) {
  const d = parseDate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

/** "Sáb, 31 out" */
export function weekdayShortDate(iso: string) {
  const d = parseDate(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${shortDate(iso)}`;
}

/** "Outubro de 2026" */
export function monthTitle(d: Date) {
  return `${MONTHS[d.getMonth()][0].toUpperCase()}${MONTHS[d.getMonth()].slice(1)} de ${d.getFullYear()}`;
}

/** "Criada hoje", "Criada ontem", "Criada há 3 dias", "Criada há 1 semana"... */
export function relativeAge(iso: string, prefix = 'Criada') {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return `${prefix} hoje`;
  if (days === 1) return `${prefix} ontem`;
  if (days < 7) return `${prefix} há ${days} dias`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${prefix} há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  const months = Math.floor(days / 30);
  return `${prefix} há ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

/** Datas "YYYY-MM-DD" do banco viram data local (sem deslocar o dia pelo fuso). */
export function parseDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso);
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const PERIODS = ['Manhã', 'Tarde', 'Noite'];

/** Momento de oração atual (o último horário já alcançado hoje; antes do 1º, o da manhã). */
export function currentPrayer(rel: Tradition, now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  let index = 0;
  rel.times.forEach((t, i) => {
    if (toMinutes(t) <= mins) index = i;
  });
  return { index, name: rel.prayers[index], time: rel.times[index], period: PERIODS[index] ?? '' };
}

/** Próximo horário de oração depois de agora (volta para o primeiro do dia seguinte). */
export function nextPrayer(rel: Tradition, now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const i = rel.times.findIndex((t) => toMinutes(t) > mins);
  const index = i === -1 ? 0 : i;
  return { index, name: rel.prayers[index], time: rel.times[index] };
}

/** "hoje, às 08:15" / "ontem, às 21:40" / "em 28 out, às 19:02" */
export function dayAndTime(iso: string, now = new Date()) {
  const d = new Date(iso);
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  const day = diff === 0 ? 'hoje' : diff === 1 ? 'ontem' : `em ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
  return `${day}, às ${hhmm}`;
}

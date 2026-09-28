const TIMEZONE = 'America/Argentina/Buenos_Aires';

/** Fecha de hoy en Argentina, como 'YYYY-MM-DD'. */
export function argentinaToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(
    new Date(),
  );
}

/** Suma (o resta, con un número negativo) días a una fecha 'YYYY-MM-DD'. */
export function addDays(fecha: string, dias: number): string {
  const date = new Date(`${fecha}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dias);
  return date.toISOString().slice(0, 10);
}

/** Diferencia en días entre dos fechas 'YYYY-MM-DD' (a - b). */
export function diffDays(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const dateA = new Date(`${a}T00:00:00Z`).getTime();
  const dateB = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((dateA - dateB) / msPerDay);
}

/** Convierte lo que devuelva TypeORM para una columna `date` a 'YYYY-MM-DD'. */
export function toDateString(value: Date | string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

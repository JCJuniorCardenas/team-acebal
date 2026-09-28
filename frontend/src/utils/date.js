/** Suma un mes a una fecha 'YYYY-MM-DD', respetando la duración de cada mes
 * (ej: 31 de enero + 1 mes = 28 o 29 de febrero, no "3 de marzo"). */
export function agregarUnMes(fecha) {
  const [year, month, day] = fecha.split('-').map(Number)
  const primerDiaSiguienteMes = new Date(Date.UTC(year, month, 1))
  const ultimoDiaDelMesSiguiente = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  primerDiaSiguienteMes.setUTCDate(Math.min(day, ultimoDiaDelMesSiguiente))
  return primerDiaSiguienteMes.toISOString().slice(0, 10)
}

/** Edad en años cumplidos a partir de una fecha de nacimiento 'YYYY-MM-DD'. */
export function calcularEdad(fechaNacimiento) {
  const [year, month, day] = fechaNacimiento.split('-').map(Number)
  const hoy = new Date()
  let edad = hoy.getFullYear() - year
  const noCumplioAnoTodavia = hoy.getMonth() + 1 < month || (hoy.getMonth() + 1 === month && hoy.getDate() < day)
  if (noCumplioAnoTodavia) edad -= 1
  return edad
}

import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

/**
 * Форматирует дату в строку вида "Пятница, 6 Марта 2026"
 * @param date Дата для форматирования
 * @returns Отформатированная строка с датой
 */
export function formatDateFull(date: dayjs.Dayjs | Date | string): string {
  const d = dayjs(date)
  const weekday = d.format('dddd')
  const day = d.format('D')
  const month = d.format('MMMM')
  const year = d.format('YYYY')

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)

  return `${capitalizedWeekday}, ${day} ${capitalizedMonth} ${year}`
}

/**
 * Проверяет, является ли дата сегодняшней
 * @param date Дата для проверки
 * @returns true если дата сегодня
 */
export function isToday(date: dayjs.Dayjs | Date | string): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * Форматирует дату в относительном виде (сегодня, вчера, завтра)
 * @param date Дата для форматирования
 * @returns Относительная строка с датой
 */
export function formatRelativeDate(date: dayjs.Dayjs | Date | string): string {
  const d = dayjs(date)
  const today = dayjs()

  if (d.isSame(today, 'day')) {
    return 'Сегодня'
  }

  if (d.isSame(today.add(1, 'day'), 'day')) {
    return 'Завтра'
  }

  if (d.isSame(today.subtract(1, 'day'), 'day')) {
    return 'Вчера'
  }

  return formatDateFull(d)
}

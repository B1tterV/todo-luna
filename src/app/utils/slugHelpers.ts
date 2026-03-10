import slugify from 'slugify'

/**
 * Генерирует уникальный slug из названия группы
 * @param name - Название группы
 * @returns Уникальный slug в нижнем регистре
 */
export function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'en',
    trim: true
  })
}

/**
 * Генерирует уникальный slug с проверкой на дубликаты
 * @param name - Название группы
 * @param existingSlugs - Существующие slug'и
 * @returns Уникальный slug
 */
export function generateUniqueSlug(name: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

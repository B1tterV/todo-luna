// Libs
import { defineStore } from 'pinia'
// Utils
import { generateUniqueSlug } from '~/utils/slugHelpers'
// Composables
import { useDatabase } from '~/composables/useDatabase'
// Types
import type { TaskGroup, TaskGroupWithStats } from '~/types/groups'
// Stores
import { useToDosStore } from '~/stores/public/toDos'

/**
 * Store для управления группами задач
 */
export const useTaskGroupsStore = defineStore('taskGroups', () => {
  const groups = ref<TaskGroup[]>([])
  const isLoaded = ref(false)

  const { db } = useDatabase()
  const toDosStore = useToDosStore()

  /**
   * Загрузка групп из базы данных
   */
  const loadGroups = async () => {
    try {
      const stored = await db.taskGroups.toArray()
      // Сортируем по order
      groups.value = stored.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      isLoaded.value = true
    } catch (error) {
      console.error('Failed to load task groups:', error)
      groups.value = []
      isLoaded.value = true
    }
  }

  /**
   * Получение групп со статистикой по ToDos
   */
  const groupsWithStats = computed<TaskGroupWithStats[]>(() => {
    return groups.value.map(group => ({
      ...group,
      stats: toDosStore.getGroupStats(group.id),
    }))
  })

  /**
   * Добавление новой группы
   * @param name - Название группы
   * @param emoji - Эмодзи группы
   * @returns Созданная группа
   */
  const addGroup = async (name: string, emoji: string): Promise<TaskGroup> => {
    const existingSlugs = groups.value.map(g => g.slug)
    const slug = generateUniqueSlug(name, existingSlugs)

    const maxOrder = groups.value.reduce((max, g) => Math.max(max, g.order ?? 0), 0)

    const now = Date.now()
    const newGroup: TaskGroup = {
      id: crypto.randomUUID() || crypto.getRandomValues(),
      name,
      slug,
      emoji,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    }

    await db.taskGroups.add(newGroup)
    groups.value.push(newGroup)
    return newGroup
  }

  /**
   * Обновление группы
   * @param id - ID группы
   * @param updates - Обновляемые данные
   */
  const updateGroup = async (id: string, updates: Partial<Pick<TaskGroup, 'name' | 'emoji' | 'order'>>) => {
    const groupIndex = groups.value.findIndex(g => g.id === id)
    if (groupIndex === -1) return

    const group = groups.value[groupIndex]!

    if (updates.name) {
      const existingSlugs = groups.value.filter(g => g.id !== id).map(g => g.slug)
      group.slug = generateUniqueSlug(updates.name, existingSlugs)
      group.name = updates.name
    }

    if (updates.emoji) {
      group.emoji = updates.emoji
    }

    if (updates.order !== undefined) {
      group.order = updates.order
    }

    group.updatedAt = Date.now()

    // Обновляем массив для реактивности
    groups.value = [
      ...groups.value.slice(0, groupIndex),
      { ...group } as TaskGroup,
      ...groups.value.slice(groupIndex + 1)
    ]

    await db.taskGroups.update(id, group)
  }

  /**
   * Переупорядочивание групп
   * @param orderedGroups - Массив групп в новом порядке
   */
  const reorderGroups = async (orderedGroups: TaskGroup[]) => {
    // Обновляем порядок для каждой группы
    const updates = orderedGroups.map((group, index) => ({
      id: group.id,
      order: index,
      updatedAt: Date.now()
    }))

    // Обновляем в базе данных
    await Promise.all(
      updates.map(update => db.taskGroups.update(update.id, { order: update.order, updatedAt: update.updatedAt }))
    )

    // Обновляем локальное состояние
    groups.value = orderedGroups.map((group, index) => ({
      ...group,
      order: index,
      updatedAt: Date.now()
    }))
  }

  /**
   * Удаление группы
   * @param id - ID группы
   */
  const deleteGroup = async (id: string) => {
    const index = groups.value.findIndex(g => g.id === id)
    if (index !== -1) {
      // Обновляем массив для реактивности
      groups.value = [
        ...groups.value.slice(0, index),
        ...groups.value.slice(index + 1)
      ]
      await db.taskGroups.delete(id)
    }
  }

  /**
   * Получение группы по slug
   * @param slug - Slug группы
   * @returns Группа или undefined
   */
  const getGroupBySlug = (slug: string): TaskGroup | undefined => {
    return groups.value.find(g => g.slug === slug)
  }

  /**
   * Получение группы по ID
   * @param id - ID группы
   * @returns Группа или undefined
   */
  const getGroupById = (id: string): TaskGroup | undefined => {
    return groups.value.find(g => g.id === id)
  }

  /**
   * Очистка всех групп
   */
  const clearGroups = async () => {
    groups.value = []
    await db.taskGroups.clear()
  }

  // Автозагрузка при инициализации
  loadGroups()

  return {
    groups,
    groupsWithStats,
    isLoaded,
    loadGroups,
    addGroup,
    updateGroup,
    reorderGroups,
    deleteGroup,
    getGroupBySlug,
    getGroupById,
    clearGroups,
  }
})

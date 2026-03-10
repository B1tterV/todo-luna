// Libs
import { defineStore } from 'pinia'
// Utils
import { generateUniqueSlug } from '~/utils/slugHelpers'
// Composables
import { useDatabase } from '~/composables/useDatabase'
// Types
import type { ToDo, ToDoGroupStats } from '~/types/toDos'

/**
 * Store для управления задачами (ToDos)
 */
export const useToDosStore = defineStore('toDos', () => {
  const toDos = ref<ToDo[]>([])
  const isLoaded = ref(false)

  const { db } = useDatabase()

  /**
   * Загрузка задач из базы данных
   */
  const loadToDos = async () => {
    try {
      const stored = await db.toDos.toArray()
      toDos.value = stored.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      isLoaded.value = true
    } catch (error) {
      console.error('Failed to load toDos:', error)
      toDos.value = []
      isLoaded.value = true
    }
  }

  /**
   * Добавление новой задачи
   * @param name - Название задачи
   * @param groupIds - ID групп
   * @returns Созданная задача
   */
  const addToDo = async (name: string, groupIds: string[]): Promise<ToDo> => {
    const existingSlugs = toDos.value.map(t => t.slug)
    const slug = generateUniqueSlug(name, existingSlugs)

    const maxOrder = toDos.value.reduce((max, t) => Math.max(max, t.order ?? 0), 0)

    const now = Date.now()
    // Create a clean plain object for IndexedDB
    const newToDo: ToDo = {
      id: crypto.randomUUID(),
      name,
      slug,
      groupIds: [...groupIds], // Ensure it's a new array
      content: '',
      isComplete: false,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    }

    await db.toDos.add(newToDo)
    toDos.value.push(newToDo)
    return newToDo
  }

  /**
   * Обновление задачи
   * @param id - ID задачи
   * @param updates - Обновляемые данные
   */
  const updateToDo = async (id: string, updates: Partial<Pick<ToDo, 'name' | 'groupIds' | 'isComplete' | 'order'>>) => {
    const todoIndex = toDos.value.findIndex(t => t.id === id)
    if (todoIndex === -1) return

    const oldTodo = toDos.value[todoIndex]!

    // Создаём новый объект с обновлениями
    const updatedTodo: ToDo = {
      ...oldTodo,
      updatedAt: Date.now(),
    }

    if (updates.name) {
      const existingSlugs = toDos.value.filter(t => t.id !== id).map(t => t.slug)
      updatedTodo.slug = generateUniqueSlug(updates.name, existingSlugs)
      updatedTodo.name = updates.name
    }

    if (updates.groupIds) {
      updatedTodo.groupIds = [...updates.groupIds]
    }

    if (updates.isComplete !== undefined) {
      updatedTodo.isComplete = updates.isComplete
    }

    if (updates.order !== undefined) {
      updatedTodo.order = updates.order
    }

    // Обновляем массив для реактивности
    toDos.value = [
      ...toDos.value.slice(0, todoIndex),
      { ...updatedTodo } as ToDo,
      ...toDos.value.slice(todoIndex + 1)
    ]

    // Создаём чистый объект для базы данных (без реактивных прокси)
    const dbUpdateData = {
      id: updatedTodo.id,
      name: updatedTodo.name,
      slug: updatedTodo.slug,
      groupIds: [...updatedTodo.groupIds],
      isComplete: updatedTodo.isComplete,
      order: updatedTodo.order,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
    }

    await db.toDos.update(id, dbUpdateData)
  }

  /**
   * Переключение статуса завершения задачи
   * @param id - ID задачи
   * @param isComplete - новый статус задачи
   */
  const toggleToDoComplete = async (id: string, isComplete?: boolean) => {
    const todo = toDos.value.find(t => t.id === id)
    if (todo) {
      const newStatus = isComplete !== undefined ? isComplete : !todo.isComplete
      await updateToDo(id, { isComplete: newStatus })
    }
  }

  /**
   * Удаление задачи
   * @param id - ID задачи
   */
  const deleteToDo = async (id: string) => {
    const index = toDos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toDos.value = [
        ...toDos.value.slice(0, index),
        ...toDos.value.slice(index + 1)
      ]
      await db.toDos.delete(id)
    }
  }

  /**
   * Обновление содержимого задачи (контент редактора)
   * @param id - ID задачи
   * @param content - HTML контент
   */
  const updateToDoContent = async (id: string, content: string) => {
    const todoIndex = toDos.value.findIndex(t => t.id === id)
    if (todoIndex === -1) return

    const oldTodo = toDos.value[todoIndex]!

    // Создаём новый объект с обновлениями
    const updatedTodo: ToDo = {
      ...oldTodo,
      content,
      updatedAt: Date.now(),
    }

    // Обновляем массив для реактивности
    toDos.value = [
      ...toDos.value.slice(0, todoIndex),
      { ...updatedTodo } as ToDo,
      ...toDos.value.slice(todoIndex + 1)
    ]

    // Создаём чистый объект для базы данных
    const dbUpdateData = {
      id: updatedTodo.id,
      name: updatedTodo.name,
      slug: updatedTodo.slug,
      groupIds: [...updatedTodo.groupIds],
      content: updatedTodo.content,
      isComplete: updatedTodo.isComplete,
      order: updatedTodo.order,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
    }

    await db.toDos.update(id, dbUpdateData)
  }

  /**
   * Получение задачи по slug
   * @param slug - Slug задачи
   * @returns Задача или undefined
   */
  const getToDoBySlug = (slug: string): ToDo | undefined => {
    return toDos.value.find(t => t.slug === slug)
  }

  /**
   * Получение задачи по ID
   * @param id - ID задачи
   * @returns Задача или undefined
   */
  const getToDoById = (id: string): ToDo | undefined => {
    return toDos.value.find(t => t.id === id)
  }

  /**
   * Получение статистики по группе
   * @param groupId - ID группы
   * @returns Статистика группы
   */
  const getGroupStats = (groupId: string): ToDoGroupStats => {
    const groupToDos = toDos.value.filter(t => t.groupIds.includes(groupId))
    return {
      total: groupToDos.length,
      completed: groupToDos.filter(t => t.isComplete).length,
      active: groupToDos.filter(t => !t.isComplete).length,
    }
  }

  /**
   * Получение всех задач для группы
   * @param groupId - ID группы
   * @returns Массив задач
   */
  const getToDosByGroupId = (groupId: string): ToDo[] => {
    return toDos.value.filter(t => t.groupIds.includes(groupId))
  }

  /**
   * Получение всех задач без группы
   * @returns Массив задач без группы
   */
  const getToDosWithoutGroup = (): ToDo[] => {
    return toDos.value.filter(t => !t.groupIds || t.groupIds.length === 0)
  }

  /**
   * Очистка всех задач
   */
  const clearToDos = async () => {
    toDos.value = []
    await db.toDos.clear()
  }

  // Автозагрузка при инициализации
  loadToDos()

  return {
    toDos,
    isLoaded,
    loadToDos,
    addToDo,
    updateToDo,
    updateToDoContent,
    toggleToDoComplete,
    deleteToDo,
    getToDoBySlug,
    getToDoById,
    getGroupStats,
    getToDosByGroupId,
    getToDosWithoutGroup,
    clearToDos,
  }
})

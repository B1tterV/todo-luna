export interface ToDo {
  id: string
  name: string
  slug: string
  groupIds: string[]
  content: string
  isComplete: boolean
  order: number
  createdAt: number
  updatedAt: number
}

export interface ToDoGroupStats {
  total: number
  completed: number
  active: number
}

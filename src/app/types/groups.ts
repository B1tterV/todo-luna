import type { LocationQuery } from 'vue-router'

export interface SidebarGroupItem {
  name: string
  emoji: string
  route: string
  query: undefined | LocationQuery
  type: 'group' | 'default'
  groupId: string
  groupSlug: string
  editable: boolean
}

export interface TaskGroup {
  id: string
  name: string
  slug: string
  emoji: string
  order: number
  createdAt: number
  updatedAt: number
}

export interface TaskGroupWithStats extends TaskGroup {
  stats: {
    total: number
    completed: number
    active: number
  }
}

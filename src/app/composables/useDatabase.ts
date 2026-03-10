// Libs
import Dexie from 'dexie'
// Types
import type { Table } from 'dexie'
import type { TaskGroup } from '~/types/groups'
import type { ToDo } from '~/types/toDos'

class TaskDatabase extends Dexie {
  taskGroups!: Table<TaskGroup, string>
  toDos!: Table<ToDo, string>

  constructor() {
    super('TaskDatabase')

    this.version(1).stores({
      taskGroups: 'id, slug, name',
    })

    this.version(2).stores({
      taskGroups: 'id, slug, name, order',
    }).upgrade(tx => {
      return tx.table('taskGroups').toCollection().modify(group => {
        if (group.order === undefined) {
          group.order = 0
        }
      })
    })

    // Version 3: Add toDos table with proper array handling
    this.version(3).stores({
      taskGroups: 'id, slug, name, order',
      toDos: '++id, id, slug, isComplete, order, createdAt, updatedAt',
    })
  }
}

const db = new TaskDatabase()

export const useDatabase = () => {
  return {
    db,
    // Task Groups
    async getTaskGroups() {
      return await db.taskGroups.toArray()
    },

    async addTaskGroup(group: TaskGroup) {
      await db.taskGroups.add(group)
    },

    async updateTaskGroup(id: string, updates: Partial<TaskGroup>) {
      await db.taskGroups.update(id, updates)
    },

    async deleteTaskGroup(id: string) {
      await db.taskGroups.delete(id)
    },

    async getTaskGroupBySlug(slug: string) {
      return await db.taskGroups.get({ slug })
    },

    async getTaskGroupById(id: string) {
      return await db.taskGroups.get(id)
    },

    async clearTaskGroups() {
      await db.taskGroups.clear()
    },

    // ToDos
    async getToDos() {
      return await db.toDos.toArray()
    },

    async getToDoBySlug(slug: string) {
      return await db.toDos.get({ slug })
    },

    async getToDoById(id: string) {
      return await db.toDos.get(id)
    },

    async addToDo(toDo: ToDo) {
      // Ensure groupIds is a proper array
      const toDoData = {
        ...toDo,
        groupIds: Array.isArray(toDo.groupIds) ? [...toDo.groupIds] : [],
      }
      await db.toDos.add(toDoData)
    },

    async updateToDo(id: string, updates: Partial<ToDo>) {
      const updateData = { ...updates }
      // Ensure groupIds is properly handled
      if (updateData.groupIds) {
        updateData.groupIds = Array.isArray(updateData.groupIds) ? [...updateData.groupIds] : []
      }
      await db.toDos.update(id, updateData)
    },

    async deleteToDo(id: string) {
      await db.toDos.delete(id)
    },

    async clearToDos() {
      await db.toDos.clear()
    },

    async getToDosByGroupId(groupId: string) {
      return await db.toDos.filter(toDo => {
        const groupIds = Array.isArray(toDo.groupIds) ? toDo.groupIds : []
        return groupIds.includes(groupId)
      }).toArray()
    },

    // Reset database (for development/debugging)
    async resetDatabase() {
      await db.delete()
      window.location.reload()
    },
  }
}

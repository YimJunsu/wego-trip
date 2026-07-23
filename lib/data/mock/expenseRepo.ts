import seed from '@/mocks/expenses.json'
import type { ExpenseRepository } from '../repositories'
import type { Expense } from '../types'

const expenses = [...(seed as Expense[])]

export const mockExpenseRepo: ExpenseRepository = {
  async listByTrip(tripId) {
    return expenses.filter((e) => e.tripId === tripId)
  },

  async add(input) {
    const expense: Expense = {
      ...input,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    expenses.push(expense)
    return expense
  },
}

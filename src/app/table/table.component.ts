import { Component } from '@angular/core';
import { Expense } from '../expense';
import { FormComponent } from '../form/form.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [FormComponent, NgFor],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  expenses: Expense[] = [];
  totalOrigin: number = 0;
  totalDestination: number = 0;

  receiveExpenseMessage(expense: Expense) {
    this.expenses.push(expense);
    this.totalOrigin = this.totalOrigin + expense.amount;
    this.totalDestination = this.totalDestination + expense.convertedAmount;
  }
}

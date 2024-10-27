import { Component, EventEmitter, Output, } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Expense } from '../expense';
import { GestaoService } from '../gestao-service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HttpClientModule ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  providers: [GestaoService]
})
export class FormComponent {
  @Output() onExpenseAdd = new EventEmitter<Expense>();
  private apiUrl = 'https://api.exchangerate-api.com/v4/latest/';
  expenses: Expense[] = [];
  totalOrigin: number = 0;
  totalDestination: number = 0;

  form = new FormGroup({
    description: new FormControl('', Validators.required),
    quantity: new FormControl(0, Validators.required),
    amount: new FormControl(0, Validators.required),
    currencyFrom: new FormControl('', Validators.required),
    currencyTo: new FormControl('', Validators.required),
  })

  constructor(
    private httpClient: HttpClient,
    public gestaoService: GestaoService
  ) {}

  rates: { [key: string]: number } = {};
  
  onSubmit() {
    this.httpClient.get<any>(this.apiUrl + this.form.get('currencyFrom')?.value).subscribe({
      next: (response) => {
        this.rates = response.rates;
        const maybeCurrencyTo: string = this.form.get('currencyTo')?.value ?? ''
        const rate: number = this.rates[maybeCurrencyTo];

        if (rate != null) {
          const description = this.form.get('description')?.value ?? '';
          const quantity = this.form.get('quantity')?.value ?? 0;
          const amount = this.form.get('amount')?.value ?? 0.0;
          const currencyFrom = this.form.get('currencyFrom')?.value ?? '';
          const convertedAmount = ((quantity*amount) * rate).toFixed(2);
          const expense = new Expense(description, quantity, amount, currencyFrom, maybeCurrencyTo, Number(convertedAmount));
          this.addExpense(expense);
          this.form.reset();
        } else {
          alert('No rate found');
        }
      },
      error: (error) => {
        alert('Error fetching exchange rates:' + error);
      }
    });
  }

  addExpense(expense: Expense) {
    this.expenses.push(expense);
    this.totalOrigin = this.totalOrigin + expense.amount;
    this.totalDestination = this.totalDestination + expense.convertedAmount;
  }

  editExpense(idx: number, expense: Expense) {
    this.deleteExpense(idx, expense);

    this.form.setValue({
      description: expense.description, 
      quantity: expense.quantity,
      amount: expense.amount,
      currencyFrom: expense.currencyFrom,
      currencyTo: expense.currencyTo
    });
  }

  deleteExpense(idx: number, expense: Expense) {
    if (idx > -1) {
      this.expenses.splice(idx, 1);
      this.totalOrigin = this.totalOrigin - expense.amount;
      this.totalDestination = this.totalDestination - expense.convertedAmount;
    }
  }
}

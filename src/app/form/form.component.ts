import { Component, EventEmitter, Output, } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from '../table/table.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Expense } from '../expense';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TableComponent, HttpClientModule ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
  @Output() onExpenseAdd = new EventEmitter<Expense>();

  private apiUrl = 'https://api.exchangerate-api.com/v4/latest/';

  constructor(private httpClient: HttpClient) {}
  gestaoForm = new FormGroup({
    description: new FormControl(null, Validators.required),
    quantity: new FormControl(0, Validators.required),
    amount: new FormControl(0.0, Validators.required),
    currencyFrom: new FormControl(null, Validators.required),
    currencyTo: new FormControl(null, Validators.required),
  });

  rates: { [key: string]: number } = {};
  
  onSubmit() {
    this.httpClient.get<any>(this.apiUrl + this.gestaoForm.get('currencyFrom')?.value).subscribe({
      next: (response) => {
        this.rates = response.rates;
        const maybeCurrencyTo: string = this.gestaoForm.get('currencyTo')?.value ?? ''
        const rate: number = this.rates[maybeCurrencyTo];

        if (rate != null) {
          const description = this.gestaoForm.get('description')?.value ?? '';
          const quantity = this.gestaoForm.get('quantity')?.value ?? 0;
          const amount = this.gestaoForm.get('amount')?.value ?? 0.0;
          const currencyFrom = this.gestaoForm.get('currencyFrom')?.value ?? '';
          const convertedAmount = ((quantity*amount) * rate).toFixed(2);
          const expense = new Expense(description, quantity, amount, currencyFrom, maybeCurrencyTo, Number(convertedAmount));
          this.addExpense(expense);
          this.gestaoForm.reset();
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
    this.onExpenseAdd.emit(expense);
  }
}

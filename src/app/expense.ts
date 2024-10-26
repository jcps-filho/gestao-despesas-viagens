export class Expense {
    constructor(
        public description: string,
        public quantity: number,
        public amount: number,
        public currencyFrom: string,
        public currencyTo: string,
        public convertedAmount: number
      ) {}

}

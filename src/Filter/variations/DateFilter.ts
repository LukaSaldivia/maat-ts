import Filter from "../Filter";

export default class DateFilter<C extends string> extends Filter<C> {
  date: string;

  constructor(date: string, field: C, score? : number) {
    super(field, score);
    this.date = date;
  }

  get() {
    let cases: string[] = [];
    cases.push(this._buildCaseQuery(this.date));
    cases.unshift(this.fallbackCase);
    return cases.join('+');
  }

  _buildCaseQuery(date: string) {
    return this.sanitize(`CASE WHEN ${String(this.field)} = '${date}' THEN ${this.score} ELSE 0 END`);
  }
}
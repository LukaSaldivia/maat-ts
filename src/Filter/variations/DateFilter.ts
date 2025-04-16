import Filter from "../Filter";

export default class DateFilter<C extends string> extends Filter<C> {
  date: string;

  constructor(date: string, field: C, score? : number) {
    super(field, score);
    this.date = date;
  }

  value(): string[] {
      return [this.date]
  }

  _buildCaseQuery() {
    return `CASE WHEN ${String(this.field)} = ?  THEN ${this.score} ELSE 0 END`;
  }
}
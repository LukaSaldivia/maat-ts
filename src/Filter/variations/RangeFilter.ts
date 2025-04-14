import Filter from "../Filter";

export default class RangeFilter<C extends string> extends Filter<C>{
  min : string | number
  max : string | number
  constructor(min : string | number, max : string | number, field : C, score? : number){
    super(field, score)
    this.min = min
    this.max = max
  }

  value(): string[] {
      return [String(this.min), String(this.max)]
  }

  _buildCaseQuery(){
    return `CASE WHEN ${String(this.field)} BETWEEN "?" AND "?" THEN ${this.score} ELSE 0 END`
  }
}

import Filter from "../Filter"

export default class NumberFilter<C extends string> extends Filter<C>{
  num = 0
  constructor(num : number, field : C, score? : number){
    super(field, score)
    this.num = num
  }

  value(): string[] {
      return [String(this.num)]
  }

  _buildCaseQuery(){
    return `CASE WHEN ${String(this.field)} = ? THEN ${this.score} ELSE 0 END`
  }
}

import Filter from "../Filter";

export default class StrictTextFilter<C extends string> extends Filter<C>{
  txt = ''
  constructor(txt : string, field : C, score? : number){
    super(field, score)
    this.txt = txt
  }

  value(): string[] {
      return [this.txt]
  }

  _buildCaseQuery(){
    return `CASE WHEN ${String(this.field)} = ? THEN ${this.score} ELSE 0 END`
  }
}

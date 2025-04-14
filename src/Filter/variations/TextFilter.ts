import  getAccumulated  from "../../vendor/getAccumulated";
import Filter from "../Filter";

export default class TextFilter<C extends string> extends Filter<C>{
  txt = ''
  constructor(txt = "", field : C, score? : number){
    super(field, score)
    this.txt = txt
    this.score = +(this.score / this.txt.length).toFixed(2)
  }

  get(){
      let cases = getAccumulated(this.txt);
      cases = cases.map(_ => this._buildCaseQuery())
      cases.unshift(this.fallbackCase)
      return cases.join('+')
    
  }

  value(){
    return getAccumulated(this.txt).map(txt => `%${txt}%`)
  }

  _buildCaseQuery(){
    return `CASE WHEN LOWER(${String(this.field)}) LIKE LOWER(?) THEN ${this.score} ELSE 0 END`
  }
}

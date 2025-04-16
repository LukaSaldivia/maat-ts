import { Table } from "../Table/Table";

export default class AF<C extends string, PK extends C[]> {
  table : Table<C, PK>;
  field : C | "*";
  function : string;
  alias : string = "";
  constructor(table : Table<C, PK>, functionName : string, field : C | "*", alias? : string) {
    this.table = table
    this.function = functionName
    this.field = field
    this.alias = alias || ""
  }

  get(showAlias = false){
    return `${this.function}(${this.field})${showAlias ? ` AS ${this.alias}` : ""}`
  }
}
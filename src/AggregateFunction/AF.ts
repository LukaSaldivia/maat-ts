import { Table } from "../Table/Table";

export default class AF<C extends string, PK extends C[]> {
  table : Table<C, PK>;
  field : C | "*";
  function : string;
  constructor(table : Table<C, PK>, functionName : string, field : C | "*"){
    this.table = table
    this.function = functionName
    this.field = field
  }

  get(){
    return `${this.function}(${this.field})`
  }
}
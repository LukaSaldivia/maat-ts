import { Table } from "src/Table/Table";
import AF from "./AF";

export default class AggregateFunction{
  static from<C extends string, PK extends C[]>(table : Table<C ,PK >){
    return {
      count : function(column : C | "*", alias? : string){
        return new AF(table, "COUNT", column, alias)
      },
      max : function(column : C | "*", alias?: string){
        return new AF(table, "MAX", column, alias)
      },
      min : function(column : C | "*", alias?: string){
        return new AF(table, "MIN", column, alias)
      },
      sum : function(column : C | "*", alias?: string){
        return new AF(table, "SUM", column, alias)
      },
      avg : function(column : C | "*", alias?: string){
        return new AF(table, "AVG", column, alias)
      },
    }
  }
}
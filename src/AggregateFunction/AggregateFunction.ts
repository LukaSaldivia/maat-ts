import { Table } from "src/Table/Table";
import AF from "./AF";

export default class AggregateFunction{
  static from<C extends string, PK extends C[]>(table : Table<C ,PK >){
    return {
      count : function(column : C | "*"){
        return new AF(table, "COUNT", column)
      },
      max : function(column : C | "*"){
        return new AF(table, "MAX", column)
      },
      min : function(column : C | "*"){
        return new AF(table, "MIN", column)
      },
      sum : function(column : C | "*"){
        return new AF(table, "SUM", column)
      },
      avg : function(column : C | "*"){
        return new AF(table, "AVG", column)
      },
    }
  }
}
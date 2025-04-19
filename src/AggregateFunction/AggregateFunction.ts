import { Table } from "../Table/Table";
import AF from "./AF";

/**
 * Provides factory methods to create SQL aggregate functions
 * (COUNT, MAX, MIN, SUM, AVG) scoped to a specific table.
 */
export default class AggregateFunction {

  /**
 * Creates a set of aggregate functions bound to a specific table.
 *
 * @template C - A union of string literals representing column names.
 * @template PK - An array of primary key column names (subset of C).
 * @param {Table<C, PK>} table - The table to bind the aggregate functions to.
 * @returns {Object} An object containing methods to create aggregate functions.
 */
  static from<C extends string, PK extends C[]>(table: Table<C, PK>) {
    return {
      count: function (column: C | "*", alias?: string) {
        return new AF(table, "COUNT", column, alias)
      },
      max: function (column: C | "*", alias?: string) {
        return new AF(table, "MAX", column, alias)
      },
      min: function (column: C | "*", alias?: string) {
        return new AF(table, "MIN", column, alias)
      },
      sum: function (column: C | "*", alias?: string) {
        return new AF(table, "SUM", column, alias)
      },
      avg: function (column: C | "*", alias?: string) {
        return new AF(table, "AVG", column, alias)
      },
    }
  }
}
import AF from "../AggregateFunction/AF";
import FilterCollection from "../Filter/FilterCollection";
import { Table } from "../Table/Table";
import { DebugResult, Queryable } from "./types";
import Filter from "../Filter/Filter";

/**
 * Represents a generic data model for performing CRUD and search operations on a SQL table.
 * 
 * @template C - Column names as string union.
 * @template PK - Primary key columns, subset of C.
 * @template SQLResult - The result type of a SQL query.
 */
export default class Model<C extends string, PK extends C[], SQLResult>{

  table: Table<C, PK>
  database: Queryable<SQLResult>
  filterCollection: FilterCollection<C>

  /**
 * Creates an instance of the Model.
 * 
 * @param {Table<C, PK>} table - The table this model interacts with.
 * @param {Queryable<SQLResult>} database - Database adapter implementing `query()`.
 * @example
 * ```ts
 * type MySQLResult = Promise<[RowDataPacket[], FieldPacket[]]>
 * const pool : Queryable<MySQLResult> = mysql.createPool()
 * let table = TableFactory.create()
 * let model = new Model(table, pool)
 * ```
 */
  constructor(table: Table<C, PK>, database: Queryable<SQLResult>) {
    this.table = table
    this.database = database
    this.filterCollection = new FilterCollection()
  }

  /**
   * Inserts a new row into the table.
   * 
   * @param {Partial<Record<C, string>>} data - Data to insert.
   * @param {C[]} [allowedFields] - Optional list of allowed columns.
   * @returns {SQLResult}
   */
  create(data: Partial<Record<C, string>>, allowedFields?: C[]): SQLResult {

    let filteredData = { ...data }

    if (allowedFields?.length) {

      for (const key in filteredData) {
        if (!allowedFields?.includes(key as C)) {
          delete filteredData[key]
        }
      }

    }

    let cols = Object.keys(filteredData)

    let placeholders = new Array(cols.length).fill('?')

    let query = `INSERT INTO ${this.table.tableName} (${cols.join(',')}) VALUES (${placeholders.join(',')})`


    return this.executeQuery(query, Object.values(filteredData))
  }

  /**
 * Inserts multiple rows into the table.
 * 
 * @param {Record<C, string>[]} arr - Array of data objects to insert.
 * @param {C[]} [allowedFields] - Optional list of allowed columns.
 * @returns {SQLResult}
 */
  createBundle(arr: Partial<Record<C, string>>[], allowedFields?: C[]): SQLResult {
    const allowedFieldsSet = allowedFields ? new Set(allowedFields) : null;
    const filteredData = arr.map(data => {
      const filtered: Partial<Record<C, string>> = {};

      for (const key in data) {
        if (!allowedFieldsSet || allowedFieldsSet.has(key as C)) {
          filtered[key as C] = data[key];
        }
      }
      return filtered;
    });

    let fields = Object.keys(filteredData[0])
    let query = "INSERT INTO " + this.table.tableName + `(${fields.join(',')}) VALUES `
    let placeholders = filteredData.map(_ => `(${new Array(fields.length).fill('?').join(',')})`).join(', ')
    query += placeholders
    let values = filteredData.map<string[]>(obj => Object.values(obj)).flat()

    return this.executeQuery(query, values)

  }

  /**
 * Updates a row based on its primary key.
 * 
 * @param {Partial<Record<C, string>>} data - New data to apply.
 * @param {Record<PK[number], string>} pk - Primary key identifying the row.
 * @param {C[]} [allowedFields] - Optional list of fields to allow for updates.
 * @returns {SQLResult}
 */
  edit(data: Partial<Record<C, string>>, pk: Record<PK[number], string>, allowedFields?: C[]): SQLResult {

    let filteredData = { ...data }

    if (allowedFields?.length) {

      for (const key in filteredData) {
        if (!allowedFields?.includes(key as C)) {
          delete filteredData[key]
        }
      }

    }


    let updates = Object.keys(filteredData).map(col => `${col} = ?`).join(", ");

    const { conditions, values } = this.buildPK(pk)

    let query = `UPDATE ${this.table.tableName} SET ${updates} WHERE ${conditions}`;

    return this.executeQuery(query, [...Object.values(filteredData), ...values] as string[]);

  }

  /**
 * Deletes a row from the table using its columns.
 * 
 * @param {Record<C, string>} columns - Columns values of the row to delete.
 * @returns {SQLResult}
 */
  delete(columns: Partial<Record<C, string>>): SQLResult {

    const { conditions, values } = this.buildEquals(columns)
    const query = `DELETE FROM ${this.table.tableName} WHERE ${conditions}`
    return this.executeQuery(query, values)

  }

  /**
 * Retrieves a row using its primary key.
 * 
 * @param {Record<PK[number], string>} pk - Primary key of the row to fetch.
 * @param {(C | "*")[]} [fields=["*"]] - Fields to select.
 * @returns {SQLResult}
 */
  get(pk: Record<PK[number], string>, fields: (C | "*")[] = ["*"]): SQLResult {

    // Obtener los campos a devolver
    let selects = fields.join(", ")

    const { conditions, values } = this.buildPK(pk)
    const query = `SELECT ${selects} FROM ${this.table.tableName} WHERE ${conditions}`
    return this.executeQuery(query, values)
  }

  /**
 * Initializes the filter collection for search.
 * 
 * @returns {FilterCollection<C>}
 */
  prepareSearch(): FilterCollection<C> {
    this.filterCollection = new FilterCollection<C>()
    return this.filterCollection
  }

  /**
   * Performs a search query with filters and optional sorting.
   * 
   * @param {number} [minScore=0] - Minimum relevance score.
   * @param {(C | "relevance" | "*")[]} [fields=["*"]] - Fields to return.
   * @param {Object} options - Additional search options.
   * @param {{ field: C | "relevance", order: "ASC" | "DESC" }[]} [options.sortBy] - Sort instructions.
   * @param {number} [options.limit=15] - Limit of results.
   * @param {number} [options.offset=0] - Offset for pagination.
   * @returns {SQLResult}
   */
  search(
    minScore: number = 0,
    fields: (C | "relevance" | "*")[] = ["*"],
    options: {
      sortBy?: { field: C | "relevance", order: "ASC" | "DESC" }[],
      limit?: number,
      offset?: number
    } = { limit: 15, offset: 0 }
  ): SQLResult {
    // Obtener las expresiones CASE de los filtros
    let filterValues: string[] = []
    let cases = this.filterCollection.filters.map((filter: Filter<C>) => {
      filter.value().forEach(value => {
        filterValues.push(value)
      })
      return filter.get()
    });

    // Si no hay filtros, usar minScore como relevancia básica
    if (cases.length === 0) {
      cases.push(String(minScore));
    }

    // Combinar las expresiones CASE para calcular la relevancia
    let relevanceCalculation = cases.join(' + ');

    // Obtener los campos a devolver
    let selects = fields.map(field => `response.${field}`).join(", ")

    // Construir la consulta
    let query = `SELECT ${selects} FROM (SELECT *, (${relevanceCalculation}) AS relevance FROM ${this.table.tableName}) AS response WHERE response.relevance >= ${minScore}`;

    // Manejar ordenación
    let sortBy = options.sortBy || [];
    let sortQuery = [];

    for (const sortObj of sortBy) {
      // const field = sortObj.field === 'relevance' ? 'relevance' : sortObj.field;
      const { field } = sortObj;
      sortQuery.push(`${field} ${sortObj.order || "ASC"}`);
    }

    // Ordenar por relevancia descendente por defecto si no hay otros criterios
    if (sortQuery.length === 0) {
      sortQuery.push('relevance DESC');
    }

    // Añadir ORDER BY a la consulta
    if (sortQuery.length > 0) {
      query += ` ORDER BY ${sortQuery.join(', ')}`;
    }

    // Añadir LIMIT y OFFSET
    query += ` LIMIT ${options.limit || 15}`;
    if (options.offset) {
      query += ` OFFSET ${options.offset}`;
    }

    return this.executeQuery(query, filterValues);
  }

  /**
   * Performs a grouped search using filters and aggregate functions.
   * 
   * @param {number} [minScore=0] - Minimum relevance score.
   * @param {(C | "relevance" | AF<C, PK>)[]} fields - Fields and aggregates to return.
   * @param {Object} options - Grouped search options.
   * @param {{ field: C | "relevance" | AF<C, PK>, order: "ASC" | "DESC" }[]} [options.sortBy] - Sort instructions.
   * @param {number} [options.limit=15] - Result limit.
   * @param {number} [options.offset=0] - Pagination offset.
   * @returns {SQLResult}
   */
  groupedSearch(
    minScore: number = 0,
    fields: (C | "relevance" | AF<C, PK>)[],
    options: {
      sortBy?: { field: C | "relevance" | AF<C, PK>, order: "ASC" | "DESC", }[],
      limit?: number,
      offset?: number
    } = { limit: 15, offset: 0 }
  ): SQLResult {

    // Obtener las expresiones CASE de los filtros
    let filterValues: string[] = []
    let cases = this.filterCollection.filters.map((filter: Filter<C>) => {
      filter.value().forEach(value => {
        filterValues.push(value)
      })
      return filter.get()
    });

    // Si no hay filtros, usar minScore como relevancia básica
    if (cases.length === 0) {
      cases.push(String(minScore));
    }

    // Combinar las expresiones CASE para calcular la relevancia
    let relevanceCalculation = cases.join(' + ');

    // Obtener los campos a devolver
    let selects = fields.map(field => field instanceof AF ? field.get(true) : `response.${field}`).join(", ")

    // Construir la consulta
    let query = `SELECT ${selects} FROM (SELECT *, (${relevanceCalculation}) AS relevance FROM ${this.table.tableName}) AS response WHERE response.relevance >= ${minScore}`;

    // Manejar agrupamientos
    // Manejar agrupamientos
    let groupByFields = fields
      .filter(field => !(field instanceof AF))
      .map(field => `response.${field}`);

    if (groupByFields.length > 0) {
      query += ` GROUP BY ${groupByFields.join(', ')}`;
    }

    // Manejar ordenación
    let sortBy = options.sortBy || [];
    let sortQuery = [];

    for (const sortObj of sortBy) {
      let field: string | AF<C, PK> = sortObj.field;

      // Si el campo es una función de agregado, usar su resultado
      if (field instanceof AF) {
        field = field.get()
      }

      sortQuery.push(`${field} ${sortObj.order || "ASC"}`);
    }

    // Ordenar por relevancia descendente por defecto si no hay otros criterios
    if (sortQuery.length === 0) {
      sortQuery.push('relevance DESC');
    }

    // Añadir ORDER BY a la consulta
    if (sortQuery.length > 0) {
      query += ` ORDER BY ${sortQuery.join(', ')}`;
    }

    // Añadir LIMIT y OFFSET
    query += ` LIMIT ${options.limit || 15}`;
    if (options.offset) {
      query += ` OFFSET ${options.offset}`;
    }

    return this.executeQuery(query, filterValues)

  }

  /**
   * Executes a SQL query using the database adapter.
   * 
   * @param {string} query - SQL query string.
   * @param {string[]} [values] - Values to bind in the query.
   * @returns {SQLResult}
   */
  executeQuery(query: string, values?: string[]): SQLResult {
    let res = this.database.query(query, values)
    return res
  }

  /**
   * Creates a debug-mode instance of the model, where queries are not executed
   * but instead returned as an object containing:
   * - the original query string,
   * - the provided values,
   * - and the resulting SQL string with interpolated values.
   *
   * This is useful for debugging and inspecting how queries are constructed
   * without sending them to an actual database.
   *
   * @template C - The shape/type of the model's fields.
   * @template PK - The type of the primary key (e.g. string or number).
   *
   * @returns {Model<C, PK, { query: string, values: string[] | undefined, sql: string }>}
   * A new instance of the model where the `query()` method simulates SQL generation.
   */
  debug(): Model<C, PK, DebugResult> {

    let db = {
      query: function (query: string, values?: string[]) {

        let i = 0;
        let sql = query.replace(/\?/g, () => {
          if (values != undefined) {

            const val = values[i++];
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            return `'${String(val).replace(/'/g, "''")}'`;
          }
          return query
        });

        return {
          query,
          values,
          sql
        }
      }
    }

    return new Model(this.table, db)
  }

  /**
 * Builds a WHERE clause using the primary key.
 * 
 * @private
 * @param {Record<PK[number], string>} pk - Primary key values.
 * @returns {{ conditions: string, values: string[] }}
 */
  private buildPK(pk: Record<PK[number], string>): { conditions: string; values: string[]; } {
    const keys = Object.keys(pk)
    const conditions = keys.map(key => `${key} = ?`).join(" AND ")
    const values = keys.map(key => pk[key as PK[number]])
    return { conditions, values }
  }

  private buildEquals(columns : Partial<Record<C, string>>) : { conditions: string; values: string[]; }{
    const keys = Object.keys(columns)
    const conditions = keys.map(key => `${key} = ?`).join(" AND ")
    const values = keys.map(key => columns[key as C]) as string[]
    return { conditions, values }
  }


}
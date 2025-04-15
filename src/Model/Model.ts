import FilterCollection from "../Filter/FilterCollection";
import { Table } from "../Table/Table";
import { Queryable } from "./types";
import Filter from "src/Filter/Filter";

export default class Model<C extends string, PK extends C[], SQLResult> {

  table: Table<C, PK>
  database: Queryable<SQLResult>
  filterCollection: FilterCollection<C>

  constructor(table: Table<C, PK>, database: Queryable<SQLResult>) {
    this.table = table
    this.database = database
    this.filterCollection = new FilterCollection()
  }

  create(data: Partial<Record<C, string | number>>, appliedFields?: C[]) {

    let filteredData = { ...data }

    if (appliedFields?.length) {

      for (const key in filteredData) {
        if (!appliedFields?.includes(key as C)) {
          delete filteredData[key]
        }
      }

    }

    let cols = Object.keys(filteredData)

    let placeholders = new Array(cols.length).fill('?')

    let query = `INSERT INTO ${this.table.tableName} (${cols.join(',')}) VALUES (${placeholders.join(',')})`


    return this.executeQuery(query, Object.values(filteredData))
  }

  createBundle(arr: Record<C, string | number>[], appliedFields?: C[]) {
    const appliedFieldsSet = appliedFields ? new Set(appliedFields) : null;
    const filteredData = arr.map(data => {
      const filtered: Partial<Record<C, string | number>> = {};

      for (const key in data) {
        if (!appliedFieldsSet || appliedFieldsSet.has(key as C)) {
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

  edit(data: Record<C, string | number>, pk: Record<PK[number], string>, appliedFields?: C[]) {

    let filteredData = { ...data }

    if (appliedFields?.length) {

      for (const key in filteredData) {
        if (!appliedFields?.includes(key as C)) {
          delete filteredData[key]
        }
      }

    }


    let updates = Object.keys(filteredData).map(col => `${col} = ?`).join(", ");

    const { conditions, values } = this.buildPK(pk)

    let query = `UPDATE ${this.table.tableName} SET ${updates} WHERE ${conditions}`;

    return this.executeQuery(query, [...Object.values(filteredData), ...values] as string[]);

  }

  delete(pk: Record<PK[number], string>) {

    const { conditions, values } = this.buildPK(pk)
    const query = `DELETE FROM ${this.table.tableName} WHERE ${conditions}`
    return this.executeQuery(query, values)

  }

  get(pk: Record<PK[number], string>, fields: (C | "*")[] = ["*"]) {

    // Obtener los campos a devolver
    let selects = fields.join(", ")

    const { conditions, values } = this.buildPK(pk)
    const query = `SELECT ${selects} FROM ${this.table.tableName} WHERE ${conditions}`
    return this.executeQuery(query, values)
  }

  prepareSearch() {
    this.filterCollection = new FilterCollection<C>()
    return this.filterCollection
  }

  search(
    minScore = 0,
    fields: (C | "relevance" | "*")[] = ["*"],
    options: {
      sortBy?: { field: C | "relevance", order: "ASC" | "DESC" }[],
      limit?: number,
      offset?: number
    } = { limit: 15, offset: 0 }
  ) {
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
      const field = sortObj.field === 'relevance' ? 'relevance' : sortObj.field;
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

  groupedSearch() {

  }


  executeQuery(query: string, values?: string[]) {
    let res = this.database.query(query, values)
    return res
  }

  private buildPK(pk: Record<PK[number], string>) {
    const keys = Object.keys(pk)
    const conditions = keys.map(key => `${key} = ?`).join(" AND ")
    const values = keys.map(key => pk[key as PK[number]])
    return { conditions, values }
  }


}
# 🪶Maat-ts <!-- omit in toc -->

![GitHub last commit](https://img.shields.io/github/last-commit/lukasaldivia/maat)
![GitHub top language](https://img.shields.io/github/languages/top/lukasaldivia/maat)
![GitHub package.json version](https://img.shields.io/github/package-json/v/lukasaldivia/maat?color=ffffff)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/lukasaldivia/maat)

Maat is a modular Typescript library for modeling CRUD operations over SQL databases.
It provides advanced filtering and searching capabilities, and it's fully agnostic of the SQL engine (supports MySQL, PostgreSQL, SQLite and MariaDB).



## Table of contents <!-- omit in toc -->

- [✨ Features](#-features)
- [🚀 Getting Started](#-getting-started)
- [`TableFactory`](#tablefactory)
  - [`.create(tableName, columns, primaryKey)`](#createtablename-columns-primarykey)
- [`FilterCollection<C>`](#filtercollectionc)
  - [`.appendFilter(options)`](#appendfilteroptions)
- [`AggregateFunction`](#aggregatefunction)
  - [`.from(table)`](#fromtable)
- [`Queryable<T = any>`](#queryablet--any)
- [`Model<C, PK, SQLResult>`](#modelc-pk-sqlresult)
  - [`.create(data, allowedFields?)`](#createdata-allowedfields)
  - [`.createBundle(arr, allowedFields?)`](#createbundlearr-allowedfields)
  - [`.edit(data, pk, allowedFields?)`](#editdata-pk-allowedfields)
  - [`.delete(columns)`](#deletecolumns)
  - [`.get(pk, fields = ["*"])`](#getpk-fields--)
  - [`.prepareSearch()`](#preparesearch)
  - [`.search(minScore = 0, fields = ["*"], options)`](#searchminscore--0-fields---options)
  - [`.groupedSearch(minScore = 0, fields, options)`](#groupedsearchminscore--0-fields-options)
  - [`.executeQuery(query, values?)`](#executequeryquery-values)
  - [`.debug()`](#debug)
- [🛠️ Basic usage](#️-basic-usage)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📘 License](#-license)

## ✨ Features

- Full customizable CRUD operations
- Works with any SQL connection that supports `.query(string, string[])`
- Chainable and advanced filters
- Aggregation functions included
- Designed to fit cleanly into MVC architectures or standalone use

## 🚀 Getting Started

### 📦 Installation <!-- omit in toc -->

```bash
npm i maat-ts
```

### Creating the connection <!-- omit in toc -->

```ts
import { Queryable } from "maat-ts"
import { GenericConnection, GenericResponseType } from "any-sql-library-you-want" // <- here you get the connection of the library you want (e.g. mysql2, pg, sqlite3)

const connection : Queryable<GenericResponseType> = GenericConnection.getConnection()
```
> [!WARNING]
> Please do not try to use GenericConnection or GenericResponseType, they don't exist, it's just for the example.

### Creating the table with TableFactory <!-- omit in toc -->

```ts
import { TableFactory } from "maat-ts"

const table = TableFactory.create(
  "table", // table-name
  ["col1", "col2", "col3"], // column(s) of the table 
  ["col1"] // column(s) of the primary key of the table
  )
```

### Creating the model <!-- omit in toc -->

```ts
import { Model } from "maat-ts"

const TableModel = new Model(table, connection)

// notice that every CRUD function, return type is GenericResponseType
```

## `TableFactory`

Factory class to create `Table` instances.

This class is responsible for generating instances of a `Table` based on configuration or metadata, abstracting the construction process.

### `.create(tableName, columns, primaryKey)`

Creates a new `Table` instance with the given table name, columns, and primary key.

#### Template Parameters <!-- omit in toc -->

- `C` – A string union type representing the column names.
- `PK` – A tuple type representing the primary key column(s), constrained to be a subset of `C`.

#### Parameters <!-- omit in toc -->

- `tableName` (`string`) – The name of the table.
- `columns` (`C[]`) – An array of strings representing the column names.
- `primaryKey` (`PK`) – A tuple of column names that make up the primary key.

#### Returns <!-- omit in toc -->

- `Table<C, PK>` – A new `Table` object with the specified structure.

#### Example <!-- omit in toc -->

```ts
const userTable = TableFactory.create(
  'users',
  ['id', 'name', 'email'],
  ['id']
);

// userTable is an instance of Table<"id" | "name" | "email", ["id"]>
```

## `FilterCollection<C>`

Represents a collection of filters that can be applied to a query.

This class is used to define and manage filtering logic for SQL queries, typically as part of a larger query-building process.

### Template Parameters <!-- omit in toc -->

- `C` – A union of string literals representing column names. These define the fields that can be filtered.

### `.appendFilter(options)`

Appends a new filter to the collection using the provided options.

This method adds a new filter rule to the internal list based on the given configuration, enabling flexible and dynamic query building.

#### Parameters <!-- omit in toc -->

- `options` (`FilterOptions<C>`) – Configuration options to create the filter. This includes the field name, operator, and value(s) for filtering.

#### Returns <!-- omit in toc -->

- `this` – The current `FilterCollection` instance, allowing method chaining.

#### Example <!-- omit in toc -->

```ts
filters
  .appendFilter(...)
  .appendFilter(...);
```

## `AggregateFunction`

Provides factory methods to create SQL aggregate functions (`COUNT`, `MAX`, `MIN`, `SUM`, `AVG`) scoped to a specific table.

This utility class is used to generate aggregate expressions that can be included in `SELECT` statements, particularly useful in grouped queries or reporting.

### `.from(table)`

Creates a set of aggregate functions bound to a specific table.

This method returns an object with methods to generate SQL aggregate expressions (`COUNT`, `MAX`, `MIN`, `SUM`, `AVG`) that are scoped to the provided table.

#### Template Parameters <!-- omit in toc -->

- `C` – A union of string literals representing the column names of the table.
- `PK` – An array of primary key column names, which must be a subset of `C`.

#### Parameters <!-- omit in toc -->

- `table` (`Table<C, PK>`) – The table instance to which the aggregate functions will be bound.

#### Returns <!-- omit in toc -->

- `Object` – An object with aggregate function generators such as `.count(column)`, `.max(column)`, etc.

#### Example <!-- omit in toc -->

```js
const agg = AggregateFunction.from(userTable);

const totalUsers = agg.count('id');
const highestScore = agg.max('score', "max_score"); // "max_score" is an alias of "MAX(score)"

```

## `Queryable<T = any>`

Represents an object capable of executing SQL queries.

This type defines the minimal interface required to perform parameterized SQL queries, typically used by database adapters or query builders.

### Type Parameters <!-- omit in toc -->

- `T` – The result type of the query. Defaults to `any`.

### Properties <!-- omit in toc -->

- `query(sql: string, params?: string[]): T`  
  Executes a SQL query.  
  - `sql`: The SQL query string to be executed.  
  - `params` *(optional)*: An array of string parameters to safely inject into the query.

### Example <!-- omit in toc -->

```ts
const db: Queryable<CustomSQLResult> = {
  query: (sql, params) => {
    // Implementation here
  }
};

const result = db.query('SELECT * FROM users WHERE id = ?', ['42']);
```

## `Model<C, PK, SQLResult>`

Represents a generic data model for performing CRUD and search operations on a SQL table.

### Template Parameters <!-- omit in toc -->

- `C` – Column names as a string union. Represents the columns in the SQL table.
- `PK` – Primary key columns, a subset of `C`. Represents the primary key fields of the table.
- `SQLResult` – The result type of a SQL query. Represents the structure of the result returned from SQL operations.

### Example <!-- omit in toc -->

```ts
import { Model, Queryable, TableFactory } from 'maat-ts';
import mysql, { FieldPacket, RowDataPacket } from 'mysql2';

type MySQLResult = Promise<[RowDataPacket[], FieldPacket[]]>

const pool: Queryable<MySQLResult> = mysql.createPool(...).promise()

const userTable = TableFactory.create(
  "user",
  ["id", "name", "email", "age"],
  ["id"]
)

const userModel = new Model(userTable, pool)

```

### `.create(data, allowedFields?)`

Inserts a new row into the table associated with the model.

#### Parameters <!-- omit in toc -->

- `data` (`Partial<Record<C, string>>`) – An object containing the data to insert. Keys must match valid column names in the table.
- `allowedFields` (`C[]`, optional) – Optional list of allowed columns. If provided, the data will be filtered to include only these fields.

#### Returns <!-- omit in toc -->

- `SQLResult` – The result of the user typed SQL operation.

#### Example <!-- omit in toc -->

```ts
const result = model.create(
  { name: 'Carlos', age: 30, email: 'carlos@mail.com' },
  ['name', 'age', 'email']
);

```

### `.createBundle(arr, allowedFields?)`

Inserts multiple rows into the table associated with the model.

#### Parameters <!-- omit in toc -->

- `arr` (`Record<C, string>[]`) – An array of objects, each representing a row to insert. Keys must match valid column names in the table.
- `allowedFields` (`C[]`, optional) – Optional list of allowed columns. If provided, each object in the array will be filtered to include only these fields.

#### Returns <!-- omit in toc -->

- `SQLResult` – The result of the user typed SQL operation.

#### Example <!-- omit in toc -->

```ts
const result = model.createBundle(
  [
    { name: 'Alice', age: '25' },
    { name: 'Bob', age: '30' }
  ],
  ['name', 'age']
);
```

### `.edit(data, pk, allowedFields?)`

Updates a row in the table based on its primary key.

#### Parameters <!-- omit in toc -->

- `data` (`Partial<Record<C, string>>`) – An object containing the new data to apply. Only specified fields will be updated.
- `pk` (`Record<PK[number], string>`) – An object representing the primary key of the row to update. The keys should match the primary key columns.
- `allowedFields` (`C[]`, optional) – Optional list of fields allowed for update. If provided, `data` will be filtered to include only these fields.

#### Returns <!-- omit in toc -->

- `SQLResult` – The result of the user typed SQL operation.

#### Example <!-- omit in toc -->

```ts
const result = model.edit(
  { name: 'Updated Name' },
  { id: '15' },
  ['name']
);
```


### `.delete(columns)`

Deletes a row from the table using its columns.

#### Parameters <!-- omit in toc -->

- `columns` (`Record<C, string>`) – An object representing the columns of the row to delete. Keys must match the columns of the table.

#### Returns <!-- omit in toc -->

- `SQLResult` – The result of the user typed SQL operation.

#### Example <!-- omit in toc -->

```ts
const result = model.delete({ id: '15' });
```

### `.get(pk, fields = ["*"])`

Retrieves a row from the table using its primary key.

#### Parameters <!-- omit in toc -->

- `pk` (`Record<PK[number], string>`) – An object representing the primary key of the row to retrieve. Keys must match the primary key columns.
- `fields` (`(C | "*")[]`, optional, default: `["*"]`) – List of fields to select. Use `["*"]` to select all fields.

#### Returns <!-- omit in toc -->

- `SQLResult` – The result of the user typed SQL operation.

#### Example <!-- omit in toc -->

```ts
const result = model.get({ id: '15' }, ['name', 'email']);
```

### `.prepareSearch()`

Initializes the filter collection for search operations.

#### Returns <!-- omit in toc -->

- [`FilterCollection<C>`](#filtercollectionc) – A filter collection that can be used to set up search criteria for subsequent queries.

#### Example <!-- omit in toc -->

```ts
model.prepareSearch()
  .appendFilter({
    type: "range",
    field: "age",
    min: 18,
    max: 99,
    score: 2
  })
  .appendFilter({
    type: "text",
    field: "name",
    value: "Han",
  })

```

### `.search(minScore = 0, fields = ["*"], options)`

Performs a search query with filters and optional sorting.

The query includes a `relevance` column to sort the results.

#### Parameters <!-- omit in toc -->

- `minScore` (`number`, optional, default: `0`) – Minimum relevance score for the results.
- `fields` (`(C | "relevance" | "*")[]`, optional, default: `["*"]`) – Fields to return in the results. Use `["*"]` for all fields.
- `options` (`Object`) – Additional search options.
  - `sortBy` (`{ field: C | "relevance", order: "ASC" | "DESC" }[]`, optional) – Sort instructions. Specify which fields to sort by and the order.
  - `limit` (`number`, optional, default: `15`) – Maximum number of results to return.
  - `offset` (`number`, optional, default: `0`) – Offset for pagination to specify where to start fetching results.

#### Returns <!-- omit in toc -->

- `SQLResult` – The result of the search query, which is typed by the user.

#### Example <!-- omit in toc -->

```ts
const results = model.search(1, ['name', 'age'], {
  sortBy: [{ field: 'name', order: 'ASC' }],
  limit: 10,
  offset: 0
});
```

### `.groupedSearch(minScore = 0, fields, options)`

Performs a grouped search using filters and aggregate functions.

#### Parameters <!-- omit in toc -->

- `minScore` (`number`, optional, default: `0`) – Minimum relevance score for the results.
- `fields` (`(C | "relevance" | AF<C, PK>)[]`) – Fields and aggregate functions to return. `AF<C, PK>` represents an aggregate function applied to a field.
- `options` (`Object`) – Additional grouped search options.
  - `sortBy` (`{ field: C | "relevance" | AF<C, PK>, order: "ASC" | "DESC" }[]`, optional) – Sort instructions, specifying which fields or aggregates to sort by and the order.
  - `limit` (`number`, optional, default: `15`) – Maximum number of results to return.
  - `offset` (`number`, optional, default: `0`) – Offset for pagination to specify where to start fetching results.

#### Returns <!-- omit in toc -->

- `SQLResult` – The result of the grouped search query, which is typed by the user.

#### Example <!-- omit in toc -->

```ts
const { count } = AggregateFunction.from(userTable)

userModel.groupedSearch(
  0, // minimum score
  [count("age", "age_count"), "age"], // returns "age_count" and "age" as columns. "age_count" is an alias to "COUNT(age)"
  {
    sortBy: [
      {
        field: "age",
        order: "DESC"
      }
    ],
    limit: 10
  }
)

```

### `.executeQuery(query, values?)`

Executes a SQL query using the database adapter.

#### Parameters <!-- omit in toc -->

- `query` (`string`) – The SQL query string to execute.
- `values` (`string[]`, optional) – An array of values to bind in the query.

#### Returns <!-- omit in toc -->

- `SQLResult` – The result of the user typed SQL execution.

#### Example <!-- omit in toc -->

```ts
const result = model.executeQuery('SELECT * FROM users WHERE age > ?', [30]);

```

### `.debug()`

Creates a debug-mode instance of the model, where queries are not executed but instead returned as an object containing:
- The original query string,
- The provided values,
- The resulting SQL string with interpolated values.

This is useful for debugging and inspecting how queries are constructed without sending them to an actual database.

#### Template Parameters <!-- omit in toc -->

- `C` – The shape/type of the model's fields.
- `PK` – The type of the primary key (e.g., string or number).

#### Returns <!-- omit in toc -->

- `Model<C, PK, { query: string, values: string[] | undefined, sql: string }>` – A new instance of the model where the `query()` method simulates SQL generation.

#### Example <!-- omit in toc -->

```ts
const debugModel = model.debug();
const debugQuery = debugModel.executeQuery('SELECT * FROM users WHERE age > ?', [30]);
```

## 🛠️ Basic usage

```ts
import { Model, TableFactory, AggregateFunction, Queryable } from "maat-ts"
import mysql, { FieldPacket, RowDataPacket } from 'mysql2';

type MySQLResult = Promise<[RowDataPacket[], FieldPacket[]]>

const pool: Queryable<MySQLResult> = mysql.createPool({
  host: "...",
  user: "...",
  password: "...",
  database: "...",
}).promise()

const userTable = TableFactory.create(
  "user", // table name
  ["id", "name", "email", "age"], // table's columns
  ["id"] // table´s primary key
)

const userModel = new Model(userTable, pool)

// Create
userModel.create(
  {
    id: "auto-increment-on-database",
    name: "Hank",
    email: "hankyhank@mail.com",
    age: "26"
  },
  ["name", "age", "email"]
)

// Read
userModel.get({
  id: "6"
})

// Update
userModel.edit({
  name: "Not Hank"
},
  {
    id: "6"
  }
)

// Delete
userModel.delete({
  id: "6"
})


// Create bundle

userModel.createBundle(
  [
    {
      name: "Jessica",
      email: "jessica@mail.com",
      age: "18"
    },
    {
      id: "not-allowd-id",
      name: "Hank again",
      age: "16",
      email: "hankyhank@mail.com"
    }
  ],

  ["name", "email", "age"]
)


// Search with filters

userModel.prepareSearch() // returns a FilterCollection used in Model.search() or Model.groupedSearch()
  .appendFilter({
    type: "range",
    field: "age",
    min: 18,
    max: 99,
    score: 2
  })
  .appendFilter({
    type: "text",
    field: "name",
    value: "Han",
  })

userModel.search(
  2, // only returns rows where age are between 18 and 99, text filter applies as a secondary filter
  ["name", "email"], // only returns name and email columns
  {
    sortBy: [
      {
        field: "relevance", // "relevance" is an extra column used as filter coincidence
        order: "DESC"
      },
      {
        field: "name",
        order: "ASC"
      }
    ],
    limit: 5,
    offset: 15
  }
)


// Executes a grouped search

userModel.prepareSearch() // If "appendFilter" is not invocated, no filters will be applied

const { count } = AggregateFunction.from(userTable)

userModel.groupedSearch(
  0, // minimum score
  [count("age", "age_count"), "age"], // returns "age_count" and "age" as columns. "age_count" is an alias to "COUNT(age)"
  {
    sortBy: [
      {
        field: "age",
        order: "DESC"
      }
    ],
    limit: 10
  }
)


```

## 📁 Project Structure

```txt
📁 src
    📁 AggregateFunction
        📄 AF.ts
        📄 AggregateFunction.ts
    📁 Filter
        📄 Filter.ts
        📄 FilterCollection.ts
        📄 FilterFactory.ts
        📄 FilterOptions.ts
        📁 variations
            📄 DateFilter.ts
            📄 NumberFilter.ts
            📄 RangeFilter.ts
            📄 StrictTextFilter.ts
            📄 TextFilter.ts
    📁 Model
        📄 Model.ts
        📄 types.ts
    📁 Table
        📄 Table.ts
        📄 TableFactory.ts
    📁 vendor
        📄 getAccumulated.ts
```

## 🤝 Contributing

Contributions are welcome! Whether it's reporting bugs, suggesting improvements, or opening pull requests. Please follow the existing modular structure and include tests when possible.

## 📘 License

MIT License

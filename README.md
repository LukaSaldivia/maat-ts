# 🪶Maat-ts

![GitHub last commit](https://img.shields.io/github/last-commit/lukasaldivia/maat)
![GitHub top language](https://img.shields.io/github/languages/top/lukasaldivia/maat)
![GitHub package.json version](https://img.shields.io/github/package-json/v/lukasaldivia/maat?color=ffffff)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/lukasaldivia/maat)

Maat is a modular Typescript library for modeling CRUD operations over SQL databases.
It provides advanced filtering and searching capabilities, and it's fully agnostic of the SQL engine — as long as your connection object exposes a `query(string, string[])` method.

## ✨ Features

- Full customizable CRUD operations
- Works with any SQL connection that supports `.query(string, string[])`
- Chainable and advanced filters
- Aggregation functions included
- Designed to fit cleanly into MVC architectures or standalone use

## 📦 Installation

```bash
npm i maat-ts
```

## 🛠️ Basic usage

```ts
import { Queryable } from "src/Model/types";
import Model from "../src/Model/Model";
import TableFactory from "../src/Table/TableFactory";
import mysql, { FieldPacket, RowDataPacket } from 'mysql2';
import AggregateFunction from "../src/AggregateFunction/AggregateFunction";

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
  [count("age", "age_count"), "age"], // returns "age_count" and "age" as columns. "age_count" is an alias from "COUNT(age)"
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

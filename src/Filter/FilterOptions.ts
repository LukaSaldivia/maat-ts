type FilterOptions<C extends string> = {
  field: C
  score? : number
} & (
    {
      type: 'range'
      min: number | string
      max: number | string
    } | {
      type: 'number'
      value: number
    } | {
      type: 'text' | 'date' | 'stricttext'
      value: string
    }

  )

export { FilterOptions }
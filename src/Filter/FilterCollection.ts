import Filter from "./Filter.js";
import { FilterOptions } from "./FilterOptions.js";
import FilterFactory from "./FilterFactory";


export default class FilterCollection<C extends string>{
  filters : Filter<C>[] = []

  appendFilter(options : FilterOptions<C>){
    let { create } = FilterFactory
    let filter : Filter<C> = create(options)
    this.filters.push(filter)
    return this
  }
}
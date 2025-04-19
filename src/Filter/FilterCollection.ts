import Filter from "./Filter.js";
import { FilterOptions } from "./FilterOptions.js";
import FilterFactory from "./FilterFactory";

/**
 * Represents a collection of filters that can be applied to a query.
 *
 * @template C - A union of string literals representing column names.
 */
export default class FilterCollection<C extends string> {
  filters: Filter<C>[] = []

  /**
 * Appends a new filter to the collection using the provided options.
 *
 * @param {FilterOptions<C>} options - Configuration options to create the filter.
 * @returns {this} The current FilterCollection instance for chaining.
 */
  appendFilter(options: FilterOptions<C>): this {
    let { create } = FilterFactory
    let filter: Filter<C> = create(options)
    this.filters.push(filter)
    return this
  }
}
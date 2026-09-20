export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name A to Z' },
  { value: 'name-desc', label: 'Name Z to A' },
]

const byDate = (direction) => (a, b) => direction * (new Date(a.createdAt) - new Date(b.createdAt))
const byPrice = (direction) => (a, b) => direction * (Number(a.price) - Number(b.price))
const byName = (direction) => (a, b) => direction * String(a.title).localeCompare(String(b.title))

export const SORT_COMPARATORS = {
  newest: byDate(-1),
  oldest: byDate(1),
  'price-asc': byPrice(1),
  'price-desc': byPrice(-1),
  'name-asc': byName(1),
  'name-desc': byName(-1),
}
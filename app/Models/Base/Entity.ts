enum Entity {
  companies,
  users,
  ip_portfolios,
  patents,
  patent_costs
}
export type EntityKey = keyof typeof Entity
export default Entity

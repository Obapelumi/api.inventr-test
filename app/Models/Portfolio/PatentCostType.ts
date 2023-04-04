enum PatentCostType {
  filing,
  attorney
}
export type PatentCostTypeKey = keyof typeof PatentCostType
export default PatentCostType

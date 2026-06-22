/**
 * Pension analysis feature public surface.
 *
 * All cross-feature consumers must import from this barrel.
 */
export { usePensionCalculation, type PensionData } from "./hooks/use-pension-calculation";
export { PensionChart } from "./components/pension-chart";
export { PensionResultsOverview } from "./components/pension-results-overview";
export { PensionResultsTable } from "./components/pension-results-table";
export { DisabilityIncomeDiagram } from "./components/disability-income-diagram";

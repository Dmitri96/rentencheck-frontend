/**
 * Pension analysis feature public surface.
 *
 * All cross-feature consumers must import from this barrel. Every component
 * renders the backend analysis (usePensionAnalysis) — no client-side math.
 */
export {
  usePensionAnalysis,
  type PensionAnalysis,
  type PensionAnalysisRow,
} from "./hooks/use-pension-analysis";
export { PensionChart, PensionAnalysisError } from "./components/pension-chart";
export { PensionResultsOverview } from "./components/pension-results-overview";
export { PensionResultsTable } from "./components/pension-results-table";
export { PensionBreakdownTable } from "./components/pension-breakdown-table";
export { CapitalRequirementChart } from "./components/capital-requirement-chart";
export { DisabilityIncomeDiagram } from "./components/disability-income-diagram";

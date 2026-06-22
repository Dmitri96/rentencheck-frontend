/**
 * Rentenchecks feature public surface.
 *
 * All cross-feature consumers must import from this barrel.
 */
export { useRentenblickForm } from "./hooks/use-rentenblick-form";
export { RentenblickResults } from "./components/rentenblick-results";
export { RentenblickForm } from "./components/rentenblick-form";
export type { RentenblickFormProps } from "./components/rentenblick-form";
export type { RentencheckData } from "@/lib/services/rentencheck-service";

/**
 * Clients feature public surface.
 *
 * All cross-feature consumers must import from this barrel.
 */
export { ClientDashboard } from "./components/client-dashboard";
export { ClientDetailView } from "./components/client-detail-view";
export { CreateClientForm } from "./components/create-client-form";

// Client detail sub-components — exported for pages that render them individually
export {
  ClientInfoSection,
  ClientContactCard,
  ClientStatsCard,
  RentenchecksCard,
  ClientLoadingState,
  ClientErrorState,
} from "./components/client-detail/index";

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Clean up the DOM between every test so element queries don't bleed.
afterEach(() => {
  cleanup();
});

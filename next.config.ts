import type { NextConfig } from "next";

/*
 * Next 16 removed the inline `eslint` config block — ESLint is now invoked
 * standalone via the `lint`/`lint:check` scripts in package.json. Build-time
 * type checking still honours `typescript.ignoreBuildErrors: false`.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

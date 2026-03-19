import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "@prisma/adapter-libsql", "@libsql/client"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
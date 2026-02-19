import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const IS_BUILD_STATIC = process.env.IS_BUILD_STATIC === "true";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  ...(IS_BUILD_STATIC && {
    output: "export",
    trailingSlash: true,
  }),
};

export default withMDX(config);

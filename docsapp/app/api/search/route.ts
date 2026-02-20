import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

const IS_BUILD_STATIC = process.env.IS_BUILD_STATIC === "1";
const revalidate = !IS_BUILD_STATIC ? false : 0;

const { staticGET, GET: ssrGET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: "english",
});

const GET = IS_BUILD_STATIC ? staticGET : ssrGET;

export { GET, revalidate };

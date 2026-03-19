import { createFromSource } from "fumadocs-core/search/server";
import { NextResponse } from "next/server";
import { source } from "@/lib/source";
import { getAuthSession } from "@/lib/session";

const IS_BUILD_STATIC = process.env.IS_BUILD_STATIC === "true";

export async function GET(req: Request) {
  const session = await getAuthSession()

  if (!session) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { staticGET, GET: ssrGET } = createFromSource(source, {
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: "english",
  });

  if (IS_BUILD_STATIC) {
    // static search (used when generating static JSON)
    return staticGET();
  } else {
    // dynamic server-side search
    return ssrGET(req);
  }
}

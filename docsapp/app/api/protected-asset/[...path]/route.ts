import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";

/**
 * Serves auth-protected media assets in protected (private) page routes
 * @param req - Next request
 * @param context - Route path or parameters
 * @returns NextResponse
 */
// biome-ignore lint/suspicious/noExplicitAny: Needed for dynamic route params typing
export async function GET(_: Request, context?: any) {
  const session = await getAuthSession();
  const PROTECTED_FILE_PATH = "protected";
  let filePathArray = ["images", "default.png"];

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const ctxParams = await context.params;

  if (Array.isArray(ctxParams?.path)) {
    filePathArray = ctxParams?.path;
  }

  const filePath = join(process.cwd(), PROTECTED_FILE_PATH, ...filePathArray);

  try {
    const file = (await readFile(filePath)) as unknown;

    return new NextResponse(file as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

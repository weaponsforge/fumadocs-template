import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

/**
 * Serves auth-protected media assets in protected (private) page routes
 * @param req - Next request
 * @param param1 - Route path or parameters
 * @returns NextResponse
 */
// biome-ignore lint/suspicious/noExplicitAny: Needed for dynamic route params typing
export async function GET(_: Request, context?: any) {
  const session = await getServerSession(authOptions);

  const PROTECTED_FILE_PATH = "protected";
  let filePathArray = ["images", "default.png"];

  if (Array.isArray(context?.params?.path)) {
    filePathArray = context?.params?.path;
  }

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
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

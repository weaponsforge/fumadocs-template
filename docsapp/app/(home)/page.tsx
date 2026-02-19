import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { GoogleSignInButton } from "@/app/components/auth/google/btnLogin";
import { ButtonLink } from "@/app/components/ui/buttons/buttonLink";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const renderButton = session ? (
    <ButtonLink
      href="/docs"
      styles="
          w-45 p-5 mt-6 text-center !rounded-full
          bg-orange-50 border border-orange-300 hover:bg-orange-100
          dark:bg-orange-400 dark:border-orange-600 dark:hover:bg-orange-400
          dark:text-white
        "
    >
      View Documentation
    </ButtonLink>
  ) : (
    <div className="pt-4">
      <GoogleSignInButton />
    </div>
  );

  return (
    <main className="min-h-100 flex flex-col pt-8">
      <div className="max-w-screen-md w-full p-4 mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Hello World</h1>
        <p className="text-fd-muted-foreground">
          You can open{" "}
          <Link
            href="/docs"
            className="text-fd-foreground font-semibold underline"
          >
            /docs
          </Link>{" "}
          and see the documentation.
        </p>

        {renderButton}
      </div>
    </main>
  );
}

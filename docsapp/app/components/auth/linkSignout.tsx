import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { SignOutButton } from "@/app/components/auth/btnSignout";

export default async function SignOutLink() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const user = session?.user;
  const email = user?.email ?? "-";
  const picture = user?.image ?? "-";

  return (
    <SignOutButton
      title="Sign out"
      label={email as string}
      image={picture as string}
    />
  );
}

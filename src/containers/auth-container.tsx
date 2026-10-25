import { useSession, signIn } from "next-auth/react";
import * as React from "react";

export default function AuthContainer(props: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  React.useEffect(() => {
    if (status === "unauthenticated") signIn("google");
  }, [status]);

  if (status === "authenticated") {
    return <>{props.children}</>;
  }
  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>;
}

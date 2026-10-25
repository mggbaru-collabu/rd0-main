import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import AuthContainer from "../containers/auth-container";
import { AppShell, Navbar, Header, NavLink } from "@mantine/core";

import "../styles/globals.css";
import { QueryClientProvider } from "react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { adminWhitelists } from "../config";

function App(props: { children: React.ReactNode }) {
  const router = useRouter();
  const { data } = useSession();
  return (
    <AppShell
      padding="md"
      layout="alt"
      navbar={
        <Navbar width={{ base: 300 }} p="xs">
          <Navbar.Section>
            <Link href="/mutasi">
              <NavLink
                label="Mutasi Konversi"
                active={router.pathname === "/mutasi"}
              />
            </Link>
          </Navbar.Section>
          {adminWhitelists.indexOf(data!.user!.email!.toLowerCase()) >= 0 && (
            <Navbar.Section>
              <Link href="/infi">
                <NavLink
                  label="Setting Auto Approver"
                  active={router.pathname === "/infi"}
                />
              </Link>
            </Navbar.Section>
          )}
        </Navbar>
      }
      header={<Header height={60}>{null}</Header>}
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {props.children}
    </AppShell>
  );
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session} refetchInterval={30 * 60}>
      <AuthContainer>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: "light",
          }}
        >
          <App>
            <Component {...pageProps} />
          </App>
        </MantineProvider>
      </AuthContainer>
    </SessionProvider>
  );
}

export default MyApp;

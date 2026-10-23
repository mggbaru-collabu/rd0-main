import type { NextPage, NextPageContext } from "next";
import Link from "next/link";
import { Button } from "@mantine/core";

export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {}, // will be passed to the page component as props
  };
}

const Home: NextPage = () => {
  return (
    <>
      <h1>Dashboard RDO</h1>
    </>
  );
};

export default Home;

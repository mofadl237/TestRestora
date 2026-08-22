import { HomeClient } from "@/src/Components/Home/HomeClient";
import { TableResolver } from "@/src/Components/Table/TableResolver";

interface IHomePageProps {
  searchParams: Promise<{ tableId?: string }>;
}

export default async function Home({ searchParams }: IHomePageProps) {
  const params = await searchParams;

  return (
    <>
      <TableResolver tableId={params.tableId} />
      <HomeClient />
    </>
  );
}

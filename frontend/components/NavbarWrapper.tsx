import { getTourismTypes } from "@/lib/api";
import Navbar from "./Navbar";
import UtilityBar from "./UtilityBar";

export default async function NavbarWrapper() {
  const tourismTypes = await getTourismTypes().catch(() => []);

  return (
    <>
      <UtilityBar />
      <Navbar initialTourismTypes={tourismTypes} />
    </>
  );
}

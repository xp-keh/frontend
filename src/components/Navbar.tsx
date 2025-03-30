import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <Link
        href="/"
        className="text-lg font-semibold text-gray-700 hover:text-blue-500"
      >
        Home
      </Link>
      <Link
        href="/dashboard"
        className="text-lg font-semibold text-gray-700 hover:text-blue-500"
      >
        Weather
      </Link>
    </nav>
  );
};

export default Navbar;

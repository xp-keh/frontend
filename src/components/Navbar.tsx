import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md py-2 px-6 flex justify-between items-center">
      <Link
        href="/"
        className="text-md font-semibold text-gray-700 hover:text-blue-500"
      >
        Home
      </Link>
      <Link
        href="/dashboard"
        className="text-md font-semibold text-gray-700 hover:text-blue-500 flex items-center gap-0.5"
      >
        <Image
          src="/cloudy-day.png"
          alt="Cloudy Weather Icon"
          width={15}
          height={20}
        />
        Weather
      </Link>
    </nav>
  );
};

export default Navbar;

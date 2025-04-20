import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md py-2 px-6 flex items-center">
      {/* Home on the left with flex-grow */}
      <Link
        href="/"
        className="text-md font-semibold text-gray-700 hover:text-blue-500 flex-grow"
      >
        Home
      </Link>

      {/* Right-aligned menu items */}
      <div className="flex items-center gap-4">
        <Link
          href="/weather"
          className="text-md font-semibold text-gray-700 hover:text-blue-500 flex items-center gap-1"
        >
          <Image
            src="/cloudy-day.png"
            alt="Weather Logo"
            width={15}
            height={20}
          />
          Weather
        </Link>
        <Link
          href="/seismic"
          className="text-md font-semibold text-gray-700 hover:text-blue-500 flex items-center gap-1"
        >
          <Image
            src="/waveform.png"
            alt="Seismic Logo"
            width={25}
            height={30}
          />
          Seismic
        </Link>
        <Link
          href="/dashboard"
          className="text-md font-semibold text-gray-700 hover:text-blue-500 flex items-center gap-1"
        >
          <Image
            src="/data-retrieval.png"
            alt="Data Retrieval Icon"
            width={15}
            height={20}
          />
          Data Retrieval
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

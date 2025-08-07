'use client';
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white shadow-md py-2 px-6 flex items-center justify-between z-[9999]">
      <div className="flex items-center gap-6">
        <div
          className="relative z-[9998]"
          ref={dropdownRef}
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="text-md px-4 font-semibold text-gray-700 hover:text-blue-500 flex items-center gap-1"
          >
            <Image
              src="/data-integration.png"
              alt="Data Integration Icon"
              width={15}
              height={20}
            />
            Data Station
            <svg
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 bg-white border rounded shadow-md z-10 w-40">
              <Link
                href="/weather"
                className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-500 flex items-center gap-1"
              >
                <Image
                  src="/cloudy-day.png"
                  alt="Weather Logo"
                  width={20}
                  height={20}
                />
                Weather
              </Link>
              <Link
                href="/seismic"
                className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-500 flex items-center gap-1"
              >
                <Image
                  src="/waveform.png"
                  alt="Seismic Logo"
                  width={20}
                  height={20}
                />
                Seismic
              </Link>
              <Link
                href="/retrieve"
                className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-500 flex items-center gap-1"
              >
                <Image
                  src="/data-retrieval.png"
                  alt="Data Retrieval Icon"
                  width={20}
                  height={20}
                />
                Data Retrieval
              </Link>
            </div>
          )}
        </div>

        {/* Local Wisdom */}
        <Link
          href="/localwisdom"
          className="text-md font-semibold text-gray-700 hover:text-blue-500 flex items-center gap-1"
        >
          <Image
            src="/local-wisdom.png"
            alt="Local Wisdom Icon"
            width={10}
            height={15}
          />
          Local Wisdom
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

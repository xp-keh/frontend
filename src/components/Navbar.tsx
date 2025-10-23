"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
	const { authenticated, user, login, logout, loading } = useAuth();
	const dropdownRef = useRef<HTMLDivElement>(null);
	const profileMenuRef = useRef<HTMLDivElement>(null);

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);

	/** ---------- Outside click handlers ---------- */
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
			if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node))
				setProfileMenuOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	/** ---------- Sign out handler ---------- */
	const handleSignOut = () => {
		logout();
		setProfileMenuOpen(false);
	};

	/** ---------- Render ---------- */
	return (
		<nav className="w-full bg-white shadow-md py-2 px-6 flex items-center justify-between z-[9999]">
			{/* ---------- Left: Logos ---------- */}
			<div className="flex items-center gap-3 select-none cursor-default">
				{[
					["/UI.png", "Universitas Indonesia"],
					["/UGM.png", "Universitas Gadjah Mada"],
					["/NTU.png", "Nanyang Technological University"],
					["/LPDP.png", "LPDP"],
					["/KEMENRISTEKDIKTI.svg", "Kemenristekdikti"],
					["/Smart City Pillar.png", "Smart City Project"],
				].map(([src, alt]) => (
					<Image key={alt} src={src} alt={alt} width={40} height={30} />
				))}
				<span className="font-bold text-gray-800 text-sm md:text-base whitespace-nowrap">
					Vertical Intelligent Application in Smart City Ecosystem
				</span>
			</div>

			{/* ---------- Right: Navigation ---------- */}
			<div className="flex items-center gap-6">
				{/* Dropdown Menu */}
				<div
					ref={dropdownRef}
					className="relative z-[9998]"
					onMouseEnter={() => setDropdownOpen(true)}
					onMouseLeave={() => setDropdownOpen(false)}
				>
					<button
						onClick={() => setDropdownOpen((prev) => !prev)}
						className="text-md px-4 font-semibold text-gray-700 hover:text-blue-500 flex items-center gap-1"
					>
						<Image src="/data-integration.png" alt="Data Integration" width={15} height={20} />
						Data Station
						<svg
							className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{dropdownOpen && (
						<div className="absolute left-0 bg-white border rounded shadow-md z-10 w-40">
							{[
								["/weather", "/cloudy-day.png", "Weather"],
								["/seismic", "/waveform.png", "Seismic"],
								["/retrieve", "/data-retrieval.png", "Data Retrieval"],
								["/files", "/file-manager.png", "File Manager"],
							].map(([href, icon, label]) => (
								<Link
									key={href}
									href={href}
									className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 hover:text-blue-500"
								>
									<Image src={icon} alt={label} width={20} height={20} /> {label}
								</Link>
							))}
						</div>
					)}
				</div>

				{/* Local Wisdom */}
				<Link
					href="/localwisdom"
					className="text-md font-semibold text-gray-700 hover:text-blue-500 flex items-center gap-1"
				>
					<Image src="/local-wisdom.png" alt="Local Wisdom" width={10} height={15} />
					Local Wisdom
				</Link>

				{/* Authentication */}
				<div className="flex items-center gap-1">
					{loading ? (
						<div className="text-sm text-gray-500">Loading...</div>
					) : authenticated && user ? (
						<div className="relative" ref={profileMenuRef}>
							<button
								onClick={() => setProfileMenuOpen((s) => !s)}
								className="flex items-center gap-2 focus:outline-none"
							>
								<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
									{user.name ? user.name.charAt(0).toUpperCase() : user.username ? user.username.charAt(0).toUpperCase() : "U"}
								</div>
								<span className="text-sm font-medium text-gray-700">
									{user.name || user.username || "User"}
								</span>
							</button>

							{profileMenuOpen && (
								<div className="absolute right-0 mt-2 bg-white border rounded shadow-md text-gray-700 py-1 min-w-[120px]">
									<div className="px-4 py-2 text-xs text-gray-500 border-b">
										{user.email || user.username}
									</div>
									<button
										onClick={handleSignOut}
										className="w-full text-left px-4 py-2 hover:bg-gray-100"
									>
										Sign out
									</button>
								</div>
							)}
						</div>
					) : (
						<button
							onClick={login}
							className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium"
						>
							Sign In
						</button>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
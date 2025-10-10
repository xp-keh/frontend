"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type GisCallbackResponse = { credential?: string };

declare global {
	interface Window {
		google?: {
			accounts?: {
				id?: {
					initialize?: (opts: {
						client_id: string;
						callback: (response: GisCallbackResponse) => void;
					}) => void;
					renderButton?: (parent: HTMLElement, options?: Record<string, string>) => void;
					disableAutoSelect?: () => void;
				};
			};
		};
	}
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

if (!GOOGLE_CLIENT_ID && typeof window !== "undefined") {
	// Warn in dev when the env var is not provided
	// eslint-disable-next-line no-console
	console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
}

interface GoogleProfile {
	id: string;
	name: string;
	imageUrl: string;
	email: string;
}

const Navbar = () => {
	const router = useRouter();
	const dropdownRef = useRef<HTMLDivElement>(null);
	const profileMenuRef = useRef<HTMLDivElement>(null);

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(() => {
		try {
			const stored = sessionStorage.getItem("google_profile");
			return stored ? JSON.parse(stored) : null;
		} catch {
			return null;
		}
	});

	/** ---------- Helpers ---------- */
	const decodeJwt = useCallback((token: string) => {
		try {
			const payload = token.split(".")[1];
			const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
			// legacy-safe decode
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return JSON.parse(decodeURIComponent(escape(json)));
		} catch {
			return null;
		}
	}, []);

	const renderGoogleButton = useCallback(() => {
		// Do not render the Google button if a profile is already present
		if (googleProfile) return;
		const container = document.getElementById("gisButton");
		const google = window.google?.accounts?.id;
		if (!container || !google?.renderButton) return;
		container.innerHTML = "";
		google.renderButton(container, { theme: "outline", size: "medium", type: "standard" });
	}, [googleProfile]);

	// Remove any Google button nodes that the GIS library may have injected.
	const removeGoogleButtons = useCallback(() => {
		try {
			// remove known GIS nodes by class or known ids
			const els = Array.from(document.querySelectorAll(".g_id_signin, #g_id_onload, iframe[id^='gsi_']"));
			els.forEach((el) => el.remove());
			// remove any iframes that point to the GSI button endpoint
			const iframes = Array.from(document.querySelectorAll("iframe")).filter(
				(i) => (i as HTMLIFrameElement).src && (i as HTMLIFrameElement).src.includes("accounts.google.com/gsi/button")
			);
			iframes.forEach((f) => f.remove());
			const container = document.getElementById("gisButton");
			if (container) container.innerHTML = "";
		} catch {
			// ignore
		}
	}, []);

	// sessionStorage is read during initial state to avoid race conditions with the
	// Google Identity script that may render the button before effects run.

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

	/** ---------- Google Sign-In initialization ---------- */
	useEffect(() => {
		if (googleProfile) {
			removeGoogleButtons();
			return;
		}

		const init = () => {
			const google = window.google?.accounts?.id;
			if (!google || typeof google.initialize !== "function") return;

			google.initialize({
				client_id: GOOGLE_CLIENT_ID,
				callback: (response: GisCallbackResponse) => {
					if (!response.credential) return;
					const payload = decodeJwt(response.credential);
					if (!payload) return;

					const profile: GoogleProfile = {
						id: (payload.sub as string) || "",
						name: (payload.name as string) || (payload.email as string) || "",
						imageUrl: (payload.picture as string) || "",
						email: (payload.email as string) || "",
					};
					// Prevent Google from auto-selecting this account again and
					// remove any injected button elements immediately.
					window.google?.accounts?.id?.disableAutoSelect?.();
					setGoogleProfile(profile);
					sessionStorage.setItem("google_profile", JSON.stringify(profile));
					removeGoogleButtons();
				},
			});
			renderGoogleButton();
		};

		if (window.google?.accounts?.id) {
			init();
			return;
		}

		const interval = setInterval(() => {
			if (window.google?.accounts?.id) {
				clearInterval(interval);
				init();
			}
		}, 300);
		return () => clearInterval(interval);
	}, [decodeJwt, renderGoogleButton, googleProfile, removeGoogleButtons]);

	// Ensure any stray Google button nodes are removed when a profile is set or cleared.
	useEffect(() => {
		if (googleProfile) removeGoogleButtons();
	}, [googleProfile, removeGoogleButtons]);

	// Observe DOM mutations to catch GIS injected nodes and remove them right away.
	useEffect(() => {
		const observer = new MutationObserver((mutations) => {
			let removed = false;
			for (const m of mutations) {
				if (m.addedNodes && m.addedNodes.length) {
					m.addedNodes.forEach((n) => {
						try {
							if (n instanceof HTMLElement) {
								if (
									n.classList.contains("g_id_signin") ||
									n.id === "g_id_onload" ||
									(n.id && n.id.startsWith("gsi_")) ||
									(n instanceof HTMLIFrameElement && n.src && n.src.includes("accounts.google.com/gsi/button"))
								) {
									n.remove();
									removed = true;
								}
							}
						} catch {
							// ignore
						}
					});
				}
			}
			if (removed) {
				const container = document.getElementById("gisButton");
				if (container) container.innerHTML = "";
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });

		const stopTimeout = setTimeout(() => observer.disconnect(), 10000);
		if (googleProfile) {
			observer.disconnect();
			clearTimeout(stopTimeout);
		}

		return () => {
			observer.disconnect();
			clearTimeout(stopTimeout);
		};
	}, [googleProfile, removeGoogleButtons]);

	/** ---------- Sign out ---------- */
	const handleSignOut = () => {
		window.google?.accounts?.id?.disableAutoSelect?.();
		sessionStorage.removeItem("google_profile");
		setGoogleProfile(null);
		setProfileMenuOpen(false);
		renderGoogleButton();
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

				{/* Google Sign-In / Profile */}
				<div className="flex items-center gap-1">
					{googleProfile ? (
						<div className="relative" ref={profileMenuRef}>
							<button
								onClick={() => setProfileMenuOpen((s) => !s)}
								className="flex items-center gap-2 focus:outline-none"
							>
								<Image
									src={googleProfile.imageUrl || "/icon.png"}
									alt={googleProfile.name}
									width={32}
									height={32}
									className="rounded-full"
								/>
								<span className="text-sm font-medium text-gray-700">{googleProfile.name}</span>
							</button>

							{profileMenuOpen && (
								<div className="absolute right-0 mt-2 bg-white border rounded shadow-md text-gray-700 py-1">
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
						<div id="gisButton" />
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
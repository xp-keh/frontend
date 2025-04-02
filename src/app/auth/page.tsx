"use client";

import { signin } from "@/actions/auth";
import { useActionState } from "react";
import Link from "next/link";

export default function SignInForm() {
  const [state, action, pending] = useActionState(signin, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030c14] p-4">
      <div className="relative bg-[#171b21] border border-neutral-700 rounded-[20px] w-full max-w-md p-8 shadow-xl">
        <h2 className="text-white text-[32px] font-semibold text-center mb-6 mt-8">
          Data Station
        </h2>

        <form action={action} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-white text-lg font-semibold mb-2"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-[#1a1e23] border border-neutral-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#03b3d7]"
              required
            />
            {state?.errors?.username && <p>{state.errors.username}</p>}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-white text-lg font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-[#1a1e23] border border-neutral-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#03b3d7]"
              required
            />
            {state?.errors?.password && (
              <div>
                <p>Password must:</p>
                <ul>
                  {state.errors.password.map((error) => (
                    <li key={error}>- {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Forgot Password */}
          {/* <div className="text-right">
            <Link href="/forgot-password" className="text-[#03b3d7] text-xs underline">
              Forgot your password?
            </Link>
          </div> */}

          <button
            disabled={pending}
            type="submit"
            className="w-full py-3 bg-gradient-to-b from-[#c4407c] to-[#da77a4] rounded-[10px] text-white text-lg font-semibold hover:opacity-90 transition"
          >
            Log in
          </button>
        </form>

        <div className="mt-6 text-center text-white text-sm">
          New to Data Station?{" "}
          <Link href="auth/signup" className="text-[#03b3d7] underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

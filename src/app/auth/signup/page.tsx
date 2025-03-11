'use client';

import { signup } from '@/actions/auth';
import { useActionState } from 'react';
import Link from 'next/link';

export default function SignUpForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030c14] p-4">

      <div className="relative bg-[#171b21] border border-neutral-700 rounded-[20px] w-full max-w-md p-8 shadow-xl">

        <h2 className="text-white text-[32px] font-semibold text-center mb-6 mt-8">Create Account</h2>

        <form action={action} className="space-y-6">

          <div>
            <label htmlFor="name" className="block text-white text-lg font-semibold mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-[#1a1e23] border border-neutral-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#03b3d7]"
              required
            />
            {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>}
          </div>

          <div>
            <label htmlFor="username" className="block text-white text-lg font-semibold mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              placeholder="Choose a username"
              className="w-full px-4 py-3 bg-[#1a1e23] border border-neutral-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#03b3d7]"
              required
            />
            {state?.errors?.username && <p className="text-red-500 text-sm mt-1">{state.errors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-white text-lg font-semibold mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-[#1a1e23] border border-neutral-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#03b3d7]"
              required
            />
            {state?.errors?.email && <p className="text-red-500 text-sm mt-1">{state.errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-white text-lg font-semibold mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 bg-[#1a1e23] border border-neutral-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#03b3d7]"
              required
            />
            {state?.errors?.password && (
              <div className="text-red-500 text-sm mt-1">
                <p>Password must:</p>
                <ul className="list-disc pl-5">
                  {state.errors.password.map((error) => (
                    <li key={error}>- {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            disabled={pending}
            type="submit"
            className="w-full py-3 bg-gradient-to-b from-[#c4407c] to-[#da77a4] rounded-[10px] text-white text-lg font-semibold hover:opacity-90 transition"
          >
            {pending ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-white text-sm">
          Already have an account?{' '}
          <Link href="/auth" className="text-[#03b3d7] underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

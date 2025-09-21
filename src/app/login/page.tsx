"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use a union type for login/signup body
      type AuthBody =
        | { email: string; password: string } // login
        | { name: string; email: string; password: string }; // signup

      let bodyData: AuthBody;

      if (mode === "login") {
        bodyData = {
          email: form.email,
          password: form.password,
        };
      } else if (mode === "signup") {
        bodyData = {
          name: form.name,
          email: form.email,
          password: form.password,
        };
      } else {
        throw new Error("Invalid mode");
      }

      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || `${mode} failed`);
      }

      // ✅ redirect on success
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-red-600 text-xl mb-4">Please login before accessing protected routes</div>

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setMode("login")}
            className={`w-1/2 py-2 font-semibold border-b-2 transition-colors ${mode === "login"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`w-1/2 py-2 font-semibold border-b-2 transition-colors ${mode === "signup"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
              }`}
          >
            Signup
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 transition-all duration-500">
          {mode == "signup" && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}


          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}

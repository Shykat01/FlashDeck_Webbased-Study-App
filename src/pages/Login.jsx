import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Layers, Lock, User, AlertCircle } from "lucide-react";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name] || errors.detail) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null, detail: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await signIn(form);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({
          detail:
            err.response.data?.detail ||
            "No active account found with the given credentials",
        });
      } else if (err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        setErrors({
          detail: "Cannot connect to server. Ensure backend is running.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-stone-900 text-white items-center justify-center shadow-md mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Welcome back to FlashDeck
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Sign in to revise your decks and continue your spaced study.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-stone-200/90 rounded-2xl">
          {errors.detail && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errors.detail}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700"
              >
                Username
              </label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors ${
                    errors.username ? "border-rose-300" : "border-stone-300"
                  }`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {errors.username[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors ${
                    errors.password ? "border-rose-300" : "border-stone-300"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {errors.password[0]}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* Demo account hint for examiner */}
          <div className="mt-6 pt-5 border-t border-stone-100 bg-stone-50/80 -mx-6 -mb-8 px-6 py-4 rounded-b-2xl">
            <p className="text-xs text-stone-500 font-medium">
              Demo Examiner Account:
            </p>
            <p className="text-xs font-mono text-stone-700 mt-1">
              User: <span className="font-bold">demo_user</span> | Pass:{" "}
              <span className="font-bold">demopass123</span>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-stone-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-stone-900 hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

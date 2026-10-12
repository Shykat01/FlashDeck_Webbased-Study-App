import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Layers, LayoutDashboard, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 text-stone-900 font-bold text-lg tracking-tight hover:opacity-90">
            <span className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-stone-900 font-extrabold tracking-tight">FlashDeck</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-stone-100 text-stone-900 font-semibold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/decks"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-stone-100 text-stone-900 font-semibold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`
              }
            >
              <Layers className="w-4 h-4" />
              <span>Decks</span>
            </NavLink>
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1.5 rounded-full border border-stone-200/80">
            <User className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-semibold text-stone-800">{user}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors border border-transparent hover:border-rose-100"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

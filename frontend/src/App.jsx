import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DeckList from "./pages/DeckList";
import DeckDetail from "./pages/DeckDetail";
import DeckForm from "./pages/DeckForm";
import CardForm from "./pages/CardForm";
import Study from "./pages/Study";

// Layout wrapper for protected screens
function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/decks"
            element={
              <ProtectedLayout>
                <DeckList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/decks/new"
            element={
              <ProtectedLayout>
                <DeckForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/decks/:id"
            element={
              <ProtectedLayout>
                <DeckDetail />
              </ProtectedLayout>
            }
          />
          <Route
            path="/decks/:id/edit"
            element={
              <ProtectedLayout>
                <DeckForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/decks/:id/cards/new"
            element={
              <ProtectedLayout>
                <CardForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/cards/:id/edit"
            element={
              <ProtectedLayout>
                <CardForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/decks/:id/study"
            element={
              <ProtectedLayout>
                <Study />
              </ProtectedLayout>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

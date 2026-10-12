import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStats, listDecks } from "../api/decks";
import StatCard from "../components/StatCard";
import BoxBadge from "../components/BoxBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  ArrowRight,
  Play,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [dueDecks, setDueDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsData, decksData] = await Promise.all([
        getStats(),
        listDecks({ is_archived: false }),
      ]);
      setStats(statsData);

      // Extract decks with cards due
      const allDecks = decksData?.results || [];
      const readyDecks = allDecks.filter((d) => d.due_count > 0);
      setDueDecks(readyDecks);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Loading dashboard metrics..." />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <ErrorState
          title="Could not load dashboard"
          message="Failed to retrieve study statistics. Check that the backend server is reachable."
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  const isBrandNewUser = stats?.decks === 0 && stats?.cards === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Track your Leitner retention curve and daily study targets.
          </p>
        </div>

        <Link
          to="/decks/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New deck</span>
        </Link>
      </div>

      {isBrandNewUser ? (
        <EmptyState
          icon={Layers}
          title="No decks yet"
          message="Welcome to FlashDeck! Create your first deck of questions to start spaced-repetition study."
          actionLabel="Create First Deck"
          onAction={() => navigate("/decks/new")}
        />
      ) : (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              title="Due now"
              value={stats?.due_now}
              icon={Clock}
              colorClass="bg-amber-100 text-amber-700"
              subtitle="Cards scheduled today"
            />
            <StatCard
              title="Total cards"
              value={stats?.cards}
              icon={BookOpen}
              colorClass="bg-sky-100 text-sky-700"
              subtitle={`Across ${stats?.decks} active ${stats?.decks === 1 ? "deck" : "decks"}`}
            />
            <StatCard
              title="Mastered"
              value={stats?.mastered}
              icon={Award}
              colorClass="bg-emerald-100 text-emerald-700"
              subtitle="Promoted to Box 5"
            />
            <StatCard
              title="Accuracy"
              value={stats?.accuracy}
              unit="%"
              icon={TrendingUp}
              colorClass="bg-indigo-100 text-indigo-700"
              subtitle="Lifetime correct recall"
            />
          </div>

          {/* Where your cards sit (Box Distribution Row) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900 tracking-tight">
                  Where your cards sit
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Visual Leitner distribution across the 5 spaced interval boxes.
                </p>
              </div>
              <span className="text-xs font-mono text-stone-500">
                {stats?.cards} cards total
              </span>
            </div>

            {/* Distribution bars & counts */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {[1, 2, 3, 4, 5].map((boxNum) => {
                const count = stats?.boxes?.[String(boxNum)] || 0;
                const percentage =
                  stats?.cards > 0 ? Math.round((count / stats.cards) * 100) : 0;

                return (
                  <div
                    key={boxNum}
                    className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/70 space-y-2 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <BoxBadge box={boxNum} size="sm" />
                      <span className="font-mono font-bold text-sm text-stone-800">
                        {count}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          boxNum === 1
                            ? "bg-rose-500"
                            : boxNum === 2
                            ? "bg-amber-500"
                            : boxNum === 3
                            ? "bg-sky-500"
                            : boxNum === 4
                            ? "bg-indigo-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>

                    <div className="text-[11px] text-stone-400 font-medium text-right">
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ready to Study Section */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900 tracking-tight">
                  Ready to study
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Decks with cards awaiting review today.
                </p>
              </div>

              <Link
                to="/decks"
                className="inline-flex items-center space-x-1 text-xs font-bold text-stone-700 hover:text-stone-900 group"
              >
                <span>See all decks</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {dueDecks.length === 0 ? (
              <div className="py-8 text-center bg-stone-50/60 rounded-xl border border-dashed border-stone-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800">
                  You're all caught up!
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  No cards are currently due for review. Check back later or add new cards.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {dueDecks.map((deck) => (
                  <div
                    key={deck.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
                      <div className="min-w-0">
                        <Link
                          to={`/decks/${deck.id}`}
                          className="font-bold text-sm sm:text-base text-stone-900 hover:text-blue-600 transition-colors truncate block"
                        >
                          {deck.title}
                        </Link>
                        <div className="flex items-center space-x-2 text-xs text-stone-500 mt-0.5">
                          <span className="uppercase text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                            {deck.subject}
                          </span>
                          <span>•</span>
                          <span>{deck.card_count} total cards</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 self-end sm:self-center">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {deck.due_count} due
                      </span>
                      <Link
                        to={`/decks/${deck.id}/study`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Study</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

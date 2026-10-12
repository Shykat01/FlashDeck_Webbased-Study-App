import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getStudySession } from "../api/decks";
import { reviewCard } from "../api/cards";
import BoxBadge from "../components/BoxBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import {
  ArrowLeft,
  Check,
  HelpCircle,
  RotateCcw,
  Sparkles,
  X,
  Keyboard,
  Award,
} from "lucide-react";

export default function Study() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Session score tracker
  const [score, setScore] = useState({ done: 0, correct: 0 });

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(false);
    setIndex(0);
    setFlipped(false);
    setShowHint(false);
    setScore({ done: 0, correct: 0 });

    try {
      const data = await getStudySession(id);
      setSession(data);
      setCards(data.cards || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const currentCard = cards[index];

  // Review answer handler (B-5 & 7.7)
  const handleAnswer = async (correct) => {
    if (saving || !currentCard) return; // Guards the double click
    setSaving(true);

    try {
      await reviewCard(currentCard.id, correct);

      setScore((s) => ({
        done: s.done + 1,
        correct: s.correct + (correct ? 1 : 0),
      }));

      // Next card starts face down
      setFlipped(false);
      setShowHint(false);
      setIndex((i) => i + 1);
    } catch (err) {
      alert("Could not save that answer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Keyboard navigation (O-10: Space flips card, 1 is Missed, 2 is Got it, Escape exits)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if target is input
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.key === "Escape") {
        navigate(`/decks/${id}`);
      } else if (e.key === " " && currentCard && !saving) {
        e.preventDefault();
        setFlipped((prev) => !prev);
      } else if (e.key === "1" && currentCard && flipped && !saving) {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.key === "2" && currentCard && flipped && !saving) {
        e.preventDefault();
        handleAnswer(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard, flipped, saving, id, navigate]);

  if (loading) {
    return <Loader fullScreen text="Loading study session..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ErrorState
          title="Could not load study session"
          message="Failed to retrieve cards scheduled for review. Make sure the backend server is running."
          onRetry={fetchSession}
        />
      </div>
    );
  }

  // Empty state: Nothing due today
  if (!cards.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Nothing due in this deck right now!
          </h2>
          <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
            All cards in <span className="font-bold text-stone-800">"{session?.deck?.title}"</span> are currently resting on their scheduled Leitner intervals.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/decks/${id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm text-stone-800 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              Back to Deck
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Session completed / Finished state
  if (!currentCard) {
    const accuracy =
      score.done > 0 ? Math.round((score.correct / score.done) * 100) : 0;

    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 text-center shadow-md animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white mx-auto flex items-center justify-center mb-5 shadow-sm">
            <Award className="w-8 h-8 text-amber-400" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Session Completed
          </span>
          <h2 className="mt-1 text-2xl font-extrabold text-stone-900 tracking-tight">
            Session done — {score.done} reviewed, {score.correct} correct, {accuracy}%
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Any cards you missed were dropped back to Box 1 and are ready for re-review immediately.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
            <div>
              <div className="text-xl font-mono font-bold text-stone-900">{score.done}</div>
              <div className="text-[11px] text-stone-500 font-medium uppercase mt-0.5">Reviewed</div>
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-emerald-600">{score.correct}</div>
              <div className="text-[11px] text-stone-500 font-medium uppercase mt-0.5">Correct</div>
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-stone-900">{accuracy}%</div>
              <div className="text-[11px] text-stone-500 font-medium uppercase mt-0.5">Accuracy</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/decks/${id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              Back to deck
            </Link>
            <button
              type="button"
              onClick={fetchSession}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Study again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active study session card view
  const progressPercent = Math.round(((index + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10 space-y-6">
      {/* Top Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
          <Link
            to={`/decks/${id}`}
            className="inline-flex items-center space-x-1 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="truncate max-w-[180px] sm:max-w-xs">{session?.deck?.title}</span>
          </Link>

          <div className="flex items-center space-x-3">
            <span className="font-mono font-bold text-stone-800">
              {index + 1} / {cards.length}
            </span>
            <button
              onClick={() => navigate(`/decks/${id}`)}
              className="px-2 py-0.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Exit [Esc]
            </button>
          </div>
        </div>

        {/* Thin Progress Bar */}
        <div className="w-full bg-stone-200/80 rounded-full h-1 overflow-hidden">
          <div
            className="h-full bg-stone-900 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* 3D Flip Flashcard */}
      <div className="perspective-1000 min-h-[340px] sm:min-h-[380px]">
        <div
          className={`w-full h-full min-h-[340px] sm:min-h-[380px] bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
            flipped ? "border-stone-400 ring-2 ring-stone-900/5 shadow-md" : ""
          }`}
        >
          {/* Card Top Meta */}
          <div className="flex items-center justify-between">
            <BoxBadge box={currentCard.box} showSchedule size="sm" />
            <span className="text-[11px] font-mono text-stone-400">
              Card #{currentCard.id}
            </span>
          </div>

          {/* Card Content Area */}
          <div className="my-auto py-6">
            {/* Front / Question (Always visible) */}
            <div className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {currentCard.front}
            </div>

            {/* Hint (Revealed upon request if present) */}
            {currentCard.hint && !flipped && (
              <div className="mt-4">
                {showHint ? (
                  <div className="inline-flex items-center space-x-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-xs text-amber-800 animate-in fade-in">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Hint: {currentCard.hint}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="inline-flex items-center space-x-1 text-xs text-stone-400 hover:text-stone-700 font-medium transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Show hint</span>
                  </button>
                )}
              </div>
            )}

            {/* Back / Answer (Rendered strictly after flip) */}
            {flipped && (
              <div className="mt-6 pt-6 border-t border-stone-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Answer
                </span>
                <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal whitespace-pre-line">
                  {currentCard.back}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100">
            {!flipped ? (
              <button
                type="button"
                onClick={() => setFlipped(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-stone-900 hover:bg-stone-800 transition-all shadow-xs flex items-center justify-center space-x-2"
              >
                <span>Show answer</span>
                <span className="text-xs text-stone-400 font-mono hidden sm:inline">[Space]</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Missed Button */}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleAnswer(false)}
                  className="py-3 px-4 rounded-xl font-bold text-sm text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Missed</span>
                  <span className="text-xs text-rose-400 font-mono hidden sm:inline">[1]</span>
                </button>

                {/* Got it Button */}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleAnswer(true)}
                  className="py-3 px-4 rounded-xl font-bold text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Got it</span>
                  <span className="text-xs text-emerald-600 font-mono hidden sm:inline">[2]</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Footer */}
      <div className="text-center text-xs text-stone-400 flex items-center justify-center space-x-4">
        <span className="inline-flex items-center space-x-1">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Space: Flip</span>
        </span>
        <span>•</span>
        <span>1: Missed</span>
        <span>•</span>
        <span>2: Got it</span>
        <span>•</span>
        <span>Esc: Exit</span>
      </div>
    </div>
  );
}

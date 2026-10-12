import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { getCard, createCard, updateCard } from "../api/cards";
import { getDeck } from "../api/decks";
import Loader from "../components/Loader";
import { ArrowLeft, Plus, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function CardForm() {
  const { id } = useParams();
  const location = useLocation();

  // If path is /decks/:id/cards/new, id is deckId. If /cards/:id/edit, id is cardId.
  const isCreateForDeck = location.pathname.includes("/cards/new");
  const isEdit = !isCreateForDeck;

  const navigate = useNavigate();

  const [deckId, setDeckId] = useState(isCreateForDeck ? id : null);
  const [deckTitle, setDeckTitle] = useState("");
  const [form, setForm] = useState({
    front: "",
    back: "",
    hint: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    if (isCreateForDeck) {
      // Fetch deck title for display
      getDeck(id)
        .then((deck) => {
          if (!ignore) {
            setDeckTitle(deck.title);
            setDeckId(deck.id);
          }
        })
        .catch(() => {
          if (!ignore) setErrors({ detail: "Could not load deck." });
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    } else {
      // Fetch existing card
      getCard(id)
        .then((card) => {
          if (!ignore) {
            setForm({
              front: card.front || "",
              back: card.back || "",
              hint: card.hint || "",
            });
            setDeckId(card.deck);
            setDeckTitle(card.deck_title);
          }
        })
        .catch(() => {
          if (!ignore) setErrors({ detail: "Could not load card details." });
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }

    return () => {
      ignore = true;
    };
  }, [id, isCreateForDeck]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.detail) {
      setErrors((prev) => ({ ...prev, [name]: null, detail: null }));
    }
  };

  const handleSave = async (andAddAnother = false) => {
    setSaving(true);
    setErrors({});
    setSuccessToast("");

    try {
      if (isEdit) {
        await updateCard(id, form);
        navigate(`/decks/${deckId}`);
      } else {
        await createCard({
          ...form,
          deck: deckId,
        });

        if (andAddAnother) {
          // Clear inputs and show success confirmation
          setForm({ front: "", back: "", hint: "" });
          setSuccessToast("Card created! Ready for next card.");
          // Clear toast after 3 seconds
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          navigate(`/decks/${deckId}`);
        }
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        setErrors({ detail: "Failed to save card. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(false);
  };

  if (loading) {
    return <Loader fullScreen text="Loading card details..." />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to={`/decks/${deckId}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {deckTitle || "Deck"}</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            {deckTitle ? `Deck: ${deckTitle}` : "Flashcard"}
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {isEdit ? "Edit Flashcard" : "Add Flashcard"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {isEdit
              ? "Modify the prompt question and verified answer."
              : "Create a question and answer card. New cards automatically start in Leitner Box 1."}
          </p>
        </div>

        {successToast && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {errors.detail && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errors.detail}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question / Front */}
          <div>
            <label
              htmlFor="front"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700"
            >
              Question (Front) <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="front"
              name="front"
              rows={3}
              required
              value={form.front}
              onChange={handleChange}
              placeholder="What question will prompt your recall?"
              className={`mt-1.5 block w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors ${
                errors.front ? "border-rose-300 ring-1 ring-rose-200" : "border-stone-300"
              }`}
            />
            {errors.front && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.front[0]}
              </p>
            )}
          </div>

          {/* Answer / Back */}
          <div>
            <label
              htmlFor="back"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700"
            >
              Answer (Back) <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="back"
              name="back"
              rows={4}
              required
              value={form.back}
              onChange={handleChange}
              placeholder="The precise, complete answer revealed upon card flip..."
              className={`mt-1.5 block w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors ${
                errors.back ? "border-rose-300 ring-1 ring-rose-200" : "border-stone-300"
              }`}
            />
            {errors.back && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.back[0]}
              </p>
            )}
          </div>

          {/* Hint */}
          <div>
            <label
              htmlFor="hint"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700"
            >
              Recall Hint (optional)
            </label>
            <input
              id="hint"
              name="hint"
              type="text"
              maxLength={200}
              value={form.hint}
              onChange={handleChange}
              placeholder="A brief mnemonic or keyword hint before showing the answer"
              className={`mt-1.5 block w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors ${
                errors.hint ? "border-rose-300" : "border-stone-300"
              }`}
            />
            {errors.hint && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.hint[0]}
              </p>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/decks/${deckId}`)}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>

            {/* Save and add another (only on create mode) */}
            {isCreateForDeck && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-stone-800 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Save & add another</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : isEdit ? "Update Card" : "Save Card"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

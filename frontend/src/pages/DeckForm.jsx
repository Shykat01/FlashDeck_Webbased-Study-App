import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDeck, createDeck, updateDeck } from "../api/decks";
import Loader from "../components/Loader";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

const SUBJECT_OPTIONS = [
  { value: "PROGRAMMING", label: "Programming" },
  { value: "LANGUAGE", label: "Language" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OTHER", label: "Other" },
];

export default function DeckForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "OTHER",
    is_archived: false,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getDeck(id)
        .then((data) => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            subject: data.subject || "OTHER",
            is_archived: Boolean(data.is_archived),
          });
        })
        .catch(() => {
          setErrors({ detail: "Could not load deck for editing." });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name] || errors.detail) {
      setErrors((prev) => ({ ...prev, [name]: null, detail: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      if (isEdit) {
        await updateDeck(id, form);
        navigate(`/decks/${id}`);
      } else {
        const created = await createDeck(form);
        navigate(`/decks/${created.id}`);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        setErrors({ detail: "Something went wrong. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading deck details..." />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to={isEdit ? `/decks/${id}` : "/decks"}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {isEdit ? "deck" : "decks"}</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {isEdit ? "Edit Deck" : "Create New Deck"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {isEdit
              ? "Update deck title, subject classification, and description."
              : "Organize your study cards into a themed Leitner collection."}
          </p>
        </div>

        {errors.detail && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errors.detail}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deck Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={120}
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Django ORM Mastery"
              className={`mt-1.5 block w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors ${
                errors.title ? "border-rose-300 ring-1 ring-rose-200" : "border-stone-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.title[0]}
              </p>
            )}
          </div>

          {/* Subject Dropdown */}
          <div>
            <label
              htmlFor="subject"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700"
            >
              Subject Category
            </label>
            <select
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors"
            >
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.subject[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Brief summary of what this deck covers..."
              className="mt-1.5 block w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.description[0]}
              </p>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/decks/${id}` : "/decks")}
              className="px-4 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : isEdit ? "Save Changes" : "Create Deck"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

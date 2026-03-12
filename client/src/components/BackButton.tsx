import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}


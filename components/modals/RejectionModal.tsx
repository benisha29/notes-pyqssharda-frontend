"use client";

import { useState } from "react";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  itemType: "note" | "pyq" | "syllabus";
  itemTitle: string;
  isSubmitting?: boolean;
}

export default function RejectionModal({
  isOpen,
  onClose,
  onSubmit,
  itemType,
  itemTitle,
  isSubmitting = false,
}: RejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setError("Rejection reason must be at least 10 characters");
      return;
    }

    onSubmit(rejectionReason.trim());
    setRejectionReason("");
    setError("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRejectionReason("");
      setError("");
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center border-b-2 border-black">
          <div className="flex justify-center mb-4">
            <span className="w-12 h-12 rounded-full border-2 border-black bg-[#EF4444] flex items-center justify-center text-2xl text-white">
              ✕
            </span>
          </div>
          <h2 className="text-2xl font-black text-black mb-1">
            Reject {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Please provide a specific reason for rejection
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 pt-4">
          {/* Item Info */}
          <div className="mb-4 p-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              REJECTING ITEM
            </p>
            <p
              className="text-sm font-bold text-black line-clamp-1"
              title={itemTitle}
            >
              {itemTitle}
            </p>
          </div>

          {/* Rejection Reason Input */}
          <div className="mb-6">
            <label
              htmlFor="rejectionReason"
              className="block text-sm font-bold text-black mb-1 text-left"
            >
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setError("");
              }}
              placeholder="e.g. The file is blurry, Incorrect course code..."
              className="w-full px-4 py-3 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500 resize-none"
              rows={4}
              disabled={isSubmitting}
              maxLength={500}
            />

            <div className="flex justify-between items-center mt-2">
              <span
                className={`text-xs font-bold ${
                  error ? "text-red-500" : "text-gray-400"
                }`}
              >
                {error || "Min 10 characters"}
              </span>
              <span className="text-xs font-bold text-gray-400">
                {rejectionReason.length}/500
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white hover:bg-gray-50 border-2 border-black rounded-lg font-bold text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rejectionReason.trim()}
              className="w-full px-4 py-3 bg-[#EF4444] hover:bg-[#DC2626] border-2 border-black rounded-lg font-bold text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

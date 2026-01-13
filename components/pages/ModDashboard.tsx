"use client";

import { useEffect } from "react";
import { useModStore } from "@/stores/mod.store";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/authStore";

export default function ModDashboard() {
  const { user } = useAuthStore();
  const {
    pendingNotes,
    pendingPyqs,
    pendingSyllabus,
    isLoading,
    fetchPendingContent,
    approveItem,
    rejectItem,
  } = useModStore();

  useEffect(() => {
    fetchPendingContent();
  }, [fetchPendingContent]);

  const handleAction = async (
    id: string,
    type: "note" | "pyq" | "syllabus",
    action: "approve" | "reject"
  ) => {
    try {
      if (action === "approve") {
        await approveItem(id, type);
        toast.success("Item approved successfully");
      } else {
        await rejectItem(id, type);
        toast.success("Item rejected");
      }
    } catch (error) {
      toast.error("Failed to process action");
    }
  };

  const totalPending =
    pendingNotes.length + pendingPyqs.length + pendingSyllabus.length;

  return (
    <div className="min-h-screen bg-[#F2F4F8] p-8 font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 animate-fade-in-up">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-black text-black mb-2">
            Moderator <span className="text-[#C084FC]">Dashboard</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back, {user?.name || "Moderator"}. You have {totalPending}{" "}
            pending items to review.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <StatCard
              label="Total Pending"
              value={totalPending}
              color="bg-blue-100"
            />
            <StatCard
              label="Pending PYQs"
              value={pendingPyqs.length}
              color="bg-[#FF9F66]"
            />
            <StatCard
              label="Pending Notes"
              value={pendingNotes.length}
              color="bg-[#4ADE80]"
            />
            <StatCard
              label="Pending Syllabus"
              value={pendingSyllabus.length}
              color="bg-[#C084FC]"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PYQs Section */}
          <ModSection
            title="Pending PYQs"
            items={pendingPyqs}
            onApprove={(id) => handleAction(id, "pyq", "approve")}
            onReject={(id) => handleAction(id, "pyq", "reject")}
            type="pyq"
            color="#FF9F66"
          />

          {/* Notes Section */}
          <ModSection
            title="Pending Notes"
            items={pendingNotes}
            onApprove={(id) => handleAction(id, "note", "approve")}
            onReject={(id) => handleAction(id, "note", "reject")}
            type="note"
            color="#4ADE80"
          />

          {/* Syllabus Section */}
          <ModSection
            title="Pending Syllabus"
            items={pendingSyllabus}
            onApprove={(id) => handleAction(id, "syllabus", "approve")}
            onReject={(id) => handleAction(id, "syllabus", "reject")}
            type="syllabus"
            color="#C084FC"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`${color} border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 transition-transform hover:-translate-y-1`}
    >
      <div className="text-3xl font-black text-black mb-1">{value}</div>
      <div className="text-sm font-bold text-black/80 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function ModSection({
  title,
  items,
  onApprove,
  onReject,
  type,
  color,
}: {
  title: string;
  items: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  type: "note" | "pyq" | "syllabus";
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b-2 border-black bg-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-black text-black flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border-2 border-black"
            style={{ backgroundColor: color }}
          ></span>
          {title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[600px] p-6 space-y-4 custom-scrollbar bg-[#F2F4F8]/50">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-12 italic border-2 border-dashed border-gray-300 rounded-xl">
            No {title.toLowerCase()} to review. Good job! 🎉
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3
                  className="font-bold text-lg text-black line-clamp-1"
                  title={item.title}
                >
                  {item.title}
                </h3>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  {item.courseCode && (
                    <div className="inline-block px-2 py-1 bg-gray-100 border border-black rounded-md text-xs font-bold">
                      {item.courseCode}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-600 line-clamp-1">
                    {item.courseName || "No Course Name"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  By:{" "}
                  <span className="font-semibold text-black">
                    {item.userId?.name || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end gap-2">
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-500 mb-2">
                    {item.program || "Program n/a"} • Sem {item.semester || "?"}{" "}
                    {type === "pyq" && item.year && `• ${item.year}`}
                  </div>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-black underline decoration-2 hover:text-purple-600 transition-colors"
                  >
                    VIEW FILE →
                  </a>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(item._id)}
                    className="p-2 bg-green-100 hover:bg-green-200 border border-black rounded-lg transition-colors text-green-700 font-bold"
                    title="Approve"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => onReject(item._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 border border-black rounded-lg transition-colors text-red-700 font-bold"
                    title="Reject"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

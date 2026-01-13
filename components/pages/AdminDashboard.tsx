"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/stores/admin.store";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/authStore";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const {
    users,
    mods,
    modRequests,
    isLoading,
    fetchUsers,
    fetchMods,
    fetchModRequests,
    processModRequest,
    deleteUser,
    deactivateUser,
    activateUser,
    removeModRole,
  } = useAdminStore();

  useEffect(() => {
    fetchUsers();
    fetchMods();
    fetchModRequests();
  }, [fetchUsers, fetchMods, fetchModRequests]);

  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        if (confirm("Deactivate this user?")) await deactivateUser(id);
      } else {
        await activateUser(id);
      }
      toast.success(
        `User ${currentStatus ? "deactivated" : "activated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleModRequest = async (id: string, action: "approve" | "reject") => {
    try {
      await processModRequest(id, action);
      toast.success(`Request ${action}ed`);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleRemoveMod = async (id: string) => {
    if (confirm("Remove moderator role?")) {
      try {
        await removeModRole(id);
        toast.success("Moderator role removed");
      } catch (error) {
        toast.error("Failed to remove role");
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Delete user permanently?")) {
      try {
        await deleteUser(id);
        toast.success("User deleted");
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] p-8 font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 animate-fade-in-up">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-black text-black mb-2">
            Admin <span className="text-[#C084FC]">Dashboard</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back, {user?.name || "Admin"}. Manage your users and content
            creators efficiently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <StatCard
              label="Total Users"
              value={users.length}
              color="bg-blue-100"
            />
            <StatCard
              label="Active Moderators"
              value={mods.length}
              color="bg-[#FF9F66]"
            />
            <StatCard
              label="Pending Mod Requests"
              value={modRequests.length}
              color="bg-[#4ADE80]"
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
          {/* Users Section */}
          <AdminSection
            title="All Users"
            color="#93C5FD" // blue-300
          >
            {users.length === 0 ? (
              <EmptyState message="No users found." />
            ) : (
              users.map((u) => (
                <UserCard
                  key={u._id}
                  user={u}
                  onDeactivate={() => handleDeactivate(u._id, u.isActive)}
                  onDelete={() => handleDeleteUser(u._id)}
                />
              ))
            )}
          </AdminSection>

          {/* Moderators Section */}
          <AdminSection
            title="Moderators"
            color="#FF9F66" // orange-300
          >
            {mods.length === 0 ? (
              <EmptyState message="No moderators found." />
            ) : (
              mods.map((mod) => (
                <ModCard
                  key={mod._id}
                  mod={mod}
                  onRemove={() => handleRemoveMod(mod._id)}
                />
              ))
            )}
          </AdminSection>

          {/* Mod Requests Section */}
          <AdminSection
            title="Mod Requests"
            color="#4ADE80" // green-400
          >
            {modRequests.length === 0 ? (
              <EmptyState message="No pending requests." />
            ) : (
              modRequests.map((req: any) => (
                <RequestCard
                  key={req._id}
                  req={req}
                  onApprove={() => handleModRequest(req._id, "approve")}
                  onReject={() => handleModRequest(req._id, "reject")}
                />
              ))
            )}
          </AdminSection>
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

function AdminSection({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
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
        {children}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center text-gray-400 py-12 italic border-2 border-dashed border-gray-300 rounded-xl">
      {message}
    </div>
  );
}

function UserCard({
  user,
  onDeactivate,
  onDelete,
}: {
  user: any;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-black">{user.name}</h3>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-md text-[10px] uppercase font-black border border-black ${
            user.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={onDeactivate}
          className="flex-1 px-2 py-1.5 text-xs font-bold bg-yellow-100 hover:bg-yellow-200 border border-black rounded-lg transition-colors text-yellow-800"
        >
          {user.isActive ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1.5 text-xs font-bold bg-red-100 hover:bg-red-200 border border-black rounded-lg transition-colors text-red-800"
          title="Delete User"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function ModCard({ mod, onRemove }: { mod: any; onRemove: () => void }) {
  return (
    <div className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
      <div className="mb-3">
        <h3 className="font-bold text-lg text-black">{mod.name}</h3>
        <p className="text-xs text-gray-500">{mod.email}</p>
      </div>

      <button
        onClick={onRemove}
        className="w-full px-3 py-2 text-xs font-bold bg-orange-100 hover:bg-orange-200 border border-black rounded-lg transition-colors text-orange-800"
      >
        Remove Mod Role
      </button>
    </div>
  );
}

function RequestCard({
  req,
  onApprove,
  onReject,
}: {
  req: any;
  onApprove: () => void;
  onReject: () => void;
}) {
  const name = req.name || req.userId?.name || "Unknown";
  const email = req.email || req.userId?.email || "No Email";

  return (
    <div className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
      <div className="mb-3">
        <h3 className="font-bold text-lg text-black">{name}</h3>
        <p className="text-xs text-gray-500">{email}</p>
        <p className="text-xs font-medium text-purple-600 mt-1">
          Requesting: Moderator Access
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 py-2 bg-green-100 hover:bg-green-200 border border-black rounded-lg transition-colors text-green-700 font-bold text-xs"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-2 bg-red-100 hover:bg-red-200 border border-black rounded-lg transition-colors text-red-700 font-bold text-xs"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

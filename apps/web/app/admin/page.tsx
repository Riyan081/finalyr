"use client";

import { useState } from "react";
import { Users, Activity, Search, Shield, Sparkles, UserCheck, RefreshCw } from "lucide-react";
import { useAdminStats, useAllUsers } from "@/hooks/api-hooks";

export default function AdminDashboardPage() {
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: users, loading: usersLoading, refetch: refetchUsers } = useAllUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = (users || []).filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
  };

  return (
    <div className="space-y-8">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl">Admin Overview</h1>
          <p className="text-muted-foreground text-sm">
            Live system statistics & platform user registry.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="brutal-btn bg-card text-xs font-bold flex items-center gap-2 self-start sm:self-auto py-2 px-3"
        >
          <RefreshCw size={14} className={statsLoading || usersLoading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="brutal-card p-5 bg-digi-yellow/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Users
            </span>
            <Users size={18} className="text-primary" />
          </div>
          <div className="font-heading font-black text-3xl">
            {statsLoading ? "…" : stats?.totalUsers ?? users?.length ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Registered platform accounts</p>
        </div>

        <div className="brutal-card p-5 bg-digi-mint/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Sessions
            </span>
            <Activity size={18} className="text-emerald-600" />
          </div>
          <div className="font-heading font-black text-3xl">
            {statsLoading ? "…" : stats?.activeSessions ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Live tokens in storage</p>
        </div>

        <div className="brutal-card p-5 bg-digi-pink/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Creators
            </span>
            <Sparkles size={18} className="text-pink-600" />
          </div>
          <div className="font-heading font-black text-3xl">
            {usersLoading ? "…" : (users || []).filter((u) => u.role === "creator").length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Active creator storefronts</p>
        </div>

        <div className="brutal-card p-5 bg-digi-blue/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Administrators
            </span>
            <Shield size={18} className="text-blue-600" />
          </div>
          <div className="font-heading font-black text-3xl">
            {usersLoading ? "…" : (users || []).filter((u) => u.role === "admin").length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Platform superusers</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="brutal-card overflow-hidden">
        <div className="p-5 border-b-2 border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg">Platform Users</h2>
            <p className="text-xs text-muted-foreground">
              Fetched via <code className="bg-muted px-1 py-0.5 brutal-border">GET /api/users</code>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search name, email, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="brutal-input pl-8 pr-3 py-1.5 text-xs w-full sm:w-60"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex gap-1">
              {["all", "creator", "user", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 text-xs font-bold capitalize brutal-border transition-colors ${
                    roleFilter === r ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {usersLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm font-semibold">
            Loading platform users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No users matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/40 border-b-2 border-border text-xs uppercase font-heading">
                  <th className="p-3 pl-5">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 pr-5 text-right">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20">
                    <td className="p-3 pl-5 font-semibold flex items-center gap-2.5">
                      {u.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.image}
                          alt={u.name}
                          className="w-7 h-7 rounded-full brutal-border object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-black uppercase px-2 py-0.5 brutal-border ${
                          u.role === "admin"
                            ? "bg-destructive/20 text-destructive border-destructive"
                            : u.role === "creator"
                              ? "bg-digi-pink/30 text-pink-700"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 pr-5 text-right font-mono text-xs text-muted-foreground">
                      {u.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

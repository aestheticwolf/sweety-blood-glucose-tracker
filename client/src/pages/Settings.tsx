
import {
  UserRound,
  ShieldCheck,
  KeyRound,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Settings() {
  const { logout } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and personal preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-xl font-semibold text-teal-700">
            U
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your Account</h2>
            <p className="text-sm text-slate-500">Glucose Tracker</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Account */}
        <div className="flex items-center gap-4 border-b border-slate-100 p-5">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <UserRound size={20} />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Account Information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Manage your personal account details.
            </p>
          </div>

          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Security */}
        <div className="flex items-center gap-4 border-b border-slate-100 p-5">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <ShieldCheck size={20} />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">Security</h3>
            <p className="mt-1 text-sm text-slate-500">
              Your account security and password.
            </p>
          </div>

          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Password */}
        <div className="flex items-center gap-4 border-b border-slate-100 p-5">
          <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
            <KeyRound size={20} />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Password & Privacy
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Keep your account information secure.
            </p>
          </div>

          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Logout */}
        <button
  onClick={logout}
  className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-rose-50"
>
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <LogOut size={20} />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-rose-600">Log Out</h3>
            <p className="mt-1 text-sm text-slate-500">
              Sign out of your account.
            </p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400">
        Sweety Glucose Tracker
      </div>
    </div>
  );
}

export default Settings;

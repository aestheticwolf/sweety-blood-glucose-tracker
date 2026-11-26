import { Bell } from "lucide-react";

function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">
      {/* Left side */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome back 👋
        </h2>
        <p className="text-sm text-slate-500">
          Here's your health overview for today.
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
            U
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">Your Account</p>
            <p className="text-xs text-slate-500">Glucose Tracker</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
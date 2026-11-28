import { LayoutDashboard, Activity, ChartNoAxesCombined, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "Blood Glucose",
    icon: Activity,
    path: "/readings",
  },
  {
    name: "Reports",
    icon: ChartNoAxesCombined,
    path: "/reports",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function Sidebar() {
  const { user } = useAuth();
  const userName = user?.name?.trim() || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6">
      {/* Brand */}
      <div className="mb-10 flex items-center gap-3">
        <img
          src="/branding/sweety-icon.svg"
          alt="Sweety icon"
          className="h-11 w-11 shrink-0"
        />

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sweety
          </h1>
          <p className="text-xs text-slate-500">Glucose Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Profile */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
            {userInitial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {userName}
            </p>
            <p className="truncate text-xs text-slate-500">Personal health</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
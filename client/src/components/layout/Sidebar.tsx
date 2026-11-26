import { LayoutDashboard, Activity, ChartNoAxesCombined, Settings, Heart } from "lucide-react";

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
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-5 py-6">
      {/* Brand */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
          <Heart size={22} fill="currentColor" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sweety
          </h1>
          <p className="text-xs text-slate-500">Glucose Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.name}
                href={item.path}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon size={19} />
                {item.name}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Bottom Profile */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
            U
          </div>

          <div>
            <p className="text-sm font-medium text-slate-800">Your Account</p>
            <p className="text-xs text-slate-500">Personal health</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
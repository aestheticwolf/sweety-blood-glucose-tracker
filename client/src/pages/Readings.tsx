
import { Plus, Droplets, Pencil, Trash2, CalendarDays } from "lucide-react";

const readings = [
  {
    id: 1,
    date: "Nov 27, 2026",
    slot: "Morning",
    value: 98,
    time: "7:30 AM",
  },
  {
    id: 2,
    date: "Nov 27, 2026",
    slot: "After Breakfast",
    value: 148,
    time: "9:15 AM",
  },
  {
    id: 3,
    date: "Nov 27, 2026",
    slot: "After Lunch",
    value: 126,
    time: "2:00 PM",
  },
  {
    id: 4,
    date: "Nov 26, 2026",
    slot: "After Dinner",
    value: 135,
    time: "9:30 PM",
  },
  {
    id: 5,
    date: "Nov 26, 2026",
    slot: "Morning",
    value: 105,
    time: "7:45 AM",
  },
];

function Readings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Blood Glucose
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and review your glucose readings.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700">
          <Plus size={18} />
          Add Reading
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Readings</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">24</h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Logged Today</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">3</h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Latest Reading</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                126 <span className="text-sm font-medium text-slate-500">mg/dL</span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Readings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <h2 className="font-semibold text-slate-900">Reading History</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your recorded glucose measurements
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Reading Slot</th>
                <th className="px-5 py-3.5">Value</th>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {readings.map((reading) => (
                <tr key={reading.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {reading.date}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                      {reading.slot}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-900">
                      {reading.value}
                    </span>
                    <span className="ml-1 text-xs text-slate-500">mg/dL</span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {reading.time}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        aria-label="Edit reading"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete reading"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Readings;

import { Award, Banknote, BriefcaseBusiness, Globe2 } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import type { AnalyticsData } from "../types";

interface Props {
  data: AnalyticsData | null;
  loading: boolean;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function TablePanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-emerald-700 ring-1 ring-slate-200">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export default function AnalyticsCards({ data, loading }: Props) {
  if (loading || !data) return null;

  return (
    <div className="space-y-6">
      <TablePanel title="Salary by Country" icon={Globe2}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide">
                Country
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Headcount
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Min Salary
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Max Salary
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Avg Salary
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Total Payroll
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.country_analytics.map((c) => (
              <tr key={c.country} className="transition hover:bg-emerald-50/35">
                <td className="px-5 py-4 font-semibold text-slate-950">
                  {c.country}
                </td>
                <td className="px-5 py-4 text-right text-slate-600">
                  {c.count.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-right text-slate-600">
                  {formatCurrency(c.min_salary)}
                </td>
                <td className="px-5 py-4 text-right text-slate-600">
                  {formatCurrency(c.max_salary)}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                  {formatCurrency(c.avg_salary)}
                </td>
                <td className="px-5 py-4 text-right text-slate-600">
                  {formatCurrency(c.total_payroll)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablePanel>

      <TablePanel title="Average Salary by Job Title" icon={BriefcaseBusiness}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide">
                Job Title
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide">
                Country
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Count
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Avg Salary
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.job_analytics.slice(0, 20).map((j) => (
              <tr key={j.key} className="transition hover:bg-emerald-50/35">
                <td className="px-5 py-4 font-semibold text-slate-950">
                  {j.job_title}
                </td>
                <td className="px-5 py-4 text-slate-600">{j.country}</td>
                <td className="px-5 py-4 text-right text-slate-600">
                  {j.count}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                  {formatCurrency(j.avg_salary)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablePanel>

      <TablePanel title="Department Overview" icon={Banknote}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide">
                Department
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Headcount
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Avg Salary
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Total Payroll
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.department_analytics.map((d) => (
              <tr
                key={d.department}
                className="transition hover:bg-emerald-50/35"
              >
                <td className="px-5 py-4 font-semibold text-slate-950">
                  {d.department}
                </td>
                <td className="px-5 py-4 text-right text-slate-600">
                  {d.count.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                  {formatCurrency(d.avg_salary)}
                </td>
                <td className="px-5 py-4 text-right text-slate-600">
                  {formatCurrency(d.total_payroll)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablePanel>

      <TablePanel title="Top 10 Earners" icon={Award}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide">
                Rank
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide">
                Name
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide">
                Job Title
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide">
                Country
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                Salary
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.top_earners.map((e, i) => (
              <tr key={e.id} className="transition hover:bg-emerald-50/35">
                <td className="px-5 py-4 font-bold text-slate-400">#{i + 1}</td>
                <td className="px-5 py-4 font-semibold text-slate-950">
                  {e.full_name}
                </td>
                <td className="px-5 py-4 text-slate-600">{e.job_title}</td>
                <td className="px-5 py-4 text-slate-600">{e.country}</td>
                <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                  {formatCurrency(e.salary)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablePanel>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart3, Filter, RefreshCw, X } from "lucide-react";
import AnalyticsCards from "../components/AnalyticsCards";
import FilterSelect from "../components/FilterSelect";
import { fetchAnalytics, fetchFilters } from "../lib/api";
import type { AnalyticsData, Filters } from "../types";

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    countries: [],
    job_titles: [],
    departments: [],
  });
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const hasLoadedRef = useRef(false);

  const load = useCallback(async () => {
    if (hasLoadedRef.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [analytics, filterOpts] = await Promise.all([
        fetchAnalytics({ country: selectedCountry, job_title: selectedJob }),
        fetchFilters(),
      ]);
      setData(analytics);
      setFilters(filterOpts);
    } catch (err) {
      console.error(err);
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCountry, selectedJob]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 md:flex-row md:items-start md:justify-between md:px-6">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </p>
            <h1 className="text-xl font-bold text-slate-950 md:text-2xl">
              Salary Insights
            </h1>
            <p className="mt-2 max-w-none text-sm leading-6 text-slate-500 xl:whitespace-nowrap">
              Monitor payroll, salary ranges, and compensation patterns across
              countries, roles, and departments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={load}
              disabled={loading || refreshing}
              aria-label="Refresh dashboard"
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading || refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                <Filter className="h-4 w-4" />
              </span>
              Filters
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedCountry("");
                  setSelectedJob("");
                }}
                disabled={!selectedCountry && !selectedJob}
                className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[11px] font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
              {(selectedCountry || selectedJob) && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Filtered view
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(150px,190px)_minmax(180px,250px)] lg:items-end">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Country
              </span>
              <FilterSelect
                ariaLabel="Filter salary insights by country"
                value={selectedCountry}
                onChange={setSelectedCountry}
                options={[
                  { value: "", label: "All Countries" },
                  ...filters.countries.map((country) => ({
                    value: country,
                    label: country,
                  })),
                ]}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Job Title
              </span>
              <FilterSelect
                ariaLabel="Filter salary insights by job title"
                value={selectedJob}
                onChange={setSelectedJob}
                options={[
                  { value: "", label: "All Titles" },
                  ...filters.job_titles.map((job) => ({
                    value: job,
                    label: job,
                  })),
                ]}
              />
            </label>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="h-4 w-28 rounded bg-slate-200"></div>
                      <div className="h-10 w-10 rounded-lg bg-slate-200"></div>
                    </div>
                    <div className="h-8 w-40 rounded bg-slate-200"></div>
                  </div>
                ))}
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Total Employees",
                    value: data.overall.total_employees.toLocaleString(),
                    icon: "Users",
                    accent: "text-sky-700",
                    bg: "bg-sky-50",
                  },
                  {
                    label: "Total Payroll",
                    value: new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(data.overall.total_payroll),
                    icon: "DollarSign",
                    accent: "text-emerald-700",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Average Salary",
                    value: new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(data.overall.avg_salary),
                    icon: "TrendingUp",
                    accent: "text-indigo-700",
                    bg: "bg-indigo-50",
                  },
                  {
                    label: "Salary Range",
                    value: `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(data.overall.min_salary)} - ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(data.overall.max_salary)}`,
                    icon: "TrendingDown",
                    accent: "text-amber-700",
                    bg: "bg-amber-50",
                  },
                ].map((card) => {
                  const iconMap = {
                    Users: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    ),
                    DollarSign: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    TrendingUp: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    ),
                    TrendingDown: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                        />
                      </svg>
                    ),
                  };
                  return (
                    <article
                      key={card.label}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {card.label}
                        </span>
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${card.bg} ${card.accent}`}
                        >
                          {iconMap[card.icon as keyof typeof iconMap]}
                        </span>
                      </div>
                      <div className="wrap-break-word text-xl font-bold leading-tight text-slate-950">
                        {card.value}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <AnalyticsCards data={data} loading={loading} />
      </div>
    </div>
  );
}

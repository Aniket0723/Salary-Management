import { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart3, Filter, RefreshCw, X } from 'lucide-react';
import AnalyticsCards from '../components/AnalyticsCards';
import FilterSelect from '../components/FilterSelect';
import { fetchAnalytics, fetchFilters } from '../lib/api';
import type { AnalyticsData, Filters } from '../types';

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({ countries: [], job_titles: [], departments: [] });
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
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

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </p>
          <h1 className="text-xl font-bold text-slate-950 md:text-2xl">Salary Insights</h1>
          <p className="mt-2 max-w-none text-sm leading-6 text-slate-500 xl:whitespace-nowrap">
            Monitor payroll, salary ranges, and compensation patterns across countries, roles, and departments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={load}
            disabled={loading || refreshing}
            aria-label="Refresh dashboard"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-50 text-emerald-700">
              <Filter className="h-4 w-4" />
            </span>
            Filters
          </div>
          {(selectedCountry || selectedJob) && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Filtered view
            </span>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(150px,190px)_minmax(180px,250px)_1fr] lg:items-end">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Country</span>
            <FilterSelect
              ariaLabel="Filter salary insights by country"
              value={selectedCountry}
              onChange={setSelectedCountry}
              options={[
                { value: '', label: 'All Countries' },
                ...filters.countries.map(country => ({ value: country, label: country })),
              ]}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Job Title</span>
            <FilterSelect
              ariaLabel="Filter salary insights by job title"
              value={selectedJob}
              onChange={setSelectedJob}
              options={[
                { value: '', label: 'All Titles' },
                ...filters.job_titles.map(job => ({ value: job, label: job })),
              ]}
            />
          </label>
          <button
            onClick={() => { setSelectedCountry(''); setSelectedJob(''); }}
            disabled={!selectedCountry && !selectedJob}
            className="inline-flex h-9 w-fit items-center justify-center justify-self-start gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[11px] font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 lg:justify-self-end"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      </section>

      <AnalyticsCards data={data} loading={loading} />
    </div>
  );
}

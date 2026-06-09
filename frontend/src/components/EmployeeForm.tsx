import { useState, useEffect } from 'react';
import { Save, UserRound, X } from 'lucide-react';
import type { Employee } from '../types';
import { createEmployee, updateEmployee, fetchFilters } from '../lib/api';

interface Props {
  employee?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

type EmployeePayload = Omit<Employee, 'id' | 'created_at'>;

export default function EmployeeForm({ employee, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    full_name: '',
    job_title: '',
    country: '',
    salary: '',
    department: '',
    employment_type: 'Full-time',
    currency: 'USD',
  });
  const [filters, setFilters] = useState({ countries: [] as string[], job_titles: [] as string[], departments: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!employee;

  useEffect(() => {
    if (employee) {
      setForm({
        full_name: employee.full_name,
        job_title: employee.job_title,
        country: employee.country,
        salary: String(employee.salary),
        department: employee.department,
        employment_type: employee.employment_type,
        currency: employee.currency,
      });
    }
    fetchFilters().then(setFilters).catch(() => {});
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: EmployeePayload = { ...form, salary: Number(form.salary) };
      if (isEdit && employee) {
        await updateEmployee({ ...payload, id: employee.id });
      } else {
        await createEmployee(payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-slate-950/10">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50/80 p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">Employee Record</p>
              <h2 className="text-xl font-bold text-slate-950">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close employee form"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-88px)] space-y-5 overflow-y-auto p-5 md:p-6">
          {error && <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Full Name *</label>
            <input
              required
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="e.g. John Smith"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Job Title *</label>
              <select
                required
                value={form.job_title}
                onChange={e => setForm({ ...form, job_title: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">Select...</option>
                {filters.job_titles.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Department</label>
              <select
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">Select...</option>
                {filters.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Country *</label>
              <select
                required
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">Select...</option>
                {filters.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Salary (USD) *</label>
              <input
                required
                type="number"
                min="0"
                value={form.salary}
                onChange={e => setForm({ ...form, salary: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="e.g. 95000"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Employment Type</label>
              <select
                value={form.employment_type}
                onChange={e => setForm({ ...form, employment_type: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option>Full-time</option>
                <option>Contract</option>
                <option>Part-time</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Currency</label>
              <input
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="USD"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

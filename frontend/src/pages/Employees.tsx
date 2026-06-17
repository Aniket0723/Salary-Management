import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import EmployeeForm from "../components/EmployeeForm";
import FilterSelect from "../components/FilterSelect";
import { fetchEmployees, deleteEmployee, fetchFilters } from "../lib/api";
import type { Employee, Filters } from "../types";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    countries: [],
    job_titles: [],
    departments: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [result, filterOpts] = await Promise.all([
        fetchEmployees({
          page,
          limit,
          search,
          country: countryFilter,
          job_title: jobFilter,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
        fetchFilters(),
      ]);
      setEmployees(result.data);
      setCount(result.count);
      setFilters(filterOpts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, countryFilter, jobFilter, sortBy, sortOrder]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteEmployee(id);
      load();
    } catch {
      alert("Failed to delete employee");
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const totalPages = Math.ceil(count / limit);
  const hasFilters = Boolean(search || countryFilter || jobFilter);
  const firstVisible = count === 0 ? 0 : (page - 1) * limit + 1;
  const lastVisible = Math.min(page * limit, count);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const columns = [
    { key: "id", label: "ID" },
    { key: "full_name", label: "Name" },
    { key: "job_title", label: "Job Title" },
    { key: "department", label: "Department" },
    { key: "country", label: "Country" },
    { key: "salary", label: "Salary" },
    { key: "employment_type", label: "Type" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 md:flex-row md:items-start md:justify-between md:px-6">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <UserRound className="h-4 w-4" />
              Employee Records
            </p>
            <h1 className="text-xl font-bold text-slate-950 md:text-2xl">
              Employees
            </h1>
            <p className="mt-2 max-w-none text-sm leading-6 text-slate-500 xl:whitespace-nowrap">
              Manage salary records, filter across countries and roles, and keep
              compensation data current.
            </p>
          </div>
          <button
            onClick={() => {
              setEditEmployee(null);
              setShowForm(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>

        <div className="p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                <Filter className="h-4 w-4" />
              </span>
              Filters
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {count.toLocaleString()} total employees
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(150px,190px)_minmax(180px,250px)_auto] lg:items-end">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Search
              </span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search code, name, email, title, or department"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[11px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Country
              </span>
              <FilterSelect
                ariaLabel="Filter employees by country"
                value={countryFilter}
                onChange={(value) => {
                  setCountryFilter(value);
                  setPage(1);
                }}
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
                ariaLabel="Filter employees by job title"
                value={jobFilter}
                onChange={(value) => {
                  setJobFilter(value);
                  setPage(1);
                }}
                options={[
                  { value: "", label: "All Job Titles" },
                  ...filters.job_titles.map((job) => ({
                    value: job,
                    label: job,
                  })),
                ]}
              />
            </label>
            <button
              onClick={() => {
                setSearch("");
                setCountryFilter("");
                setJobFilter("");
                setPage(1);
              }}
              disabled={!hasFilters}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[11px] font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Employee Directory</h2>
            <p className="text-sm text-slate-500">
              Showing {firstVisible.toLocaleString()} -{" "}
              {lastVisible.toLocaleString()} of {count.toLocaleString()}
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sorted by {sortBy.replace("_", " ")} {sortOrder}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-white text-slate-500">
              <tr className="border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="cursor-pointer select-none px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <ArrowUpDown
                        className={`h-3.5 w-3.5 ${sortBy === col.key ? "text-emerald-700" : "text-slate-300"}`}
                      />
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-semibold text-slate-700">
                      No employees found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try adjusting your filters or add a new employee.
                    </p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="transition hover:bg-emerald-50/35"
                  >
                    <td className="px-5 py-4 font-medium text-slate-400">
                      #{emp.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-950">
                        {emp.full_name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {emp.job_title}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{emp.country}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">
                      {formatCurrency(emp.salary)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          emp.employment_type === "Full-time"
                            ? "bg-emerald-50 text-emerald-700"
                            : emp.employment_type === "Contract"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {emp.employment_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditEmployee(emp);
                            setShowForm(true);
                          }}
                          aria-label={`Edit ${emp.full_name}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-transparent text-slate-400 transition hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          aria-label={`Delete ${emp.full_name}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-transparent text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center text-sm font-medium text-slate-600">
              {firstVisible.toLocaleString()}-{lastVisible.toLocaleString()}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <EmployeeForm
          employee={editEmployee}
          onClose={() => setShowForm(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}

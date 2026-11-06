import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Grid,
  List,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { applicationApi } from '../services/api.js';
import { ApplicationModal } from '../components/applications/ApplicationModal.jsx';
import { format } from 'date-fns';

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Debounce search input to eliminate jank
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchApps = async () => {
    if (applications.length === 0) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }

    try {
      const res = await applicationApi.getAll({
        search: debouncedSearch,
        status: statusFilter,
        source: sourceFilter,
        page: page.toString(),
        limit: '20',
      });

      if (res.success && res.data) {
        setApplications(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [debouncedSearch, statusFilter, sourceFilter, page]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this application and its event history?')) return;
    
    // Instant 0ms optimistic UI removal
    const previousApps = [...applications];
    const previousTotal = totalCount;
    setApplications((prev) => prev.filter((app) => app._id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));

    try {
      await applicationApi.delete(id);
    } catch (err) {
      setApplications(previousApps);
      setTotalCount(previousTotal);
      console.error('Failed to delete application:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Interview':
        return 'bg-[#EDE8FF] text-[#7652E8] border-violet-200/60';
      case 'Assessment':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Applied':
        return 'bg-sky-50 text-sky-700 border-sky-200/60';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'Saved':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Applications</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, filter, and manage all your active and historical job applications ({totalCount})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-violet-100 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-[#7652E8] text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#7652E8] text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedApp(null);
              setModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Job</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-violet-100/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by company, title, or location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none focus:border-[#7652E8] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7652E8]"
          >
            <option value="All">All Statuses</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Assessment">Assessment</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="On Hold">On Hold</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7652E8]"
          >
            <option value="All">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Company Website">Company Website</option>
            <option value="Workday">Workday</option>
            <option value="Greenhouse">Greenhouse</option>
            <option value="Lever">Lever</option>
            <option value="Naukri">Naukri</option>
            <option value="Internshala">Internshala</option>
            <option value="Referral">Referral</option>
          </select>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading && applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-violet-100/60 space-y-4 animate-pulse">
          <div className="h-8 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-violet-100/60 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE8FF] text-[#7652E8] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No applications found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            {search || statusFilter !== 'All'
              ? 'No jobs match your current search and filter criteria.'
              : "You haven't tracked any applications yet. Add your first application to start gathering intelligence!"}
          </p>
          <button
            onClick={() => {
              setSelectedApp(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer"
          >
            + Add First Application
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <>
          {/* Desktop/Tablet Table (>= md) */}
          <div className="hidden md:block bg-white rounded-3xl shadow-xs border border-violet-100/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-violet-100/60 bg-[#FAF9FE] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Company</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Applied Date</th>
                    <th className="py-3.5 px-6">Source</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-50 text-xs text-slate-700">
                  {applications.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-violet-50/40 transition-colors group cursor-pointer"
                      onClick={() => (window.location.href = `/applications/${app._id}`)}
                    >
                      <td className="py-4 px-6 font-bold text-slate-800">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center font-bold text-[#7652E8] text-xs shrink-0 border border-violet-100/50">
                            {app.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="group-hover:text-[#7652E8] transition-colors">
                            {app.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{app.jobTitle}</td>
                      <td className="py-4 px-6 text-slate-500">{app.jobLocation || 'Remote'}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {app.appliedDate ? format(new Date(app.appliedDate), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium text-[11px]">
                          {app.source}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/applications/${app._id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#7652E8] hover:bg-violet-50 transition-colors"
                            title="View Timeline & Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#7652E8] hover:bg-violet-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(app._id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List (< md) */}
          <div className="md:hidden space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                onClick={() => (window.location.href = `/applications/${app._id}`)}
                className="bg-white rounded-2xl p-4 border border-[#ECE8FB] shadow-xs active:scale-99 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center font-bold text-[#7652E8] text-xs shrink-0 border border-violet-100/50">
                      {app.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-800 truncate">{app.companyName}</h3>
                      <p className="text-[11px] text-slate-400 truncate">{app.jobTitle}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-violet-50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{app.source}</span>
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#7652E8]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(app._id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {applications.map((app) => (
            <Link
              key={app._id}
              to={`/applications/${app._id}`}
              className="bg-white rounded-3xl p-5 shadow-xs border border-violet-100/60 hover:border-violet-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center font-bold text-[#7652E8] text-sm shrink-0 border border-violet-100/50">
                      {app.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#7652E8] transition-colors">
                        {app.companyName}
                      </h3>
                      <p className="text-xs text-slate-400">{app.jobTitle}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-violet-50 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.jobLocation || 'Remote'}</span>
                  </div>
                  <span>{app.appliedDate ? format(new Date(app.appliedDate), 'MMM d, yyyy') : ''}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Showing Page {page} of {totalPages} ({totalCount} total applications)
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white border border-violet-100 text-slate-500 hover:bg-violet-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-white border border-violet-100 text-slate-500 hover:bg-violet-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <ApplicationModal
          isOpen={modalOpen}
          initialData={selectedApp}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchApps();
          }}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;


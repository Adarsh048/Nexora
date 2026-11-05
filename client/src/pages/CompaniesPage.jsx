import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Briefcase,
  Globe,
} from 'lucide-react';
import { companyApi } from '../services/api.js';

export const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'Technology',
    location: 'Remote',
    website: '',
    notes: '',
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyApi.getAll(search);
      if (res.success && res.data) {
        setCompanies(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) return;

    try {
      await companyApi.create(newCompany);
      setModalOpen(false);
      setNewCompany({ name: '', industry: 'Technology', location: 'Remote', website: '', notes: '' });
      fetchCompanies();
    } catch (err) {
      alert(err.message || 'Failed to add company');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Companies Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Target employer directory with aggregated roles, recruiters, and historical notes
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-violet-100/60 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company by name, industry, or location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none focus:border-[#7652E8]"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-48 bg-white rounded-3xl" />
          <div className="h-48 bg-white rounded-3xl" />
          <div className="h-48 bg-white rounded-3xl" />
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-violet-100 shadow-xs">
          <Building2 className="w-10 h-10 text-violet-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No companies found</h3>
          <p className="text-xs text-slate-400 mt-1">Companies are automatically generated when tracking applications, or you can add them manually.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="bg-white rounded-3xl p-6 shadow-xs border border-violet-100/70 hover:shadow-md hover:border-violet-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top: Logo & Name */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center font-black text-[#7652E8] text-sm shrink-0 border border-violet-100/60 shadow-2xs">
                      {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#7652E8] transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-xs text-slate-400">{company.industry}</p>
                    </div>
                  </div>

                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-[#7652E8] p-1"
                      title="Visit company website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Location */}
                <div className="mt-3 flex items-center space-x-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.location || 'Remote'}</span>
                </div>

                {/* Notes */}
                {company.notes && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 bg-violet-50/40 p-2.5 rounded-xl border border-violet-100/30">
                    {company.notes}
                  </p>
                )}

                {/* Applications list under company */}
                <div className="mt-4 pt-3 border-t border-violet-50">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#7652E8]" />
                      <span>Tracked Roles</span>
                    </span>
                    <span className="text-[11px] bg-violet-100 text-[#7652E8] px-2 py-0.5 rounded-full">
                      {company.applicationsCount || 0}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {company.applications && company.applications.length > 0 ? (
                      company.applications.map((app) => (
                        <Link
                          key={app._id}
                          to={`/applications/${app._id}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9FE] hover:bg-violet-50 text-xs transition-colors"
                        >
                          <span className="font-semibold text-slate-700 truncate">{app.jobTitle}</span>
                          <span className="text-[10px] font-bold text-violet-600 px-2 py-0.5 rounded bg-violet-100">
                            {app.status}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No roles recorded for this company</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-violet-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Add Company</h3>
            <form onSubmit={handleCreateCompany} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Stripe, OpenAI, Microsoft"
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none focus:border-[#7652E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  placeholder="e.g. FinTech, SaaS, AI, HealthTech"
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  placeholder="https://company.com"
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7652E8] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;


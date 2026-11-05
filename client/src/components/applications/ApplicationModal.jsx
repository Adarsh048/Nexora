import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Building2, Briefcase, Globe } from 'lucide-react';
import { applicationApi } from '../../services/api.js';

export const ApplicationModal = ({
  isOpen = false,
  onClose,
  onSaved,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    source: 'LinkedIn',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateNotice, setDuplicateNotice] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        jobTitle: initialData.jobTitle || '',
        source: initialData.source || 'LinkedIn',
      });
    } else {
      setFormData({
        companyName: '',
        jobTitle: '',
        source: 'LinkedIn',
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDuplicateNotice(null);

    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      setError('Please provide both the company name and position.');
      return;
    }

    setLoading(true);

    try {
      if (initialData?._id) {
        const res = await applicationApi.update(initialData._id, formData);
        if (res.success && res.data) {
          onSaved?.(res.data);
        }
      } else {
        const res = await applicationApi.create({
          ...formData,
          status: 'Applied',
          appliedDate: new Date().toISOString(),
        });
        if (res.success && res.data) {
          if (res.duplicateWarning) {
            setDuplicateNotice(res.duplicateWarning);
          }
          onSaved?.(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save application');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0E0A22]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-violet-100 overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-violet-50 flex items-center justify-between bg-gradient-to-r from-violet-50/50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EDE8FF] flex items-center justify-center text-[#7652E8] shadow-2xs shrink-0">
              <Briefcase className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                {initialData ? 'Edit Application' : 'Add New Application'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Quick 3-field application tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center space-x-2 text-rose-600 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {duplicateNotice && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex items-center space-x-2 text-amber-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{duplicateNotice}</span>
            </div>
          )}

          {/* 1. Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Company Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="companyName"
                required
                autoFocus
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Google, Stripe, Visa, Microsoft"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#7652E8] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* 2. Position / Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Position / Role *
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Software Engineer, SDE Intern, Frontend Developer"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#7652E8] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* 3. Job Application Platform */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Job Application Platform
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-bold text-slate-700 focus:outline-none focus:border-[#7652E8] focus:bg-white transition-colors"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Indeed">Indeed</option>
                <option value="Company Website">Company Careers Website</option>
                <option value="Wellfound">Wellfound (AngelList)</option>
                <option value="Glassdoor">Glassdoor</option>
                <option value="Naukri">Naukri</option>
                <option value="Internshala">Internshala</option>
                <option value="Workday">Workday</option>
                <option value="Greenhouse">Greenhouse</option>
                <option value="Lever">Lever</option>
                <option value="Employee Referral">Employee Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-violet-50 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Application' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;


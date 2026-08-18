import React from 'react';
import { LuClipboardList, LuCalendar } from 'react-icons/lu';

export default function TeacherApplyLeavePage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          <LuClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="text-sm text-gray-500">Submit a new leave request for approval</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Leave Type</label>
            <select className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-gray-50 text-gray-800">
              <option value="">Select type...</option>
              <option value="CL">Casual Leave (CL)</option>
              <option value="SL">Sick Leave (SL)</option>
              <option value="ML">Maternity/Paternity</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">From Date</label>
              <div className="relative">
                <LuCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-gray-50 text-gray-800" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">To Date</label>
              <div className="relative">
                <LuCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-gray-50 text-gray-800" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for Leave</label>
            <textarea 
              rows="4" 
              placeholder="Please provide details..."
              className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-gray-50 text-gray-800 resize-none"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

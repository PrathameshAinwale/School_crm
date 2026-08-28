import React, { useState } from 'react';
import { LuKey, LuCopy, LuCheck, LuX, LuShieldCheck, LuUser } from 'react-icons/lu';

export default function CredentialsModal({ isOpen, onClose, credentials, title = 'Login Credentials Generated' }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !credentials) return null;

  const loginId = credentials.email || credentials.login_mobile || credentials.guardian_phone || '';
  const password = credentials.temporary_password || '';

  const copyToClipboard = () => {
    const text = `School CRM Login Credentials:\nIdentifier: ${loginId}\nTemporary Password: ${password}\nPlease change your password on first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <LuShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">{title}</h3>
              <p className="text-primary-100 text-xs">Share these credentials with the user</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Credentials Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
            <strong>First-time Login:</strong> The user will be automatically prompted to create their permanent password upon logging in with these credentials.
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {credentials.name && (
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="text-slate-800 font-semibold">{credentials.name}</span>
              </div>
            )}
            {credentials.role && (
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Portal Access:</span>
                <span className="text-indigo-700 font-bold uppercase tracking-wider text-[10px] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {credentials.role === 'admin'
                    ? 'School Admin Portal'
                    : credentials.role === 'accountant'
                    ? 'Accounts & Finance Portal'
                    : credentials.role === 'hr'
                    ? 'HR Portal'
                    : 'Teacher Portal'}
                </span>
              </div>
            )}
            {credentials.teacher_id && (
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Employee ID:</span>
                <span className="text-primary-700 font-mono font-bold">{credentials.teacher_id}</span>
              </div>
            )}
            {credentials.admission_number && (
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Admission No:</span>
                <span className="text-primary-700 font-mono font-bold">{credentials.admission_number}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Login ID (Email/Phone):</span>
              <span className="text-slate-900 font-mono font-bold select-all">{loginId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Auto-generated Password:</span>
              <span className="text-rose-600 font-mono font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 select-all">
                {password}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {copied ? <LuCheck className="w-4 h-4 text-emerald-300" /> : <LuCopy className="w-4 h-4" />}
              {copied ? 'Credentials Copied!' : 'Copy Credentials'}
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

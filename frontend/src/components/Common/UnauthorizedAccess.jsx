import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LuShieldAlert, LuArrowLeft, LuLayoutDashboard } from 'react-icons/lu';

export default function UnauthorizedAccess({ allowedRoles = [], moduleName = 'this section' }) {
  const { currentRole, ROLE_LABELS } = useAuth();
  const navigate = useNavigate();

  const currentRoleName = ROLE_LABELS[currentRole] || currentRole;
  const allowedRolesText = allowedRoles.map(r => ROLE_LABELS[r] || r).join(' or ');

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-8 text-center animate-scale-up">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100 shadow-inner">
          <LuShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-2">
          Access Restricted
        </span>

        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Unauthorized Module Access
        </h2>

        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          You are currently signed in as <strong className="text-slate-900 font-semibold">{currentRoleName}</strong>. 
          Your account role does not have permission to access <strong className="text-slate-900">{moduleName}</strong>.
        </p>

        {allowedRoles.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-6 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Required Role(s):</span> {allowedRolesText}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <LuLayoutDashboard className="w-4 h-4" />
            Go to My Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LuArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

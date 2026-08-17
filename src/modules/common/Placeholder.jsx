import { useLocation } from 'react-router-dom';
import { LuConstruction } from 'react-icons/lu';

export default function Placeholder() {
  const location = useLocation();
  const pageName = location.pathname.replace('/', '').replace(/-/g, ' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
        <LuConstruction className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2 capitalize">{pageName || 'Page'}</h2>
      <p className="text-gray-500 text-sm max-w-md">
        This module is coming soon. It will be built in the next phase.
      </p>
      <div className="mt-4 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium">
        🚧 Under Development
      </div>
    </div>
  );
}

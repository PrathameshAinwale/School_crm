import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import {
  LuLayers,
  LuBuilding2,
  LuCheck,
  LuPlus,
  LuSparkles,
  LuShieldCheck,
  LuWallet,
  LuRefreshCw,
  LuArrowRight,
} from 'react-icons/lu';

export default function PlatformSubscriptionsPage() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await superAdminService.getSchools();
        if (res?.success) {
          setSchools(res.data?.schools || res.schools || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const tiers = [
    {
      name: 'Enterprise Tier',
      price: '₹60,000',
      period: '/ month',
      badge: 'Most Popular for Large Campuses',
      accent: 'border-purple-300 bg-purple-50/30',
      tagBg: 'bg-purple-600 text-white',
      capacity: 'Up to 3,000 Students & 100 Faculty',
      features: [
        'Full Multi-Tenant ERP & CRM Modules',
        'Accounts & Finance Module (Student Fees, School Expenses, HR-to-Accounts Salary Disburse)',
        'Biometric & RFID Attendance Integration',
        'Custom Domain & School Subdomain Mapping',
        '24/7 Priority SLA & Dedicated Account Manager',
      ],
      planKey: 'Enterprise',
    },
    {
      name: 'Pro Tier',
      price: '₹35,000',
      period: '/ month',
      badge: 'Mid-Scale Institutions',
      accent: 'border-blue-200 bg-blue-50/20',
      tagBg: 'bg-blue-600 text-white',
      capacity: 'Up to 1,500 Students & 60 Faculty',
      features: [
        'Complete Academic & Examination Portal',
        'Student Fees Collection & Receipt Printing',
        'Parent Portal & Push Notification System',
        'Staff Salary & Leave Management',
        'Business Hours Technical Support',
      ],
      planKey: 'Pro',
    },
    {
      name: 'Standard Tier',
      price: '₹20,000',
      period: '/ month',
      badge: 'Foundational Package',
      accent: 'border-emerald-200 bg-emerald-50/20',
      tagBg: 'bg-emerald-600 text-white',
      capacity: 'Up to 1,000 Students & 45 Faculty',
      features: [
        'Class Attendance & Timetable Management',
        'Assignments, Study Material & Notices',
        'Student Profile & Directory Management',
        'Standard Email Support',
      ],
      planKey: 'Standard',
    },
    {
      name: '30-Day Pilot Sandbox',
      price: '₹0',
      period: 'Free Trial',
      badge: 'Pilot Evaluation',
      accent: 'border-amber-200 bg-amber-50/20',
      tagBg: 'bg-amber-600 text-white',
      capacity: 'Up to 100 Students (Evaluation Only)',
      features: [
        'Complete ERP Sandbox Environment',
        'Test Admin, Teacher & Parent Portals',
        'Sample Data Pre-loaded',
        '1-on-1 Guided Onboarding Demo',
      ],
      planKey: 'Trial',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            SaaS Subscription Tiers & Billing
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Platform pricing matrices, capacity quotas, and active school tenant subscriptions
          </p>
        </div>
        <button
          onClick={() => navigate('/super-admin/schools?action=new')}
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
        >
          <LuPlus className="w-4 h-4" />
          Onboard School with Plan
        </button>
      </div>

      {/* Subscription Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiers.map((tier) => {
          const subscribedSchools = schools.filter((s) => s.subscription_plan === tier.planKey);

          return (
            <div
              key={tier.name}
              className={`rounded-3xl p-6 border ${tier.accent} bg-white shadow-xs flex flex-col justify-between relative`}
            >
              <div>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${tier.tagBg}`}>
                  {tier.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-3">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{tier.price}</span>
                  <span className="text-xs text-slate-500">{tier.period}</span>
                </div>
                <p className="text-xs font-semibold text-primary-700 mt-2">{tier.capacity}</p>

                <div className="border-t border-slate-100 my-4 pt-4 space-y-2.5">
                  <div className="text-xs font-bold text-slate-800">Included Capabilities:</div>
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Subscribed Schools */}
              <div className="pt-4 border-t border-slate-100 mt-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Subscribed Schools ({subscribedSchools.length})
                </div>
                {subscribedSchools.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No schools on this tier.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {subscribedSchools.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => navigate(`/super-admin/schools?id=${s.id}`)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="truncate">{s.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{s.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

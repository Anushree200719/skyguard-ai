import React, { useState } from 'react';
import { Shield, X, Lock, User, AlertCircle, Info } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Technical Officer');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="gov-card w-full max-w-md bg-white shadow-2xl rounded border border-slate-300 overflow-hidden font-sans">
        {/* Government Identity Modal Header */}
        <div className="bg-blue-950 text-white p-4 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-900 border border-amber-400 flex items-center justify-center font-serif font-bold text-base text-amber-400">
              🇮🇳
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white uppercase">SKYGUARD AI PORTAL</h3>
              <p className="text-[10px] text-amber-300 font-medium">Automatic Weather Station Monitoring Login</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-blue-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6">
          <div className="mb-4 text-center">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">USER LOGIN</h2>
            <p className="text-xs text-slate-500 mt-0.5">Authorized Technical Officers & AWS Operators</p>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-center text-xs font-semibold">
              ✅ Authentication Successful. Directing to Official Dashboard...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  User Role / Designation
                </label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="Technical Officer">Technical Officer (Quality Control)</option>
                  <option value="AWS Operator">AWS Station Operator</option>
                  <option value="District Admin">District Administrator</option>
                  <option value="IMD Officer">IMD Scientific Officer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Username / Govt Email ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="officer@gov.in"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <a href="#forgot" className="text-blue-700 font-medium hover:underline">Forgot Password?</a>
                <span className="text-slate-400">Helpdesk: 1800-11-2026</span>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider shadow-sm transition-colors border border-blue-950"
              >
                [ LOGIN TO PORTAL ]
              </button>
            </form>
          )}

          {/* Academic / Demonstration Project Disclaimer */}
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-tight flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Academic / Demonstration Project Notice:</span>
              <p className="text-[10px] text-amber-800 mt-0.5">
                This website is an academic demonstration system. Authentication is configured for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

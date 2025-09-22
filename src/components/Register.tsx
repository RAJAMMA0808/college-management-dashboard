import React, { useState } from 'react';
import { Role, College } from '../types';
import { COLLEGE_NAMES } from '../constants';

interface RegisterProps {
  onRegister: (details: any) => void;
  switchToLogin: () => void;
}

const ROLE_DISPLAY_NAMES: { [key in Role]: string } = {
    [Role.CHAIRMAN]: 'Chairman',
    [Role.HOD]: 'HOD',
    [Role.FACULTY]: 'Faculty',
    [Role.STAFF]: 'Staff',
};

const Register: React.FC<RegisterProps> = ({ onRegister, switchToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>(Role.FACULTY);
  const [college, setCollege] = useState<College>(College.BIET);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!firstName || !lastName || !email || !username || !password) {
        setError('Please fill in all fields.');
        return;
    }
    setError('');
    onRegister({ 
      firstName, 
      lastName, 
      email, 
      username, 
      role, 
      password,
      college: role === Role.CHAIRMAN ? null : college
    });
  };

  const inputClass = (fieldName: string) => `w-full px-4 py-2 border rounded-md bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${focused === fieldName ? 'border-blue-300' : 'border-slate-200'}`;

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Create account</h2>
        <p className="mt-2 text-sm text-slate-600">Sign up to get started with EduManage</p>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-left">
          <h3 className="text-2xl font-semibold text-slate-900">Sign Up</h3>
          <p className="text-slate-500 text-sm">Fill in your details to create a new account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className={inputClass('firstName')} onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className={inputClass('lastName')} onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputClass('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" className={inputClass('username')} onFocus={() => setFocused('username')} onBlur={() => setFocused(null)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} className={inputClass('role')} onFocus={() => setFocused('role')} onBlur={() => setFocused(null)}>
              {Object.values(Role).map(r => <option key={r} value={r}>{ROLE_DISPLAY_NAMES[r]}</option>)}
            </select>
          </div>
          {role !== Role.CHAIRMAN && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
              <select value={college} onChange={e => setCollege(e.target.value as College)} className={inputClass('college')} onFocus={() => setFocused('college')} onBlur={() => setFocused(null)}>
                {Object.values(College).filter(c => c !== College.ALL).map(c => (
                  <option key={c} value={c}>{COLLEGE_NAMES[c]}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" className={inputClass('password')} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className={inputClass('confirmPassword')} onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused(null)} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold transition-colors duration-300">
            Create Account
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button onClick={switchToLogin} className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;

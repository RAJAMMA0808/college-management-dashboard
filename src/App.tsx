import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import AuthLayout from './components/AuthLayout';
import CollegeComparison from './components/CollegeComparison';
import CoursesOffered from './components/CoursesOffered';
import { User, Role } from './types';
import { MOCK_USERS } from './constants';

export type View = 'dashboard' | 'comparison' | 'courses';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [view, setView] = useState<View>('dashboard');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleRegister = (details: any) => {
    const userExists = users.some(user => user.id.toLowerCase() === details.username.toLowerCase());
    if (userExists) {
        alert(`Username "${details.username}" is already taken. Please choose another one.`);
        return;
    }
      
    const newUser: User = {
        id: details.username,
        name: `${details.firstName} ${details.lastName}`,
        email: details.email,
        password: details.password,
        role: details.role,
        college: details.college,
    };
    setUsers([...users, newUser]);
    alert(`Registration successful for ${newUser.name}! You can now log in.`);
    setIsRegistering(false);
  };

  if (!currentUser) {
    return (
      <AuthLayout>
        {isRegistering ? (
          <Register onRegister={handleRegister} switchToLogin={() => setIsRegistering(false)} />
        ) : (
          <Login onLogin={handleLogin} users={users} switchToRegister={() => setIsRegistering(true)} />
        )}
      </AuthLayout>
    );
  }

  return (
    <div className="h-screen w-full flex bg-slate-950 text-gray-100">
      <Sidebar user={currentUser} onLogout={handleLogout} view={view} setView={setView} />
      <div className="flex-1 flex flex-col">
        {view === 'dashboard' && <Dashboard user={currentUser} />}
        {view === 'comparison' && currentUser.role === Role.CHAIRMAN && <CollegeComparison />}
        {view === 'courses' && <CoursesOffered />}
      </div>
    </div>
  );
};

export default App;

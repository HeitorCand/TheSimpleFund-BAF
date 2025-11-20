import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <main className="w-full max-w-md p-8 m-4 bg-white rounded-lg shadow-soft">
        <div className="flex justify-center mb-8">
          {/* You can place a logo here */}
          <h1 className="text-3xl font-bold text-primary">TheSimpleFund</h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

// Adding a basic soft shadow to the theme for reusability
// In a real scenario, this would be in a global CSS or tailwind config
const style = document.createElement('style');
style.innerHTML = `
  .shadow-soft {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  }
`;
document.head.appendChild(style);

import React from 'react';
import { Outlet } from 'react-router-dom';

const GestorDashboard: React.FC = () => {
  return (
    <div>
      {/* The sub-page will have its own title, but we can have a root one if needed */}
      {/* <h1 className="text-2xl font-bold mb-6">Management Dashboard</h1> */}
      <Outlet />
    </div>
  );
};

export default GestorDashboard;
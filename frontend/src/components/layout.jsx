import { Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );

}



import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
//import SchedulePage from './pages/SchedulePage';
//import EmployeePage from './pages/EmployeePage';

const SchedulePage = () => <div style={{ padding: '20px' }}>Schedule Page (Under Construction)</div>;
const EmployeePage = () => <div style={{ padding: '20px' }}>Employee Page (Under Construction)</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/schedule',
    element: <SchedulePage />,
  },
  {
    path: '/employee',
    element: <EmployeePage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

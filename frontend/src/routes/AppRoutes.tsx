import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CreateTicketPage from '../pages/CreateTicketPage';
import EditTicketPage from '../pages/EditTicketPage';
import TicketDetailPage from '../pages/TicketDetailPage';
import TicketListPage from '../pages/TicketListPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<TicketListPage />} />
        <Route path="tickets/new" element={<CreateTicketPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="tickets/:id/edit" element={<EditTicketPage />} />
      </Route>
    </Routes>
  );
}

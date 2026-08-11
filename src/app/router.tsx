import { Navigate, Route, Routes } from 'react-router-dom';
import { StorefrontLayout } from '../layouts/StorefrontLayout';
import { PortalLayout } from '../layouts/PortalLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { RequireRole } from '../components/RequireRole';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RestaurantsPage } from '../pages/RestaurantsPage';
import { RestaurantMenuPage } from '../pages/RestaurantMenuPage';
import { CartPage } from '../pages/CartPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { DashboardPage } from '../pages/DashboardPage';
import { StockPage } from '../pages/StockPage';
import { ReplenishmentsPage } from '../pages/ReplenishmentsPage';
import { PortalOrdersPage } from '../pages/PortalOrdersPage';
import { MenuManagementPage } from '../pages/MenuManagementPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ReservationsPage } from '../pages/ReservationsPage';
import { PortalReservationsPage } from '../pages/PortalReservationsPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { AdminFranchisesPage } from '../pages/AdminFranchisesPage';
import { ComingSoonPage } from '../pages/ComingSoonPage';

/** Route table. Guards live in RequireRole; pages stay presentational. */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Storefront (public catalog, protected orders) */}
      <Route element={<StorefrontLayout />}>
        <Route index element={<RestaurantsPage />} />
        <Route path="restaurants/:id" element={<RestaurantMenuPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="orders"
          element={
            <RequireRole>
              <MyOrdersPage />
            </RequireRole>
          }
        />
        <Route
          path="reservations"
          element={
            <RequireRole>
              <ReservationsPage />
            </RequireRole>
          }
        />
        <Route
          path="profile"
          element={
            <RequireRole>
              <ProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequireRole>
              <OrderDetailPage />
            </RequireRole>
          }
        />
      </Route>

      {/* Franchisee portal (manager only) */}
      <Route
        path="/portal"
        element={
          <RequireRole role="manager">
            <PortalLayout />
          </RequireRole>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="replenishments" element={<ReplenishmentsPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="reservations" element={<PortalReservationsPage />} />
        <Route path="orders" element={<PortalOrdersPage />} />
      </Route>

      {/* Head office portal (admin only) */}
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<ComingSoonPage title="Tableau de bord" subtitle="Vue globale du réseau de franchises" />} />
        <Route path="stock" element={<ComingSoonPage title="Gestion des stocks" subtitle="Vue consolidée des stocks du réseau" />} />
        <Route path="menu" element={<ComingSoonPage title="Gestion des Plats" subtitle="Catalogue plats du réseau" />} />
        <Route path="promotions" element={<ComingSoonPage title="Promotions" subtitle="Campagnes promotionnelles du réseau" />} />
        <Route path="personnel" element={<ComingSoonPage title="Personnel" subtitle="Effectifs du réseau" />} />
        <Route path="franchises" element={<AdminFranchisesPage />} />
        <Route path="settings" element={<ComingSoonPage title="Paramètres" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

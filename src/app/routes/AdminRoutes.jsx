import {
  Route,
} from 'react-router-dom';

import AdminRoute
  from '@/modules/admin/guards/AdminRoute';

import AdminLayout
  from '@/modules/admin/layouts/AdminLayout';

import DashboardPage
  from '@/modules/admin/pages/DashboardPage';

import BookingsPage
  from '@/modules/admin/pages/BookingsPage';

import QuotesPage
  from '@/modules/admin/pages/QuotesPage';

import RecleansPage
  from '@/modules/admin/pages/RecleansPage';

import PaymentsPage
  from '@/modules/admin/pages/PaymentsPage';

import ServicesPage
  from '@/modules/admin/pages/ServicesPage';

import PricingPage
  from '@/modules/admin/pages/PricingPage';

import PromotionsPage
  from '@/modules/admin/pages/PromotionsPage';

import SettingsPage
  from '@/modules/admin/pages/SettingsPage';

import ServicePricingBuilderPage
  from '@/modules/admin/pages/ServicePricingBuilderPage';

import FaqsAdminPage
  from '@/modules/admin/pages/FaqsAdminPage';
/*
|--------------------------------------------------------------------------
| CONTACT MESSAGES
|--------------------------------------------------------------------------
*/

import ContactMessagesAdminPage
  from '@/modules/admin/pages/ContactMessagesAdminPage';


export default function AdminRoutes() {
  return (
    <Route
      element={
        <AdminRoute />
      }
    >
      <Route
        path="/admin"
        element={
          <AdminLayout />
        }
      >

        {/* Dashboard */}

        <Route
          index
          element={
            <DashboardPage />
          }
        />


        {/* Bookings */}

        <Route
          path="bookings"
          element={
            <BookingsPage />
          }
        />


        {/* Quotes */}

        <Route
          path="quotes"
          element={
            <QuotesPage />
          }
        />


        {/* =====================================================
            CONTACT MESSAGES
        ===================================================== */}

        <Route
          path="contact-messages"
          element={
            <ContactMessagesAdminPage />
          }
        />


        {/* Re-clean */}

        <Route
          path="recleans"
          element={
            <RecleansPage />
          }
        />


        {/* Payments */}

        <Route
          path="payments"
          element={
            <PaymentsPage />
          }
        />


        {/* Services */}

        {/*
        <Route
          path="services"
          element={
            <ServicesPage />
          }
        />
        */}

        <Route
          path="services"
          element={
            <ServicePricingBuilderPage />
          }
        />


        {/* Pricing */}

        <Route
          path="pricing"
          element={
            <PricingPage />
          }
        />


        {/* Promotions */}

        <Route
          path="promotions"
          element={
            <PromotionsPage />
          }
        />
        
        <Route
          path="faqs"
          element={
            <FaqsAdminPage />
          }
        />

        {/* Settings */}

        <Route
          path="settings"
          element={
            <SettingsPage />
          }
        />

      </Route>
    </Route>
  );
}
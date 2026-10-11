import {
  Route,
} from 'react-router-dom';

import SiteLayout
  from '@/modules/frontend/layouts/SiteLayout';

import HomePage
  from '@/modules/frontend/pages/HomePage';

import ServicePage
  from '@/modules/frontend/pages/ServicePage';

import IncludedPage
  from '@/modules/frontend/pages/IncludedPage';

import AboutPage
  from '@/modules/frontend/pages/AboutPage';

import GuaranteePage
  from '@/modules/frontend/pages/GuaranteePage';

import FAQPage
  from '@/modules/frontend/pages/FAQPage';

import ContactPage
  from '@/modules/frontend/pages/ContactPage';

import ThankYouPage
  from '@/modules/frontend/pages/ThankYouPage';

import QuotePage
  from '@/modules/frontend/pages/QuotePage';

import PolicyPage
  from '@/modules/frontend/pages/PolicyPage';

import NotFoundPage
  from '@/modules/frontend/pages/NotFoundPage';

import BookingPage
  from '@/modules/booking/pages/BookingPage';

import AccountPage
  from '@/modules/account/pages/AccountPage';
import LoginPage
  from '@/modules/auth/pages/LoginPage';

import RegisterPage
  from '@/modules/auth/pages/RegisterPage';

import ForgotPasswordPage
  from '@/modules/auth/pages/ForgotPasswordPage';

import ResetPasswordPage
  from '@/modules/auth/pages/ResetPasswordPage';

import TrackOrderPage
  from '@/modules/frontend/pages/TrackOrderPage';
/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

function PublicRoutes() {
  return (
    <>
      <Route
        element={
          <SiteLayout />
        }
      >

        {/* =====================================================
            HOME
        ===================================================== */}

        <Route
          index
          element={
            <HomePage />
          }
        />


        {/* =====================================================
            SERVICES
        ===================================================== */}

        <Route
          path="general-cleaning"
          element={
            <ServicePage
              serviceId="general"
            />
          }
        />


        <Route
          path="deep-cleaning"
          element={
            <ServicePage
              serviceId="deep"
            />
          }
        />


        <Route
          path="move-in-cleaning"
          element={
            <ServicePage
              serviceId="move-in"
            />
          }
        />


        <Route
          path="end-of-lease-cleaning"
          element={
            <ServicePage
              serviceId="end-of-lease"
            />
          }
        />


        {/* =====================================================
            WHAT'S INCLUDED
        ===================================================== */}

        <Route
          path="whats-included"
          element={
            <IncludedPage />
          }
        />


        {/* =====================================================
            ABOUT
        ===================================================== */}

        <Route
          path="about"
          element={
            <AboutPage />
          }
        />


        {/* =====================================================
            GUARANTEE
        ===================================================== */}

        <Route
          path="bond-back-guarantee"
          element={
            <GuaranteePage />
          }
        />


        {/* =====================================================
            FAQ
        ===================================================== */}

        <Route
          path="faq"
          element={
            <FAQPage />
          }
        />


        {/* =====================================================
            CONTACT
        ===================================================== */}

        <Route
          path="contact"
          element={
            <ContactPage />
          }
        />


        {/* =====================================================
            SHARED THANK YOU PAGE

            Used by:
            - Contact form
            - Quote request
        ===================================================== */}

        <Route
          path="thank-you"
          element={
            <ThankYouPage />
          }
        />


        {/* =====================================================
            GET A QUOTE
        ===================================================== */}

        <Route
          path="get-a-quote"
          element={
            <QuotePage />
          }
        />


        {/* =====================================================
            BOOKING
        ===================================================== */}

        <Route
          path="book"
          element={
            <BookingPage />
          }
        />


        {/* =====================================================
            TERMS
        ===================================================== */}

        <Route
          path="terms"
          element={
            <PolicyPage
              type="terms"
            />
          }
        />


        {/* =====================================================
            PRIVACY
        ===================================================== */}

        <Route
          path="privacy"
          element={
            <PolicyPage
              type="privacy"
            />
          }
        />

        <Route
          path="account"
          element={
            <AccountPage />
          }
        />

        <Route
          path="login"
          element={
            <LoginPage />
          }
        />


        <Route
          path="register"
          element={
            <RegisterPage />
          }
        />


        <Route
          path="forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />


        <Route
          path="reset-password"
          element={
            <ResetPasswordPage />
          }
        />


        <Route
          path="reset-password/:token"
          element={
            <ResetPasswordPage />
          }
        />


        <Route
          path="track-order"
          element={
            <TrackOrderPage />
          }
        />
        {/* =====================================================
            404
        ===================================================== */}

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />

      </Route>
    </>
  );
}


/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default PublicRoutes;
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  Home,
  House,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  MapPin,
  Plus,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { services } from '@/shared/data/content';
import { isRecleanEligible, useApp } from '@/shared/context/AppContext';
import { useAuth } from '@/modules/auth/context/AuthContext';

const ACCOUNT_SECTIONS = [
  ['home', 'Home', Home],
  ['bookings', 'My Bookings', CalendarDays],
  ['book', 'Book Now', Sparkles],
  ['payments', 'Payments', CreditCard],
  ['profile', 'Profile', UserRound],
];

const BOOKING_TABS = [
  ['upcoming', 'Upcoming'],
  ['plans', 'My Cleaning Plans'],
  ['history', 'History'],
];

const sectionIds = new Set(ACCOUNT_SECTIONS.map(([id]) => id));
const tabIds = new Set(BOOKING_TABS.map(([id]) => id));

const serviceIcons = {
  general: House,
  deep: Sparkles,
  'move-in': House,
  'end-of-lease': KeyRound,
};

const money = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
});

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clean(value) {
  return String(value ?? '').trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function normalisePhone(value) {
  return clean(value).replace(/[^\d+]/g, '').replace(/^00/, '+');
}

function parseDate(value) {
  if (!value) return null;
  const text = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T00:00:00`)
    : new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value, options = {}) {
  const date = parseDate(value);
  if (!date) return 'To be confirmed';

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function bookingAmount(booking) {
  return safeNumber(
    booking?.confirmedTotal ??
      booking?.confirmed_total ??
      booking?.approvedTotal ??
      booking?.approved_total ??
      booking?.priceSnapshot?.total ??
      booking?.price_snapshot?.total ??
      booking?.total ??
      0,
  );
}

function paidAmount(booking) {
  const explicit =
    booking?.paidAmount ??
    booking?.paid_amount ??
    booking?.payment?.amount ??
    null;

  if (explicit !== null && explicit !== undefined && explicit !== '') {
    return safeNumber(explicit);
  }

  const status = normalisePaymentStatus(
    booking?.paymentStatus ?? booking?.payment_status ?? booking?.payment?.status,
  );

  return status === 'paid' ? bookingAmount(booking) : 0;
}

function getService(booking) {
  return services.find(
    (item) => item.id === (booking?.service ?? booking?.service_id ?? booking?.serviceId),
  );
}

function serviceName(booking) {
  return (
    getService(booking)?.name ||
    booking?.serviceName ||
    booking?.service_name ||
    'Cleaning service'
  );
}

function normaliseFrequency(value) {
  const frequency = lower(value).replace(/[\s_]+/g, '-');

  if (['weekly', 'week'].includes(frequency)) return 'weekly';
  if (
    ['fortnightly', 'fortnight', 'biweekly', 'bi-weekly', 'every-2-weeks'].includes(
      frequency,
    )
  ) {
    return 'fortnightly';
  }
  if (['monthly', 'month'].includes(frequency)) return 'monthly';

  return 'one-off';
}

function bookingFrequency(booking) {
  return normaliseFrequency(
    booking?.frequency ??
      booking?.recurringFrequency ??
      booking?.recurring_frequency ??
      booking?.cleaningFrequency ??
      booking?.cleaning_frequency ??
      booking?.recurrence ??
      booking?.schedule?.frequency ??
      booking?.plan?.frequency ??
      'one-off',
  );
}

function frequencyLabel(value) {
  return {
    'one-off': 'One-Off',
    weekly: 'Weekly',
    fortnightly: 'Fortnightly',
    monthly: 'Monthly',
  }[normaliseFrequency(value)];
}

function propertyLabel(booking) {
  const type =
    clean(
      booking?.propertyLabel ??
        booking?.property_label ??
        booking?.propertyType ??
        booking?.property_type ??
        booking?.property?.type ??
        booking?.property,
    ) || 'Property';

  const rooms = [];

  const bedrooms = booking?.bedrooms ?? booking?.property?.bedrooms;
  const bathrooms = booking?.bathrooms ?? booking?.property?.bathrooms;

  if (bedrooms !== null && bedrooms !== undefined && bedrooms !== '') {
    rooms.push(`${bedrooms} bed`);
  }

  if (bathrooms !== null && bathrooms !== undefined && bathrooms !== '') {
    rooms.push(`${bathrooms} bath`);
  }

  return rooms.length ? `${type} · ${rooms.join(' · ')}` : type;
}

function bookingAddress(booking) {
  return (
    clean(booking?.customer?.address) ||
    clean(booking?.address) ||
    clean(booking?.serviceAddress) ||
    clean(booking?.service_address) ||
    clean(booking?.property?.address) ||
    clean(booking?.postcode) ||
    'Address to be confirmed'
  );
}

function arrivalWindow(booking) {
  return (
    clean(booking?.arrivalWindow) ||
    clean(booking?.arrival_window) ||
    clean(booking?.preferredTime) ||
    clean(booking?.preferred_time) ||
    clean(booking?.time) ||
    clean(booking?.schedule?.time) ||
    'To be confirmed'
  );
}

function normaliseBookingStatus(value) {
  return lower(value).replace(/[\s_]+/g, '-');
}

function bookingStatus(booking) {
  const status = normaliseBookingStatus(booking?.status);

  if (['pending', 'requested', 'request', 'awaiting-confirmation'].includes(status)) {
    return ['awaiting-confirmation', 'Awaiting Confirmation', 'neutral'];
  }

  if (['confirmed', 'approved'].includes(status)) {
    return ['confirmed', 'Confirmed', 'teal'];
  }

  if (['on-the-way', 'onway', 'en-route', 'enroute'].includes(status)) {
    return ['on-the-way', 'Cleaner On the Way', 'teal'];
  }

  if (['cleaning', 'in-progress', 'inprogress', 'started'].includes(status)) {
    return ['cleaning', 'Cleaning in Progress', 'teal'];
  }

  if (status === 'completed') {
    return ['completed', 'Completed', 'success'];
  }

  if (['cancelled', 'canceled'].includes(status)) {
    return ['cancelled', 'Cancelled', 'danger'];
  }

  return [status || 'awaiting-confirmation', status || 'Awaiting Confirmation', 'neutral'];
}

function normalisePaymentStatus(value) {
  return lower(value).replace(/[\s_]+/g, '-');
}

function paymentStatus(booking) {
  const status = normalisePaymentStatus(
    booking?.paymentStatus ?? booking?.payment_status ?? booking?.payment?.status,
  );

  if (status === 'paid') return ['paid', 'Paid', 'success'];

  if (
    ['awaiting-verification', 'verification-pending', 'pending-verification'].includes(
      status,
    )
  ) {
    return ['verification-pending', 'Verification Pending', 'neutral'];
  }

  if (['due', 'unpaid', 'approved', 'payable'].includes(status)) {
    return ['due', 'Payment Due', 'teal'];
  }

  const [bookingKey] = bookingStatus(booking);

  if (bookingKey === 'awaiting-confirmation') {
    return ['not-ready', 'Available After Approval', 'neutral'];
  }

  return ['unpaid', 'Unpaid', 'neutral'];
}

function statusClasses(tone) {
  if (tone === 'teal') {
    return 'border-[#c7dfdd] bg-[#edf6f5] text-[#087e83]';
  }

  if (tone === 'success') {
    return 'border-[#d2e5dc] bg-[#f1f8f4] text-[#27664a]';
  }

  if (tone === 'danger') {
    return 'border-[#ead8d6] bg-[#fbf4f3] text-[#9a4d45]';
  }

  return 'border-[#d9e2e4] bg-[#f5f8f8] text-[#5d727c]';
}

function bookingReference(booking) {
  return (
    booking?.reference ||
    booking?.booking_reference ||
    booking?.bookingReference ||
    booking?.id ||
    'Booking'
  );
}

function receiptUrl(booking) {
  return (
    booking?.receiptUrl ||
    booking?.receipt_url ||
    booking?.paymentReceiptUrl ||
    booking?.payment_receipt_url ||
    booking?.receipt?.url ||
    booking?.payment?.receipt_url ||
    ''
  );
}

function isCompleted(booking) {
  return bookingStatus(booking)[0] === 'completed';
}

function isCancelled(booking) {
  return bookingStatus(booking)[0] === 'cancelled';
}

function isPast(booking) {
  const date = parseDate(booking?.date);
  return Boolean(date && date.getTime() < todayStart().getTime());
}

function belongsToCustomer(booking, user) {
  if (!booking || !user) return false;

  const bookingUserId =
    booking?.customer?.user_id ??
    booking?.customer?.userId ??
    booking?.customer_id ??
    booking?.customerId ??
    booking?.user_id ??
    booking?.userId ??
    null;

  if (user.id !== null && user.id !== undefined && bookingUserId !== null) {
    return String(user.id) === String(bookingUserId);
  }

  const bookingEmail = lower(booking?.customer?.email ?? booking?.email);
  const userEmail = lower(user.email);

  if (bookingEmail && userEmail) return bookingEmail === userEmail;

  const bookingPhone = normalisePhone(
    booking?.customer?.mobile ??
      booking?.customer?.phone ??
      booking?.mobile ??
      booking?.phone,
  );

  const userPhone = normalisePhone(user.phone);

  return Boolean(bookingPhone && userPhone && bookingPhone === userPhone);
}

function notificationBelongsToCustomer(notification, user, bookingIds) {
  if (!notification || !user) return false;

  const targetUserId =
    notification?.user_id ??
    notification?.userId ??
    notification?.customer_id ??
    notification?.customerId ??
    null;

  if (user.id !== null && user.id !== undefined && targetUserId !== null) {
    return String(user.id) === String(targetUserId);
  }

  const recipient = lower(
    notification?.to ?? notification?.email ?? notification?.recipient,
  );

  if (recipient && user.email && recipient === lower(user.email)) return true;

  const bookingId = notification?.booking_id ?? notification?.bookingId ?? null;

  if (bookingId !== null && bookingId !== undefined) {
    return bookingIds.has(String(bookingId));
  }

  // Privacy: do not show a notification unless ownership can be established.
  return false;
}

function sortByDate(items, direction = 'asc') {
  return [...items].sort((a, b) => {
    const aDate = parseDate(a?.date);
    const bDate = parseDate(b?.date);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return direction === 'desc' ? bDate - aDate : aDate - bDate;
  });
}

function buildCleaningPlans(bookings) {
  const map = new Map();

  bookings
    .filter((booking) => {
      return (
        ['general', 'deep'].includes(booking?.service) &&
        bookingFrequency(booking) !== 'one-off'
      );
    })
    .forEach((booking) => {
      const frequency = bookingFrequency(booking);

      const key = String(
        booking?.recurringPlanId ??
          booking?.recurring_plan_id ??
          booking?.planId ??
          booking?.plan_id ??
          booking?.cleaningPlanId ??
          booking?.cleaning_plan_id ??
          [booking?.service, frequency, bookingAddress(booking)].join('|'),
      );

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          service: booking?.service,
          frequency,
          status: lower(
            booking?.planStatus ??
              booking?.plan_status ??
              booking?.recurringStatus ??
              booking?.recurring_status ??
              booking?.plan?.status ??
              'active',
          ),
          pricePerVisit: safeNumber(
            booking?.approvedPricePerVisit ??
              booking?.approved_price_per_visit ??
              bookingAmount(booking),
          ),
          address: bookingAddress(booking),
          property: propertyLabel(booking),
          visits: [],
        });
      }

      map.get(key).visits.push(booking);
    });

  return Array.from(map.values()).map((plan) => {
    const upcoming = sortByDate(
      plan.visits.filter(
        (booking) => !isCompleted(booking) && !isCancelled(booking) && !isPast(booking),
      ),
    );

    return {
      ...plan,
      upcoming,
      nextVisit: upcoming[0] || null,
    };
  });
}

function Pill({ children, tone = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses(
        tone,
      )}`}
    >
      {children}
    </span>
  );
}

function ShellCard({ children, className = '' }) {
  return (
    <Card
      className={`rounded-[20px] border border-[#dfe5e7] bg-white p-0 shadow-[0_8px_28px_rgba(16,45,67,0.035)] ${className}`}
    >
      {children}
    </Card>
  );
}

function SectionHeader({ icon: Icon, eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#e6eaeb] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[#087e83]">
          {Icon ? <Icon size={14} /> : null}
          <span className="text-[9px] font-bold uppercase tracking-[0.14em]">
            {eyebrow}
          </span>
        </div>
        <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-[#102d43]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#71858f]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#edf6f5] text-[#087e83]">
        <Icon size={21} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#102d43]">{title}</h3>
      <p className="mt-2 max-w-md text-[12px] leading-6 text-[#748791]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#f1f6f5] text-[#087e83]">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#84949c]">
          {label}
        </p>
        <p className="mt-1 break-words text-[12px] font-medium leading-5 text-[#334d5d]">
          {value}
        </p>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, helper }) {
  return (
    <div className="flex min-h-[102px] items-center gap-4 rounded-[16px] border border-[#e0e6e8] bg-white px-4 py-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#edf6f5] text-[#087e83]">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#7e919a]">
          {label}
        </p>
        <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#102d43]">
          {value}
        </p>
        <p className="mt-1 truncate text-[10px] text-[#7b8e97]">{helper}</p>
      </div>
    </div>
  );
}

function AccountNavigation({ active, onChange }) {
  return (
    <nav
      aria-label="Customer account"
      className="rounded-[16px] border border-[#dfe5e7] bg-white p-1.5 shadow-[0_5px_18px_rgba(16,45,67,0.025)]"
    >
      {/*
        Mobile: all five items are always visible in a 5-column grid.
        No horizontal scrolling / sliding is required.

        Tablet/Desktop: the same five items become a wider horizontal
        navigation with icon + label in one line.
      */}
      <div className="grid grid-cols-5 gap-1">
        {ACCOUNT_SECTIONS.map(([id, label, Icon]) => {
          const selected = active === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={selected ? 'page' : undefined}
              className={`
                group
                flex
                min-w-0
                min-h-[58px]
                flex-col
                items-center
                justify-center
                gap-1.5
                rounded-[11px]
                px-1
                py-2
                text-center
                transition-all
                duration-200

                sm:min-h-[48px]
                sm:flex-row
                sm:gap-2
                sm:px-2
                sm:py-2.5

                lg:min-h-[46px]
                lg:px-4

                ${
                  selected
                    ? 'bg-[#102d43] text-white shadow-[0_5px_14px_rgba(16,45,67,0.12)] ring-1 ring-[#087e83] ring-offset-1'
                    : 'text-[#4d6572] hover:bg-[#f3f7f7] hover:text-[#087e83]'
                }
              `}
            >
              <Icon
                size={15}
                strokeWidth={1.8}
                className="shrink-0"
              />

              <span
                className="
                  block
                  min-w-0
                  max-w-full
                  text-[9px]
                  font-semibold
                  leading-[1.05]

                  sm:text-[10px]
                  sm:leading-tight

                  lg:text-[12px]
                "
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function hasPendingRequest(pendingRequests, scope, id) {
  return Object.keys(pendingRequests).some((key) =>
    key.startsWith(`${scope}:${id}:`),
  );
}

function BookingCard({ booking, history, pending, onRequest }) {
  const [statusKey, statusLabel, statusTone] = bookingStatus(booking);
  const [, paymentLabel, paymentTone] = paymentStatus(booking);
  const receipt = receiptUrl(booking);

  const canChange =
    !history && statusKey !== 'completed' && statusKey !== 'cancelled';

  const canReclean =
    history &&
    booking?.service === 'end-of-lease' &&
    isRecleanEligible(booking);

  return (
    <div className="border-b border-[#e7ebec] px-5 py-5 last:border-b-0 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#102d43]">
              {serviceName(booking)}
            </h3>
            <Pill tone={statusTone}>{statusLabel}</Pill>
            {pending ? <Pill>Awaiting Approval</Pill> : null}
          </div>
          <p className="mt-1 text-[10px] text-[#7d8f97]">
            {bookingReference(booking)}
          </p>
        </div>

        {history ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-9 rounded-[9px] px-3 text-[10px]">
              <Link to={`/book?service=${encodeURIComponent(booking?.service || '')}`}>
                BOOK AGAIN
              </Link>
            </Button>

            {canReclean ? (
              <Button asChild className="h-9 rounded-[9px] px-3 text-[10px]">
                <Link
                  to={`/bond-back-guarantee?booking=${encodeURIComponent(
                    booking.id,
                  )}#request-reclean`}
                >
                  REQUEST RE-CLEAN
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Detail icon={CalendarDays} label="Date" value={formatDate(booking.date)} />
        <Detail icon={Clock3} label="Arrival" value={arrivalWindow(booking)} />
        <Detail icon={House} label="Property" value={propertyLabel(booking)} />
        <Detail
          icon={RefreshCw}
          label="Frequency"
          value={frequencyLabel(bookingFrequency(booking))}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-[12px] bg-[#f7f9f9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#85959d]">
            {history ? 'Paid amount' : 'Booking value'}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#102d43]">
            {money.format(history ? paidAmount(booking) || bookingAmount(booking) : bookingAmount(booking))}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={paymentTone}>{paymentLabel}</Pill>

          {history && receipt ? (
            <a
              href={receipt}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#d9e2e4] bg-white px-2.5 text-[10px] font-semibold text-[#102d43]"
            >
              <ReceiptText size={13} />
              Receipt
            </a>
          ) : null}
        </div>
      </div>

      {canChange ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-[9px] px-3 text-[10px]"
            onClick={() => onRequest('booking', booking.id, 'reschedule')}
          >
            Request Reschedule
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-[9px] border-[#e3d9d7] px-3 text-[10px] text-[#8e4a43] hover:bg-[#fbf4f3] hover:text-[#8e4a43]"
            onClick={() => onRequest('booking', booking.id, 'cancel')}
          >
            Request Cancellation
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function PlanCard({ plan, pending, onRequest }) {
  const paused = ['paused', 'pause'].includes(plan.status);

  return (
    <div className="border-b border-[#e7ebec] px-5 py-6 last:border-b-0 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-[#102d43]">
              {services.find((item) => item.id === plan.service)?.name ||
                'Cleaning Plan'}
            </h3>
            <Pill tone={paused ? 'neutral' : 'teal'}>
              {paused ? 'Paused' : 'Active'}
            </Pill>
            {pending ? <Pill>Awaiting Approval</Pill> : null}
          </div>

          <p className="mt-1.5 text-[11px] text-[#748791]">
            {frequencyLabel(plan.frequency)} · {plan.address}
          </p>
        </div>

        <div className="rounded-[12px] border border-[#dce5e6] bg-[#f8faf9] px-4 py-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#83949c]">
            Approved price
          </p>
          <p className="mt-1 text-base font-semibold text-[#102d43]">
            {money.format(plan.pricePerVisit)}
            <span className="ml-1 text-[10px] font-medium text-[#82939b]">
              / visit
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-[14px] border border-[#e5eaeb] bg-[#fbfcfc] p-4 sm:grid-cols-3">
        <Detail icon={RefreshCw} label="Frequency" value={frequencyLabel(plan.frequency)} />
        <Detail
          icon={CalendarDays}
          label="Next visit"
          value={plan.nextVisit ? formatDate(plan.nextVisit.date) : 'No upcoming visit'}
        />
        <Detail icon={House} label="Property" value={plan.property} />
      </div>

      {plan.upcoming.length ? (
        <div className="mt-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#81929a]">
            Upcoming visits
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.upcoming.slice(0, 6).map((visit) => (
              <span
                key={visit.id}
                className="rounded-[9px] border border-[#dfe5e7] bg-white px-3 py-2 text-[10px] font-medium text-[#506873]"
              >
                {formatDate(visit.date)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-[#e7ebec] pt-5">
        {[
          ['skip', 'Skip Next Visit'],
          [paused ? 'resume' : 'pause', paused ? 'Resume' : 'Pause'],
          ['reschedule', 'Reschedule'],
          ['change-frequency', 'Change Frequency'],
          ['cancel-plan', 'Cancel Plan'],
        ].map(([kind, label]) => (
          <Button
            key={kind}
            type="button"
            variant="outline"
            className={`h-9 rounded-[9px] px-3 text-[10px] ${
              kind === 'cancel-plan'
                ? 'border-[#e3d9d7] text-[#8e4a43] hover:bg-[#fbf4f3] hover:text-[#8e4a43]'
                : ''
            }`}
            onClick={() => onRequest('plan', plan.id, kind)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function HomeSection({
  user,
  bookings,
  nextConfirmed,
  plans,
  notifications,
  pendingRequests,
  onRequest,
  onSection,
}) {
  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'there';

  const upcomingCount = bookings.filter(
    (booking) => !isCompleted(booking) && !isCancelled(booking) && !isPast(booking),
  ).length;

  const paymentAttention = bookings.filter((booking) => {
    const [key] = paymentStatus(booking);
    return ['due', 'unpaid', 'verification-pending'].includes(key);
  }).length;

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#087e83]">
            Customer account
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#102d43] sm:text-[2.35rem]">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f838d]">
            Keep your cleaning appointments, plans and payments together in one
            simple place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="relative grid h-11 w-11 place-items-center rounded-[11px] border border-[#dce4e6] bg-white text-[#102d43]"
            onClick={() =>
              document
                .getElementById('customer-notifications')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            <Bell size={17} />
            {notifications.length ? (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#087e83] ring-2 ring-white" />
            ) : null}
          </button>

          <Button asChild variant="outline" className="h-11 rounded-[10px] px-4 text-[11px]">
            <Link to="/contact">
              <LifeBuoy size={15} />
              Help & Support
            </Link>
          </Button>

          <Button asChild className="h-11 rounded-[10px] px-5 text-[11px]">
            <Link to="/book">BOOK NOW</Link>
          </Button>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={CalendarDays}
          label="Upcoming"
          value={upcomingCount}
          helper="Requests and appointments"
        />
        <MiniStat
          icon={RefreshCw}
          label="Cleaning plans"
          value={plans.length}
          helper="Recurring General / Deep"
        />
        <MiniStat
          icon={WalletCards}
          label="Payments"
          value={paymentAttention}
          helper="Items needing attention"
        />
      </div>

      <div className="mt-6">
        <ShellCard>
          {nextConfirmed ? (
            <div className="grid lg:grid-cols-[210px_1fr]">
              <div className="flex flex-col justify-between bg-[#102d43] p-6 text-white sm:p-7">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                    Your next clean
                  </p>
                  <p className="mt-4 text-[2rem] font-semibold leading-none tracking-[-0.055em]">
                    {formatDate(nextConfirmed.date, {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                  <p className="mt-2 text-[11px] text-white/65">
                    {formatDate(nextConfirmed.date, {
                      weekday: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="mt-8">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-white/50">
                    Arrival window
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {arrivalWindow(nextConfirmed)}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#087e83]">
                      Confirmed appointment
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#102d43]">
                      {serviceName(nextConfirmed)}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Pill tone={bookingStatus(nextConfirmed)[2]}>
                      {bookingStatus(nextConfirmed)[1]}
                    </Pill>
                    {hasPendingRequest(
                      pendingRequests,
                      'booking',
                      nextConfirmed.id,
                    ) ? (
                      <Pill>Awaiting Approval</Pill>
                    ) : null}
                  </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <Detail
                    icon={RefreshCw}
                    label="Frequency"
                    value={frequencyLabel(bookingFrequency(nextConfirmed))}
                  />
                  <Detail
                    icon={House}
                    label="Property"
                    value={propertyLabel(nextConfirmed)}
                  />
                  <Detail
                    icon={MapPin}
                    label="Address"
                    value={bookingAddress(nextConfirmed)}
                  />
                  <Detail
                    icon={CircleDollarSign}
                    label="Approved price"
                    value={money.format(bookingAmount(nextConfirmed))}
                  />
                </div>

                <div className="mt-7 flex flex-wrap gap-2 border-t border-[#e5eaec] pt-5">
                  <Button
                    variant="outline"
                    className="h-10 rounded-[9px] px-4 text-[11px]"
                    onClick={() =>
                      onRequest('booking', nextConfirmed.id, 'reschedule')
                    }
                  >
                    Request Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 rounded-[9px] border-[#e3d9d7] px-4 text-[11px] text-[#8e4a43]"
                    onClick={() =>
                      onRequest('booking', nextConfirmed.id, 'cancel')
                    }
                  >
                    Request Cancellation
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming confirmed clean yet."
              description="When Matelink confirms your next appointment, it will appear here."
              action={
                <Button asChild>
                  <Link to="/book">BOOK NOW</Link>
                </Button>
              }
            />
          )}
        </ShellCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <ShellCard>
          <SectionHeader
            icon={Bell}
            eyebrow="Updates"
            title="Notifications"
            description="Booking and payment updates connected to your account."
          />
          <div id="customer-notifications" className="scroll-mt-28">
            {notifications.length ? (
              notifications.slice(0, 5).map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="flex gap-3 border-b border-[#e7ebec] px-5 py-4 last:border-b-0 sm:px-6"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#edf6f5] text-[#087e83]">
                    <Bell size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#102d43]">
                      {item.title || item.event || 'Matelink update'}
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-[#748791]">
                      {item.message || item.body || 'Your account has a new update.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Bell}
                title="You're all caught up."
                description="New booking and payment updates will appear here."
              />
            )}
          </div>
        </ShellCard>

        <ShellCard>
          <SectionHeader
            icon={LifeBuoy}
            eyebrow="Support"
            title="Need a hand?"
            description="Help stays inside the account without becoming a sixth main menu item."
          />
          <div className="p-5 sm:p-6">
            <div className="rounded-[15px] bg-[#102d43] p-5 text-white">
              <HelpCircle size={22} className="text-[#8bd0ce]" />
              <h3 className="mt-4 text-lg font-semibold">Matelink support</h3>
              <p className="mt-2 text-[11px] leading-6 text-white/65">
                Questions about a booking, payment or cleaning plan? Send
                Matelink a message and include your booking reference when
                possible.
              </p>
              <Button
                asChild
                className="mt-5 h-10 bg-white px-4 text-[11px] text-[#102d43] hover:bg-[#edf6f5]"
              >
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>

            <button
              type="button"
              onClick={() => onSection('bookings')}
              className="mt-3 flex w-full items-center justify-between rounded-[12px] border border-[#e1e7e8] px-4 py-3 text-[11px] font-semibold text-[#102d43]"
            >
              View all bookings
              <ChevronRight size={15} />
            </button>
          </div>
        </ShellCard>
      </div>
    </>
  );
}

function BookingsSection({
  activeTab,
  onTab,
  upcoming,
  plans,
  history,
  pendingRequests,
  onRequest,
}) {
  return (
    <>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#087e83]">
          My Bookings
        </p>
        <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#102d43]">
          Your cleans, in one place.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#70848e]">
          Upcoming appointments, recurring plans and completed history.
        </p>
      </div>

      <div className="mt-6 flex overflow-x-auto rounded-[14px] border border-[#dfe5e7] bg-white p-1">
        {BOOKING_TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={`min-h-[40px] shrink-0 rounded-[9px] px-4 text-[11px] font-semibold sm:flex-1 ${
              activeTab === id
                ? 'bg-[#edf6f5] text-[#087e83]'
                : 'text-[#637985] hover:bg-[#f7f9f9]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {activeTab === 'upcoming' ? (
          <ShellCard>
            <SectionHeader
              icon={CalendarDays}
              eyebrow="Upcoming"
              title="Requests & appointments"
              description="Pending requests, confirmed appointments and upcoming recurring visits."
              action={
                <Button asChild className="h-9 px-4 text-[10px]">
                  <Link to="/book">BOOK NOW</Link>
                </Button>
              }
            />
            {upcoming.length ? (
              upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  pending={hasPendingRequest(
                    pendingRequests,
                    'booking',
                    booking.id,
                  )}
                  onRequest={onRequest}
                />
              ))
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming bookings."
                description="Start a cleaning request and Matelink will review it before confirming the appointment."
              />
            )}
          </ShellCard>
        ) : null}

        {activeTab === 'plans' ? (
          <ShellCard>
            <SectionHeader
              icon={RefreshCw}
              eyebrow="Recurring"
              title="My Cleaning Plans"
              description="Weekly, fortnightly and monthly General or Deep Cleaning plans."
            />
            {plans.length ? (
              plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  pending={hasPendingRequest(pendingRequests, 'plan', plan.id)}
                  onRequest={onRequest}
                />
              ))
            ) : (
              <EmptyState
                icon={RefreshCw}
                title="No recurring cleaning plan yet."
                description="Recurring plans are available for General and Deep Cleaning."
              />
            )}
          </ShellCard>
        ) : null}

        {activeTab === 'history' ? (
          <ShellCard>
            <SectionHeader
              icon={RotateCcw}
              eyebrow="History"
              title="Past cleans"
              description="Completed and past booking records retained in your account."
            />
            {history.length ? (
              history.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  history
                  onRequest={onRequest}
                />
              ))
            ) : (
              <EmptyState
                icon={RotateCcw}
                title="No booking history yet."
                description="Completed bookings will appear here."
              />
            )}
          </ShellCard>
        ) : null}
      </div>
    </>
  );
}

function BookNowSection() {
  const customerServices = services.filter((service) =>
    ['general', 'deep', 'move-in', 'end-of-lease'].includes(service.id),
  );

  return (
    <>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#087e83]">
          Book Now
        </p>

        <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#102d43]">
          Choose your next clean.
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#70848e]">
          Each service opens the same booking flow with that service already selected.
        </p>
      </div>

      {/*
        Mobile       = 1 card per row
        Small tablet = 2 cards per row
        Desktop      = all 4 service cards in ONE row
      */}
      <div
        className="
          mt-7
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-2

          lg:grid-cols-4
          lg:gap-3

          xl:gap-4
        "
      >
        {customerServices.map((service) => {
          const Icon = serviceIcons[service.id] || Sparkles;
          const recurring = ['general', 'deep'].includes(service.id);

          const frequencies = recurring
            ? ['One-Off', 'Weekly', 'Fortnightly', 'Monthly']
            : ['One-Off only'];

          return (
            <ShellCard
              key={service.id}
              className="
                group
                flex
                h-full
                flex-col
                overflow-hidden
                transition-all
                duration-200
                hover:-translate-y-[2px]
                hover:border-[#c4d9d9]
                hover:shadow-[0_14px_34px_rgba(16,45,67,0.07)]
              "
            >
              {service.cardImage ? (
                <div
                  className="
                    relative
                    h-[158px]
                    shrink-0
                    overflow-hidden
                    bg-[#eef2f0]

                    sm:h-[150px]

                    lg:h-[118px]

                    xl:h-[138px]
                  "
                >
                  <img
                    src={service.cardImage}
                    alt={service.cardImageAlt || ''}
                    loading="lazy"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-[1.025]
                    "
                  />

                  <div
                    className="
                      absolute
                      bottom-3
                      left-3
                      grid
                      h-9
                      w-9
                      place-items-center
                      rounded-full
                      border
                      border-white/70
                      bg-white/95
                      text-[#087e83]
                      shadow-sm

                      lg:h-8
                      lg:w-8
                    "
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                    />
                  </div>
                </div>
              ) : null}

              <div
                className="
                  flex
                  flex-1
                  flex-col
                  p-5

                  sm:p-5

                  lg:p-4

                  xl:p-5
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.13em]
                        text-[#087e83]
                      "
                    >
                      {service.eyebrow || 'Matelink Cleaning'}
                    </p>

                    <h2
                      className="
                        mt-2
                        text-[18px]
                        font-semibold
                        leading-tight
                        tracking-[-0.035em]
                        text-[#102d43]

                        lg:text-[15px]

                        xl:text-[17px]
                      "
                    >
                      {service.name}
                    </h2>
                  </div>

                  <span
                    className="
                      shrink-0
                      rounded-full
                      border
                      border-[#dbe4e5]
                      bg-[#f7f9f9]
                      px-2
                      py-1
                      text-[8px]
                      font-medium
                      leading-none
                      text-[#657a84]

                      lg:px-1.5
                      lg:text-[7px]

                      xl:px-2
                      xl:text-[8px]
                    "
                  >
                    {recurring ? 'Recurring' : 'One-Off'}
                  </span>
                </div>

                <p
                  className="
                    mt-3
                    line-clamp-2
                    text-[11px]
                    leading-5
                    text-[#70848e]

                    lg:text-[10px]
                    lg:leading-[1.55]

                    xl:text-[11px]
                  "
                >
                  {service.cardText ||
                    'Configure your property and see the calculated price before submitting.'}
                </p>

                <div
                  className="
                    mt-4
                    flex
                    min-h-[48px]
                    flex-wrap
                    content-start
                    gap-1.5

                    lg:mt-3
                    lg:min-h-[42px]
                    lg:gap-1
                  "
                >
                  {frequencies.map((item) => (
                    <span
                      key={item}
                      className="
                        rounded-full
                        bg-[#f2f6f5]
                        px-2.5
                        py-1
                        text-[9px]
                        font-medium
                        leading-none
                        text-[#59707a]

                        lg:px-2
                        lg:text-[8px]
                      "
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 lg:pt-3">
                  <Button
                    asChild
                    className="
                      h-11
                      w-full
                      rounded-[10px]
                      text-[11px]

                      lg:h-10
                      lg:text-[10px]
                    "
                  >
                    <Link
                      to={`/book?service=${encodeURIComponent(service.id)}`}
                    >
                      BOOK NOW
                    </Link>
                  </Button>
                </div>
              </div>
            </ShellCard>
          );
        })}
      </div>

      <div
        className="
          mt-5
          flex
          gap-3
          rounded-[14px]
          border
          border-[#dfe5e7]
          bg-[#f8faf9]
          px-4
          py-4
        "
      >
        <BadgeCheck
          size={18}
          className="mt-0.5 shrink-0 text-[#087e83]"
        />

        <p className="text-[11px] leading-6 text-[#637984]">
          A booking submission creates a request pending Matelink confirmation.
          Guest booking remains available on the public Book Now page.
        </p>
      </div>
    </>
  );
}

function PaymentsSection({
  bookings,
  cardRequests,
  onCardRequest,
}) {
  const totalPaid = bookings.reduce((sum, booking) => sum + paidAmount(booking), 0);

  const totalDue = bookings.reduce((sum, booking) => {
    const [key] = paymentStatus(booking);

    if (['paid', 'not-ready'].includes(key)) return sum;

    return (
      sum +
      Math.max(bookingAmount(booking) - paidAmount(booking), 0)
    );
  }, 0);

  const verificationCount = bookings.filter(
    (booking) => paymentStatus(booking)[0] === 'verification-pending',
  ).length;

  return (
    <>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#087e83]">
          Payments
        </p>
        <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#102d43]">
          Clear payment tracking.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#70848e]">
          Approved amounts, verification status and receipts. Recurring visits
          remain separate payment records.
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={CheckCircle2}
          label="Paid"
          value={money.format(totalPaid)}
          helper="Confirmed payments"
        />
        <MiniStat
          icon={CircleDollarSign}
          label="Payable"
          value={money.format(totalDue)}
          helper="Approved unpaid amount"
        />
        <MiniStat
          icon={Clock3}
          label="Verification"
          value={verificationCount}
          helper="Bank / PayID checks"
        />
      </div>

      <div className="mt-6">
        <ShellCard>
          <SectionHeader
            icon={WalletCards}
            eyebrow="Payment records"
            title="Bookings & payments"
            description="Each cleaning visit has its own payment record."
          />

          {bookings.length ? (
            bookings.map((booking) => {
              const [paymentKey, paymentLabel, paymentTone] = paymentStatus(booking);
              const [bookingKey] = bookingStatus(booking);
              const approved = !['awaiting-confirmation', 'cancelled'].includes(
                bookingKey,
              );
              const receipt = receiptUrl(booking);

              return (
                <div
                  key={booking.id}
                  className="border-b border-[#e7ebec] px-5 py-5 last:border-b-0 sm:px-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#102d43]">
                        {serviceName(booking)}
                      </p>
                      <p className="mt-1 text-[10px] text-[#7b8d96]">
                        {bookingReference(booking)} · {formatDate(booking.date)}
                      </p>
                    </div>
                    <Pill tone={paymentTone}>{paymentLabel}</Pill>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[12px] bg-[#f8faf9] px-4 py-3">
                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#83949c]">
                        Payable amount
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#102d43]">
                        {money.format(bookingAmount(booking))}
                      </p>
                    </div>

                    <div className="rounded-[12px] bg-[#f8faf9] px-4 py-3">
                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#83949c]">
                        Frequency
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#102d43]">
                        {frequencyLabel(bookingFrequency(booking))}
                      </p>
                    </div>

                    <div className="rounded-[12px] bg-[#f8faf9] px-4 py-3">
                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#83949c]">
                        Paid
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#102d43]">
                        {money.format(paidAmount(booking))}
                      </p>
                    </div>
                  </div>

                  {approved ? (
                    <div className="mt-4 flex flex-col gap-3 rounded-[13px] border border-[#e2e7e8] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-[#102d43]">
                          PayID / bank transfer
                        </p>
                        <p className="mt-1 text-[10px] leading-5 text-[#7b8d96]">
                          Use Matelink's payment instructions after approval.
                          Bank and PayID payments remain Verification Pending until
                          confirmed.
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {receipt ? (
                          <a
                            href={receipt}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-[#d9e2e4] px-3 text-[10px] font-semibold text-[#102d43]"
                          >
                            <ReceiptText size={13} />
                            Receipt
                          </a>
                        ) : null}

                        {paymentKey !== 'paid' ? (
                          <Button
                            variant="outline"
                            disabled={Boolean(cardRequests[booking.id])}
                            className="h-9 px-3 text-[10px]"
                            onClick={() => onCardRequest(booking)}
                          >
                            {cardRequests[booking.id]
                              ? 'Link Requested'
                              : 'Request Card Payment Link'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-[10px] text-[#788b95]">
                      Payment instructions will appear after Matelink approves
                      this booking.
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No payment records yet."
              description="Approved bookings and their payment status will appear here."
            />
          )}
        </ShellCard>
      </div>
    </>
  );
}

function PasswordField({ id, value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-11 pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((value) => !value)}
        className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-[8px] text-[#81919a] hover:bg-[#f4f7f7]"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 border-b border-[#e7ebec] py-4 last:border-b-0">
      <div>
        <p className="text-[12px] font-semibold text-[#102d43]">{label}</p>
        <p className="mt-1 text-[10px] leading-5 text-[#778b94]">
          {description}
        </p>
      </div>

      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full ${
          checked ? 'bg-[#087e83]' : 'bg-[#cfd8db]'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </label>
  );
}

function ProfileSection({ user, auth }) {
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const storageId = String(user?.id || user?.email || 'customer');

  const propertiesKey = `matelink.customer.properties.${storageId}`;
  const preferencesKey = `matelink.customer.notifications.${storageId}`;

  const [properties, setProperties] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(propertiesKey) || '[]');
    } catch {
      return [];
    }
  });

  const [newProperty, setNewProperty] = useState('');

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(preferencesKey) || 'null');
      if (saved) return saved;
    } catch {
      // use defaults
    }

    return {
      email: true,
      sms: true,
      whatsapp: false,
      reminders: true,
    };
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    setProfile({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  async function saveProfile(event) {
    event.preventDefault();

    if (!profile.first_name.trim() || !profile.last_name.trim()) {
      toast.error('Enter your first and last name.');
      return;
    }

    const payload = {
      ...profile,
      first_name: profile.first_name.trim(),
      last_name: profile.last_name.trim(),
      name: `${profile.first_name.trim()} ${profile.last_name.trim()}`,
      email: profile.email.trim().toLowerCase(),
      phone: profile.phone.trim(),
    };

    try {
      if (typeof auth.updateProfile === 'function') {
        const response = await auth.updateProfile(payload);
        auth.updateUser?.(response?.data?.user || response?.user || payload);
      } else {
        auth.updateUser?.(payload);
      }

      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error?.displayMessage || error?.message || 'Unable to update profile.');
    }
  }

  function addProperty(event) {
    event.preventDefault();
    const address = newProperty.trim();

    if (!address) return;

    const next = [...properties, { id: Date.now(), address }];
    setProperties(next);
    localStorage.setItem(propertiesKey, JSON.stringify(next));
    setNewProperty('');
    toast.success('Property saved.');
  }

  function deleteProperty(id) {
    const next = properties.filter((item) => item.id !== id);
    setProperties(next);
    localStorage.setItem(propertiesKey, JSON.stringify(next));
  }

  function savePreferences() {
    localStorage.setItem(preferencesKey, JSON.stringify(preferences));
    toast.success('Notification preferences saved.');
  }

  async function changePassword(event) {
    event.preventDefault();

    if (!passwords.current_password) {
      toast.error('Enter your current password.');
      return;
    }

    if (passwords.password.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    if (passwords.password !== passwords.password_confirmation) {
      toast.error('New passwords do not match.');
      return;
    }

    if (typeof auth.changePassword !== 'function') {
      toast.info(
        'Password form is ready, but your current AuthContext still needs a server changePassword method.',
      );
      return;
    }

    try {
      await auth.changePassword(passwords);
      setPasswords({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      toast.success('Password changed successfully.');
    } catch (error) {
      toast.error(error?.displayMessage || error?.message || 'Unable to change password.');
    }
  }

  return (
    <>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#087e83]">
          Profile
        </p>
        <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#102d43]">
          Your details & preferences.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#70848e]">
          Contact details, saved properties, notifications and account security.
        </p>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <ShellCard>
          <SectionHeader
            icon={UserRound}
            eyebrow="Personal details"
            title="Profile information"
            description="The details Matelink uses for your account."
          />
          <form onSubmit={saveProfile} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                className="mt-2 h-11"
                value={profile.first_name}
                onChange={(event) =>
                  setProfile((value) => ({
                    ...value,
                    first_name: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                className="mt-2 h-11"
                value={profile.last_name}
                onChange={(event) =>
                  setProfile((value) => ({
                    ...value,
                    last_name: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="mt-2 h-11"
                value={profile.email}
                onChange={(event) =>
                  setProfile((value) => ({
                    ...value,
                    email: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                className="mt-2 h-11"
                value={profile.phone}
                onChange={(event) =>
                  setProfile((value) => ({
                    ...value,
                    phone: event.target.value,
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="h-10 px-5 text-[11px]">
                Save Profile
              </Button>
            </div>
          </form>
        </ShellCard>

        <ShellCard>
          <SectionHeader
            icon={Bell}
            eyebrow="Notifications"
            title="Notification preferences"
            description="Choose how Matelink keeps you updated."
          />
          <div className="px-5 sm:px-6">
            <Toggle
              label="Email updates"
              description="Booking, payment and service updates."
              checked={preferences.email}
              onChange={(checked) =>
                setPreferences((value) => ({ ...value, email: checked }))
              }
            />
            <Toggle
              label="SMS updates"
              description="Time-sensitive appointment updates."
              checked={preferences.sms}
              onChange={(checked) =>
                setPreferences((value) => ({ ...value, sms: checked }))
              }
            />
            <Toggle
              label="WhatsApp updates"
              description="Supported Matelink messages through WhatsApp."
              checked={preferences.whatsapp}
              onChange={(checked) =>
                setPreferences((value) => ({ ...value, whatsapp: checked }))
              }
            />
            <Toggle
              label="Appointment reminders"
              description="Reminders before confirmed cleaning appointments."
              checked={preferences.reminders}
              onChange={(checked) =>
                setPreferences((value) => ({ ...value, reminders: checked }))
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={savePreferences}
              className="mb-6 mt-2 h-10 px-4 text-[11px]"
            >
              Save Preferences
            </Button>
          </div>
        </ShellCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ShellCard>
          <SectionHeader
            icon={House}
            eyebrow="Properties"
            title="Saved properties"
            description="Keep your regular cleaning addresses together."
          />
          <div className="p-5 sm:p-6">
            {user?.address ? (
              <div className="mb-2 flex items-center gap-3 rounded-[12px] border border-[#e1e7e8] px-4 py-3">
                <MapPin size={16} className="text-[#087e83]" />
                <p className="text-[11px] font-medium text-[#405965]">
                  {user.address}
                </p>
              </div>
            ) : null}

            {properties.map((property) => (
              <div
                key={property.id}
                className="mb-2 flex items-center gap-3 rounded-[12px] border border-[#e1e7e8] px-4 py-3"
              >
                <MapPin size={16} className="text-[#087e83]" />
                <p className="min-w-0 flex-1 text-[11px] text-[#405965]">
                  {property.address}
                </p>
                <button
                  type="button"
                  onClick={() => deleteProperty(property.id)}
                  className="grid h-8 w-8 place-items-center rounded-[8px] text-[#89979e] hover:bg-[#fbf3f2] hover:text-[#9a4d45]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <form onSubmit={addProperty} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                className="h-11 flex-1"
                placeholder="Add another property address"
                value={newProperty}
                onChange={(event) => setNewProperty(event.target.value)}
              />
              <Button variant="outline" className="h-11 px-4 text-[11px]">
                <Plus size={14} />
                Add Property
              </Button>
            </form>
          </div>
        </ShellCard>

        <ShellCard>
          <SectionHeader
            icon={LockKeyhole}
            eyebrow="Security"
            title="Change password"
            description="Use a strong password you do not use elsewhere."
          />
          <form onSubmit={changePassword} className="space-y-4 p-5 sm:p-6">
            <div>
              <Label htmlFor="current_password">Current password</Label>
              <div className="mt-2">
                <PasswordField
                  id="current_password"
                  value={passwords.current_password}
                  onChange={(event) =>
                    setPasswords((value) => ({
                      ...value,
                      current_password: event.target.value,
                    }))
                  }
                  autoComplete="current-password"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new_password">New password</Label>
              <div className="mt-2">
                <PasswordField
                  id="new_password"
                  value={passwords.password}
                  onChange={(event) =>
                    setPasswords((value) => ({
                      ...value,
                      password: event.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirm new password</Label>
              <div className="mt-2">
                <PasswordField
                  id="confirm_password"
                  value={passwords.password_confirmation}
                  onChange={(event) =>
                    setPasswords((value) => ({
                      ...value,
                      password_confirmation: event.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  placeholder="Enter new password again"
                />
              </div>
            </div>

            <Button type="submit" className="h-10 px-5 text-[11px]">
              Change Password
            </Button>
          </form>
        </ShellCard>
      </div>

      <div className="mt-6">
        <ShellCard>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#edf6f5] text-[#087e83]">
                <LifeBuoy size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#102d43]">
                  Help & Support
                </p>
                <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#758892]">
                  Need help with your account, booking, payment or cleaning plan?
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="h-10 px-4 text-[11px]">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </ShellCard>
      </div>
    </>
  );
}

export default function AccountPage() {
  const auth = useAuth();
  const user = auth.user;

  const { bookings = [], notifications = [] } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingRequests, setPendingRequests] = useState({});
  const [cardRequests, setCardRequests] = useState({});

  const requestedSection = searchParams.get('section');
  const activeSection = sectionIds.has(requestedSection)
    ? requestedSection
    : 'home';

  const requestedTab = searchParams.get('tab');
  const activeTab = tabIds.has(requestedTab) ? requestedTab : 'upcoming';

  const customerBookings = useMemo(
    () => bookings.filter((booking) => belongsToCustomer(booking, user)),
    [bookings, user],
  );

  const bookingIds = useMemo(
    () => new Set(customerBookings.map((booking) => String(booking.id))),
    [customerBookings],
  );

  const customerNotifications = useMemo(
    () =>
      notifications
        .filter((item) =>
          notificationBelongsToCustomer(item, user, bookingIds),
        )
        .slice()
        .reverse(),
    [notifications, user, bookingIds],
  );

  const upcoming = useMemo(
    () =>
      sortByDate(
        customerBookings.filter(
          (booking) =>
            !isCompleted(booking) &&
            !isCancelled(booking) &&
            !isPast(booking),
        ),
      ),
    [customerBookings],
  );

  const history = useMemo(
    () =>
      sortByDate(
        customerBookings.filter(
          (booking) =>
            isCompleted(booking) ||
            isCancelled(booking) ||
            isPast(booking),
        ),
        'desc',
      ),
    [customerBookings],
  );

  const plans = useMemo(
    () => buildCleaningPlans(customerBookings),
    [customerBookings],
  );

  const nextConfirmed = useMemo(
    () =>
      sortByDate(
        customerBookings.filter((booking) => {
          const [key] = bookingStatus(booking);
          return (
            ['confirmed', 'on-the-way', 'cleaning'].includes(key) &&
            !isPast(booking)
          );
        }),
      )[0] || null,
    [customerBookings],
  );

  const paymentBookings = useMemo(
    () =>
      sortByDate(
        customerBookings.filter((booking) => !isCancelled(booking)),
        'desc',
      ),
    [customerBookings],
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  function changeSection(section) {
    const next = new URLSearchParams(searchParams);
    next.set('section', section);

    if (section !== 'bookings') next.delete('tab');

    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function changeTab(tab) {
    const next = new URLSearchParams(searchParams);
    next.set('section', 'bookings');
    next.set('tab', tab);
    setSearchParams(next);
  }

  function requestChange(scope, id, kind) {
    const key = `${scope}:${id}:${kind}`;

    setPendingRequests((current) => ({
      ...current,
      [key]: {
        scope,
        id,
        kind,
        status: 'awaiting-approval',
        createdAt: new Date().toISOString(),
      },
    }));

    toast.success(
      'Request sent. Your current booking or cleaning plan stays unchanged until Matelink approves it.',
    );
  }

  function requestCardLink(booking) {
    setCardRequests((current) => ({
      ...current,
      [booking.id]: true,
    }));

    toast.success(
      'Card payment link requested. Matelink will send a separate secure link after review.',
    );
  }

  return (
    <section className="min-h-[70vh] bg-[#f7f6f2] py-8 sm:py-10 lg:py-12">
      <div className="container-site">
        <AccountNavigation active={activeSection} onChange={changeSection} />

        <div className="mt-7 lg:mt-9">
          {activeSection === 'home' ? (
            <HomeSection
              user={user}
              bookings={customerBookings}
              nextConfirmed={nextConfirmed}
              plans={plans}
              notifications={customerNotifications}
              pendingRequests={pendingRequests}
              onRequest={requestChange}
              onSection={changeSection}
            />
          ) : null}

          {activeSection === 'bookings' ? (
            <BookingsSection
              activeTab={activeTab}
              onTab={changeTab}
              upcoming={upcoming}
              plans={plans}
              history={history}
              pendingRequests={pendingRequests}
              onRequest={requestChange}
            />
          ) : null}

          {activeSection === 'book' ? <BookNowSection /> : null}

          {activeSection === 'payments' ? (
            <PaymentsSection
              bookings={paymentBookings}
              cardRequests={cardRequests}
              onCardRequest={requestCardLink}
            />
          ) : null}

          {activeSection === 'profile' ? (
            <ProfileSection user={user} auth={auth} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

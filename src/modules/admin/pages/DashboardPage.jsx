import {
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  MessageSquare,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Target,
  Users,
  WalletCards,
} from 'lucide-react';

import { Card } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/Shared';

import { useApp } from '@/shared/context/AppContext';

import { services } from '@/shared/data/content';
import { formatDate } from '@/shared/lib/dates';


/* =========================================================
   FORMATTERS
   ========================================================= */

const currency = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormat = new Intl.NumberFormat('en-AU');


function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


function formatMoney(value) {
  return currency.format(
    safeNumber(value)
  );
}


function formatCompactMoney(value) {
  return compactCurrency.format(
    safeNumber(value)
  );
}


function percentage(part, total) {
  if (!total) return 0;

  return Math.max(
    0,
    Math.min(
      100,
      (part / total) * 100
    )
  );
}


function serviceName(id) {
  return (
    services.find(
      service => service.id === id
    )?.name ||
    'Custom clean'
  );
}


function bookingValue(booking) {
  const confirmed =
    booking?.confirmedTotal;

  const estimated =
    booking?.priceSnapshot?.total;

  if (
    confirmed !== null &&
    confirmed !== undefined &&
    confirmed !== '' &&
    Number.isFinite(
      Number(confirmed)
    )
  ) {
    return safeNumber(confirmed);
  }

  if (
    estimated !== null &&
    estimated !== undefined &&
    estimated !== '' &&
    Number.isFinite(
      Number(estimated)
    )
  ) {
    return safeNumber(estimated);
  }

  return 0;
}


function bookingCreatedDate(
  booking
) {
  const candidate =
    booking?.createdAt ||
    booking?.created_at ||
    booking?.date;

  if (!candidate) {
    return null;
  }

  const date =
    new Date(candidate);

  return !Number.isNaN(
    date.getTime()
  )
    ? date
    : null;
}


function monthKey(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
}


function lastSixMonths() {
  const now = new Date();

  const months = [];

  for (
    let offset = 5;
    offset >= 0;
    offset -= 1
  ) {
    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() - offset,
        1
      );

    months.push({
      key: monthKey(date),

      label:
        date.toLocaleDateString(
          'en-AU',
          {
            month: 'short',
          }
        ),

      longLabel:
        date.toLocaleDateString(
          'en-AU',
          {
            month: 'long',
            year: 'numeric',
          }
        ),
    });
  }

  return months;
}


function todayISO() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}


/* =========================================================
   PAGE HEADING
   ========================================================= */

function DashboardIntro({
  totalValue,
  activeOrders,
  attentionCount,
  todayJobs,
}) {
  const today =
    new Date().toLocaleDateString(
      'en-AU',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );

  return (
    <section
      className="
        overflow-hidden
        rounded-[24px]
        border border-[#dfe5e7]
        bg-white
        shadow-[0_14px_40px_rgba(16,45,67,0.045)]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-7
          px-6
          py-7

          sm:px-8
          sm:py-8

          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >
        <div className="max-w-3xl">
          <div
            className="
              inline-flex
              items-center
              gap-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#087e83]
            "
          >
            <Activity size={14} />

            Website overview
          </div>

          <h1
            className="
              mt-3
              text-[2rem]
              font-semibold
              leading-[1.08]
              tracking-[-0.05em]
              text-[#102d43]

              sm:text-[2.35rem]
            "
          >
            Matelink operations
            at a glance.
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-[#657985]
            "
          >
            Monitor bookings,
            customers, enquiries,
            revenue, payments and
            service activity from one
            place.
          </p>
        </div>

        <div
          className="
            grid
            w-full
            gap-3

            sm:grid-cols-2

            xl:w-auto
            xl:min-w-[480px]
          "
        >
          <OverviewBrief
            label="Today"
            value={today}
            helper={
              todayJobs
                ? `${todayJobs} job${
                    todayJobs === 1
                      ? ''
                      : 's'
                  } scheduled`
                : 'No jobs scheduled today'
            }
          />

          <OverviewBrief
            label="Current pipeline"
            value={
              formatMoney(
                totalValue
              )
            }
            helper={`${activeOrders} active order${
              activeOrders === 1
                ? ''
                : 's'
            } · ${attentionCount} requiring attention`}
          />
        </div>
      </div>
    </section>
  );
}


function OverviewBrief({
  label,
  value,
  helper,
}) {
  return (
    <div
      className="
        rounded-[18px]
        border border-[#dfe5e7]
        bg-[#fafbfb]
        px-5
        py-4
      "
    >
      <p
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-[0.15em]
          text-[#7a8d98]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-base
          font-semibold
          tracking-[-0.025em]
          text-[#102d43]
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-[10px]
          leading-4
          text-[#788b95]
        "
      >
        {helper}
      </p>
    </div>
  );
}


/* =========================================================
   PRIMARY KPI CARD
   ========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  badge,
  progress,
  to,
}) {
  const body = (
    <Card
      className="
        group
        h-full
        overflow-hidden
        rounded-[20px]
        border
        border-[#dfe5e7]
        bg-white
        p-0
        shadow-none
        transition-all
        duration-200

        hover:border-[#c9dadc]
        hover:shadow-[0_12px_30px_rgba(16,45,67,0.055)]
      "
    >
      <div className="p-5">
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-[12px]
              bg-[#edf6f5]
              text-[#087e83]
            "
          >
            <Icon
              size={18}
              strokeWidth={1.8}
            />
          </div>

          {badge ? (
            <span
              className="
                rounded-full
                border
                border-[#e1e7e9]
                bg-[#fafbfb]
                px-2.5
                py-1
                text-[8px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-[#7a8d98]
              "
            >
              {badge}
            </span>
          ) : null}
        </div>

        <p
          className="
            mt-5
            text-[9px]
            font-bold
            uppercase
            tracking-[0.13em]
            text-[#71858f]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-2
            text-[1.9rem]
            font-semibold
            leading-none
            tracking-[-0.05em]
            text-[#102d43]
          "
        >
          {value}
        </p>

        <p
          className="
            mt-2
            min-h-[36px]
            text-[11px]
            leading-[18px]
            text-[#738691]
          "
        >
          {note}
        </p>

        {typeof progress ===
        'number' ? (
          <div
            className="
              mt-5
              h-[4px]
              overflow-hidden
              rounded-full
              bg-[#edf1f2]
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-[#087e83]
                transition-all
                duration-500
              "
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    progress
                  )
                )}%`,
              }}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );

  if (!to) {
    return body;
  }

  return (
    <Link
      to={to}
      className="block h-full"
    >
      {body}
    </Link>
  );
}


/* =========================================================
   SMALL OVERVIEW CARDS
   ========================================================= */

function QuickOverviewCard({
  icon: Icon,
  label,
  value,
  helper,
  to,
}) {
  const content = (
    <div
      className="
        group
        flex
        h-full
        min-h-[104px]
        items-center
        gap-4
        rounded-[18px]
        border
        border-[#dfe5e7]
        bg-white
        px-5
        py-4
        transition-all
        duration-200

        hover:border-[#c9dadc]
        hover:shadow-[0_10px_26px_rgba(16,45,67,0.045)]
      "
    >
      <div
        className="
          grid
          h-10
          w-10
          shrink-0
          place-items-center
          rounded-[12px]
          bg-[#edf6f5]
          text-[#087e83]
        "
      >
        <Icon
          size={17}
          strokeWidth={1.8}
        />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-[8px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-[#7a8d98]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            text-xl
            font-semibold
            tracking-[-0.04em]
            text-[#102d43]
          "
        >
          {value}
        </p>

        <p
          className="
            mt-1
            truncate
            text-[10px]
            text-[#7b8d97]
          "
        >
          {helper}
        </p>
      </div>

      {to ? (
        <ChevronRight
          size={15}
          className="
            shrink-0
            text-[#91a0a8]
            transition-transform
            group-hover:translate-x-0.5
            group-hover:text-[#087e83]
          "
        />
      ) : null}
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link
      to={to}
      className="block h-full"
    >
      {content}
    </Link>
  );
}


/* =========================================================
   SECTION HEADER
   ========================================================= */

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        border-b
        border-[#e3e8ea]
        px-6
        py-5

        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div className="min-w-0">
        <div
          className="
            flex
            items-center
            gap-2
            text-[#087e83]
          "
        >
          {Icon ? (
            <Icon size={14} />
          ) : null}

          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.15em]
            "
          >
            {eyebrow}
          </span>
        </div>

        <h2
          className="
            mt-2
            text-xl
            font-semibold
            tracking-[-0.04em]
            text-[#102d43]
          "
        >
          {title}
        </h2>

        {description ? (
          <p
            className="
              mt-1.5
              max-w-2xl
              text-[11px]
              leading-5
              text-[#768992]
            "
          >
            {description}
          </p>
        ) : null}
      </div>

      {action}
    </div>
  );
}


/* =========================================================
   REVENUE TREND CHART
   ========================================================= */

function RevenueTrendChart({
  data,
}) {
  const [
    hoveredIndex,
    setHoveredIndex,
  ] = useState(
    data.length
      ? data.length - 1
      : null
  );

  const width = 900;
  const height = 310;

  const leftPadding = 62;
  const rightPadding = 24;
  const topPadding = 24;
  const bottomPadding = 48;

  const chartWidth =
    width -
    leftPadding -
    rightPadding;

  const chartHeight =
    height -
    topPadding -
    bottomPadding;

  const maxRaw =
    Math.max(
      ...data.map(
        item =>
          safeNumber(
            item.value
          )
      ),
      1
    );

  const maxValue =
    Math.ceil(
      maxRaw / 50
    ) * 50 || 50;

  const points = data.map(
    (item, index) => {
      const x =
        data.length === 1
          ? leftPadding +
            chartWidth / 2
          : leftPadding +
            (
              index /
              (data.length - 1)
            ) *
              chartWidth;

      const y =
        topPadding +
        chartHeight -
        (
          safeNumber(
            item.value
          ) /
          maxValue
        ) *
          chartHeight;

      return {
        ...item,
        x,
        y,
      };
    }
  );

  const linePath =
    points
      .map(
        (
          point,
          index
        ) =>
          `${
            index === 0
              ? 'M'
              : 'L'
          } ${point.x} ${point.y}`
      )
      .join(' ');

  const areaPath =
    points.length
      ? `${linePath}
         L ${
           points[
             points.length -
               1
           ].x
         } ${
           topPadding +
           chartHeight
         }
         L ${points[0].x} ${
           topPadding +
           chartHeight
         } Z`
      : '';

  const active =
    hoveredIndex === null
      ? null
      : points[
          hoveredIndex
        ];

  const yTicks = [
    1,
    0.75,
    0.5,
    0.25,
    0,
  ];

  return (
    <div>
      <div
        className="
          mb-2
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
          px-1
        "
      >
        <p
          className="
            text-[10px]
            text-[#7a8c96]
          "
        >
          Hover any month to
          inspect performance.
        </p>

        <div
          className="
            min-w-[165px]
            rounded-[12px]
            border
            border-[#e1e7e9]
            bg-[#fafbfb]
            px-4
            py-2.5
            text-right
          "
        >
          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.13em]
              text-[#82939b]
            "
          >
            {active?.longLabel ||
              'Current period'}
          </p>

          <div
            className="
              mt-1
              flex
              items-end
              justify-end
              gap-2
            "
          >
            <strong
              className="
                text-base
                font-semibold
                text-[#102d43]
              "
            >
              {formatMoney(
                active?.value || 0
              )}
            </strong>

            <span
              className="
                pb-[1px]
                text-[9px]
                text-[#85959d]
              "
            >
              {active?.orders ||
                0}{' '}
              order
              {(active?.orders ||
                0) === 1
                ? ''
                : 's'}
            </span>
          </div>
        </div>
      </div>

      <div
        className="
          w-full
          overflow-hidden
        "
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="
            block
            h-[300px]
            w-full
          "
          role="img"
          aria-label="Booked value trend"
        >
          <defs>
            <linearGradient
              id="dashboardRevenueArea"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#087e83"
                stopOpacity="0.13"
              />

              <stop
                offset="100%"
                stopColor="#087e83"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {yTicks.map(
            (
              fraction,
              index
            ) => {
              const y =
                topPadding +
                chartHeight *
                  (1 -
                    fraction);

              const value =
                maxValue *
                fraction;

              return (
                <g
                  key={
                    fraction
                  }
                >
                  <line
                    x1={
                      leftPadding
                    }
                    x2={
                      width -
                      rightPadding
                    }
                    y1={y}
                    y2={y}
                    stroke="#e4eaec"
                    strokeWidth="1"
                    strokeDasharray={
                      index ===
                      yTicks.length -
                        1
                        ? '0'
                        : '4 6'
                    }
                  />

                  <text
                    x={
                      leftPadding -
                      12
                    }
                    y={y + 4}
                    textAnchor="end"
                    fill="#8a9aa2"
                    fontSize="10"
                  >
                    {formatCompactMoney(
                      value
                    )}
                  </text>
                </g>
              );
            }
          )}

          {areaPath ? (
            <path
              d={areaPath}
              fill="url(#dashboardRevenueArea)"
            />
          ) : null}

          {linePath ? (
            <path
              d={linePath}
              fill="none"
              stroke="#087e83"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map(
            (
              point,
              index
            ) => {
              const
                slotWidth =
                  chartWidth /
                  Math.max(
                    data.length,
                    1
                  );

              return (
                <g
                  key={
                    point.key
                  }
                >
                  {hoveredIndex ===
                  index ? (
                    <line
                      x1={
                        point.x
                      }
                      x2={
                        point.x
                      }
                      y1={
                        topPadding
                      }
                      y2={
                        topPadding +
                        chartHeight
                      }
                      stroke="#087e83"
                      strokeWidth="1"
                      strokeDasharray="4 5"
                      opacity="0.22"
                    />
                  ) : null}

                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={
                      hoveredIndex ===
                      index
                        ? 6
                        : 4
                    }
                    fill="#ffffff"
                    stroke="#087e83"
                    strokeWidth={
                      hoveredIndex ===
                      index
                        ? 2.5
                        : 2
                    }
                  />

                  <rect
                    x={
                      point.x -
                      slotWidth /
                        2
                    }
                    y={0}
                    width={
                      slotWidth
                    }
                    height={
                      height -
                      24
                    }
                    fill="transparent"
                    style={{
                      cursor:
                        'crosshair',
                    }}
                    onMouseEnter={() =>
                      setHoveredIndex(
                        index
                      )
                    }
                    onFocus={() =>
                      setHoveredIndex(
                        index
                      )
                    }
                  />

                  <text
                    x={point.x}
                    y={
                      height - 15
                    }
                    textAnchor="middle"
                    fill="#71858f"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {
                      point.label
                    }
                  </text>
                </g>
              );
            }
          )}
        </svg>
      </div>
    </div>
  );
}


/* =========================================================
   STATUS DONUT
   ========================================================= */

function StatusDonut({
  data,
  total,
}) {
  const [
    hovered,
    setHovered,
  ] = useState(null);

  const size = 180;
  const radius = 65;

  const circumference =
    2 *
    Math.PI *
    radius;

  const palette = [
    '#087e83',
    '#102d43',
    '#6faead',
    '#9fc8c6',
    '#d6e1e3',
  ];

  let consumed = 0;

  const active =
    hovered === null
      ? null
      : data[hovered];

  return (
    <div
      className="
        grid
        gap-7

        md:grid-cols-[180px_1fr]
        md:items-center
      "
    >
      <div
        className="
          relative
          mx-auto
          h-[180px]
          w-[180px]
        "
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="
            h-full
            w-full
            -rotate-90
          "
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#edf1f2"
            strokeWidth="16"
          />

          {data.map(
            (
              item,
              index
            ) => {
              const fraction =
                total > 0
                  ? item.value /
                    total
                  : 0;

              const dash =
                fraction *
                circumference;

              const offset =
                -consumed *
                circumference;

              consumed +=
                fraction;

              return (
                <circle
                  key={
                    item.key
                  }
                  cx={
                    size / 2
                  }
                  cy={
                    size / 2
                  }
                  r={radius}
                  fill="none"
                  stroke={
                    palette[
                      index %
                        palette.length
                    ]
                  }
                  strokeWidth={
                    hovered ===
                    index
                      ? 19
                      : 16
                  }
                  strokeLinecap="butt"
                  strokeDasharray={`${dash} ${
                    circumference -
                    dash
                  }`}
                  strokeDashoffset={
                    offset
                  }
                  className="
                    cursor-pointer
                    transition-all
                    duration-200
                  "
                  onMouseEnter={() =>
                    setHovered(
                      index
                    )
                  }
                  onMouseLeave={() =>
                    setHovered(
                      null
                    )
                  }
                />
              );
            }
          )}
        </svg>

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            grid
            place-items-center
            text-center
          "
        >
          <div>
            <p
              className="
                text-[1.8rem]
                font-semibold
                leading-none
                tracking-[-0.05em]
                text-[#102d43]
              "
            >
              {active
                ? active.value
                : total}
            </p>

            <p
              className="
                mt-2
                text-[8px]
                font-bold
                uppercase
                tracking-[0.13em]
                text-[#84959d]
              "
            >
              {active
                ? active.label
                : 'Total orders'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {data.map(
          (
            item,
            index
          ) => (
            <button
              key={item.key}
              type="button"
              onMouseEnter={() =>
                setHovered(
                  index
                )
              }
              onMouseLeave={() =>
                setHovered(
                  null
                )
              }
              className={`
                flex
                w-full
                items-center
                justify-between
                rounded-[10px]
                px-3
                py-2.5
                text-left
                transition

                ${
                  hovered ===
                  index
                    ? 'bg-[#f2f7f6]'
                    : 'hover:bg-[#fafbfb]'
                }
              `}
            >
              <span
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                  "
                  style={{
                    backgroundColor:
                      palette[
                        index %
                          palette.length
                      ],
                  }}
                />

                <span
                  className="
                    text-xs
                    font-medium
                    text-[#435966]
                  "
                >
                  {
                    item.label
                  }
                </span>
              </span>

              <strong
                className="
                  text-xs
                  text-[#102d43]
                "
              >
                {
                  item.value
                }
              </strong>
            </button>
          )
        )}
      </div>
    </div>
  );
}


/* =========================================================
   SERVICE PERFORMANCE
   ========================================================= */

function ServicePerformance({
  data,
}) {
  const maxValue =
    Math.max(
      ...data.map(
        item =>
          item.count
      ),
      1
    );

  return (
    <div className="space-y-5">
      {data.map(item => {
        const width =
          (
            item.count /
            maxValue
          ) *
          100;

        return (
          <div
            key={item.key}
          >
            <div
              className="
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#102d43]
                  "
                >
                  {item.label}
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-[#7a8d96]
                  "
                >
                  {item.count}{' '}
                  booking
                  {item.count ===
                  1
                    ? ''
                    : 's'}
                </p>
              </div>

              <p
                className="
                  text-xs
                  font-semibold
                  text-[#102d43]
                "
              >
                {formatMoney(
                  item.value
                )}
              </p>
            </div>

            <div
              className="
                mt-3
                h-[5px]
                overflow-hidden
                rounded-full
                bg-[#edf1f2]
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-[#087e83]
                  transition-all
                  duration-500
                "
                style={{
                  width: `${Math.max(
                    width,
                    item.count
                      ? 5
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* =========================================================
   OPERATIONS ROW
   ========================================================= */

function OperationsRow({
  icon: Icon,
  label,
  description,
  value,
  to,
}) {
  return (
    <Link
      to={to}
      className="
        group
        flex
        items-center
        gap-4
        border-b
        border-[#e5eaec]
        px-6
        py-4
        last:border-b-0

        hover:bg-[#fbfcfc]
      "
    >
      <div
        className="
          grid
          h-10
          w-10
          shrink-0
          place-items-center
          rounded-[11px]
          bg-[#edf6f5]
          text-[#087e83]
        "
      >
        <Icon
          size={17}
          strokeWidth={1.8}
        />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-xs
            font-semibold
            text-[#102d43]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            truncate
            text-[10px]
            text-[#7a8c95]
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <strong
          className="
            text-lg
            font-semibold
            text-[#102d43]
          "
        >
          {value}
        </strong>

        <ChevronRight
          size={15}
          className="
            text-[#98a5ab]
            transition-transform
            group-hover:translate-x-0.5
            group-hover:text-[#087e83]
          "
        />
      </div>
    </Link>
  );
}


/* =========================================================
   FINANCIAL OVERVIEW
   ========================================================= */

function FinancialOverview({
  totalValue,
  paidRevenue,
  outstanding,
  averageOrder,
  collectionRate,
}) {
  return (
    <div className="p-6">
      <div
        className="
          grid
          gap-3
          sm:grid-cols-3
        "
      >
        <FinanceCell
          label="Booked"
          value={formatMoney(
            totalValue
          )}
        />

        <FinanceCell
          label="Collected"
          value={formatMoney(
            paidRevenue
          )}
        />

        <FinanceCell
          label="Outstanding"
          value={formatMoney(
            outstanding
          )}
        />
      </div>

      <div
        className="
          mt-5
          rounded-[16px]
          border
          border-[#e1e7e9]
          bg-[#fafbfb]
          p-4
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <span
            className="
              text-[10px]
              font-medium
              text-[#758993]
            "
          >
            Payment collection
          </span>

          <strong
            className="
              text-sm
              font-semibold
              text-[#102d43]
            "
          >
            {collectionRate.toFixed(
              0
            )}
            %
          </strong>
        </div>

        <div
          className="
            mt-3
            h-[5px]
            overflow-hidden
            rounded-full
            bg-[#e7edef]
          "
        >
          <div
            className="
              h-full
              rounded-full
              bg-[#087e83]
            "
            style={{
              width: `${collectionRate}%`,
            }}
          />
        </div>

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            gap-4
            border-t
            border-[#e3e8ea]
            pt-4
          "
        >
          <span
            className="
              text-[10px]
              text-[#7b8d96]
            "
          >
            Average order
            value
          </span>

          <strong
            className="
              text-base
              font-semibold
              text-[#102d43]
            "
          >
            {formatMoney(
              averageOrder
            )}
          </strong>
        </div>
      </div>
    </div>
  );
}


function FinanceCell({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-[14px]
        border
        border-[#e1e7e9]
        bg-white
        p-4
      "
    >
      <p
        className="
          text-[8px]
          font-bold
          uppercase
          tracking-[0.13em]
          text-[#81939b]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-xl
          font-semibold
          tracking-[-0.04em]
          text-[#102d43]
        "
      >
        {value}
      </p>
    </div>
  );
}


/* =========================================================
   REVIEW QUEUE
   ========================================================= */

function BookingReviewRow({
  booking,
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        border-b
        border-[#e5eaec]
        px-6
        py-4
        last:border-b-0

        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div className="min-w-0">
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <p
            className="
              truncate
              text-xs
              font-semibold
              text-[#102d43]
            "
          >
            {booking
              ?.customer
              ?.name ||
              'Customer'}
          </p>

          <span
            className="
              rounded-full
              bg-[#f2f6f6]
              px-2
              py-1
              text-[8px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-[#60747f]
            "
          >
            Pending
          </span>
        </div>

        <p
          className="
            mt-1.5
            text-[10px]
            text-[#758892]
          "
        >
          {serviceName(
            booking.service
          )}{' '}
          ·{' '}
          {booking.reference ||
            booking.id}
        </p>

        <p
          className="
            mt-1
            text-[10px]
            text-[#87979f]
          "
        >
          {booking.postcode ||
            'No postcode'}{' '}
          ·{' '}
          {formatMoney(
            bookingValue(
              booking
            )
          )}
        </p>
      </div>

      <Link
        to={`/admin/bookings?booking=${booking.id}`}
        className="
          inline-flex
          h-9
          shrink-0
          items-center
          justify-center
          gap-1.5
          rounded-[9px]
          border
          border-[#dce3e6]
          bg-white
          px-3
          text-[10px]
          font-semibold
          text-[#102d43]

          hover:border-[#bcd4d5]
          hover:bg-[#f5faf9]
        "
      >
        Review

        <ArrowRight
          size={13}
        />
      </Link>
    </div>
  );
}


/* =========================================================
   UPCOMING BOOKINGS
   ========================================================= */

function UpcomingBookingRow({
  booking,
}) {
  return (
    <div
      className="
        flex
        gap-4
        border-b
        border-[#e5eaec]
        px-6
        py-4
        last:border-b-0
      "
    >
      <div
        className="
          grid
          h-10
          w-10
          shrink-0
          place-items-center
          rounded-[11px]
          bg-[#edf6f5]
          text-[#087e83]
        "
      >
        <CalendarDays
          size={17}
        />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                text-[#102d43]
              "
            >
              {booking.date
                ? formatDate(
                    booking.date
                  )
                : 'Date pending'}
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-[#768a94]
              "
            >
              {serviceName(
                booking.service
              )}
            </p>
          </div>

          <strong
            className="
              shrink-0
              text-xs
              text-[#102d43]
            "
          >
            {formatMoney(
              bookingValue(
                booking
              )
            )}
          </strong>
        </div>

        <p
          className="
            mt-2
            truncate
            text-[10px]
            text-[#87979f]
          "
        >
          {booking
            ?.customer
            ?.name ||
            'Customer'}{' '}
          ·{' '}
          {booking.postcode ||
            '—'}{' '}
          ·{' '}
          {booking.time ||
            'Time to be arranged'}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   RECENT ACTIVITY
   ========================================================= */

function ActivityItem({
  notification,
}) {
  return (
    <div
      className="
        flex
        gap-3
        border-b
        border-[#e5eaec]
        px-6
        py-4
        last:border-b-0
      "
    >
      <div
        className="
          mt-0.5
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-[10px]
          bg-[#edf6f5]
          text-[#087e83]
        "
      >
        <ReceiptText
          size={15}
        />
      </div>

      <div className="min-w-0">
        <p
          className="
            text-xs
            font-semibold
            capitalize
            text-[#102d43]
          "
        >
          {notification.event ||
            'Activity'}
        </p>

        <p
          className="
            mt-1
            truncate
            text-[10px]
            text-[#788b94]
          "
        >
          {notification.to ||
            notification.message ||
            'Frontend notification event'}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

export function DashboardPage() {
  const {
    bookings = [],
    quotes = [],
    contacts = [],
    notifications = [],
  } = useApp();


  const data = useMemo(
    () => {
      /*
       * Prefer real/non-demo
       * bookings.
       *
       * If this frontend still only
       * contains demo records,
       * continue displaying them.
       */

      const realBookings =
        bookings.filter(
          booking =>
            !booking.demo
        );

      const dashboardBookings =
        realBookings.length
          ? realBookings
          : bookings;


      /* -----------------------------------------
         Booking statuses
         ----------------------------------------- */

      const pending =
        dashboardBookings.filter(
          booking =>
            booking.status ===
            'pending'
        );

      const confirmed =
        dashboardBookings.filter(
          booking =>
            booking.status ===
            'confirmed'
        );

      const cleaning =
        dashboardBookings.filter(
          booking =>
            booking.status ===
            'cleaning'
        );

      const completed =
        dashboardBookings.filter(
          booking =>
            booking.status ===
            'completed'
        );

      const cancelled =
        dashboardBookings.filter(
          booking =>
            booking.status ===
            'cancelled'
        );

      const activeBookings =
        dashboardBookings.filter(
          booking =>
            booking.status !==
            'cancelled'
        );


      /* -----------------------------------------
         Financial data
         ----------------------------------------- */

      const totalValue =
        activeBookings.reduce(
          (
            sum,
            booking
          ) =>
            sum +
            bookingValue(
              booking
            ),
          0
        );

      const paidBookings =
        dashboardBookings.filter(
          booking =>
            booking.paymentStatus ===
            'paid'
        );

      const paidRevenue =
        paidBookings.reduce(
          (
            sum,
            booking
          ) =>
            sum +
            bookingValue(
              booking
            ),
          0
        );

      const outstanding =
        Math.max(
          totalValue -
            paidRevenue,
          0
        );

      const averageOrder =
        activeBookings.length
          ? totalValue /
            activeBookings.length
          : 0;

      const completionRate =
        percentage(
          completed.length,
          Math.max(
            activeBookings.length,
            1
          )
        );

      const collectionRate =
        percentage(
          paidRevenue,
          totalValue
        );


      /* -----------------------------------------
         Six month chart
         ----------------------------------------- */

      const months =
        lastSixMonths();

      const monthMap =
        Object.fromEntries(
          months.map(
            month => [
              month.key,
              {
                ...month,
                value: 0,
                orders: 0,
              },
            ]
          )
        );

      dashboardBookings.forEach(
        booking => {
          const date =
            bookingCreatedDate(
              booking
            );

          if (!date) return;

          const key =
            monthKey(date);

          if (!monthMap[key]) {
            return;
          }

          monthMap[
            key
          ].orders += 1;

          if (
            booking.status !==
            'cancelled'
          ) {
            monthMap[
              key
            ].value +=
              bookingValue(
                booking
              );
          }
        }
      );


      /* -----------------------------------------
         Status chart
         ----------------------------------------- */

      const statusData = [
        {
          key: 'pending',
          label: 'Pending',
          value:
            pending.length,
        },
        {
          key: 'confirmed',
          label: 'Confirmed',
          value:
            confirmed.length,
        },
        {
          key: 'cleaning',
          label: 'Cleaning',
          value:
            cleaning.length,
        },
        {
          key: 'completed',
          label: 'Completed',
          value:
            completed.length,
        },
        {
          key: 'cancelled',
          label: 'Cancelled',
          value:
            cancelled.length,
        },
      ];


      /* -----------------------------------------
         Services
         ----------------------------------------- */

      const serviceData =
        services.map(
          service => {
            const matching =
              dashboardBookings.filter(
                booking =>
                  booking.service ===
                  service.id
              );

            return {
              key: service.id,

              label:
                service.name,

              count:
                matching.length,

              value:
                matching
                  .filter(
                    booking =>
                      booking.status !==
                      'cancelled'
                  )
                  .reduce(
                    (
                      sum,
                      booking
                    ) =>
                      sum +
                      bookingValue(
                        booking
                      ),
                    0
                  ),
            };
          }
        );


      /* -----------------------------------------
         Re-cleans
         ----------------------------------------- */

      const openRecleans =
        dashboardBookings.reduce(
          (
            total,
            booking
          ) => {
            const requests =
              booking.recleans ||
              [];

            const open =
              requests.filter(
                request =>
                  ![
                    'completed',
                    'declined',
                  ].includes(
                    request.status
                  )
              );

            return (
              total +
              open.length
            );
          },
          0
        );


      /* -----------------------------------------
         Payment verification
         ----------------------------------------- */

      const transfers =
        dashboardBookings.filter(
          booking =>
            booking.paymentStatus ===
            'awaiting_verification'
        ).length;


      /* -----------------------------------------
         Today
         ----------------------------------------- */

      const today =
        todayISO();

      const todayJobs =
        dashboardBookings.filter(
          booking =>
            booking.date ===
              today &&
            [
              'confirmed',
              'cleaning',
            ].includes(
              booking.status
            )
        ).length;


      /* -----------------------------------------
         Pending review queue
         ----------------------------------------- */

      const reviewQueue =
        pending
          .slice()
          .sort(
            (
              a,
              b
            ) =>
              new Date(
                b.createdAt ||
                  b.created_at ||
                  0
              ).getTime() -
              new Date(
                a.createdAt ||
                  a.created_at ||
                  0
              ).getTime()
          )
          .slice(0, 4);


      /* -----------------------------------------
         Upcoming schedule
         ----------------------------------------- */

      const upcoming =
        dashboardBookings
          .filter(
            booking =>
              [
                'confirmed',
                'cleaning',
              ].includes(
                booking.status
              ) &&
              booking.date
          )
          .sort(
            (
              a,
              b
            ) =>
              String(
                a.date
              ).localeCompare(
                String(
                  b.date
                )
              )
          )
          .slice(0, 4);


      return {
        dashboardBookings,

        activeBookings,

        pending,
        confirmed,
        cleaning,
        completed,
        cancelled,

        totalValue,
        paidRevenue,
        outstanding,
        averageOrder,
        completionRate,
        collectionRate,

        monthlyTrend:
          months.map(
            month =>
              monthMap[
                month.key
              ]
          ),

        statusData,
        serviceData,

        openRecleans,
        transfers,

        todayJobs,

        reviewQueue,
        upcoming,
      };
    },
    [bookings]
  );


  /* =======================================================
     QUOTES
     ======================================================= */

  const newQuotes =
    quotes.filter(
      quote =>
        quote.status ===
          'new' ||
        quote.status ===
          'pending'
    ).length;

  const quotePipeline =
    quotes
      .filter(
        quote =>
          [
            'quoted',
            'accepted',
          ].includes(
            quote.status
          )
      )
      .reduce(
        (
          total,
          quote
        ) =>
          total +
          safeNumber(
            quote.amount
          ),
        0
      );


  /* =======================================================
     CONTACTS
     ======================================================= */

  const newContacts =
    contacts.filter(
      contact =>
        !contact.status ||
        [
          'new',
          'unread',
          'pending',
        ].includes(
          String(
            contact.status
          ).toLowerCase()
        )
    ).length;


  /* =======================================================
     ACTION COUNT
     ======================================================= */

  const attentionCount =
    data.pending.length +
    newQuotes +
    newContacts +
    data.transfers +
    data.openRecleans;


  /* =======================================================
     TOTALS
     ======================================================= */

  const totalOrders =
    data.dashboardBookings
      .length;

  const recentNotifications =
    notifications
      .slice()
      .reverse()
      .slice(0, 5);


  return (
    <div
      className="
        pb-12
      "
    >

      {/* ===================================================
          WEBSITE OVERVIEW HEADER
          =================================================== */}

      <DashboardIntro
        totalValue={
          data.totalValue
        }
        activeOrders={
          data.activeBookings
            .length
        }
        attentionCount={
          attentionCount
        }
        todayJobs={
          data.todayJobs
        }
      />


      {/* ===================================================
          PRIMARY WEBSITE KPIs
          =================================================== */}

      <section
        className="
          mt-6
          grid
          gap-4

          sm:grid-cols-2

          xl:grid-cols-3

          2xl:grid-cols-6
        "
      >
        <MetricCard
          icon={ShoppingBag}
          label="Total orders"
          value={numberFormat.format(
            totalOrders
          )}
          note={`${data.activeBookings.length} active / non-cancelled`}
          badge="All time"
          progress={100}
          to="/admin/bookings"
        />

        <MetricCard
          icon={Clock3}
          label="Pending review"
          value={numberFormat.format(
            data.pending.length
          )}
          note="Booking requests waiting for action"
          badge={
            data.pending.length
              ? 'Action'
              : 'Clear'
          }
          progress={percentage(
            data.pending.length,
            Math.max(
              totalOrders,
              1
            )
          )}
          to="/admin/bookings"
        />

        <MetricCard
          icon={BadgeCheck}
          label="Confirmed"
          value={numberFormat.format(
            data.confirmed.length
          )}
          note={`${data.cleaning.length} currently being cleaned`}
          badge="Pipeline"
          progress={percentage(
            data.confirmed.length +
              data.cleaning.length,
            Math.max(
              totalOrders,
              1
            )
          )}
          to="/admin/bookings"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Completed"
          value={numberFormat.format(
            data.completed.length
          )}
          note={`${data.completionRate.toFixed(
            0
          )}% completion rate`}
          badge="Delivered"
          progress={
            data.completionRate
          }
          to="/admin/bookings"
        />

        <MetricCard
          icon={
            CircleDollarSign
          }
          label="Booked value"
          value={formatCompactMoney(
            data.totalValue
          )}
          note={`${formatMoney(
            data.paidRevenue
          )} collected`}
          badge="AUD"
          progress={
            data.collectionRate
          }
          to="/admin/payments"
        />

        <MetricCard
          icon={WalletCards}
          label="Outstanding"
          value={formatCompactMoney(
            data.outstanding
          )}
          note={`${data.collectionRate.toFixed(
            0
          )}% payment collection`}
          badge="Payments"
          progress={
            100 -
            data.collectionRate
          }
          to="/admin/payments"
        />
      </section>


      {/* ===================================================
          FULL WEBSITE ACTIVITY OVERVIEW
          =================================================== */}

      <section
        className="
          mt-4
          grid
          gap-4

          sm:grid-cols-2

          lg:grid-cols-3

          2xl:grid-cols-5
        "
      >
        <QuickOverviewCard
          icon={Target}
          label="Average order"
          value={formatMoney(
            data.averageOrder
          )}
          helper="Across active bookings"
        />

        <QuickOverviewCard
          icon={MessageSquare}
          label="Quote requests"
          value={numberFormat.format(
            newQuotes
          )}
          helper={`${formatMoney(
            quotePipeline
          )} quoted pipeline`}
          to="/admin/quotes"
        />

        <QuickOverviewCard
          icon={Mail}
          label="Contact messages"
          value={numberFormat.format(
            contacts.length
          )}
          helper={`${newContacts} requiring review`}
          to="/admin/contacts"
        />

        <QuickOverviewCard
          icon={CreditCard}
          label="Payment checks"
          value={numberFormat.format(
            data.transfers
          )}
          helper="Transfers awaiting verification"
          to="/admin/payments"
        />

        <QuickOverviewCard
          icon={RefreshCw}
          label="Re-clean requests"
          value={numberFormat.format(
            data.openRecleans
          )}
          helper="Open guarantee workflow"
          to="/admin/recleans"
        />
      </section>


      {/* ===================================================
          PERFORMANCE + STATUS
          =================================================== */}

      <section
        className="
          mt-6
          grid
          gap-6

          2xl:grid-cols-[1.55fr_.75fr]
        "
      >

        {/* Revenue trend */}

        <Card
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#dfe5e7]
            bg-white
            p-0
            shadow-none
          "
        >
          <SectionHeader
            icon={Activity}
            eyebrow="Performance"
            title="Booked value trend"
            description="Six-month booking value and order activity."
          />

          <div
            className="
              px-4
              pb-5
              pt-4

              sm:px-6
              sm:pb-6
            "
          >
            <RevenueTrendChart
              data={
                data.monthlyTrend
              }
            />
          </div>
        </Card>


        {/* Status */}

        <Card
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#dfe5e7]
            bg-white
            p-0
            shadow-none
          "
        >
          <SectionHeader
            icon={Target}
            eyebrow="Order health"
            title="Booking status"
            description="Current order distribution across the workflow."
          />

          <div className="p-6">
            <StatusDonut
              data={
                data.statusData
              }
              total={
                totalOrders
              }
            />
          </div>
        </Card>
      </section>


      {/* ===================================================
          OPERATIONS + SERVICE PERFORMANCE
          =================================================== */}

      <section
        className="
          mt-6
          grid
          gap-6

          xl:grid-cols-2
        "
      >

        {/* Operations */}

        <Card
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#dfe5e7]
            bg-white
            p-0
            shadow-none
          "
        >
          <SectionHeader
            icon={Activity}
            eyebrow="Operations"
            title="Action centre"
            description="Items across the website that currently need administrative attention."
            action={
              <span
                className="
                  rounded-full
                  bg-[#edf6f5]
                  px-3
                  py-1.5
                  text-[9px]
                  font-bold
                  text-[#087e83]
                "
              >
                {
                  attentionCount
                }{' '}
                open
              </span>
            }
          />

          <OperationsRow
            icon={Clock3}
            label="Booking approvals"
            description="Pending booking requests waiting for review"
            value={
              data.pending
                .length
            }
            to="/admin/bookings"
          />

          <OperationsRow
            icon={
              MessageSquare
            }
            label="Quote enquiries"
            description="New tailored quote requests"
            value={newQuotes}
            to="/admin/quotes"
          />

          <OperationsRow
            icon={Mail}
            label="Customer messages"
            description="Contact enquiries requiring review"
            value={
              newContacts
            }
            to="/admin/contacts"
          />

          <OperationsRow
            icon={
              CreditCard
            }
            label="Payment verification"
            description="Manual payment transfers to verify"
            value={
              data.transfers
            }
            to="/admin/payments"
          />

          <OperationsRow
            icon={RefreshCw}
            label="Re-clean workflow"
            description="Open Bond Back Guarantee requests"
            value={
              data.openRecleans
            }
            to="/admin/recleans"
          />
        </Card>


        {/* Service performance */}

        <Card
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#dfe5e7]
            bg-white
            p-0
            shadow-none
          "
        >
          <SectionHeader
            icon={Users}
            eyebrow="Services"
            title="Service performance"
            description="Booking demand and value by cleaning service."
          />

          <div className="p-6">
            <ServicePerformance
              data={
                data.serviceData
              }
            />
          </div>
        </Card>
      </section>


      {/* ===================================================
          FINANCIAL + PENDING BOOKINGS
          =================================================== */}

      <section
        className="
          mt-6
          grid
          gap-6

          xl:grid-cols-[.85fr_1.15fr]
        "
      >

        {/* Financial */}

        <Card
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#dfe5e7]
            bg-white
            p-0
            shadow-none
          "
        >
          <SectionHeader
            icon={WalletCards}
            eyebrow="Financial"
            title="Revenue overview"
            description="Booked value, collected revenue and outstanding payments."
          />

          <FinancialOverview
            totalValue={
              data.totalValue
            }
            paidRevenue={
              data.paidRevenue
            }
            outstanding={
              data.outstanding
            }
            averageOrder={
              data.averageOrder
            }
            collectionRate={
              data.collectionRate
            }
          />
        </Card>


        {/* Review queue */}

        <Card
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#dfe5e7]
            bg-white
            p-0
            shadow-none
          "
        >
          <SectionHeader
            icon={Clock3}
            eyebrow="Bookings"
            title="Requests awaiting review"
            description="Newest booking requests waiting for admin approval."
            action={
              <Link
                to="/admin/bookings"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-[10px]
                  font-semibold
                  text-[#087e83]
                  hover:underline
                "
              >
                View all

                <ArrowRight
                  size={12}
                />
              </Link>
            }
          />

          {data.reviewQueue
            .length ? (
            <div>
              {data.reviewQueue.map(
                booking => (
                  <BookingReviewRow
                    key={
                      booking.id
                    }
                    booking={
                      booking
                    }
                  />
                )
              )}
            </div>
          ) : (
            <EmptyState
              icon={
                CheckCircle2
              }
              title="Nothing waiting for review."
              description="New booking requests will appear here."
            />
          )}
        </Card>
      </section>


      {/* ===================================================
          SCHEDULE + ACTIVITY
          =================================================== */}

      <section
        className="
          mt-6
          grid
          gap-6

          xl:grid-cols-2
        "
      >

        {/* Upcoming */}

        <Card
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#dfe5e7]
            bg-white
            p-0
            shadow-none
          "
        >
          <SectionHeader
            icon={
              CalendarDays
            }
            eyebrow="Schedule"
            title="Upcoming cleans"
            description="Confirmed or active jobs currently on the calendar."
            action={
              <Link
                to="/admin/bookings"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-[10px]
                  font-semibold
                  text-[#087e83]
                  hover:underline
                "
              >
                Full schedule

                <ArrowRight
                  size={12}
                />
              </Link>
            }
          />

          {data.upcoming
            .length ? (
            <div>
              {data.upcoming.map(
                booking => (
                  <UpcomingBookingRow
                    key={
                      booking.id
                    }
                    booking={
                      booking
                    }
                  />
                )
              )}
            </div>
          ) : (
            <EmptyState
              icon={
                CalendarDays
              }
              title="No upcoming cleans."
              description="Confirmed bookings will appear here."
            />
          )}
        </Card>


        {/* Recent activity */}

        <Card
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#dfe5e7]
            bg-white
            p-0
            shadow-none
          "
        >
          <SectionHeader
            icon={
              ReceiptText
            }
            eyebrow="Activity"
            title="Recent website activity"
            description="Latest notification and workflow activity."
          />

          {recentNotifications.length ? (
            <div>
              {recentNotifications.map(
                (
                  notification,
                  index
                ) => (
                  <ActivityItem
                    key={
                      notification.id ||
                      index
                    }
                    notification={
                      notification
                    }
                  />
                )
              )}
            </div>
          ) : (
            <EmptyState
              icon={
                ReceiptText
              }
              title="No recent activity."
              description="Website events will appear here as they occur."
            />
          )}
        </Card>
      </section>


      {/* ===================================================
          WEBSITE TOTALS
          =================================================== */}

      <section
        className="
          mt-6
          overflow-hidden
          rounded-[22px]
          border
          border-[#dfe5e7]
          bg-white
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            px-6
            py-6

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
                text-[#087e83]
              "
            >
              <FileText
                size={14}
              />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                "
              >
                Website totals
              </span>
            </div>

            <h2
              className="
                mt-2
                text-xl
                font-semibold
                tracking-[-0.04em]
                text-[#102d43]
              "
            >
              Overall Matelink
              activity
            </h2>

            <p
              className="
                mt-1
                text-[11px]
                text-[#788b94]
              "
            >
              A simple summary of
              customer and operational
              activity currently held
              by the application.
            </p>
          </div>

          <div
            className="
              grid
              gap-3

              sm:grid-cols-2

              md:grid-cols-4

              lg:min-w-[620px]
            "
          >
            <FooterStat
              label="Bookings"
              value={
                totalOrders
              }
            />

            <FooterStat
              label="Quotes"
              value={
                quotes.length
              }
            />

            <FooterStat
              label="Messages"
              value={
                contacts.length
              }
            />

            <FooterStat
              label="Activities"
              value={
                notifications.length
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}


/* =========================================================
   FOOTER STAT
   ========================================================= */

function FooterStat({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-[14px]
        border
        border-[#e2e8ea]
        bg-[#fafbfb]
        px-4
        py-3
      "
    >
      <p
        className="
          text-[8px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-[#84959d]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-lg
          font-semibold
          text-[#102d43]
        "
      >
        {numberFormat.format(
          value
        )}
      </p>
    </div>
  );
}


export default DashboardPage;
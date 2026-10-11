import {
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Home,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';


/* =========================================================
   AUSTRALIAN PHONE HELPERS
   ========================================================= */

function normalizeAustralianPhone(value) {
  let phone =
    String(value || '')
      .trim()
      .replace(
        /[\s()-]/g,
        ''
      );


  /*
   * 61412345678
   * ->
   * +61412345678
   */
  if (
    phone.startsWith('61') &&
    !phone.startsWith('+61')
  ) {
    phone = `+${phone}`;
  }


  /*
   * Local Australian:
   *
   * 0412345678
   * 0291234567
   * 0391234567
   * 0791234567
   * 0891234567
   *
   * ->
   *
   * +61412345678
   * +61291234567
   */
  if (
    /^0[23478]\d{8}$/.test(
      phone
    )
  ) {
    phone =
      `+61${phone.slice(1)}`;
  }


  return phone;
}


function isValidAustralianPhone(value) {
  const phone =
    normalizeAustralianPhone(
      value
    );


  return /^\+61[23478]\d{8}$/.test(
    phone
  );
}


function displayAustralianPhone(value) {
  const normalized =
    normalizeAustralianPhone(
      value
    );


  /*
   * Mobile:
   * +61412345678
   * ->
   * 0412 345 678
   */
  if (
    /^\+614\d{8}$/.test(
      normalized
    )
  ) {
    return `0${normalized.slice(
      3,
      6
    )} ${normalized.slice(
      6,
      9
    )} ${normalized.slice(
      9
    )}`;
  }


  return value;
}


/* =========================================================
   FORMAT HELPERS
   ========================================================= */

function formatCurrency(value) {
  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {
    return '—';
  }


  return new Intl.NumberFormat(
    'en-AU',
    {
      style:
        'currency',

      currency:
        'AUD',
    }
  ).format(number);
}


function formatDate(value) {
  if (!value) {
    return '—';
  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return new Intl.DateTimeFormat(
    'en-AU',
    {
      weekday:
        'short',

      day:
        'numeric',

      month:
        'long',

      year:
        'numeric',
    }
  ).format(date);
}


/* =========================================================
   TRACKING STATUS
   ========================================================= */

const TRACKING_STEPS = [
  {
    id: 1,

    title:
      'Request received',

    description:
      'Your cleaning request has been received.',

    icon:
      ClipboardCheck,
  },

  {
    id: 2,

    title:
      'Confirmed',

    description:
      'Matelink has reviewed and confirmed your clean.',

    icon:
      BadgeCheck,
  },

  {
    id: 3,

    title:
      'Scheduled',

    description:
      'Your preferred cleaning schedule has been arranged.',

    icon:
      CalendarDays,
  },

  {
    id: 4,

    title:
      'Cleaning',

    description:
      'Your Matelink clean is in progress.',

    icon:
      Sparkles,
  },

  {
    id: 5,

    title:
      'Completed',

    description:
      'Your cleaning service has been completed.',

    icon:
      CheckCircle2,
  },
];


/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-[16px]
        border
        border-[#e2e7e7]

        bg-white

        p-4

        transition-all
        duration-300

        hover:-translate-y-[1px]

        hover:border-[#087e83]/20

        hover:shadow-[0_10px_25px_rgba(16,45,67,0.05)]
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <div
          className="
            grid

            h-10
            w-10

            shrink-0

            place-items-center

            rounded-xl

            bg-[#edf6f5]

            text-[#087e83]
          "
        >
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>


        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-[10px]
              font-bold
              uppercase

              tracking-[0.12em]

              text-[#78909c]
            "
          >
            {label}
          </p>


          <p
            className="
              mt-1.5

              break-words

              text-sm
              font-semibold
              leading-5

              text-[#102d43]
            "
          >
            {value || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   TRACKING TIMELINE
   ========================================================= */

function TrackingTimeline({
  currentStep = 2,
}) {
  return (
    <>
      {/* DESKTOP */}

      <div
        className="
          hidden

          md:block
        "
      >
        <div
          className="
            relative

            grid

            grid-cols-5
          "
        >
          {/* BACKGROUND LINE */}

          <div
            className="
              absolute

              left-[10%]
              right-[10%]

              top-[21px]

              h-px

              bg-[#dfe5e5]
            "
          />


          {/* ACTIVE LINE */}

          <div
            className="
              absolute

              left-[10%]

              top-[21px]

              h-px

              bg-[#087e83]

              transition-all

              duration-700
            "
            style={{
              width:
                `${Math.max(
                  0,
                  Math.min(
                    1,
                    (currentStep - 1) /
                      4
                  )
                ) * 80}%`,
            }}
          />


          {TRACKING_STEPS.map(
            step => {
              const complete =
                step.id <
                currentStep;


              const active =
                step.id ===
                currentStep;


              const reached =
                step.id <=
                currentStep;


              return (
                <div
                  key={
                    step.id
                  }
                  className="
                    relative

                    z-10

                    flex
                    flex-col
                    items-center

                    px-2

                    text-center
                  "
                >
                  <div
                    className={`
                      grid

                      h-[43px]
                      w-[43px]

                      place-items-center

                      rounded-full

                      border

                      transition-all

                      duration-300

                      ${
                        complete
                          ? `
                            border-[#087e83]
                            bg-[#087e83]
                            text-white
                          `
                          : active
                          ? `
                            border-[#087e83]
                            bg-white
                            text-[#087e83]

                            ring-4
                            ring-[#087e83]/10
                          `
                          : `
                            border-[#d9e1e1]
                            bg-white
                            text-slate-400
                          `
                      }
                    `}
                  >
                    {complete ? (
                      <Check
                        size={18}
                      />
                    ) : (
                      <step.icon
                        size={17}
                      />
                    )}
                  </div>


                  <p
                    className={`
                      mt-3

                      text-xs
                      font-semibold

                      ${
                        reached
                          ? 'text-[#102d43]'
                          : 'text-slate-400'
                      }
                    `}
                  >
                    {
                      step.title
                    }
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>


      {/* MOBILE */}

      <div
        className="
          space-y-0

          md:hidden
        "
      >
        {TRACKING_STEPS.map(
          (
            step,
            index
          ) => {
            const complete =
              step.id <
              currentStep;


            const active =
              step.id ===
              currentStep;


            const reached =
              step.id <=
              currentStep;


            return (
              <div
                key={
                  step.id
                }
                className="
                  relative

                  flex
                  gap-4
                "
              >
                {/* LINE */}

                {index <
                  TRACKING_STEPS.length -
                    1 && (
                  <div
                    className={`
                      absolute

                      left-[20px]
                      top-[42px]

                      h-[calc(100%-42px)]
                      w-px

                      ${
                        step.id <
                        currentStep
                          ? 'bg-[#087e83]'
                          : 'bg-[#dfe5e5]'
                      }
                    `}
                  />
                )}


                <div
                  className={`
                    relative

                    z-10

                    grid

                    h-[41px]
                    w-[41px]

                    shrink-0

                    place-items-center

                    rounded-full

                    border

                    ${
                      complete
                        ? `
                          border-[#087e83]
                          bg-[#087e83]
                          text-white
                        `
                        : active
                        ? `
                          border-[#087e83]
                          bg-white
                          text-[#087e83]

                          ring-4
                          ring-[#087e83]/10
                        `
                        : `
                          border-[#d9e1e1]
                          bg-white
                          text-slate-400
                        `
                    }
                  `}
                >
                  {complete ? (
                    <Check
                      size={17}
                    />
                  ) : (
                    <step.icon
                      size={17}
                    />
                  )}
                </div>


                <div
                  className="
                    min-h-[82px]

                    pb-5
                  "
                >
                  <p
                    className={`
                      text-sm
                      font-semibold

                      ${
                        reached
                          ? 'text-[#102d43]'
                          : 'text-slate-400'
                      }
                    `}
                  >
                    {
                      step.title
                    }
                  </p>


                  <p
                    className="
                      mt-1

                      max-w-[300px]

                      text-xs
                      leading-5

                      text-slate-500
                    "
                  >
                    {
                      step.description
                    }
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>
    </>
  );
}


/* =========================================================
   TRACK ORDER PAGE
   ========================================================= */

function TrackOrderPage() {
  const [
    values,
    setValues,
  ] =
    useState({
      phone: '',
      orderNumber: '',
    });


  const [
    errors,
    setErrors,
  ] =
    useState({});


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    booking,
    setBooking,
  ] =
    useState(null);


  /* =======================================================
     DEMO BOOKING
     ======================================================= */

  const demoBooking =
    useMemo(
      () => {
        if (
          !booking
        ) {
          return null;
        }


        return {
          orderNumber:
            booking.orderNumber,

          phone:
            booking.phone,

          customerName:
            'Demo Customer',

          service:
            'Deep Cleaning',

          status:
            'Confirmed',

          currentStep:
            2,

          preferredDate:
            '2026-10-18',

          preferredTime:
            '10:00 AM – 12:00 PM',

          propertyType:
            'Apartment',

          postcode:
            '2000',

          bedrooms:
            2,

          bathrooms:
            1,

          address:
            'Sydney, NSW',

          estimatedTotal:
            185,

          paymentStatus:
            'No payment required yet',
        };
      },
      [
        booking,
      ]
    );


  /* =======================================================
     UPDATE FIELD
     ======================================================= */

  function updateField(
    field,
    value
  ) {
    setValues(
      current => ({
        ...current,

        [field]:
          value,
      })
    );


    setErrors(
      current => ({
        ...current,

        [field]:
          '',

        form:
          '',
      })
    );


    /*
     * If they edit the details,
     * hide the previous result.
     */
    if (booking) {
      setBooking(
        null
      );
    }
  }


  /* =======================================================
     VALIDATION
     ======================================================= */

  function validate() {
    const next = {};


    if (
      !values.phone.trim()
    ) {
      next.phone =
        'Enter the Australian phone number used for your booking.';
    } else if (
      !isValidAustralianPhone(
        values.phone
      )
    ) {
      next.phone =
        'Enter a valid Australian phone number, for example 0412 345 678.';
    }


    if (
      !values.orderNumber.trim()
    ) {
      next.orderNumber =
        'Enter your order number.';
    }


    setErrors(
      next
    );


    return (
      Object.keys(
        next
      ).length === 0
    );
  }


  /* =======================================================
     DEMO TRACKING
     ======================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    if (loading) {
      return;
    }


    if (
      !validate()
    ) {
      return;
    }


    setLoading(
      true
    );

    setBooking(
      null
    );

    setErrors(
      {}
    );


    try {
      /*
       * Fake network delay.
       * Remove this when API is ready.
       */
      await new Promise(
        resolve =>
          window.setTimeout(
            resolve,
            650
          )
      );


      /*
       * ===================================================
       * DEMO MODE
       *
       * Any valid Australian phone number +
       * any non-empty order number works.
       * ===================================================
       */

      setBooking({
        orderNumber:
          values.orderNumber
            .trim()
            .toUpperCase(),

        phone:
          normalizeAustralianPhone(
            values.phone
          ),
      });

    } catch {
      setErrors({
        form:
          'Unable to track your order. Please try again.',
      });

    } finally {
      setLoading(
        false
      );
    }
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <main
      className="
        min-h-[calc(100vh-100px)]

        bg-[#f7f6f2]
      "
    >
      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="
          border-b
          border-[#e2e7e7]

          bg-[#f7f6f2]
        "
      >
        <div
          className="
            container-site

            py-12

            sm:py-14

            lg:py-16
          "
        >
          <div
            className="
              mx-auto

              max-w-[760px]

              text-center
            "
          >
            <div
              className="
                mx-auto

                mb-5

                grid

                h-12
                w-12

                place-items-center

                rounded-2xl

                border
                border-[#087e83]/10

                bg-[#edf6f5]

                text-[#087e83]
              "
            >
              <ClipboardCheck
                size={22}
                strokeWidth={1.8}
              />
            </div>


            <p
              className="
                text-[11px]
                font-bold
                uppercase

                tracking-[0.16em]

                text-[#087e83]
              "
            >
              Your clean,
              at a glance
            </p>


            <h1
              className="
                mt-4

                text-[2.5rem]
                font-semibold
                leading-[1.05]

                tracking-[-0.055em]

                text-[#102d43]

                sm:text-[3.2rem]

                lg:text-[3.8rem]
              "
            >
              Track your
              cleaning order.
            </h1>


            <p
              className="
                mx-auto

                mt-5

                max-w-[580px]

                text-sm
                leading-7

                text-[#607786]

                sm:text-[15px]
              "
            >
              Enter the
              Australian phone
              number used for
              your booking and
              your order number
              to see the latest
              progress.
            </p>
          </div>
        </div>
      </section>


      {/* =====================================================
          SEARCH AREA
      ====================================================== */}

      <section
        className="
          container-site

          py-10

          lg:py-14
        "
      >
        <div
          className="
            mx-auto

            max-w-[850px]
          "
        >
          <div
            className="
              overflow-hidden

              rounded-[24px]

              border
              border-[#dde4e4]

              bg-white

              shadow-[0_16px_50px_rgba(16,45,67,0.06)]
            "
          >
            {/* TOP ACCENT */}

            <div
              className="
                h-[3px]

                w-full

                bg-[#087e83]
              "
            />


            <div
              className="
                p-6

                sm:p-8

                lg:p-9
              "
            >
              {/* FORM HEADER */}

              <div
                className="
                  flex

                  items-start

                  gap-4
                "
              >
                <div
                  className="
                    grid

                    h-11
                    w-11

                    shrink-0

                    place-items-center

                    rounded-xl

                    bg-[#edf6f5]

                    text-[#087e83]
                  "
                >
                  <Search
                    size={20}
                  />
                </div>


                <div>
                  <h2
                    className="
                      text-xl
                      font-semibold

                      tracking-[-0.03em]

                      text-[#102d43]
                    "
                  >
                    Find your
                    booking
                  </h2>


                  <p
                    className="
                      mt-1.5

                      text-xs
                      leading-5

                      text-slate-500
                    "
                  >
                    Use the same
                    Australian phone
                    number you used
                    when requesting
                    your clean.
                  </p>
                </div>
              </div>


              {/* FORM ERROR */}

              {errors.form && (
                <div
                  role="alert"
                  className="
                    mt-6

                    flex

                    items-start

                    gap-3

                    rounded-xl

                    border
                    border-red-200

                    bg-red-50

                    px-4
                    py-3

                    text-sm

                    text-red-700
                  "
                >
                  <AlertCircle
                    size={18}
                    className="
                      mt-0.5

                      shrink-0
                    "
                  />

                  {
                    errors.form
                  }
                </div>
              )}


              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                noValidate
                className="
                  mt-7
                "
              >
                <div
                  className="
                    grid

                    gap-5

                    md:grid-cols-2
                  "
                >
                  {/* PHONE */}

                  <label
                    className="
                      block
                    "
                  >
                    <span
                      className="
                        mb-2

                        block

                        text-xs
                        font-semibold

                        text-[#102d43]
                      "
                    >
                      Australian phone
                      number
                    </span>


                    <div
                      className="
                        relative
                      "
                    >
                      <Phone
                        size={17}
                        className="
                          absolute

                          left-4
                          top-1/2

                          -translate-y-1/2

                          text-[#78909c]
                        "
                      />


                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={
                          values.phone
                        }
                        onChange={
                          event =>
                            updateField(
                              'phone',
                              event.target
                                .value
                            )
                        }
                        placeholder="e.g. 0412 345 678"
                        className={`
                          h-[52px]
                          w-full

                          rounded-xl

                          border

                          bg-white

                          pl-11
                          pr-4

                          text-sm

                          text-[#102d43]

                          outline-none

                          transition-all

                          duration-200

                          placeholder:text-slate-400

                          focus:border-[#087e83]/50

                          focus:ring-4
                          focus:ring-[#087e83]/[0.06]

                          ${
                            errors.phone
                              ? `
                                border-red-300

                                focus:border-red-400
                                focus:ring-red-100
                              `
                              : `
                                border-[#d7e0e0]
                              `
                          }
                        `}
                      />
                    </div>


                    {errors.phone && (
                      <p
                        className="
                          mt-2

                          text-xs

                          text-red-600
                        "
                      >
                        {
                          errors.phone
                        }
                      </p>
                    )}
                  </label>


                  {/* ORDER NUMBER */}

                  <label
                    className="
                      block
                    "
                  >
                    <span
                      className="
                        mb-2

                        block

                        text-xs
                        font-semibold

                        text-[#102d43]
                      "
                    >
                      Order number
                    </span>


                    <div
                      className="
                        relative
                      "
                    >
                      <PackageCheck
                        size={17}
                        className="
                          absolute

                          left-4
                          top-1/2

                          -translate-y-1/2

                          text-[#78909c]
                        "
                      />


                      <input
                        type="text"
                        autoComplete="off"
                        value={
                          values.orderNumber
                        }
                        onChange={
                          event =>
                            updateField(
                              'orderNumber',
                              event.target
                                .value
                            )
                        }
                        placeholder="e.g. ML-10025"
                        className={`
                          h-[52px]
                          w-full

                          rounded-xl

                          border

                          bg-white

                          pl-11
                          pr-4

                          text-sm

                          text-[#102d43]

                          outline-none

                          transition-all

                          duration-200

                          placeholder:text-slate-400

                          focus:border-[#087e83]/50

                          focus:ring-4
                          focus:ring-[#087e83]/[0.06]

                          ${
                            errors.orderNumber
                              ? `
                                border-red-300

                                focus:border-red-400
                                focus:ring-red-100
                              `
                              : `
                                border-[#d7e0e0]
                              `
                          }
                        `}
                      />
                    </div>


                    {errors.orderNumber && (
                      <p
                        className="
                          mt-2

                          text-xs

                          text-red-600
                        "
                      >
                        {
                          errors.orderNumber
                        }
                      </p>
                    )}
                  </label>
                </div>


                {/* INFO + BUTTON */}

                <div
                  className="
                    mt-6

                    flex

                    flex-col

                    gap-5

                    border-t
                    border-[#edf0ef]

                    pt-6

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div
                    className="
                      flex

                      max-w-[430px]

                      items-start

                      gap-2.5
                    "
                  >
                    <ShieldCheck
                      size={16}
                      className="
                        mt-0.5

                        shrink-0

                        text-[#087e83]
                      "
                    />


                    <p
                      className="
                        text-[11px]
                        leading-5

                        text-slate-500
                      "
                    >
                      Your phone
                      number is used
                      only to locate
                      the matching
                      booking.
                    </p>
                  </div>


                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="
                      inline-flex

                      h-[48px]

                      min-w-[180px]

                      items-center
                      justify-center

                      gap-2

                      rounded-xl

                      bg-[#087e83]

                      px-6

                      text-sm
                      font-semibold

                      text-white

                      shadow-[0_9px_20px_rgba(8,126,131,0.17)]

                      transition-all

                      duration-200

                      hover:-translate-y-[1px]

                      hover:bg-[#076f73]

                      hover:shadow-[0_12px_26px_rgba(8,126,131,0.22)]

                      disabled:pointer-events-none

                      disabled:opacity-60

                      sm:w-auto
                    "
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={17}
                          className="
                            animate-spin
                          "
                        />

                        Finding...
                      </>
                    ) : (
                      <>
                        Track my order

                        <ArrowRight
                          size={16}
                        />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>


          {/* DEMO NOTICE */}

          <div
            className="
              mt-4

              flex

              items-center
              justify-center

              gap-2

              text-center

              text-[11px]

              text-slate-400
            "
          >
            <BadgeCheck
              size={14}
            />

            Demo tracking is
            currently enabled.
          </div>
        </div>
      </section>


      {/* =====================================================
          RESULT
      ====================================================== */}

      {demoBooking && (
        <section
          className="
            container-site

            pb-14

            lg:pb-20
          "
        >
          <div
            className="
              mx-auto

              max-w-[1120px]
            "
          >
            {/* RESULT TOP */}

            <div
              className="
                overflow-hidden

                rounded-[26px]

                border
                border-[#dce4e4]

                bg-white

                shadow-[0_18px_55px_rgba(16,45,67,0.065)]
              "
            >
              {/* DARK HEADER */}

              <div
                className="
                  relative

                  overflow-hidden

                  bg-[#102d43]

                  px-6
                  py-7

                  text-white

                  sm:px-8
                  sm:py-8

                  lg:px-10
                "
              >
                {/* DECORATION */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none

                    absolute

                    -right-16
                    -top-20

                    h-56
                    w-56

                    rounded-full

                    border
                    border-white/10
                  "
                />


                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none

                    absolute

                    -right-6
                    top-2

                    h-32
                    w-32

                    rounded-full

                    bg-[#087e83]/20

                    blur-3xl
                  "
                />


                <div
                  className="
                    relative

                    flex

                    flex-col

                    gap-6

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase

                        tracking-[0.15em]

                        text-[#85d3d1]
                      "
                    >
                      Booking found
                    </p>


                    <h2
                      className="
                        mt-2

                        text-2xl
                        font-semibold

                        tracking-[-0.04em]

                        sm:text-3xl
                      "
                    >
                      {
                        demoBooking.service
                      }
                    </h2>


                    <div
                      className="
                        mt-3

                        flex
                        flex-wrap

                        items-center

                        gap-x-4
                        gap-y-2

                        text-xs

                        text-white/65
                      "
                    >
                      <span>
                        Order{' '}

                        <strong
                          className="
                            font-semibold

                            text-white
                          "
                        >
                          #
                          {
                            demoBooking.orderNumber
                          }
                        </strong>
                      </span>


                      <span
                        className="
                          hidden

                          h-1
                          w-1

                          rounded-full

                          bg-white/30

                          sm:block
                        "
                      />


                      <span>
                        {
                          displayAustralianPhone(
                            demoBooking.phone
                          )
                        }
                      </span>
                    </div>
                  </div>


                  <div
                    className="
                      inline-flex

                      self-start

                      items-center

                      gap-2

                      rounded-full

                      border
                      border-[#85d3d1]/20

                      bg-[#087e83]/20

                      px-4
                      py-2

                      text-xs
                      font-semibold

                      text-[#b8e7e5]

                      backdrop-blur-sm
                    "
                  >
                    <span
                      className="
                        h-2
                        w-2

                        rounded-full

                        bg-[#85d3d1]

                        shadow-[0_0_0_4px_rgba(133,211,209,0.12)]
                      "
                    />

                    {
                      demoBooking.status
                    }
                  </div>
                </div>
              </div>


              {/* CONTENT */}

              <div
                className="
                  p-6

                  sm:p-8

                  lg:p-10
                "
              >
                {/* STATUS INTRO */}

                <div
                  className="
                    flex

                    flex-col

                    gap-5

                    border-b
                    border-[#e8ecec]

                    pb-8

                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                  "
                >
                  <div
                    className="
                      max-w-[650px]
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase

                        tracking-[0.13em]

                        text-[#087e83]
                      "
                    >
                      Current status
                    </p>


                    <h3
                      className="
                        mt-2

                        text-xl
                        font-semibold

                        tracking-[-0.03em]

                        text-[#102d43]
                      "
                    >
                      Your clean has
                      been confirmed.
                    </h3>


                    <p
                      className="
                        mt-2

                        text-sm
                        leading-6

                        text-slate-500
                      "
                    >
                      Matelink has
                      reviewed your
                      request. Your
                      selected service
                      and booking details
                      are ready for the
                      next stage.
                    </p>
                  </div>


                  <div
                    className="
                      flex

                      items-center

                      gap-3

                      rounded-xl

                      bg-[#edf6f5]

                      px-4
                      py-3
                    "
                  >
                    <CheckCircle2
                      size={19}
                      className="
                        text-[#087e83]
                      "
                    />


                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold

                          text-[#102d43]
                        "
                      >
                        Confirmed
                      </p>


                      <p
                        className="
                          mt-0.5

                          text-[10px]

                          text-slate-500
                        "
                      >
                        Booking status
                      </p>
                    </div>
                  </div>
                </div>


                {/* TIMELINE */}

                <div
                  className="
                    py-9
                  "
                >
                  <TrackingTimeline
                    currentStep={
                      demoBooking.currentStep
                    }
                  />
                </div>


                {/* BOOKING DETAILS */}

                <div
                  className="
                    border-t
                    border-[#e8ecec]

                    pt-8
                  "
                >
                  <div
                    className="
                      mb-5

                      flex

                      items-center
                      justify-between

                      gap-4
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase

                          tracking-[0.13em]

                          text-[#087e83]
                        "
                      >
                        Booking details
                      </p>


                      <h3
                        className="
                          mt-1.5

                          text-lg
                          font-semibold

                          tracking-[-0.025em]

                          text-[#102d43]
                        "
                      >
                        Your clean,
                        at a glance.
                      </h3>
                    </div>
                  </div>


                  <div
                    className="
                      grid

                      gap-3

                      sm:grid-cols-2

                      lg:grid-cols-3
                    "
                  >
                    <InfoCard
                      icon={
                        Sparkles
                      }
                      label="Service"
                      value={
                        demoBooking.service
                      }
                    />


                    <InfoCard
                      icon={
                        CalendarDays
                      }
                      label="Preferred date"
                      value={
                        formatDate(
                          demoBooking.preferredDate
                        )
                      }
                    />


                    <InfoCard
                      icon={
                        Clock3
                      }
                      label="Preferred time"
                      value={
                        demoBooking.preferredTime
                      }
                    />


                    <InfoCard
                      icon={
                        Home
                      }
                      label="Property"
                      value={`${demoBooking.propertyType} · ${demoBooking.bedrooms} bedrooms · ${demoBooking.bathrooms} bathroom`}
                    />


                    <InfoCard
                      icon={
                        MapPin
                      }
                      label="Service area"
                      value={`${demoBooking.address} · ${demoBooking.postcode}`}
                    />


                    <InfoCard
                      icon={
                        CircleDollarSign
                      }
                      label="Estimated total"
                      value={
                        formatCurrency(
                          demoBooking.estimatedTotal
                        )
                      }
                    />
                  </div>
                </div>


                {/* PAYMENT */}




                {/* ACTIONS */}

                <div
                  className="
                    mt-8

                    flex

                    flex-col

                    gap-3

                    border-t
                    border-[#e8ecec]

                    pt-6

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <Link
                    to="/"
                    className="
                      inline-flex

                      h-11

                      items-center
                      justify-center

                      gap-2

                      rounded-xl

                      border
                      border-[#d8e0e0]

                      bg-white

                      px-5

                      text-sm
                      font-semibold

                      text-[#102d43]

                      transition

                      hover:border-[#087e83]/30

                      hover:bg-[#edf6f5]

                      hover:text-[#087e83]
                    "
                  >
                    <ArrowLeft
                      size={16}
                    />

                    Back to home
                  </Link>


                  <Link
                    to="/contact"
                    className="
                      inline-flex

                      h-11

                      items-center
                      justify-center

                      gap-2

                      rounded-xl

                      bg-[#087e83]

                      px-5

                      text-sm
                      font-semibold

                      text-white

                      shadow-[0_7px_18px_rgba(8,126,131,0.13)]

                      transition

                      hover:bg-[#076f73]
                    "
                  >
                    Need help?

                    <ChevronRight
                      size={16}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* =====================================================
          INFORMATION CARDS BEFORE SEARCH
      ====================================================== */}

      {!demoBooking && (
        <section
          className="
            container-site

            pb-14

            lg:pb-20
          "
        >
          <div
            className="
              mx-auto

              grid

              max-w-[1000px]

              gap-4

              md:grid-cols-3
            "
          >
            {/* PRIVATE */}

            <article
              className="
                rounded-[18px]

                border
                border-[#e0e6e6]

                bg-white

                p-5

                shadow-[0_5px_18px_rgba(16,45,67,0.025)]
              "
            >
              <div
                className="
                  grid

                  h-10
                  w-10

                  place-items-center

                  rounded-xl

                  bg-[#edf6f5]

                  text-[#087e83]
                "
              >
                <ShieldCheck
                  size={18}
                />
              </div>


              <h3
                className="
                  mt-4

                  text-sm
                  font-semibold

                  text-[#102d43]
                "
              >
                Secure lookup
              </h3>


              <p
                className="
                  mt-2

                  text-xs
                  leading-5

                  text-slate-500
                "
              >
                Use your booking
                phone number and
                order reference to
                locate your clean.
              </p>
            </article>


            {/* STATUS */}

            <article
              className="
                rounded-[18px]

                border
                border-[#e0e6e6]

                bg-white

                p-5

                shadow-[0_5px_18px_rgba(16,45,67,0.025)]
              "
            >
              <div
                className="
                  grid

                  h-10
                  w-10

                  place-items-center

                  rounded-xl

                  bg-[#edf6f5]

                  text-[#087e83]
                "
              >
                <ClipboardCheck
                  size={18}
                />
              </div>


              <h3
                className="
                  mt-4

                  text-sm
                  font-semibold

                  text-[#102d43]
                "
              >
                Follow your clean
              </h3>


              <p
                className="
                  mt-2

                  text-xs
                  leading-5

                  text-slate-500
                "
              >
                See the booking
                journey from request
                through confirmation
                and completion.
              </p>
            </article>


            {/* SUPPORT */}

            <article
              className="
                rounded-[18px]

                border
                border-[#e0e6e6]

                bg-white

                p-5

                shadow-[0_5px_18px_rgba(16,45,67,0.025)]
              "
            >
              <div
                className="
                  grid

                  h-10
                  w-10

                  place-items-center

                  rounded-xl

                  bg-[#edf6f5]

                  text-[#087e83]
                "
              >
                <Phone
                  size={18}
                />
              </div>


              <h3
                className="
                  mt-4

                  text-sm
                  font-semibold

                  text-[#102d43]
                "
              >
                Need a hand?
              </h3>


              <p
                className="
                  mt-2

                  text-xs
                  leading-5

                  text-slate-500
                "
              >
                If you cannot find
                your booking, our
                team can help point
                you in the right
                direction.
              </p>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}


export {
  TrackOrderPage,
};

export default TrackOrderPage;
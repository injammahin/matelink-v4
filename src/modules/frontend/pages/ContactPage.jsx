import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';

import {
  useApp,
} from '@/shared/context/AppContext';


/* =========================================================
   CONFIG
   ========================================================= */

const TURNSTILE_SCRIPT_ID =
  'matelink-cloudflare-turnstile';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const TURNSTILE_TEST_SITE_KEY =
  '1x00000000000000000000AA';

const DEFAULT_ADDRESS =
  'Elizabeth Street, Surry Hills, NSW 2010, Australia';


/* =========================================================
   TURNSTILE SITE KEY
   ========================================================= */

function getTurnstileSiteKey() {
  const configured =
    import.meta.env
      .VITE_TURNSTILE_SITE_KEY
      ?.trim();

  if (configured) {
    return configured;
  }

  /*
   * Cloudflare official testing key.
   * This is only used during Vite development.
   */
  if (import.meta.env.DEV) {
    return TURNSTILE_TEST_SITE_KEY;
  }

  return '';
}


/* =========================================================
   CLOUDFLARE TURNSTILE
   ========================================================= */

function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  resetSignal,
}) {
  const containerRef =
    useRef(null);

  const widgetIdRef =
    useRef(null);

  const verifyCallbackRef =
    useRef(onVerify);

  const expireCallbackRef =
    useRef(onExpire);

  const errorCallbackRef =
    useRef(onError);

  const siteKey =
    getTurnstileSiteKey();


  /*
   * Keep latest callbacks without forcing
   * Turnstile to render again.
   */
  useEffect(() => {
    verifyCallbackRef.current =
      onVerify;

    expireCallbackRef.current =
      onExpire;

    errorCallbackRef.current =
      onError;
  }, [
    onVerify,
    onExpire,
    onError,
  ]);


  /*
   * Load Turnstile script once and
   * explicitly render this widget.
   */
  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      if (
        cancelled ||
        !containerRef.current ||
        !window.turnstile ||
        !siteKey ||
        widgetIdRef.current !== null
      ) {
        return;
      }

      try {
        widgetIdRef.current =
          window.turnstile.render(
            containerRef.current,
            {
              sitekey: siteKey,

              theme: 'light',

              size: 'normal',

              action:
                'contact_form',

              callback(token) {
                verifyCallbackRef
                  .current?.(
                    token
                  );
              },

              'expired-callback'() {
                expireCallbackRef
                  .current?.();
              },

              'error-callback'() {
                errorCallbackRef
                  .current?.();
              },
            }
          );
      } catch (error) {
        console.error(
          'Cloudflare Turnstile render error:',
          error
        );

        errorCallbackRef
          .current?.();
      }
    }


    if (
      window.turnstile
    ) {
      renderWidget();

      return () => {
        cancelled = true;
      };
    }


    let script =
      document.getElementById(
        TURNSTILE_SCRIPT_ID
      );


    if (!script) {
      script =
        document.createElement(
          'script'
        );

      script.id =
        TURNSTILE_SCRIPT_ID;

      script.src =
        TURNSTILE_SCRIPT_URL;

      script.async = true;
      script.defer = true;

      document.head.appendChild(
        script
      );
    }


    script.addEventListener(
      'load',
      renderWidget
    );


    return () => {
      cancelled = true;

      script?.removeEventListener(
        'load',
        renderWidget
      );
    };
  }, [
    siteKey,
  ]);


  /*
   * Reset after failed submission,
   * expiry or Laravel validation error.
   */
  useEffect(() => {
    if (
      resetSignal > 0 &&
      widgetIdRef.current !== null &&
      window.turnstile
    ) {
      try {
        window.turnstile.reset(
          widgetIdRef.current
        );
      } catch (error) {
        console.error(
          'Turnstile reset error:',
          error
        );
      }
    }
  }, [
    resetSignal,
  ]);


  /*
   * Remove widget when component unmounts.
   */
  useEffect(() => {
    return () => {
      if (
        widgetIdRef.current !== null &&
        window.turnstile
      ) {
        try {
          window.turnstile.remove(
            widgetIdRef.current
          );
        } catch {
          // Ignore cleanup error.
        }
      }
    };
  }, []);


  /*
   * Production protection.
   */
  if (!siteKey) {
    return (
      <div
        className="
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <ShieldCheck
            size={18}
            className="
              mt-0.5
              shrink-0
              text-amber-700
            "
          />

          <div>
            <p
              className="
                text-xs
                font-semibold
                text-amber-900
              "
            >
              Security verification is
              unavailable.
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-amber-700
              "
            >
              Configure{' '}
              <code>
                VITE_TURNSTILE_SITE_KEY
              </code>{' '}
              before production.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div
      className="
        max-w-full
        overflow-hidden
      "
    >
      <div
        ref={containerRef}
        className="
          min-h-[65px]
          max-w-full
        "
      />

      {import.meta.env.DEV &&
        siteKey ===
          TURNSTILE_TEST_SITE_KEY && (
          <p
            className="
              mt-2
              text-[10px]
              leading-4
              text-slate-400
            "
          >
            Cloudflare development
            test mode.
          </p>
        )}
    </div>
  );
}


/* =========================================================
   HERO INFORMATION CARD
   ========================================================= */

function HeroInfoCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  to,
}) {
  return (
    <Link
      to={to}
      className="
        group

        flex
        min-h-[150px]
        flex-col

        rounded-[20px]

        border
        border-slate-200

        bg-white

        p-5

        shadow-[0_7px_24px_rgba(16,45,67,0.03)]

        transition-all
        duration-300

        hover:-translate-y-[2px]
        hover:border-[#087e83]/25
        hover:shadow-[0_14px_32px_rgba(16,45,67,0.07)]

        sm:p-6
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
          <Icon size={19} />
        </div>

        <ArrowRight
          size={17}
          className="
            mt-1
            text-slate-400

            transition-all

            group-hover:translate-x-1
            group-hover:text-[#087e83]
          "
        />
      </div>

      <p
        className="
          mt-5

          text-[9px]
          font-bold
          uppercase
          tracking-[0.15em]

          text-[#087e83]
        "
      >
        {eyebrow}
      </p>

      <h3
        className="
          mt-1.5

          text-[17px]
          font-semibold
          tracking-[-0.025em]

          text-[#102d43]
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2

          text-xs
          leading-5

          text-slate-500
        "
      >
        {description}
      </p>
    </Link>
  );
}


/* =========================================================
   CONTACT OPTION
   ========================================================= */

function ContactOption({
  icon: Icon,
  label,
  title,
  description,
  href,
}) {
  const content = (
    <>
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
        <Icon size={19} />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]

            text-[#087e83]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1

            break-words

            text-[15px]
            font-semibold

            text-[#102d43]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1.5

            text-xs
            leading-5

            text-slate-500
          "
        >
          {description}
        </p>
      </div>

      {href && (
        <ArrowRight
          size={16}
          className="
            mt-1
            shrink-0

            text-slate-400

            transition

            group-hover:translate-x-1
            group-hover:text-[#087e83]
          "
        />
      )}
    </>
  );


  const className = `
    group

    flex
    min-h-[118px]
    items-start
    gap-4

    rounded-[18px]

    border
    border-slate-200

    bg-white

    p-5

    shadow-[0_6px_20px_rgba(16,45,67,0.025)]

    transition

    hover:border-[#087e83]/25
    hover:shadow-[0_10px_28px_rgba(16,45,67,0.055)]
  `;


  if (!href) {
    return (
      <div className={className}>
        {content}
      </div>
    );
  }


  return (
    <a
      href={href}
      className={className}
    >
      {content}
    </a>
  );
}


/* =========================================================
   FORM INPUT
   ========================================================= */

function FormInput({
  label,
  required = false,
  error,
  ...props
}) {
  return (
    <label className="block">
      <span
        className="
          mb-2
          block

          text-xs
          font-semibold

          text-[#102d43]
        "
      >
        {label}

        {required && (
          <span
            className="
              ml-1
              text-[#087e83]
            "
          >
            *
          </span>
        )}
      </span>

      <input
        {...props}
        className={`
          h-12
          w-full

          rounded-xl

          border

          bg-white

          px-4

          text-sm
          text-[#102d43]

          outline-none

          transition

          placeholder:text-slate-400

          focus:border-[#087e83]/60

          focus:ring-4
          focus:ring-[#087e83]/[0.07]

          ${
            error
              ? 'border-red-300'
              : 'border-slate-200'
          }
        `}
      />

      {error && (
        <p
          className="
            mt-1.5

            text-xs

            text-red-600
          "
        >
          {error}
        </p>
      )}
    </label>
  );
}


/* =========================================================
   WHAT HAPPENS NEXT CARD
   ========================================================= */

function NextStepCard({
  number,
  icon: Icon,
  title,
  description,
}) {
  return (
    <article
      className="
        relative

        rounded-[18px]

        border
        border-slate-200

        bg-white

        p-6

        shadow-[0_6px_20px_rgba(16,45,67,0.025)]

        sm:p-7
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
        <div
          className="
            grid
            h-11
            w-11
            place-items-center

            rounded-xl

            bg-[#edf6f5]

            text-[#087e83]
          "
        >
          <Icon size={19} />
        </div>

        <span
          className="
            text-[11px]
            font-bold

            tracking-[0.12em]

            text-slate-300
          "
        >
          {number}
        </span>
      </div>

      <h3
        className="
          mt-5

          text-lg
          font-semibold

          tracking-[-0.025em]

          text-[#102d43]
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2.5

          text-sm
          leading-6

          text-slate-500
        "
      >
        {description}
      </p>
    </article>
  );
}


/* =========================================================
   CONTACT PAGE
   ========================================================= */

function ContactPage() {
  const navigate =
    useNavigate();

  const app =
    useApp();

  const settings =
    app?.settings || {};


  /* =======================================================
     CONTACT DETAILS
     ======================================================= */

  /*
   * These should come from your verified website settings.
   *
   * We intentionally do NOT invent an email address or
   * telephone number when one has not been configured.
   */

  const contactEmail =
    String(
      settings.contactEmail ||
      settings.email ||
      ''
    ).trim();


  const phone =
    settings.showPhone === false
      ? ''
      : String(
          settings.phone ||
          ''
        ).trim();


  const officeAddress =
    String(
      settings.address ||
      settings.officeAddress ||
      DEFAULT_ADDRESS
    ).trim();


  /* =======================================================
     API
     ======================================================= */

  const API_BASE_URL =
    (
      import.meta.env
        .VITE_API_BASE_URL ||
      ''
    )
      .trim()
      .replace(
        /\/+$/,
        ''
      );


  const contactEndpoint =
    `${API_BASE_URL}/v1/contact`;


  /* =======================================================
     FORM
     ======================================================= */

  const [
    values,
    setValues,
  ] =
    useState({
      name: '',
      email: '',
      mobile: '',
      topic: 'general',
      message: '',
      website: '',
    });


  const [
    errors,
    setErrors,
  ] =
    useState({});


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  /* =======================================================
     TURNSTILE
     ======================================================= */

  const [
    turnstileToken,
    setTurnstileToken,
  ] =
    useState('');


  const [
    turnstileError,
    setTurnstileError,
  ] =
    useState('');


  const [
    resetTurnstile,
    setResetTurnstile,
  ] =
    useState(0);


  const formStartedAtRef =
    useRef(
      Date.now()
    );


  /* =======================================================
     PATCH FORM
     ======================================================= */

  function patch(
    nextValues
  ) {
    setValues(
      previous => ({
        ...previous,
        ...nextValues,
      })
    );


    setErrors(
      previous => {
        const next = {
          ...previous,
        };

        Object.keys(
          nextValues
        ).forEach(
          key => {
            delete next[key];
          }
        );

        delete next.form;

        return next;
      }
    );
  }


  /* =======================================================
     VALIDATION
     ======================================================= */

  function validate() {
    const found = {};


    if (
      values.name
        .trim()
        .length < 2
    ) {
      found.name =
        'Please enter your full name.';
    }


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailRegex.test(
        values.email.trim()
      )
    ) {
      found.email =
        'Please enter a valid email address.';
    }


    if (
      values.mobile.trim() &&
      values.mobile
        .replace(
          /[^\d+]/g,
          ''
        )
        .length < 8
    ) {
      found.mobile =
        'Please enter a valid phone number.';
    }


    if (
      values.message
        .trim()
        .length < 10
    ) {
      found.message =
        'Please enter at least 10 characters.';
    }


    setErrors(
      found
    );


    return (
      Object.keys(
        found
      ).length === 0
    );
  }


  /* =======================================================
     LARAVEL VALIDATION ERRORS
     ======================================================= */

  function applyLaravelErrors(
    apiErrors
  ) {
    if (
      !apiErrors ||
      typeof apiErrors !==
        'object'
    ) {
      return;
    }


    const mapped = {};


    Object.entries(
      apiErrors
    ).forEach(
      ([
        field,
        messages,
      ]) => {
        mapped[field] =
          Array.isArray(
            messages
          )
            ? messages[0]
            : String(
                messages
              );
      }
    );


    setErrors(
      previous => ({
        ...previous,
        ...mapped,
      })
    );
  }


  /* =======================================================
     SUBMIT CONTACT FORM
     ======================================================= */

  async function submit(
    event
  ) {
    event.preventDefault();


    if (submitting) {
      return;
    }


    /*
     * Honeypot.
     */
    if (
      values.website
    ) {
      return;
    }


    /*
     * Very basic bot timing check.
     */
    if (
      Date.now() -
        formStartedAtRef.current <
      1200
    ) {
      setErrors({
        form:
          'Please wait a moment before submitting the form.',
      });

      return;
    }


    if (
      !validate()
    ) {
      return;
    }


    if (
      !turnstileToken
    ) {
      setTurnstileError(
        'Please complete the security check.'
      );

      return;
    }


    if (
      !API_BASE_URL
    ) {
      setErrors({
        form:
          'The contact service is not configured. Please try again later.',
      });

      return;
    }


    setSubmitting(
      true
    );

    setErrors(
      {}
    );

    setTurnstileError(
      ''
    );


    const payload = {
      name:
        values.name.trim(),

      email:
        values.email.trim(),

      mobile:
        values.mobile.trim(),

      topic:
        values.topic,

      message:
        values.message.trim(),

      turnstile_token:
        turnstileToken,
    };


    try {
      const response =
        await fetch(
          contactEndpoint,
          {
            method:
              'POST',

            headers: {
              Accept:
                'application/json',

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );


      const responseData =
        await response
          .json()
          .catch(
            () => ({})
          );


      /*
       * Laravel validation error.
       */
      if (
        response.status ===
        422
      ) {
        applyLaravelErrors(
          responseData.errors
        );


        setErrors(
          previous => ({
            ...previous,

            form:
              responseData.message ||
              'Please check the form and try again.',
          })
        );


        setTurnstileToken(
          ''
        );


        setResetTurnstile(
          previous =>
            previous + 1
        );


        return;
      }


      if (
        !response.ok
      ) {
        throw new Error(
          responseData.message ||
          `Unable to submit contact form. Server returned ${response.status}.`
        );
      }


      /*
       * SUCCESS.
       *
       * Redirect to the shared Thank You page so
       * the customer receives a clear confirmation.
       */
      setTurnstileToken(
        ''
      );


      navigate(
        '/thank-you',
        {
          replace: true,

          state: {
            type:
              'contact',

            name:
              payload.name,
          },
        }
      );
    } catch (error) {
      console.error(
        'Contact submission error:',
        error
      );


      setErrors({
        form:
          error?.message ||
          'Unable to send your message. Please try again.',
      });


      /*
       * Security verification should be performed
       * again after an unsuccessful request.
       */
      setTurnstileToken(
        ''
      );


      setResetTurnstile(
        previous =>
          previous + 1
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div
      className="
        bg-[#f7f6f2]
        text-[#102d43]
      "
    >
      {/* =====================================================
          01. HERO
          A SIMPLE WAY TO GET IN TOUCH
      ====================================================== */}

      <section
        className="
          border-b
          border-slate-200/70

          py-12

          sm:py-14

          lg:py-16
        "
      >
        <div
          className="
            container-site

            grid
            gap-10

            lg:grid-cols-[0.94fr_1.06fr]
            lg:items-center
            lg:gap-14
          "
        >
          {/* LEFT */}

          <div
            className="
              max-w-[650px]
            "
          >
            <p
              className="
                eyebrow
                mb-5
              "
            >
              Here when you need us
            </p>


            <h1
              className="
                page-title
                max-w-[620px]
              "
            >
              A simple way to
              <br />
              get in touch.
            </h1>


            <p
              className="
                body-copy

                mt-6

                max-w-[570px]

                text-[15px]
                leading-7
              "
            >
              Whether you have a
              question before booking,
              need help with an existing
              clean or want to explain
              something a little
              different, send us the
              essentials and our team
              will point you in the right
              direction.
            </p>


            <div
              className="
                mt-7

                flex
                flex-wrap
                items-center
                gap-x-6
                gap-y-3

                text-sm
                text-slate-500
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <ShieldCheck
                  size={16}
                  className="
                    text-[#087e83]
                  "
                />

                Secure enquiry form
              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <MessageCircle
                  size={16}
                  className="
                    text-[#087e83]
                  "
                />

                Personal response
              </div>
            </div>
          </div>


          {/* RIGHT — ONLY TWO CARDS */}

          <div
            className="
              grid
              gap-4

              sm:grid-cols-2
            "
          >
            <HeroInfoCard
              icon={
                Headphones
              }
              eyebrow="PERSONAL SUPPORT"
              title="Tell us what you need"
              description="Use the secure enquiry form and a member of the Matelink team will review your message."
              to="/contact#contact-form"
            />


            <HeroInfoCard
              icon={
                UserRoundCheck
              }
              eyebrow="ALREADY BOOKED?"
              title="View your booking"
              description="Sign in to your Matelink account to check your booking details and current status."
              to="/account"
            />
          </div>
        </div>
      </section>


      {/* =====================================================
          02. CONTACT OPTIONS
      ====================================================== */}

      <section
        className="
          container-site

          py-10

          lg:py-12
        "
      >
        <div
          className="
            mb-7

            grid
            gap-3

            md:grid-cols-[1fr_auto]
            md:items-end
          "
        >
          <div>
            <p
              className="
                eyebrow
                mb-3
              "
            >
              Contact options
            </p>

            <h2
              className="
                text-2xl
                font-semibold

                tracking-[-0.04em]

                sm:text-3xl
              "
            >
              Reach us the way that
              suits you.
            </h2>
          </div>


          <p
            className="
              max-w-[450px]

              text-sm
              leading-6

              text-slate-500
            "
          >
            Direct contact details are
            shown from Matelink&apos;s
            verified website settings.
          </p>
        </div>


        <div
          className="
            grid
            gap-4

            md:grid-cols-2
          "
        >
          <ContactOption
            icon={Mail}
            label="EMAIL"
            title={
              contactEmail ||
              'Email support'
            }
            description={
              contactEmail
                ? 'For booking questions, quote enquiries and general support.'
                : 'Send your enquiry securely using the message form below.'
            }
            href={
              contactEmail
                ? `mailto:${contactEmail}`
                : '#contact-form'
            }
          />


          <ContactOption
            icon={Phone}
            label="PHONE"
            title={
              phone ||
              'Phone support'
            }
            description={
              phone
                ? 'Call Matelink for help with your enquiry or existing booking.'
                : 'Include your phone number in the message form if you would like us to contact you.'
            }
            href={
              phone
                ? `tel:${phone.replace(
                    /\s+/g,
                    ''
                  )}`
                : '#contact-form'
            }
          />
        </div>
      </section>


      {/* =====================================================
          03. SEND A MESSAGE
      ====================================================== */}

      <section
        id="contact-form"
        className="
          container-site

          scroll-mt-[130px]

          pb-12

          lg:pb-16
        "
      >
        <div
          className="
            overflow-hidden

            rounded-[24px]

            border
            border-slate-200

            bg-white

            shadow-[0_14px_38px_rgba(16,45,67,0.045)]
          "
        >
          {/* FORM HEADER */}

          <div
            className="
              border-b
              border-slate-200

              px-6
              py-7

              sm:px-8

              lg:px-10
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase

                tracking-[0.16em]

                text-[#087e83]
              "
            >
              Send a message
            </p>


            <div
              className="
                mt-2

                grid
                gap-3

                md:grid-cols-[1fr_auto]
                md:items-end
              "
            >
              <h2
                className="
                  text-2xl
                  font-semibold

                  tracking-[-0.04em]

                  sm:text-3xl
                "
              >
                Get in touch.
              </h2>

              <p
                className="
                  max-w-[480px]

                  text-sm
                  leading-6

                  text-slate-500
                "
              >
                Share the essentials
                below and we&apos;ll get
                back to you as soon as
                possible.
              </p>
            </div>
          </div>


          {/* FORM CONTENT */}

          <div
            className="
              px-6
              py-8

              sm:px-8

              lg:px-10
              lg:py-10
            "
          >
            {/* FORM ERROR */}

            {errors.form && (
              <div
                className="
                  mb-6

                  rounded-xl

                  border
                  border-red-200

                  bg-red-50

                  px-4
                  py-3

                  text-sm
                  leading-6

                  text-red-700
                "
                role="alert"
              >
                {errors.form}
              </div>
            )}


            <form
              onSubmit={
                submit
              }
              noValidate
            >
              {/* HONEYPOT */}

              <input
                type="text"
                name="website"
                value={
                  values.website
                }
                onChange={
                  event =>
                    patch({
                      website:
                        event
                          .target
                          .value,
                    })
                }
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
                className="
                  pointer-events-none

                  absolute

                  left-[-9999px]

                  h-px
                  w-px

                  opacity-0
                "
              />


              {/* NAME + EMAIL */}

              <div
                className="
                  grid
                  gap-5

                  sm:grid-cols-2
                "
              >
                <FormInput
                  label="Full name"
                  required
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  value={
                    values.name
                  }
                  onChange={
                    event =>
                      patch({
                        name:
                          event
                            .target
                            .value,
                      })
                  }
                  error={
                    errors.name
                  }
                />


                <FormInput
                  label="Email"
                  required
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={
                    values.email
                  }
                  onChange={
                    event =>
                      patch({
                        email:
                          event
                            .target
                            .value,
                      })
                  }
                  error={
                    errors.email
                  }
                />
              </div>


              {/* MOBILE + SUBJECT */}

              <div
                className="
                  mt-5

                  grid
                  gap-5

                  sm:grid-cols-2
                "
              >
                <FormInput
                  label="Mobile"
                  type="tel"
                  name="mobile"
                  placeholder="04XX XXX XXX"
                  autoComplete="tel"
                  value={
                    values.mobile
                  }
                  onChange={
                    event =>
                      patch({
                        mobile:
                          event
                            .target
                            .value,
                      })
                  }
                  error={
                    errors.mobile
                  }
                />


                <label className="block">
                  <span
                    className="
                      mb-2
                      block

                      text-xs
                      font-semibold

                      text-[#102d43]
                    "
                  >
                    What is this about?
                  </span>


                  <select
                    name="topic"
                    value={
                      values.topic
                    }
                    onChange={
                      event =>
                        patch({
                          topic:
                            event
                              .target
                              .value,
                        })
                    }
                    className={`
                      h-12
                      w-full

                      rounded-xl

                      border

                      bg-white

                      px-4

                      text-sm
                      text-[#102d43]

                      outline-none

                      transition

                      focus:border-[#087e83]/60

                      focus:ring-4
                      focus:ring-[#087e83]/[0.07]

                      ${
                        errors.topic
                          ? 'border-red-300'
                          : 'border-slate-200'
                      }
                    `}
                  >
                    <option value="general">
                      General enquiry
                    </option>

                    <option value="booking">
                      Booking enquiry
                    </option>

                    <option value="quote">
                      Quote enquiry
                    </option>

                    <option value="existing_booking">
                      Existing booking
                    </option>

                    <option value="reclean">
                      Re-clean request
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>


                  {errors.topic && (
                    <p
                      className="
                        mt-1.5
                        text-xs
                        text-red-600
                      "
                    >
                      {errors.topic}
                    </p>
                  )}
                </label>
              </div>


              {/* MESSAGE */}

              <label
                className="
                  mt-5
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
                  Message

                  <span
                    className="
                      ml-1
                      text-[#087e83]
                    "
                  >
                    *
                  </span>
                </span>


                <textarea
                  name="message"
                  rows={6}
                  placeholder="Tell us what you need help with..."
                  value={
                    values.message
                  }
                  onChange={
                    event =>
                      patch({
                        message:
                          event
                            .target
                            .value,
                      })
                  }
                  className={`
                    w-full

                    resize-none

                    rounded-xl

                    border

                    bg-white

                    px-4
                    py-3

                    text-sm
                    leading-6

                    text-[#102d43]

                    outline-none

                    transition

                    placeholder:text-slate-400

                    focus:border-[#087e83]/60

                    focus:ring-4
                    focus:ring-[#087e83]/[0.07]

                    ${
                      errors.message
                        ? 'border-red-300'
                        : 'border-slate-200'
                    }
                  `}
                />


                {errors.message && (
                  <p
                    className="
                      mt-1.5

                      text-xs

                      text-red-600
                    "
                  >
                    {errors.message}
                  </p>
                )}
              </label>


              {/* =================================================
                  SECURITY CHECK

                  Completely disappears after verification.
              ================================================== */}

              {!turnstileToken && (
                <div
                  className="
                    mt-6

                    rounded-2xl

                    border
                    border-slate-200

                    bg-[#fafbfa]

                    p-4

                    sm:p-5
                  "
                >
                  <div
                    className="
                      mb-4

                      flex
                      items-start
                      gap-3
                    "
                  >
                    <div
                      className="
                        grid
                        h-9
                        w-9
                        shrink-0
                        place-items-center

                        rounded-lg

                        bg-[#edf6f5]

                        text-[#087e83]
                      "
                    >
                      <ShieldCheck
                        size={17}
                      />
                    </div>


                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold

                          text-[#102d43]
                        "
                      >
                        Security check
                      </p>

                      <p
                        className="
                          mt-1

                          text-xs
                          leading-5

                          text-slate-500
                        "
                      >
                        Please confirm
                        you&apos;re human
                        before sending
                        your message.
                      </p>
                    </div>
                  </div>


                  <TurnstileWidget
                    resetSignal={
                      resetTurnstile
                    }

                    onVerify={
                      token => {
                        setTurnstileToken(
                          token
                        );

                        setTurnstileError(
                          ''
                        );
                      }
                    }

                    onExpire={
                      () => {
                        setTurnstileToken(
                          ''
                        );

                        setTurnstileError(
                          'Security check expired. Please complete it again.'
                        );
                      }
                    }

                    onError={
                      () => {
                        setTurnstileToken(
                          ''
                        );

                        setTurnstileError(
                          'Cloudflare security verification could not load. Please try again.'
                        );
                      }
                    }
                  />


                  {turnstileError && (
                    <p
                      className="
                        mt-3

                        text-xs
                        font-medium

                        text-red-600
                      "
                    >
                      {
                        turnstileError
                      }
                    </p>
                  )}
                </div>
              )}


              {/* SECURITY SUCCESS */}

              {turnstileToken && (
                <div
                  className="
                    mt-5

                    flex
                    items-center
                    gap-2

                    text-xs
                    font-medium

                    text-[#087e83]
                  "
                >
                  <CheckCircle2
                    size={16}
                  />

                  Security verification
                  completed.
                </div>
              )}


              {/* SUBMIT */}

              <div
                className="
                  mt-6

                  flex
                  items-center
                "
              >
                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="
                    inline-flex

                    h-12
                    w-full

                    items-center
                    justify-center

                    gap-2

                    rounded-xl

                    bg-[#087e83]

                    px-7

                    text-sm
                    font-semibold

                    text-white

                    shadow-[0_8px_20px_rgba(8,126,131,0.14)]

                    transition

                    hover:bg-[#076f73]

                    disabled:cursor-not-allowed
                    disabled:opacity-60

                    sm:w-auto
                  "
                >
                  {submitting
                    ? 'Sending message...'
                    : 'Send message'}


                  {!submitting && (
                    <Send
                      size={16}
                    />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>


      {/* =====================================================
          04. WHAT HAPPENS NEXT
      ====================================================== */}

      <section
        className="
          border-y
          border-slate-200/70

          bg-white

          py-12

          lg:py-16
        "
      >
        <div className="container-site">
          <div
            className="
              mb-8

              max-w-[700px]
            "
          >
            <p
              className="
                eyebrow
                mb-4
              "
            >
              What happens next
            </p>

            <h2
              className="
                section-heading
              "
            >
              From message to next step,
              kept simple.
            </h2>

            <p
              className="
                body-copy

                mt-4

                max-w-[620px]

                text-sm
              "
            >
              Your enquiry goes to the
              Matelink team so the right
              person can understand what
              you need and respond with
              the appropriate next step.
            </p>
          </div>


          <div
            className="
              grid
              gap-4

              md:grid-cols-3
            "
          >
            <NextStepCard
              number="01"
              icon={
                MessageCircle
              }
              title="Send the essentials"
              description="Tell us what you need help with and include the contact details we should use to reach you."
            />


            <NextStepCard
              number="02"
              icon={
                UserRoundCheck
              }
              title="We review your enquiry"
              description="A member of the team reviews the details so your message can be handled in the right context."
            />


            <NextStepCard
              number="03"
              icon={
                CalendarCheck
              }
              title="We confirm the next step"
              description="Depending on your enquiry, we’ll help with the answer, booking details, quote or next action required."
            />
          </div>
        </div>
      </section>


      {/* =====================================================
          05. CONTACT & SERVICE AREAS

          No oversized Google Map.
      ====================================================== */}

      <section
        className="
          container-site

          py-12

          lg:py-16
        "
      >
        <div
          className="
            overflow-hidden

            rounded-[24px]

            border
            border-slate-200

            bg-white

            shadow-[0_10px_32px_rgba(16,45,67,0.04)]
          "
        >
          <div
            className="
              grid

              lg:grid-cols-[1fr_1fr]
            "
          >
            {/* BUSINESS ADDRESS */}

            <div
              className="
                p-6

                sm:p-8

                lg:p-10
              "
            >
              <div
                className="
                  grid
                  h-11
                  w-11
                  place-items-center

                  rounded-xl

                  bg-[#edf6f5]

                  text-[#087e83]
                "
              >
                <MapPin
                  size={20}
                />
              </div>


              <p
                className="
                  eyebrow

                  mb-3
                  mt-6
                "
              >
                Sydney business address
              </p>


              <h2
                className="
                  text-2xl
                  font-semibold

                  tracking-[-0.035em]

                  text-[#102d43]
                "
              >
                Matelink Cleaning
              </h2>


              <p
                className="
                  mt-3

                  max-w-[470px]

                  text-sm
                  leading-6

                  text-slate-500
                "
              >
                {officeAddress}
              </p>


              <div
                className="
                  mt-6

                  rounded-xl

                  border
                  border-[#d9e7e6]

                  bg-[#edf6f5]

                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <ShieldCheck
                    size={18}
                    className="
                      mt-0.5
                      shrink-0

                      text-[#087e83]
                    "
                  />

                  <div>
                    <p
                      className="
                        text-sm
                        font-semibold

                        text-[#102d43]
                      "
                    >
                      Virtual office
                    </p>

                    <p
                      className="
                        mt-1

                        text-xs
                        leading-5

                        text-slate-500
                      "
                    >
                      This address is
                      used as Matelink&apos;s
                      Sydney business
                      address. It is not
                      open for walk-in
                      customer visits or
                      in-person cleaning
                      enquiries.
                    </p>
                  </div>
                </div>
              </div>
            </div>


            {/* SERVICE AREAS */}

            <div
              className="
                border-t
                border-slate-200

                bg-[#fafbf9]

                p-6

                sm:p-8

                lg:border-l
                lg:border-t-0
                lg:p-10
              "
            >
              <div
                className="
                  grid
                  h-11
                  w-11
                  place-items-center

                  rounded-xl

                  bg-white

                  text-[#087e83]

                  shadow-sm
                "
              >
                <MapPin
                  size={20}
                />
              </div>


              <p
                className="
                  eyebrow

                  mb-3
                  mt-6
                "
              >
                Service areas
              </p>


              <h2
                className="
                  text-2xl
                  font-semibold

                  tracking-[-0.035em]

                  text-[#102d43]
                "
              >
                Cleaning across Sydney
                and Tasmania.
              </h2>


              <p
                className="
                  mt-3

                  max-w-[500px]

                  text-sm
                  leading-6

                  text-slate-500
                "
              >
                Matelink provides
                cleaning services across
                supported Sydney and
                Tasmania locations.
                Availability is confirmed
                as part of your booking
                or enquiry.
              </p>


              <div
                className="
                  mt-6

                  grid
                  gap-3

                  sm:grid-cols-2
                "
              >
                <div
                  className="
                    rounded-xl

                    border
                    border-slate-200

                    bg-white

                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <MapPin
                      size={16}
                      className="
                        text-[#087e83]
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-semibold

                        text-[#102d43]
                      "
                    >
                      Sydney
                    </p>
                  </div>

                  <p
                    className="
                      mt-2

                      text-xs
                      leading-5

                      text-slate-500
                    "
                  >
                    Residential cleaning
                    across supported
                    Sydney service areas.
                  </p>
                </div>


                <div
                  className="
                    rounded-xl

                    border
                    border-slate-200

                    bg-white

                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <MapPin
                      size={16}
                      className="
                        text-[#087e83]
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-semibold

                        text-[#102d43]
                      "
                    >
                      Tasmania
                    </p>
                  </div>

                  <p
                    className="
                      mt-2

                      text-xs
                      leading-5

                      text-slate-500
                    "
                  >
                    Cleaning availability
                    across supported
                    Tasmanian service
                    areas.
                  </p>
                </div>
              </div>


              <div
                className="
                  mt-5

                  flex
                  items-start
                  gap-2

                  text-xs
                  leading-5

                  text-slate-500
                "
              >
                <Clock3
                  size={15}
                  className="
                    mt-0.5
                    shrink-0
                    text-[#087e83]
                  "
                />

                Service availability is
                confirmed when we review
                your booking request or
                enquiry.
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          06. FINAL BOOKING CTA
      ====================================================== */}

      <section
        className="
          container-site

          pb-12

          lg:pb-16
        "
      >
        <div
          className="
            flex
            flex-col
            gap-6

            rounded-[24px]

            bg-[#102d43]

            p-6

            text-white

            shadow-[0_14px_38px_rgba(16,45,67,0.11)]

            sm:p-8

            lg:flex-row
            lg:items-center
            lg:justify-between

            lg:p-9
          "
        >
          <div
            className="
              max-w-3xl
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase

                tracking-[0.14em]

                text-[#a7dddb]
              "
            >
              READY WHEN YOU ARE
            </p>


            <h2
              className="
                mt-2

                text-xl
                font-semibold

                tracking-[-0.03em]

                sm:text-2xl
              "
            >
              Prefer to start with your
              cleaning details?
            </h2>


            <p
              className="
                mt-2

                max-w-[640px]

                text-sm
                leading-6

                text-white/60
              "
            >
              See your cleaning options
              online or request a custom
              quote for something less
              standard.
            </p>
          </div>


          <div
            className="
              flex
              shrink-0
              flex-col
              gap-3

              sm:flex-row
            "
          >
            <Link
              to="/book"
              className="
                inline-flex

                h-11

                items-center
                justify-center

                rounded-xl

                bg-white

                px-6

                text-sm
                font-semibold

                text-[#102d43]

                transition

                hover:bg-[#edf6f5]
              "
            >
              BOOK NOW
            </Link>


            <Link
              to="/get-a-quote"
              className="
                inline-flex

                h-11

                items-center
                justify-center

                rounded-xl

                border
                border-white/25

                px-6

                text-sm
                font-semibold

                text-white

                transition

                hover:bg-white/10
              "
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


export default ContactPage;
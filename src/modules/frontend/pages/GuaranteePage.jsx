import {
  useEffect,
} from 'react';

import {
  Link,
  useLocation,
} from 'react-router-dom';

import {
  ShieldCheck,
} from 'lucide-react';

import {
  Button,
} from '@/shared/components/ui/button';

import {
  CTABand,
  PageIntro,
} from '@/modules/frontend/layouts/SiteLayout';

import {
  CheckList,
} from '@/shared/components/Shared';

import {
  isRecleanEligible,
  useApp,
} from '@/shared/context/AppContext';


/* =========================================================
   GUARANTEE PAGE
   ========================================================= */

function GuaranteePage() {
  const location =
    useLocation();


  const {
    bookings = [],
  } =
    useApp();


  /* =======================================================
     FIND ELIGIBLE BOOKING
     ======================================================= */

  const eligibleBooking =
    bookings.find(
      isRecleanEligible
    );


  /* =======================================================
     SCROLL TO RE-CLEAN AREA WHEN HASH IS PROVIDED
     ======================================================= */

  useEffect(() => {
    if (
      location.hash !==
      '#request-reclean'
    ) {
      return undefined;
    }


    const timer =
      window.setTimeout(
        () => {
          document
            .getElementById(
              'request-reclean'
            )
            ?.scrollIntoView({
              behavior:
                'smooth',

              block:
                'start',
            });
        },
        0
      );


    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    location.hash,
  ]);


  return (
    <>
      {/* =====================================================
          INTRO
      ====================================================== */}

      <PageIntro
        eyebrow="For a considered handover"
        title="Our Bond Back Guarantee."
        description="A straightforward way to raise eligible cleaning concerns after an End-of-Lease clean, linked to your original booking."
      />


      {/* =====================================================
          GUARANTEE DETAILS
      ====================================================== */}

      <section
        className="
          section-space
        "
      >
        <div
          className="
            container-site

            grid

            gap-12

            md:grid-cols-[1.15fr_.85fr]
          "
        >
          {/* LEFT */}

          <div>
            <div
              className="
                icon-square

                mb-6
              "
            >
              <ShieldCheck
                size={25}
              />
            </div>


            <h2
              className="
                mb-6

                text-3xl
              "
            >
              Reassurance, with
              a clear scope.
            </h2>


            <p
              className="
                body-copy
              "
            >
              The guarantee
              applies to eligible
              cleaning issues
              within the scope
              agreed for your
              End-of-Lease
              booking and is
              subject to
              Matelink&apos;s
              terms. Matelink
              reviews each
              request before
              approving a
              re-clean.
            </p>


            <p
              className="
                body-copy

                mt-5
              "
            >
              A rental bond can
              depend on matters
              beyond cleaning.
              This guarantee does
              not promise a full
              bond refund and
              does not cover
              issues outside the
              agreed cleaning
              scope.
            </p>


            <h3
              className="
                mb-4
                mt-9

                text-xl
              "
            >
              If your agent
              raises a concern
            </h3>


            <CheckList
              items={[
                'Open the secure link for your original completed End-of-Lease booking.',

                'Choose “Request a Re-clean”.',

                'Add the agent or property manager name, a short explanation, the inspection report and photos of the issue.',

                'Matelink reviews your request and confirms the next steps.',
              ]}
            />


            <div
              className="
                mt-8

                rounded-xl

                border
                border-[#dfe5e5]

                bg-[#f8fbfa]

                p-5
              "
            >
              <p
                className="
                  text-sm
                  font-semibold

                  text-[#102d43]
                "
              >
                Important
              </p>


              <p
                className="
                  mt-2

                  text-sm
                  leading-6

                  text-muted-foreground
                "
              >
                The Bond Back
                Guarantee applies
                only to eligible
                cleaning concerns
                within the
                confirmed
                End-of-Lease
                cleaning scope.
                It is not a
                guarantee that
                your landlord,
                property manager
                or agent will
                refund your bond.
              </p>
            </div>
          </div>


          {/* =================================================
              REQUEST RE-CLEAN
          ================================================= */}

          <div
            id="request-reclean"
            className="
              surface

              self-start

              scroll-mt-32

              border-primary/15

              bg-[#faf9f6]

              p-8
            "
          >
            <p
              className="
                eyebrow

                mb-4
              "
            >
              Request a Re-clean
            </p>


            <h3
              className="
                text-2xl
              "
            >
              Already had your
              End-of-Lease clean?
            </h3>


            <p
              className="
                body-copy

                mt-4

                text-sm
              "
            >
              Re-clean requests
              are only available
              for eligible,
              completed
              End-of-Lease
              Cleaning bookings
              covered by the
              Bond Back
              Guarantee.
            </p>


            <p
              className="
                body-copy

                mt-4

                text-sm
              "
            >
              Open your original
              booking and submit
              the request from
              there. Your
              customer, property
              and booking details
              stay linked
              automatically.
            </p>


            <div
              className="
                mt-6

                rounded-xl

                border

                bg-white

                p-5
              "
            >
              <p
                className="
                  text-sm
                  font-semibold

                  text-foreground
                "
              >
                You&apos;ll be
                asked for:
              </p>


              <ul
                className="
                  mt-3

                  space-y-2

                  text-sm

                  text-muted-foreground
                "
              >
                <li>
                  • Agent or
                  Property Manager
                  Name
                </li>

                <li>
                  • Agent /
                  Property Manager
                  Feedback
                  (optional)
                </li>

                <li>
                  • Short
                  Explanation of
                  the Issue
                </li>

                <li>
                  • Inspection
                  Report
                </li>

                <li>
                  • Photos of the
                  Issue
                </li>
              </ul>
            </div>


            {/* ELIGIBLE BOOKING */}

            {eligibleBooking ? (
              <div
                className="
                  mt-6

                  flex
                  flex-col

                  gap-3
                "
              >
                <Button
                  asChild
                  className="
                    h-11
                  "
                >
                  <Link
                    to={`/booking/${eligibleBooking.token}/re-clean`}
                  >
                    Request a
                    Re-clean
                  </Link>
                </Button>


                <Button
                  asChild
                  variant="outline"
                  className="
                    h-11

                    bg-white
                  "
                >
                  <Link
                    to={`/booking/${eligibleBooking.token}`}
                  >
                    View eligible
                    booking
                  </Link>
                </Button>


                {eligibleBooking.demo && (
                  <p
                    className="
                      field-help
                    "
                  >
                    Static preview:
                    this button
                    uses the
                    included sample
                    completed
                    End-of-Lease
                    booking.
                  </p>
                )}
              </div>
            ) : (
              <Button
                asChild
                className="
                  mt-6
                  h-11
                "
              >
                <Link
                  to="/login"
                >
                  Sign in to view
                  my booking
                </Link>
              </Button>
            )}


            <Link
              to="/terms"
              className="
                link-line

                mt-6
              "
            >
              Read the terms
            </Link>
          </div>
        </div>
      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <CTABand
        title="Moving out? We’ll help you plan your clean."
      />
    </>
  );
}


export {
  GuaranteePage,
};

export default GuaranteePage;
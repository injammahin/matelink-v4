import {
  BadgeCheck,
  Bath,
  BedDouble,
  Check,
  ChevronDown,
  CircleHelp,
  CookingPot,
  Home,
  KeyRound,
  Layers3,
  MapPin,
  ShieldCheck,
  Sofa,
  Sparkles,
  Truck,
} from 'lucide-react';
import {
  useState,
} from 'react';
import {
  Link,
} from 'react-router-dom';

import {
  Button,
} from '@/shared/components/ui/button';

import {
  useApp,
  isRecleanEligible,
} from '@/shared/context/AppContext';

import {
  availableAddons,
} from '@/modules/booking/lib/pricing';

import * as content
  from '@/shared/data/content';


/* =========================================================
   SUPPORT EITHER:
   export const services = [...]
   OR:
   export const SERVICES = [...]
   ========================================================= */

const SERVICES =
  content.services ||
  content.SERVICES ||
  [];


/* =========================================================
   SERVICE ICONS
   ========================================================= */

const SERVICE_ICONS = {
  general: Home,
  deep: Sparkles,
  'move-in': Truck,
  'end-of-lease': KeyRound,
};


/* =========================================================
   ROOM ICONS
   ========================================================= */

const ROOM_ICONS = {
  kitchen: CookingPot,
  bathroom: Bath,
  bedroom: BedDouble,
  living: Sofa,
  floors: Layers3,
};


/* =========================================================
   SERVICE-SPECIFIC PAGE CONTENT
   ========================================================= */

const SERVICE_DETAILS = {

  /* =======================================================
     GENERAL CLEANING
     ======================================================= */

  general: {
    eyebrow:
      'EVERYDAY HOME CARE',

    title:
      'A fresh home,\nweek after week.',

    summary:
      'A practical routine clean for keeping your home fresh, comfortable and easy to enjoy.',

    includedIntro:
      'General Cleaning is designed for regular household upkeep. It focuses on the accessible surfaces and areas that benefit from consistent attention.',

    differenceTitle:
      'A reliable clean for everyday upkeep.',

    differenceText:
      'General Cleaning is lighter and more routine than Deep Cleaning. It is intended for homes that are already reasonably maintained and need regular cleaning rather than a more detailed reset.',

    rooms: [
      {
        id: 'kitchen',
        title: 'Kitchen',
        items: [
          'Accessible worktops and preparation surfaces',
          'Sink and surrounding areas',
          'Accessible splashback surfaces',
          'External appliance surfaces',
          'General surface wiping',
        ],
      },

      {
        id: 'bathroom',
        title: 'Bathrooms',
        items: [
          'Shower and bath surfaces',
          'Toilet and vanity areas',
          'Accessible mirrors',
          'Accessible fixtures and surfaces',
          'General bathroom floor cleaning',
        ],
      },

      {
        id: 'bedroom',
        title: 'Bedrooms',
        items: [
          'Accessible surface dusting',
          'General tidying of accessible areas',
          'Vacuuming accessible floor areas',
          'Mopping suitable hard floors',
        ],
      },

      {
        id: 'living',
        title: 'Living & Dining Areas',
        items: [
          'Accessible surface dusting',
          'General surface wiping',
          'Light tidying of accessible areas',
          'Vacuuming and hard-floor mopping',
        ],
      },

      {
        id: 'floors',
        title: 'Floors',
        items: [
          'Vacuuming accessible carpeted areas',
          'Vacuuming accessible hard floors',
          'Mopping suitable hard-floor areas',
        ],
      },
    ],

    faq: [
      {
        question:
          'What is included in General Cleaning?',
        answer:
          'General Cleaning focuses on routine household cleaning across accessible kitchens, bathrooms, bedrooms, living areas and floors. Your confirmed booking sets out the final agreed scope.',
      },

      {
        question:
          'How is General Cleaning different from Deep Cleaning?',
        answer:
          'General Cleaning is intended for regular upkeep. Deep Cleaning is better suited to homes that need more detailed attention, including areas that require a more thorough refresh.',
      },

      {
        question:
          'How often should I book General Cleaning?',
        answer:
          'The right frequency depends on your household, use of the property and preferred level of upkeep. You can request the service whenever your home needs a routine refresh.',
      },

      {
        question:
          'Can I request additional cleaning tasks?',
        answer:
          'Yes. Available optional extras can be selected during the booking request. If your requirements fall outside the standard scope, use the tailored quote form.',
      },

      {
        question:
          'Do I need to prepare the property?',
        answer:
          'Providing clear access to the areas being cleaned helps the team work efficiently. Let Matelink know about access, parking or anything requiring particular care before the booking is confirmed.',
      },

      {
        question:
          'Is my booking confirmed immediately?',
        answer:
          'No. Submitting your preferred date is a request. Matelink reviews the service, property details, scope and availability before confirming the booking.',
      },
    ],
  },


  /* =======================================================
     DEEP CLEANING
     ======================================================= */

  deep: {
    eyebrow:
      'A LITTLE EXTRA CARE',

    title:
      'A deeper clean.\nA lighter feeling.',

    summary:
      'Give the spaces you live in every day a little more attention. A thorough refresh for kitchens, bathrooms and the details in between.',

    includedIntro:
      'Deep Cleaning is designed for lived-in homes that need more detailed attention than a routine General Cleaning service.',

    differenceTitle:
      'More detailed than a routine clean.',

    differenceText:
      'Deep Cleaning goes beyond everyday upkeep by allowing more attention to accessible surfaces, fixtures, skirting boards and areas that may not need the same level of attention during a routine General Cleaning visit.',

    rooms: [
      {
        id: 'kitchen',
        title: 'Kitchen',
        items: [
          'Accessible worktops and preparation surfaces',
          'Sink and surrounding areas',
          'Accessible splashbacks',
          'External appliance surfaces',
          'Accessible cabinet exteriors',
          'Detailed surface wiping',
        ],
      },

      {
        id: 'bathroom',
        title: 'Bathrooms',
        items: [
          'Shower and bath surfaces',
          'Toilet and vanity areas',
          'Mirrors and accessible fixtures',
          'Accessible tiled surfaces',
          'Detailed bathroom surface cleaning',
        ],
      },

      {
        id: 'bedroom',
        title: 'Bedrooms',
        items: [
          'Accessible surface dusting and wiping',
          'Accessible skirting boards',
          'Vacuuming accessible floor areas',
          'Mopping suitable hard floors',
        ],
      },

      {
        id: 'living',
        title: 'Living & Dining Areas',
        items: [
          'Accessible surfaces and furniture surrounds',
          'Accessible skirting boards',
          'Detailed dusting of accessible areas',
          'Vacuuming and hard-floor mopping',
        ],
      },

      {
        id: 'floors',
        title: 'Floors',
        items: [
          'Detailed vacuuming of accessible areas',
          'Mopping suitable hard floors',
          'Additional attention around accessible edges',
        ],
      },
    ],

    faq: [
      {
        question:
          'How is Deep Cleaning different from General Cleaning?',
        answer:
          'Deep Cleaning is intended for homes that need a more thorough refresh. It allows greater attention to accessible surfaces, fixtures and detail areas than a routine General Cleaning service.',
      },

      {
        question:
          'What areas are included?',
        answer:
          'The suggested scope covers accessible kitchen, bathroom, bedroom, living-area and floor cleaning. Your confirmed booking defines the final agreed inclusions for your property.',
      },

      {
        question:
          'How often should I book a Deep Cleaning service?',
        answer:
          'There is no fixed schedule. A Deep Cleaning service may be useful when your home needs more attention than normal routine cleaning, after a particularly busy period or before returning to regular upkeep.',
      },

      {
        question:
          'Do I need to prepare the property?',
        answer:
          'Please provide reasonable access to the areas being cleaned and tell Matelink about any access, parking, fragile items or areas requiring special care before confirmation.',
      },

      {
        question:
          'Can I add optional extras?',
        answer:
          'Available optional extras can be selected during the booking request. If your requirement is unusual or is not listed, request a tailored quote.',
      },

      {
        question:
          'Is my preferred date automatically confirmed?',
        answer:
          'No. Matelink reviews the requested service, property information, scope, extras and preferred date before confirming the clean.',
      },
    ],
  },


  /* =======================================================
     MOVE-IN CLEANING
     ======================================================= */

  'move-in': {
    eyebrow:
      'MAKE YOURSELF AT HOME',

    title:
      'New keys.\nA fresh beginning.',

    summary:
      'Start your next chapter with a home that feels ready for you. Choose your property details and the extras your new space needs.',

    includedIntro:
      'Move-In Cleaning helps prepare a property before you settle in, with attention across the main living areas and accessible empty storage spaces included in the agreed scope.',

    differenceTitle:
      'A clean start before you unpack.',

    differenceText:
      'For the best result, Move-In Cleaning is generally most practical before furniture, boxes and belongings occupy the property. The final scope is reviewed and confirmed before the booking is accepted.',

    rooms: [
      {
        id: 'kitchen',
        title: 'Kitchen',
        items: [
          'Accessible worktops and surfaces',
          'Sink and surrounding areas',
          'Accessible splashbacks',
          'Inside accessible empty cupboards',
          'Accessible cupboard exteriors',
        ],
      },

      {
        id: 'bathroom',
        title: 'Bathrooms',
        items: [
          'Shower and bath surfaces',
          'Toilet and vanity',
          'Accessible mirrors and fixtures',
          'Accessible tiled surfaces',
          'Bathroom floor cleaning',
        ],
      },

      {
        id: 'bedroom',
        title: 'Bedrooms',
        items: [
          'Accessible empty surfaces',
          'Accessible skirting boards',
          'Vacuuming accessible floors',
          'Mopping suitable hard floors',
        ],
      },

      {
        id: 'living',
        title: 'Living & Dining Areas',
        items: [
          'Accessible surfaces',
          'Accessible skirting boards',
          'General dusting',
          'Vacuuming and hard-floor mopping',
        ],
      },

      {
        id: 'floors',
        title: 'Floors',
        items: [
          'Vacuuming accessible carpeted areas',
          'Vacuuming hard floors',
          'Mopping suitable hard-floor areas',
        ],
      },
    ],

    faq: [
      {
        question:
          'When should I schedule Move-In Cleaning?',
        answer:
          'Where possible, arrange the clean after the previous occupants have left and before your belongings are moved into the property. Your preferred date is reviewed before confirmation.',
      },

      {
        question:
          'Does the property need to be empty?',
        answer:
          'An empty or mostly empty property generally provides better access. If furniture or belongings will remain, explain this when submitting your request so the scope can be reviewed.',
      },

      {
        question:
          'What is included in Move-In Cleaning?',
        answer:
          'The suggested scope includes accessible kitchens, bathrooms, bedrooms, living areas, floors and accessible empty cupboards. The confirmed booking determines the final agreed scope.',
      },

      {
        question:
          'Can I add optional extras?',
        answer:
          'Yes. Available extras can be selected as part of the booking request. Requirements outside the available options can be submitted through the tailored quote form.',
      },

      {
        question:
          'What should I provide about property access?',
        answer:
          'Tell Matelink how the cleaner can access the property and provide any relevant information about keys, parking, building entry or other access restrictions.',
      },

      {
        question:
          'Does submitting the request confirm my booking?',
        answer:
          'No. Matelink reviews your requested service, property information, preferred date and cleaning scope before confirming the booking.',
      },
    ],
  },


  /* =======================================================
     END OF LEASE
     ======================================================= */

  'end-of-lease': {
    eyebrow:
      'LEAVE ON A CLEAN NOTE',

    title:
      'A thoughtful finish\nto your time at home.',

    summary:
      'Get ready for your handover with cleaning tailored to the agreed scope. Eligible cleaning concerns may be reviewed under Matelink’s Bond Back Guarantee.',

    includedIntro:
      'End-of-Lease Cleaning is structured around preparing a rental property for handover. The agreed scope depends on the property condition, selected extras and confirmed booking details.',

    differenceTitle:
      'Prepared around your rental handover.',

    differenceText:
      'The confirmed quote or booking defines the cleaning work agreed for your property. Optional extras and requirements outside the standard scope should be selected or discussed before the booking is accepted.',

    rooms: [
      {
        id: 'kitchen',
        title: 'Kitchen',
        items: [
          'Accessible worktops and surfaces',
          'Sink and surrounding areas',
          'Accessible splashbacks',
          'Inside accessible empty cupboards',
          'Accessible cupboard exteriors',
        ],
      },

      {
        id: 'bathroom',
        title: 'Bathrooms',
        items: [
          'Shower and bath surfaces',
          'Toilet and vanity areas',
          'Accessible mirrors and fixtures',
          'Accessible tiled surfaces',
          'Bathroom floor cleaning',
        ],
      },

      {
        id: 'bedroom',
        title: 'Bedrooms',
        items: [
          'Accessible empty surfaces',
          'Accessible skirting boards',
          'Vacuuming accessible areas',
          'Mopping suitable hard floors',
        ],
      },

      {
        id: 'living',
        title: 'Living & Dining Areas',
        items: [
          'Accessible surfaces',
          'Accessible skirting boards',
          'General dusting',
          'Vacuuming and hard-floor mopping',
        ],
      },

      {
        id: 'floors',
        title: 'Floors',
        items: [
          'Vacuuming accessible carpeted areas',
          'Vacuuming accessible hard floors',
          'Mopping suitable hard-floor areas',
        ],
      },
    ],

    faq: [
      {
        question:
          'What is included in End-of-Lease Cleaning?',
        answer:
          'The suggested scope covers accessible kitchens, bathrooms, bedrooms, living areas, floors and accessible empty cupboards. Your confirmed quote or booking defines the final agreed scope.',
      },

      {
        question:
          'Does the condition of the property affect the cleaning scope?',
        answer:
          'Yes. Property condition, access and additional requirements can affect the appropriate scope. Include accurate information when requesting your clean so Matelink can review what is required.',
      },

      {
        question:
          'Can I add carpet, window or other optional cleaning?',
        answer:
          'Where available, optional extras can be selected during the booking request. Requirements outside the available options can be submitted through the tailored quote process.',
      },

      {
        question:
          'What if my agent identifies a cleaning concern after inspection?',
        answer:
          'Eligible cleaning concerns within the agreed End-of-Lease scope may be submitted for review under Matelink’s Bond Back Guarantee through the original completed booking.',
      },

      {
        question:
          'Does the Bond Back Guarantee guarantee my bond refund?',
        answer:
          'No. A rental bond may depend on matters beyond cleaning. The guarantee relates only to eligible cleaning concerns within the agreed scope and does not promise that a landlord or agent will return the full bond.',
      },

      {
        question:
          'What information is required before booking?',
        answer:
          'Provide your property details, mandatory property address, preferred date, access information and any relevant optional extras. Matelink reviews the request before confirming the booking.',
      },
    ],
  },
};


/* =========================================================
   SERVICE TAB
   ========================================================= */

function ServiceNavigation({
  activeServiceId,
}) {
  return (
    <section
      className="
        container-site

        pt-6

        sm:pt-7

        lg:pt-8
      "
    >
      <div
        className="
          grid

          grid-cols-2

          gap-2

          rounded-2xl

          bg-[#f4f3ef]

          p-1.5

          lg:grid-cols-4
        "
      >
        {SERVICES.map(
          service => {
            const active =
              service.id ===
              activeServiceId;

            return (
              <Link
                key={
                  service.id
                }
                to={
                  `/${service.slug}`
                }
                className={`
                  flex

                  min-h-[44px]

                  items-center
                  justify-center

                  rounded-xl

                  px-3
                  py-2.5

                  text-center
                  text-xs
                  font-medium
                  leading-tight

                  transition-all

                  sm:text-sm

                  ${
                    active
                      ? `
                        bg-white
                        text-[#102d43]
                        shadow-[0_3px_10px_rgba(16,45,67,0.08)]
                      `
                      : `
                        text-slate-500

                        hover:bg-white/70
                        hover:text-[#102d43]
                      `
                  }
                `}
              >
                {service.name}
              </Link>
            );
          }
        )}
      </div>
    </section>
  );
}


/* =========================================================
   ROOM SCOPE CARD
   ========================================================= */

function RoomCard({
  room,
}) {
  const Icon =
    ROOM_ICONS[
      room.id
    ] || Home;

  return (
    <article
      className="
        rounded-[18px]

        border
        border-[#dfe3e1]

        bg-white

        p-5

        shadow-[0_5px_18px_rgba(16,45,67,0.025)]

        sm:p-6
      "
    >
      <div
        className="
          flex
          items-center
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
          />
        </div>


        <div>
          <h3
            className="
              text-[16px]
              font-semibold

              text-[#102d43]
            "
          >
            {room.title}
          </h3>


          <p
            className="
              mt-0.5

              text-[10px]
              font-bold
              uppercase

              tracking-[0.12em]

              text-[#087e83]
            "
          >
            Standard inclusion
          </p>
        </div>
      </div>


      <ul
        className="
          mt-5

          space-y-2.5
        "
      >
        {room.items.map(
          item => (
            <li
              key={item}
              className="
                flex
                items-start
                gap-2.5

                text-[13px]
                leading-5

                text-slate-600
              "
            >
              <Check
                size={15}
                strokeWidth={2}
                className="
                  mt-[2px]

                  shrink-0

                  text-[#087e83]
                "
              />

              <span>
                {item}
              </span>
            </li>
          )
        )}
      </ul>
    </article>
  );
}


/* =========================================================
   FAQ ITEM
   ========================================================= */

function ServiceFaqItem({
  item,
}) {
  const [
    open,
    setOpen,
  ] = useState(false);


  return (
    <div
      className="
        border-b
        border-slate-200

        last:border-b-0
      "
    >
      {/* QUESTION */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            current =>
              !current
          )
        }
        aria-expanded={
          open
        }
        className="
          flex
          w-full

          items-center
          justify-between

          gap-6

          py-5

          text-left

          text-[15px]
          font-semibold

          text-[#102d43]

          transition-colors

          duration-300

          hover:text-[#087e83]

          focus:outline-none
        "
      >
        <span>
          {item.question}
        </span>


        <span
          className={`
            grid
            h-8
            w-8

            shrink-0

            place-items-center

            rounded-full

            transition-all

            duration-500

            ease-in-out

            ${
              open
                ? `
                  bg-[#edf6f5]
                  text-[#087e83]
                `
                : `
                  bg-transparent
                  text-[#087e83]
                `
            }
          `}
        >
          <ChevronDown
            size={18}
            strokeWidth={1.8}
            className={`
              transition-transform

              duration-200

              ease-in-out

              ${
                open
                  ? 'rotate-180'
                  : 'rotate-0'
              }
            `}
          />
        </span>
      </button>


      {/* ANSWER
          grid-template-rows lets it animate
          smoothly in BOTH directions.
      */}

      <div
        className={`
          grid

          transition-all

          duration-500

          ease-in-out

          ${
            open
              ? `
                grid-rows-[1fr]
                opacity-100
              `
              : `
                grid-rows-[0fr]
                opacity-0
              `
          }
        `}
      >
        <div
          className="
            overflow-hidden
          "
        >
          <div
            className={`
              max-w-[850px]

              pr-8

              text-sm
              leading-6

              text-slate-500

              transition-all

              duration-500

              ease-in-out

              ${
                open
                  ? `
                    -translate-y-0
                    pb-5
                  `
                  : `
                    -translate-y-2
                    pb-0
                  `
              }
            `}
          >
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   SERVICE PAGE
   ========================================================= */

function ServicePage({
  serviceId,
}) {
  const app =
    useApp();


  const {
    settings = {},
    bookings = [],
  } =
    app || {};


  const service =
    SERVICES.find(
      item =>
        item.id ===
        serviceId
    );


  const detail =
    SERVICE_DETAILS[
      serviceId
    ];


  /*
   * Available extras continue to come
   * from the existing booking/pricing
   * configuration.
   */
  const extras =
    service
      ? availableAddons(
          settings,
          serviceId
        ).filter(
          extra =>
            extra?.active !==
            false
        )
      : [];


  /*
   * End-of-Lease re-clean must stay
   * connected to the original eligible
   * completed booking.
   */
  const eligibleRecleanBooking =
    serviceId ===
      'end-of-lease'
      ? bookings.find(
          isRecleanEligible
        )
      : null;


  /* =======================================================
     SAFE FALLBACK
     ======================================================= */

  if (
    !service ||
    !detail
  ) {
    return (
      <section
        className="
          container-site

          py-24

          text-center
        "
      >
        <p
          className="
            eyebrow

            justify-center
          "
        >
          Service unavailable
        </p>

        <h1
          className="
            mt-6

            text-4xl

            text-[#102d43]
          "
        >
          We couldn&apos;t find
          this cleaning service.
        </h1>

        <Button
          asChild
          className="
            mt-7
          "
        >
          <Link to="/">
            Back to home
          </Link>
        </Button>
      </section>
    );
  }


  const Icon =
    SERVICE_ICONS[
      serviceId
    ] || Sparkles;


  /*
   * Supports your current richer
   * service data AND your simpler
   * SERVICES array.
   */
  const heroImage =
    service.detailImage ||
    service.image ||
    service.cardImage;


  const heroImageAlt =
    service.detailImageAlt ||
    service.cardImageAlt ||
    `${service.name} by Matelink Cleaning`;


  /*
   * IMPORTANT:
   * We keep service in the URL so
   * booking / quote screens can
   * preselect the correct service.
   */
  const bookingUrl =
    `/book?service=${encodeURIComponent(
      service.id
    )}`;


  const quoteUrl =
    `/get-a-quote?service=${encodeURIComponent(
      service.id
    )}`;


  return (
    <>
      {/* =====================================================
          SERVICE SWITCHER
      ====================================================== */}

      <ServiceNavigation
        activeServiceId={
          serviceId
        }
      />


      {/* =====================================================
          01. HERO
      ====================================================== */}

      <section
        className="
          container-site

          grid

          items-center

          gap-10

          pb-14
          pt-8

          md:grid-cols-[0.92fr_1.08fr]

          lg:gap-14
          lg:pb-16
          lg:pt-10
        "
      >
        {/* TEXT */}

        <div>
          <p
            className="
              eyebrow
              mb-5
            "
          >
            {detail.eyebrow}
          </p>


          <h1
            className="
              hero-title

              whitespace-pre-line

              !text-[clamp(2.65rem,4.25vw,4.35rem)]
            "
          >
            {detail.title}
          </h1>


          <p
            className="
              body-copy

              mt-6

              max-w-xl
            "
          >
            {detail.summary}
          </p>


          <div
            className="
              mt-7

              flex
              flex-wrap

              gap-3
            "
          >
            <Button
              asChild
              className="
                h-12

                px-6
              "
            >
              <Link
                to={
                  bookingUrl
                }
              >
                Request this clean
              </Link>
            </Button>


            <Button
              asChild
              variant="outline"
              className="
                h-12

                bg-white

                px-6
              "
            >
              <Link
                to={
                  quoteUrl
                }
              >
                Get a tailored quote
              </Link>
            </Button>
          </div>


          <p
            className="
              field-help

              mt-5

              flex
              items-center

              gap-2
            "
          >
            <ShieldCheck
              size={16}
            />

            No payment at the
            request stage.
          </p>
        </div>


        {/* IMAGE */}

        <div
          className="
            service-photo

            !h-[430px]

            sm:!h-[500px]

            lg:!h-[530px]

            xl:!h-[560px]
          "
        >
          <img
            src={
              heroImage
            }
            width="1600"
            height="1067"
            alt={
              heroImageAlt
            }
            fetchPriority="high"
            className="
              h-full
              w-full

              object-cover
            "
          />
        </div>
      </section>


      {/* =====================================================
          02. WHAT'S INCLUDED
      ====================================================== */}

      <section
        className="
          border-y
          border-slate-200/70

          bg-[#faf9f6]

          py-14

          lg:py-18
        "
      >
        <div
          className="
            container-site

            grid

            gap-10

            lg:grid-cols-[0.68fr_1.32fr]

            lg:gap-14
          "
        >
          {/* INTRO */}

          <div
            className="
              lg:sticky
              lg:top-32
              lg:self-start
            "
          >
            <p
              className="
                eyebrow
                mb-5
              "
            >
              What&apos;s included
            </p>


            <h2
              className="
                section-heading
              "
            >
              Care for the spaces
              <br />
              that matter.
            </h2>


            <p
              className="
                body-copy

                mt-5
              "
            >
              {detail.includedIntro}
            </p>


            <div
              className="
                mt-7

                rounded-[18px]

                border
                border-[#d9e7e6]

                bg-[#edf6f5]

                p-5
              "
            >
              <div
                className="
                  flex
                  items-start

                  gap-3
                "
              >
                <BadgeCheck
                  size={20}
                  className="
                    mt-0.5

                    shrink-0

                    text-[#087e83]
                  "
                />


                <div>
                  <h3
                    className="
                      text-sm
                      font-semibold

                      text-[#102d43]
                    "
                  >
                    {detail.differenceTitle}
                  </h3>


                  <p
                    className="
                      mt-2

                      text-xs
                      leading-5

                      text-slate-600
                    "
                  >
                    {detail.differenceText}
                  </p>
                </div>
              </div>
            </div>


            <p
              className="
                mt-6

                text-xs
                leading-5

                text-slate-500
              "
            >
              The items shown here
              describe the suggested
              standard scope. Your
              confirmed booking or
              quote determines the
              cleaning work agreed
              for your property.
            </p>


            <Link
              to="/whats-included"
              className="
                link-line

                mt-6
              "
            >
              Compare cleaning
              inclusions
            </Link>
          </div>


          {/* ROOMS */}

          <div
            className="
              grid

              gap-4

              md:grid-cols-2
            "
          >
            {detail.rooms.map(
              room => (
                <RoomCard
                  key={
                    room.id
                  }
                  room={
                    room
                  }
                />
              )
            )}


            {/* FINAL SCOPE NOTE */}

            <div
              className="
                rounded-[18px]

                bg-[#102d43]

                p-6

                text-white

                md:col-span-2
              "
            >
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

                    h-10
                    w-10

                    shrink-0

                    place-items-center

                    rounded-xl

                    bg-white/10

                    text-[#85d3d1]
                  "
                >
                  <ShieldCheck
                    size={19}
                  />
                </div>


                <div>
                  <h3
                    className="
                      text-[16px]
                      font-semibold
                    "
                  >
                    Your confirmed
                    scope comes first.
                  </h3>


                  <p
                    className="
                      mt-2

                      max-w-3xl

                      text-[13px]
                      leading-6

                      text-white/65
                    "
                  >
                    Property
                    condition, access,
                    optional extras
                    and any special
                    requirements may
                    change the
                    appropriate
                    cleaning scope.
                    Matelink reviews
                    your request
                    before accepting
                    the booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          03. OPTIONAL EXTRAS
      ====================================================== */}

      <section
        className="
          py-14

          lg:py-18
        "
      >
        <div
          className="
            container-site
          "
        >
          <div
            className="
              flex
              flex-col

              justify-between

              gap-6

              md:flex-row
              md:items-end
            "
          >
            <div>
              <p
                className="
                  eyebrow
                  mb-4
                "
              >
                Optional extras
              </p>


              <h2
                className="
                  section-heading
                "
              >
                A little extra,
                <br />
                where you need it.
              </h2>
            </div>


            <div
              className="
                max-w-md
              "
            >
              <p
                className="
                  body-copy

                  text-sm
                "
              >
                Select available
                extras as part of
                your booking
                request. If your
                property needs
                something not
                listed here, send
                us a tailored quote
                request.
              </p>


              <div
                className="
                  mt-4

                  flex
                  items-start

                  gap-2

                  text-xs
                  leading-5

                  text-[#087e83]
                "
              >
                <MapPin
                  size={15}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                A property address
                is required when
                submitting the
                booking or quote.
              </div>
            </div>
          </div>


          {extras.length > 0 ? (
            <div
              className="
                mt-9

                grid

                gap-3

                sm:grid-cols-2

                lg:grid-cols-3
              "
            >
              {extras.map(
                (
                  extra,
                  index
                ) => {
                  /*
                   * If only one
                   * item remains in
                   * the final
                   * desktop row,
                   * centre it.
                   */
                  const singleLast =
                    extras.length >
                      3 &&
                    extras.length %
                      3 ===
                      1 &&
                    index ===
                      extras.length -
                        1;


                  return (
                    <article
                      key={
                        extra.id
                      }
                      className={`
                        flex

                        min-h-[100px]

                        items-start

                        gap-3

                        rounded-[16px]

                        border
                        border-[#dfe3e1]

                        bg-white

                        p-5

                        shadow-[0_5px_18px_rgba(16,45,67,0.025)]

                        transition

                        hover:border-[#087e83]/25

                        ${
                          singleLast
                            ? 'lg:col-start-2'
                            : ''
                        }
                      `}
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
                        <Check
                          size={17}
                        />
                      </div>


                      <div>
                        <h3
                          className="
                            text-sm
                            font-semibold

                            text-[#102d43]
                          "
                        >
                          {
                            extra.name
                          }
                        </h3>


                        {extra.description && (
                          <p
                            className="
                              mt-1.5

                              text-xs
                              leading-5

                              text-slate-500
                            "
                          >
                            {
                              extra.description
                            }
                          </p>
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div
              className="
                mt-8

                rounded-[18px]

                border
                border-slate-200

                bg-white

                p-7
              "
            >
              <p
                className="
                  body-copy

                  text-sm
                "
              >
                Have something
                additional in mind?
                Tell us about the
                property and the
                extra cleaning you
                need.
              </p>


              <Button
                asChild
                variant="outline"
                className="
                  mt-5
                "
              >
                <Link
                  to={
                    quoteUrl
                  }
                >
                  Tell us what you
                  need
                </Link>
              </Button>
            </div>
          )}


          <div
            className="
              mt-8

              flex
              flex-wrap

              gap-3
            "
          >
            <Button
              asChild
            >
              <Link
                to={
                  bookingUrl
                }
              >
                Choose extras with
                this clean
              </Link>
            </Button>


            <Button
              asChild
              variant="outline"
            >
              <Link
                to={
                  quoteUrl
                }
              >
                Request a tailored
                quote
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* =====================================================
          04. BOND BACK GUARANTEE
          END-OF-LEASE ONLY
      ====================================================== */}

      {serviceId ===
        'end-of-lease' && (
        <section
          className="
            container-site

            pb-14

            lg:pb-18
          "
          id="bond-back-guarantee"
        >
          <div
            className="
              overflow-hidden

              rounded-[24px]

              border
              border-[#087e83]/15

              bg-[#edf6f5]
            "
          >
            <div
              className="
                grid

                lg:grid-cols-[1.12fr_0.88fr]
              "
            >
              {/* MAIN */}

              <div
                className="
                  p-7

                  sm:p-9

                  lg:p-11
                "
              >
                <div
                  className="
                    grid

                    h-12
                    w-12

                    place-items-center

                    rounded-xl

                    bg-white

                    text-[#087e83]

                    shadow-sm
                  "
                >
                  <ShieldCheck
                    size={24}
                  />
                </div>


                <p
                  className="
                    eyebrow

                    mb-4
                    mt-6
                  "
                >
                  Bond Back
                  Guarantee
                </p>


                <h2
                  className="
                    max-w-2xl

                    text-3xl
                    font-semibold

                    tracking-[-0.04em]

                    text-[#102d43]

                    sm:text-4xl
                  "
                >
                  Extra reassurance
                  after your
                  End-of-Lease clean.
                </h2>


                <p
                  className="
                    body-copy

                    mt-5

                    max-w-2xl
                  "
                >
                  If your agent or
                  property manager
                  identifies an
                  eligible cleaning
                  concern within the
                  scope agreed for
                  your completed
                  End-of-Lease
                  booking, you can
                  submit the concern
                  to Matelink for
                  review.
                </p>


                <p
                  className="
                    body-copy

                    mt-4

                    max-w-2xl
                  "
                >
                  Where the concern
                  meets the
                  guarantee
                  conditions,
                  Matelink may
                  arrange an
                  eligible re-clean.
                  The request stays
                  linked to the
                  original
                  completed booking.
                </p>


                <div
                  className="
                    mt-7

                    rounded-xl

                    border
                    border-[#087e83]/15

                    bg-white/70

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

                      text-xs
                      leading-5

                      text-slate-600
                    "
                  >
                    The Bond Back
                    Guarantee is not
                    a guarantee that
                    your landlord,
                    agent or property
                    manager will
                    refund your full
                    rental bond.
                    Bond decisions
                    can depend on
                    issues beyond
                    cleaning.
                  </p>
                </div>


                <div
                  className="
                    mt-7

                    flex
                    flex-wrap

                    gap-3
                  "
                >
                  <Button
                    asChild
                  >
                    <Link
                      to="/bond-back-guarantee"
                    >
                      View guarantee
                      details
                    </Link>
                  </Button>


                  <Button
                    asChild
                    variant="outline"
                    className="
                      bg-white
                    "
                  >
                    <Link
                      to="/terms"
                    >
                      Terms &
                      conditions
                    </Link>
                  </Button>
                </div>
              </div>


              {/* RECLEAN */}

              <div
                className="
                  border-t
                  border-[#087e83]/15

                  bg-white/65

                  p-7

                  sm:p-9

                  lg:border-l
                  lg:border-t-0
                  lg:p-10
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
                  Already completed
                  your clean?
                </p>


                <h3
                  className="
                    mt-4

                    text-2xl
                    font-semibold

                    tracking-[-0.03em]

                    text-[#102d43]
                  "
                >
                  Keep the re-clean
                  connected to your
                  original booking.
                </h3>


                <p
                  className="
                    body-copy

                    mt-4

                    text-sm
                  "
                >
                  Re-clean requests
                  should be submitted
                  from the original
                  eligible completed
                  End-of-Lease
                  booking so the
                  property, customer
                  and agreed scope
                  remain connected.
                </p>


                {eligibleRecleanBooking ? (
                  <Button
                    asChild
                    className="
                      mt-7
                    "
                  >
                    <Link
                      to={`/booking/${eligibleRecleanBooking.token}/re-clean`}
                    >
                      Request a
                      Re-clean
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="
                      mt-7
                    "
                  >
                    <Link
                      to="/bond-back-guarantee#request-reclean"
                    >
                      Check re-clean
                      eligibility
                    </Link>
                  </Button>
                )}


                <p
                  className="
                    mt-4

                    text-xs
                    leading-5

                    text-slate-500
                  "
                >
                  Only eligible
                  cleaning concerns
                  within the agreed
                  End-of-Lease scope
                  can be considered.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* =====================================================
          05. SERVICE FAQ
      ====================================================== */}

      <section
        className="
          border-y
          border-slate-200/70

          bg-[#faf9f6]

          py-14

          lg:py-18
        "
      >
        <div
          className="
            container-site

            grid

            gap-10

            lg:grid-cols-[0.65fr_1.35fr]

            lg:gap-16
          "
        >
          <div>
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
              <CircleHelp
                size={21}
              />
            </div>


            <p
              className="
                eyebrow

                mb-4
                mt-6
              "
            >
              Good to know
            </p>


            <h2
              className="
                section-heading
              "
            >
              {service.name}
              <br />
              FAQs.
            </h2>


            <p
              className="
                body-copy

                mt-5

                max-w-sm

                text-sm
              "
            >
              A few of the details
              customers commonly
              want to understand
              before requesting
              this service.
            </p>


            <Link
              to="/faq"
              className="
                link-line

                mt-6
              "
            >
              View all FAQs
            </Link>
          </div>


          <div
            className="
              rounded-[20px]

              border
              border-slate-200

              bg-white

              px-6

              shadow-[0_6px_22px_rgba(16,45,67,0.025)]

              sm:px-8
            "
          >
            {detail.faq.map(
              item => (
                <ServiceFaqItem
                  key={
                    item.question
                  }
                  item={
                    item
                  }
                />
              )
            )}
          </div>
        </div>
      </section>


      {/* =====================================================
          06. FINAL BOOKING CTA
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
            relative

            overflow-hidden

            rounded-[26px]

            bg-[#102d43]

            px-6
            py-8

            text-white

            shadow-[0_16px_46px_rgba(16,45,67,0.14)]

            sm:px-8
            sm:py-10

            lg:px-11
            lg:py-11
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none

              absolute

              -right-16
              -top-20

              h-64
              w-64

              rounded-full

              border
              border-white/10
            "
          />


          <div
            className="
              relative

              flex
              flex-col

              gap-7

              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div
              className="
                max-w-2xl
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase

                  tracking-[0.15em]

                  text-[#85d3d1]
                "
              >
                Ready when you are
              </p>


              <h2
                className="
                  mt-3

                  text-2xl
                  font-semibold

                  tracking-[-0.04em]

                  sm:text-3xl
                "
              >
                Let&apos;s make your
                next clean simple.
              </h2>


              <p
                className="
                  mt-3

                  max-w-xl

                  text-sm
                  leading-6

                  text-white/65
                "
              >
                Continue with{' '}
                {service.name} and
                tell us about your
                property, or request
                a tailored quote if
                your cleaning needs
                are less standard.
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
                to={
                  bookingUrl
                }
                className="
                  inline-flex

                  h-12

                  items-center
                  justify-center

                  rounded-xl

                  bg-white

                  px-7

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
                to={
                  quoteUrl
                }
                className="
                  inline-flex

                  h-12

                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-white/25

                  px-7

                  text-sm
                  font-semibold

                  text-white

                  transition

                  hover:border-white/40
                  hover:bg-white/10
                "
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


export {
  ServicePage,
};

export default ServicePage;
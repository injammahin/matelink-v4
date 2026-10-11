import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  HandHeart,
  Heart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import {
  Button,
} from '@/shared/components/ui/button';

import {
  CTABand,
} from '@/modules/frontend/layouts/SiteLayout';


/* =========================================================
   ABOUT PAGE
   ========================================================= */

export default function AboutPage() {
  return (
    <>
      {/* =====================================================
          HERO
          Requirement:
          Preserve the current two-column layout and headline.
          Refine the introduction to explain Matelink's purpose.
      ====================================================== */}

      <section
        className="
          container-site

          grid
          items-center
          gap-10

          py-12

          md:grid-cols-[0.92fr_1.08fr]
          md:gap-12
          md:py-16

          lg:gap-16
          lg:py-20
        "
      >
        {/* ===================================================
            HERO COPY
        ==================================================== */}

        <div
          className="
            max-w-[620px]
          "
        >
          <p
            className="
              eyebrow
              mb-5
            "
          >
            Hello, we’re Matelink
          </p>


          <h1
            className="
              page-title
              max-w-[600px]
            "
          >
            Care for the place
            <br />
            you call home.
          </h1>


          <p
            className="
              body-copy

              mt-7

              max-w-[570px]

              text-[15px]
              leading-7
            "
          >
            Matelink Cleaning exists to make looking after your
            home feel simpler, clearer and more considered. From
            everyday cleaning to moving-day support, we help you
            choose the right service, understand what is included
            and arrange your clean without unnecessary complexity.
          </p>


          <p
            className="
              body-copy

              mt-5

              max-w-[570px]

              text-[15px]
              leading-7
            "
          >
            Because a home is more than a collection of rooms.
            It is where everyday routines happen, families unwind,
            new chapters begin and life keeps moving.
          </p>


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
              className="
                h-12

                rounded-xl

                px-6
              "
            >
              <Link to="/book">
                Find your clean

                <ArrowRight
                  size={17}
                />
              </Link>
            </Button>


            <Button
              asChild
              variant="outline"
              className="
                h-12

                rounded-xl

                bg-white

                px-6
              "
            >
              <Link to="/get-a-quote">
                Get a tailored quote
              </Link>
            </Button>
          </div>


          {/* SMALL PROMISE */}

          <div
            className="
              mt-7

              flex
              items-center
              gap-3

              text-sm
              text-muted-foreground
            "
          >
            <ShieldCheck
              size={17}
              className="
                shrink-0
                text-[#087e83]
              "
            />

            Clear service details and no payment at the request stage.
          </div>
        </div>


        {/* ===================================================
            HERO IMAGE
        ==================================================== */}

        <div
          className="
            relative

            min-h-[420px]

            overflow-hidden

            rounded-[24px]

            bg-[#edf1ef]

            shadow-[0_14px_40px_rgba(16,45,67,0.06)]

            sm:min-h-[500px]

            lg:min-h-[560px]
          "
        >
          <img
            src="/images/about-details.webp"
            width="1267"
            height="1900"
            alt="Bright, welcoming home interior prepared for thoughtful cleaning"
            fetchPriority="high"
            className="
              absolute
              inset-0

              h-full
              w-full

              object-cover
            "
          />


          {/* IMAGE FLOATING CARD */}

          <div
            className="
              absolute

              bottom-4
              left-4
              right-4

              rounded-[18px]

              border
              border-white/70

              bg-white/95

              p-4

              shadow-[0_12px_30px_rgba(16,45,67,0.10)]

              backdrop-blur-md

              sm:bottom-6
              sm:left-6
              sm:right-auto
              sm:max-w-[350px]
              sm:p-5
            "
          >
            <div
              className="
                flex
                items-center
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
                <Heart
                  size={20}
                />
              </div>


              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#102d43]
                  "
                >
                  Home at the centre.
                </p>

                <p
                  className="
                    mt-1

                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Thoughtful cleaning shaped around the space
                  you live in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          OUR STORY
          Requirement:
          Add a short genuine explanation of why Matelink was
          created and what the business stands for.
          No invented founder details.
      ====================================================== */}

      <section
        className="
          border-y
          border-slate-200/70

          bg-[#f7f6f2]

          py-14

          lg:py-20
        "
      >
        <div
          className="
            container-site

            grid
            items-center
            gap-10

            md:grid-cols-[0.9fr_1.1fr]

            lg:gap-16
          "
        >
          {/* ===================================================
              STORY IMAGE
          ==================================================== */}

          <div
            className="
              order-2

              md:order-1
            "
          >
            <div
              className="
                relative

                overflow-hidden

                rounded-[22px]

                bg-[#e9efed]

                shadow-[0_10px_35px_rgba(16,45,67,0.05)]
              "
            >
              <img
                src="/images/about.webp"
                width="1600"
                height="1067"
                loading="lazy"
                alt="A calm, cared-for home interior"
                className="
                  aspect-[4/3]

                  h-full
                  w-full

                  object-cover
                "
              />


              <div
                className="
                  absolute
                  bottom-4
                  left-4

                  rounded-xl

                  bg-[#102d43]

                  px-4
                  py-3

                  text-white

                  shadow-lg
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase

                    tracking-[0.14em]

                    text-[#85d3d1]
                  "
                >
                  The Matelink approach
                </p>

                <p
                  className="
                    mt-1

                    text-sm
                    font-semibold
                  "
                >
                  Clear. Considered. Simple.
                </p>
              </div>
            </div>
          </div>


          {/* ===================================================
              STORY COPY
          ==================================================== */}

          <div
            className="
              order-1

              md:order-2
            "
          >
            <p
              className="
                eyebrow
                mb-5
              "
            >
              Our story
            </p>


            <h2
              className="
                section-heading

                max-w-[600px]
              "
            >
              Cleaning should make
              home life easier.
              <br />
              Not more complicated.
            </h2>


            <p
              className="
                body-copy

                mt-6

                max-w-[600px]

                text-[15px]
                leading-7
              "
            >
              Matelink was created around a straightforward idea:
              arranging a professional home clean should feel easy
              to understand from the start. Customers should be
              able to see the available services, explain what their
              home needs and know what happens next.
            </p>


            <p
              className="
                body-copy

                mt-5

                max-w-[600px]

                text-[15px]
                leading-7
              "
            >
              That is why we focus on clarity, practical service
              choices and thoughtful communication. Whether someone
              needs a regular refresh, a deeper clean or help around
              a move, the aim stays the same: make the process simple
              and treat the home with care.
            </p>


            {/* VALUES */}

            <div
              className="
                mt-8

                grid
                gap-3

                sm:grid-cols-2
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  p-4
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
                  <Sparkles
                    size={17}
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#102d43]
                    "
                  >
                    Care in the details
                  </p>

                  <p
                    className="
                      mt-1

                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    Attention to the spaces and details that
                    make a home feel refreshed.
                  </p>
                </div>
              </div>


              <div
                className="
                  flex
                  items-start
                  gap-3

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  p-4
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
                  <ClipboardCheck
                    size={17}
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#102d43]
                    "
                  >
                    Clarity from the start
                  </p>

                  <p
                    className="
                      mt-1

                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    Clear service choices, inclusions and
                    next steps before confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          THOUGHTFUL AT EVERY STEP
          Requirement:
          Retain the three-column design and emphasise:
          - care for the home
          - attention to detail
          - a simple experience
      ====================================================== */}

      <section
        className="
          section-space
        "
      >
        <div className="container-site">
          <div
            className="
              mb-10

              max-w-[720px]
            "
          >
            <p
              className="
                eyebrow
                mb-5
              "
            >
              How we approach it
            </p>

            <h2
              className="
                section-heading
              "
            >
              Thoughtful at every step.
            </h2>

            <p
              className="
                body-copy

                mt-5

                max-w-[590px]

                text-sm
              "
            >
              From choosing your clean to welcoming the result,
              the experience is designed around care, detail and
              simplicity.
            </p>
          </div>


          <div
            className="
              grid
              gap-5

              md:grid-cols-3
            "
          >
            {/* =================================================
                CARD 1
            ================================================== */}

            <article
              className="
                group

                relative

                overflow-hidden

                rounded-[20px]

                border
                border-slate-200

                bg-white

                p-7

                shadow-[0_8px_26px_rgba(16,45,67,0.035)]

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#087e83]/25
                hover:shadow-[0_16px_40px_rgba(16,45,67,0.07)]

                sm:p-8
              "
            >
              <span
                className="
                  absolute
                  right-5
                  top-5

                  text-[11px]
                  font-bold

                  tracking-[0.1em]

                  text-slate-300
                "
              >
                01
              </span>


              <div
                className="
                  grid
                  h-12
                  w-12
                  place-items-center

                  rounded-xl

                  bg-[#edf6f5]

                  text-[#087e83]

                  transition

                  group-hover:bg-[#087e83]
                  group-hover:text-white
                "
              >
                <HandHeart
                  size={23}
                />
              </div>


              <h3
                className="
                  mb-4
                  mt-7

                  text-xl
                  font-semibold

                  tracking-[-0.03em]

                  text-[#102d43]
                "
              >
                Your home comes first
              </h3>


              <p
                className="
                  body-copy

                  text-sm
                  leading-6
                "
              >
                Choose a service that suits your space and tell us
                about the areas that matter. We approach each home
                as a place people actually live in, not simply a list
                of rooms to complete.
              </p>
            </article>


            {/* =================================================
                CARD 2
            ================================================== */}

            <article
              className="
                group

                relative

                overflow-hidden

                rounded-[20px]

                border
                border-slate-200

                bg-white

                p-7

                shadow-[0_8px_26px_rgba(16,45,67,0.035)]

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#087e83]/25
                hover:shadow-[0_16px_40px_rgba(16,45,67,0.07)]

                sm:p-8
              "
            >
              <span
                className="
                  absolute
                  right-5
                  top-5

                  text-[11px]
                  font-bold

                  tracking-[0.1em]

                  text-slate-300
                "
              >
                02
              </span>


              <div
                className="
                  grid
                  h-12
                  w-12
                  place-items-center

                  rounded-xl

                  bg-[#edf6f5]

                  text-[#087e83]

                  transition

                  group-hover:bg-[#087e83]
                  group-hover:text-white
                "
              >
                <ClipboardCheck
                  size={23}
                />
              </div>


              <h3
                className="
                  mb-4
                  mt-7

                  text-xl
                  font-semibold

                  tracking-[-0.03em]

                  text-[#102d43]
                "
              >
                Details make the difference
              </h3>


              <p
                className="
                  body-copy

                  text-sm
                  leading-6
                "
              >
                Clear inclusions, property information and the extras
                you select help shape the clean around your actual
                requirements. The small details are part of creating
                a more considered result.
              </p>
            </article>


            {/* =================================================
                CARD 3
            ================================================== */}

            <article
              className="
                group

                relative

                overflow-hidden

                rounded-[20px]

                border
                border-slate-200

                bg-white

                p-7

                shadow-[0_8px_26px_rgba(16,45,67,0.035)]

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#087e83]/25
                hover:shadow-[0_16px_40px_rgba(16,45,67,0.07)]

                sm:p-8
              "
            >
              <span
                className="
                  absolute
                  right-5
                  top-5

                  text-[11px]
                  font-bold

                  tracking-[0.1em]

                  text-slate-300
                "
              >
                03
              </span>


              <div
                className="
                  grid
                  h-12
                  w-12
                  place-items-center

                  rounded-xl

                  bg-[#edf6f5]

                  text-[#087e83]

                  transition

                  group-hover:bg-[#087e83]
                  group-hover:text-white
                "
              >
                <CalendarDays
                  size={23}
                />
              </div>


              <h3
                className="
                  mb-4
                  mt-7

                  text-xl
                  font-semibold

                  tracking-[-0.03em]

                  text-[#102d43]
                "
              >
                Keep the experience simple
              </h3>


              <p
                className="
                  body-copy

                  text-sm
                  leading-6
                "
              >
                Choose your preferred date, send your request and
                keep the next steps straightforward. We want the
                organisation around your clean to feel as easy as
                coming home to a refreshed space.
              </p>
            </article>
          </div>
        </div>
      </section>


      {/* =====================================================
          SMALL BRAND PROMISE STRIP
      ====================================================== */}

      <section
        className="
          container-site

          pb-8

          lg:pb-12
        "
      >
        <div
          className="
            grid
            gap-4

            rounded-[22px]

            border
            border-[#dbe5e3]

            bg-[#edf6f5]

            p-6

            sm:grid-cols-3
            sm:p-7
          "
        >
          {[
            {
              icon:
                Heart,

              title:
                'Care for your space',

              text:
                'Cleaning centred on the home and the people who live there.',
            },

            {
              icon:
                ShieldCheck,

              title:
                'Clear expectations',

              text:
                'Know the service, scope and next steps before confirmation.',
            },

            {
              icon:
                Sparkles,

              title:
                'A considered result',

              text:
                'Practical attention to the details that help a home feel fresh.',
            },
          ].map(
            ({
              icon: Icon,
              title,
              text,
            }) => (
              <div
                key={title}
                className="
                  flex
                  gap-3
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

                    rounded-lg

                    bg-white

                    text-[#087e83]
                  "
                >
                  <Icon
                    size={17}
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#102d43]
                    "
                  >
                    {title}
                  </p>

                  <p
                    className="
                      mt-1

                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    {text}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>


      {/* =====================================================
          FINAL BOOKING CTA
          Requirement:
          Keep "Your fresh start begins here" and link to
          existing booking journey.
      ====================================================== */}

      <div
        className="
          pb-14
          pt-6

          lg:pb-20
          lg:pt-10
        "
      >
        <CTABand
          title="Your fresh start begins here."
          description="Choose the clean that fits your home, tell us what you need and start your booking request online."
        />
      </div>
    </>
  );
}


/* =========================================================
   NAMED EXPORT
   ========================================================= */

export {
  AboutPage,
};
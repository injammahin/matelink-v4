import {
  ArrowRight,
  CheckCircle2,
  Home,
  MessageSquare,
} from 'lucide-react';

import {
  Link,
  useLocation,
} from 'react-router-dom';


function ThankYouPage() {
  const location =
    useLocation();


  const state =
    location.state ||
    {};


  const type =
    state.type ||
    'contact';


  const name =
    String(
      state.name ||
      ''
    ).trim();


  const reference =
    String(
      state.reference ||
      ''
    ).trim();


  const isQuote =
    type ===
    'quote';


  /*
  |--------------------------------------------------------------------------
  | CONTENT
  |--------------------------------------------------------------------------
  */

  const eyebrow =
    isQuote
      ? 'QUOTE REQUEST RECEIVED'
      : 'MESSAGE RECEIVED';


  const title =
    name
      ? `Thank you, ${name}.`
      : 'Thank you.';


  const description =
    isQuote
      ? 'Your quote request has been submitted successfully. Our team will review your property details and requirements and get back to you with the next step.'
      : 'Your message has been submitted successfully. Our team will review your enquiry and get back to you as soon as possible.';


  return (
    <main
      className="
        bg-[#f7f6f2]
        text-[#102d43]
      "
    >
      <section
        className="
          container-site

          flex

          min-h-[650px]

          items-center
          justify-center

          py-14

          sm:py-20
        "
      >
        <div
          className="
            w-full
            max-w-2xl

            rounded-[26px]

            border
            border-slate-200

            bg-white

            px-6
            py-12

            text-center

            shadow-[0_18px_55px_rgba(16,45,67,0.06)]

            sm:px-12
            sm:py-14
          "
        >

          {/* =====================================================
              ICON
          ===================================================== */}

          <div
            className="
              mx-auto

              grid

              h-[72px]
              w-[72px]

              place-items-center

              rounded-full

              bg-[#edf6f5]

              text-[#087e83]
            "
          >
            <CheckCircle2
              size={35}
              strokeWidth={1.8}
            />
          </div>


          {/* =====================================================
              EYEBROW
          ===================================================== */}

          <p
            className="
              mt-7

              text-[11px]

              font-bold

              uppercase

              tracking-[0.16em]

              text-[#087e83]
            "
          >
            {eyebrow}
          </p>


          {/* =====================================================
              TITLE
          ===================================================== */}

          <h1
            className="
              mt-4

              text-3xl

              font-semibold

              tracking-[-0.045em]

              sm:text-4xl
            "
          >
            {title}
          </h1>


          {/* =====================================================
              DESCRIPTION
          ===================================================== */}

          <p
            className="
              mx-auto

              mt-5

              max-w-xl

              text-sm
              leading-7

              text-slate-500

              sm:text-base
            "
          >
            {description}
          </p>


          {/* =====================================================
              REFERENCE
          ===================================================== */}

          {isQuote &&
            reference && (
            <div
              className="
                mx-auto

                mt-7

                max-w-md

                rounded-2xl

                border
                border-[#087e83]/15

                bg-[#f4faf9]

                px-5
                py-4
              "
            >
              <p
                className="
                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.14em]

                  text-[#087e83]
                "
              >
                Quote reference
              </p>

              <p
                className="
                  mt-2

                  text-lg

                  font-semibold

                  text-[#102d43]
                "
              >
                {reference}
              </p>
            </div>
          )}


          <div
            className="
              my-8

              h-px

              bg-slate-200
            "
          />


          {/* =====================================================
              NEXT STEP
          ===================================================== */}

          <div
            className="
              rounded-2xl

              bg-[#f8faf9]

              px-5
              py-5

              text-left
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
                <MessageSquare
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
                  What happens next?
                </p>


                <p
                  className="
                    mt-1

                    text-sm
                    leading-6

                    text-slate-500
                  "
                >
                  {isQuote
                    ? 'Matelink will review the cleaning scope, property information and any photos you supplied before responding with your quote.'
                    : 'A member of the Matelink team will review your message and respond using the contact details you supplied.'}
                </p>
              </div>
            </div>
          </div>


          {/* =====================================================
              BUTTONS
          ===================================================== */}

          <div
            className="
              mt-8

              flex

              flex-col

              items-center
              justify-center

              gap-3

              sm:flex-row
            "
          >
            <Link
              to="/"
              className="
                inline-flex

                h-12

                w-full

                items-center
                justify-center

                gap-2

                rounded-xl

                bg-[#087e83]

                px-6

                text-sm
                font-semibold

                text-white

                transition

                hover:bg-[#076f73]

                sm:w-auto
              "
            >
              <Home
                size={16}
              />

              Back to home
            </Link>


            {!isQuote && (
              <Link
                to="/get-a-quote"
                className="
                  inline-flex

                  h-12

                  w-full

                  items-center
                  justify-center

                  gap-2

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  px-6

                  text-sm
                  font-semibold

                  text-[#102d43]

                  transition

                  hover:border-[#087e83]/25
                  hover:bg-slate-50

                  sm:w-auto
                "
              >
                Get a Quote

                <ArrowRight
                  size={16}
                />
              </Link>
            )}


            {isQuote && (
              <Link
                to="/book"
                className="
                  inline-flex

                  h-12

                  w-full

                  items-center
                  justify-center

                  gap-2

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  px-6

                  text-sm
                  font-semibold

                  text-[#102d43]

                  transition

                  hover:border-[#087e83]/25
                  hover:bg-slate-50

                  sm:w-auto
                "
              >
                Book a clean

                <ArrowRight
                  size={16}
                />
              </Link>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}


export default ThankYouPage;
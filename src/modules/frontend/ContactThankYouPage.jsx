import {
  CheckCircle2,
  ArrowRight,
  Home,
} from 'lucide-react';

import {
  Link,
  useLocation,
} from 'react-router-dom';


export default function ContactThankYouPage() {
  const location =
    useLocation();

  const customerName =
    location.state?.name || '';


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

          min-h-[620px]

          items-center
          justify-center

          py-16

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

          {/* Success Icon */}

          <div
            className="
              mx-auto

              grid

              h-18
              w-18

              place-items-center

              rounded-full

              bg-[#edf6f5]

              text-[#087e83]
            "
          >
            <CheckCircle2
              size={34}
              strokeWidth={1.8}
            />
          </div>


          {/* Eyebrow */}

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
            MESSAGE RECEIVED
          </p>


          {/* Heading */}

          <h1
            className="
              mt-4

              text-3xl
              font-semibold

              tracking-[-0.045em]

              sm:text-4xl
            "
          >
            Thank you
            {customerName
              ? `, ${customerName}.`
              : '.'}
          </h1>


          {/* Description */}

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
            Your message has been submitted successfully.
            Our team will review your enquiry and get back
            to you as soon as possible.
          </p>


          {/* Divider */}

          <div
            className="
              my-8

              h-px
              bg-slate-200
            "
          />


          {/* Information */}

          <div
            className="
              rounded-2xl

              bg-[#f8faf9]

              px-5
              py-4

              text-sm
              leading-6

              text-slate-600
            "
          >
            If your enquiry is related to an existing
            booking, please keep your booking details
            available so our team can assist you quickly.
          </div>


          {/* Buttons */}

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
              <Home size={16} />

              Back to home
            </Link>


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

                hover:bg-slate-50

                sm:w-auto
              "
            >
              Book a clean

              <ArrowRight
                size={16}
              />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
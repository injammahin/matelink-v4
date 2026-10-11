import {
  ArrowRight,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import {
  Button,
} from '@/shared/components/ui/button';


/* =========================================================
   NOT FOUND PAGE
   ========================================================= */

function NotFoundPage() {
  return (
    <section
      className="
        container-site

        flex

        min-h-[620px]

        items-center
        justify-center

        py-20

        sm:min-h-[680px]
        sm:py-24
      "
    >
      <div
        className="
          mx-auto

          max-w-[720px]

          text-center
        "
      >
        {/* EYEBROW */}

        <p
          className="
            eyebrow

            justify-center
          "
        >
          404 · A little detour
        </p>


        {/* TITLE */}

        <h1
          className="
            mt-7

            text-[2.6rem]
            font-semibold
            leading-[1.04]

            tracking-[-0.05em]

            text-[#102d43]

            sm:text-5xl

            lg:text-[4rem]
          "
        >
          This page has
          moved on.
        </h1>


        {/* DESCRIPTION */}

        <p
          className="
            body-copy

            mx-auto

            mt-6

            max-w-lg
          "
        >
          The page you were
          looking for may have
          moved, changed or no
          longer exists. Let&apos;s
          get you back somewhere
          familiar.
        </p>


        {/* BUTTONS */}

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
          <Button
            asChild
            className="
              h-12

              min-w-[150px]

              px-6
            "
          >
            <Link
              to="/"
            >
              Back to home

              <ArrowRight
                size={16}
              />
            </Link>
          </Button>


          <Button
            asChild
            variant="outline"
            className="
              h-12

              min-w-[150px]

              px-6
            "
          >
            <Link
              to="/contact"
            >
              Contact us
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


export {
  NotFoundPage,
};

export default NotFoundPage;
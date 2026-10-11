import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ChevronDown,
  CircleHelp,
  RefreshCw,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import {
  Button,
} from '@/shared/components/ui/button';

import {
  PageIntro,
} from '@/modules/frontend/layouts/SiteLayout';


/* =========================================================
   API
   ========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
)
  .trim()
  .replace(/\/+$/, '');


const FAQ_ENDPOINT =
  `${API_BASE_URL}/v1/faqs`;


/* =========================================================
   FAQ ITEM
   ========================================================= */

function FAQItem({
  faq,
  isOpen,
  onToggle,
}) {
  return (
    <article
      className="
        overflow-hidden

        border-b
        border-slate-200

        bg-white

        last:border-b-0
      "
    >

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
        className="
          group

          flex
          w-full
          items-center
          justify-between

          gap-5

          px-5
          py-5

          text-left

          transition-colors
          duration-200

          hover:bg-[#f8fbfa]

          sm:px-6
          sm:py-6
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-4
          "
        >

          <span
            className="
              grid
              h-10
              w-10
              shrink-0
              place-items-center

              rounded-full

              bg-[#edf7f6]
              text-[#087e83]
            "
          >
            <CircleHelp
              size={18}
              strokeWidth={1.8}
            />
          </span>


          <span
            className="
              text-[15px]
              font-semibold
              leading-6
              text-[#102d43]

              sm:text-base
            "
          >
            {faq.question}
          </span>

        </div>


        <span
          className="
            grid
            h-9
            w-9
            shrink-0
            place-items-center

            rounded-full

            border
            border-slate-200

            bg-white

            text-slate-500

            transition-all
            duration-300

            group-hover:border-[#087e83]/30
            group-hover:text-[#087e83]
          "
        >

          <ChevronDown
            size={18}
            className={`
              transition-transform
              duration-300

              ${
                isOpen
                  ? 'rotate-180'
                  : 'rotate-0'
              }
            `}
          />

        </span>

      </button>


      <div
        id={`faq-answer-${faq.id}`}
        className={`
          grid

          transition-all
          duration-300
          ease-out

          ${
            isOpen
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
          }
        `}
      >

        <div className="overflow-hidden">

          <div
            className="
              pb-6
              pl-[76px]
              pr-5

              sm:pb-7
              sm:pl-[80px]
              sm:pr-8
            "
          >

            <p
              className="
                max-w-3xl

                text-sm
                leading-7

                text-slate-600

                sm:text-[15px]
              "
            >
              {faq.answer}
            </p>

          </div>

        </div>

      </div>

    </article>
  );
}


/* =========================================================
   LOADING
   ========================================================= */

function FAQLoading() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
      "
    >

      {[1, 2, 3, 4, 5].map(
        (item) => (
          <div
            key={item}
            className="
              flex
              items-center
              gap-4

              border-b
              border-slate-100

              px-5
              py-6

              last:border-b-0

              sm:px-6
            "
          >

            <div
              className="
                h-10
                w-10
                shrink-0
                animate-pulse
                rounded-full
                bg-slate-100
              "
            />


            <div
              className="
                h-4
                animate-pulse
                rounded-full
                bg-slate-100
              "
              style={{
                width:
                  `${55 + item * 5}%`,
              }}
            />

          </div>
        )
      )}

    </div>
  );
}


/* =========================================================
   FAQ PAGE
   ========================================================= */

export function FAQPage() {

  const [
    faqs,
    setFaqs,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState('');


  const [
    openId,
    setOpenId,
  ] = useState(null);


  /* =======================================================
     LOAD FAQS
     ======================================================= */

  async function loadFaqs(
    signal
  ) {

    setLoading(true);
    setError('');


    try {

      if (!API_BASE_URL) {
        throw new Error(
          'VITE_API_BASE_URL is not configured.'
        );
      }


      const response =
        await fetch(
          FAQ_ENDPOINT,
          {
            method:
              'GET',

            headers: {
              Accept:
                'application/json',
            },

            signal,
          }
        );


      let result = null;


      try {
        result =
          await response.json();
      } catch {
        result = null;
      }


      if (!response.ok) {

        throw new Error(
          result?.message ||
          `Unable to load FAQs. Server returned ${response.status}.`
        );

      }


      const rows =
        Array.isArray(
          result?.data
        )
          ? result.data
          : Array.isArray(result)
            ? result
            : [];


      /*
       * Public API should already return
       * published FAQs, but filtering here
       * prevents an unpublished row from
       * being displayed accidentally.
       */

      const published =
        rows
          .filter(
            (faq) =>
              faq &&
              faq.is_published !==
                false
          )
          .map(
            (faq) => ({
              id:
                faq.id,

              question:
                String(
                  faq.question ||
                  ''
                ).trim(),

              answer:
                String(
                  faq.answer ||
                  ''
                ).trim(),

              sort_order:
                Number(
                  faq.sort_order ??
                  0
                ),

              is_published:
                faq.is_published,

              created_at:
                faq.created_at,

              updated_at:
                faq.updated_at,
            })
          )
          .filter(
            (faq) =>
              faq.question &&
              faq.answer
          )
          .sort(
            (a, b) => {

              const orderA =
                Number(
                  a.sort_order
                ) || 0;

              const orderB =
                Number(
                  b.sort_order
                ) || 0;


              if (
                orderA !== orderB
              ) {
                return (
                  orderA -
                  orderB
                );
              }


              return (
                Number(a.id) -
                Number(b.id)
              );
            }
          );


      setFaqs(
        published
      );


      /*
       * Keep everything closed initially.
       * Change this to published[0]?.id
       * if you want the first FAQ open.
       */

      setOpenId(null);

    } catch (requestError) {

      if (
        requestError?.name ===
        'AbortError'
      ) {
        return;
      }


      console.error(
        'FAQ API error:',
        requestError
      );


      setFaqs([]);


      setError(
        requestError?.message ||
        'We could not load the FAQs right now.'
      );

    } finally {

      if (
        !signal?.aborted
      ) {
        setLoading(false);
      }

    }
  }


  useEffect(() => {

    const controller =
      new AbortController();


    loadFaqs(
      controller.signal
    );


    return () => {
      controller.abort();
    };

  }, []);


  /* =======================================================
     COUNT
     ======================================================= */

  const faqCount =
    useMemo(
      () => faqs.length,
      [faqs]
    );


  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <>

      <PageIntro
        eyebrow="Good to know"
        title="A little clarity for your next clean."
        description="From your first request to your final payment, here are the details you might be wondering about."
      />


      <section
        className="
          section-space
          !pt-8

          sm:!pt-10
          lg:!pt-12
        "
      >

        <div
          className="
            container-site
            max-w-[920px]
          "
        >

          {/* ===============================================
              HEADING
          ================================================ */}

          <div
            className="
              mb-6

              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#087e83]
                "
              >
                Your questions, answered
              </p>


              <h2
                className="
                  mt-2

                  text-2xl
                  font-semibold
                  tracking-[-0.035em]
                  text-[#102d43]

                  sm:text-3xl
                "
              >
                Frequently asked questions
              </h2>

            </div>


            {!loading &&
              !error &&
              faqCount > 0 && (

              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                {faqCount}{' '}
                {faqCount === 1
                  ? 'question'
                  : 'questions'}
              </p>

            )}

          </div>


          {/* ===============================================
              LOADING
          ================================================ */}

          {loading && (
            <FAQLoading />
          )}


          {/* ===============================================
              ERROR
          ================================================ */}

          {!loading &&
            error && (

            <div
              className="
                rounded-2xl

                border
                border-red-200

                bg-red-50

                px-6
                py-8

                text-center
              "
              role="alert"
            >

              <CircleHelp
                size={28}
                className="
                  mx-auto
                  text-red-500
                "
              />


              <h3
                className="
                  mt-4
                  text-lg
                  font-semibold
                  text-[#102d43]
                "
              >
                We couldn’t load the FAQs.
              </h3>


              <p
                className="
                  mx-auto
                  mt-2
                  max-w-lg

                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                {error}
              </p>


              <Button
                type="button"
                variant="outline"
                className="
                  mt-5
                  gap-2
                  bg-white
                "
                onClick={() =>
                  loadFaqs()
                }
              >
                <RefreshCw
                  size={15}
                />

                Try again
              </Button>

            </div>

          )}


          {/* ===============================================
              EMPTY
          ================================================ */}

          {!loading &&
            !error &&
            faqCount === 0 && (

            <div
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white

                px-6
                py-12

                text-center
              "
            >

              <CircleHelp
                size={28}
                className="
                  mx-auto
                  text-[#087e83]
                "
              />


              <h3
                className="
                  mt-4
                  text-lg
                  font-semibold
                  text-[#102d43]
                "
              >
                No FAQs available yet.
              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  text-muted-foreground
                "
              >
                Please check again soon or contact our team.
              </p>

            </div>

          )}


          {/* ===============================================
              FAQ LIST
          ================================================ */}

          {!loading &&
            !error &&
            faqCount > 0 && (

            <div
              className="
                overflow-hidden

                rounded-2xl

                border
                border-slate-200

                bg-white

                shadow-[0_8px_30px_rgba(16,45,67,0.035)]
              "
            >

              {faqs.map(
                (faq) => (

                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    isOpen={
                      openId ===
                      faq.id
                    }
                    onToggle={() =>
                      setOpenId(
                        (
                          current
                        ) =>
                          current ===
                          faq.id
                            ? null
                            : faq.id
                      )
                    }
                  />

                )
              )}

            </div>

          )}


          {/* ===============================================
              CONTACT CTA
          ================================================ */}

          <div
            className="
              mt-10

              rounded-2xl

              border
              border-[#087e83]/10

              bg-[#edf6f5]

              p-6

              sm:p-8
            "
          >

            <div
              className="
                flex
                flex-col
                gap-6

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    font-semibold
                    tracking-[-0.025em]
                    text-[#102d43]
                  "
                >
                  Still have something on your mind?
                </h2>


                <p
                  className="
                    mt-2
                    max-w-xl

                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  Send us a message, or tell us about a cleaning job that needs a tailored quote.
                </p>

              </div>


              <div
                className="
                  flex
                  shrink-0
                  flex-wrap
                  gap-3
                "
              >

                <Button
                  asChild
                  variant="outline"
                  className="
                    h-11
                    bg-white
                    px-5
                  "
                >
                  <Link to="/contact">
                    Contact us
                  </Link>
                </Button>


                <Button
                  asChild
                  className="
                    h-11
                    px-5
                  "
                >
                  <Link to="/get-a-quote">
                    Get a quote
                  </Link>
                </Button>

              </div>

            </div>

          </div>

        </div>

      </section>

    </>
  );
}


export default FAQPage;
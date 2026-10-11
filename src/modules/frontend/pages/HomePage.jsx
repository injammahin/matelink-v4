import {

  useEffect,

  useRef,

  useState,

} from 'react';



import {

  Link,

} from 'react-router-dom';



import {

  BadgeCheck,

  Check,

  ChevronLeft,

  ChevronRight,

  ClipboardCheck,

  HandHeart,

  Heart,

  House,

  KeyRound,

  MessageCircle,

  MoveUpRight,

  PhoneCall,

  Quote,

  ShieldCheck,

  Sparkles,

  Star,

  X,

} from 'lucide-react';



import {

  Button,

} from '@/shared/components/ui/button';



import {

  CTABand,

  FeatureStrip,

  PostcodeCheck,

} from '@/modules/frontend/layouts/SiteLayout';



import {

  CheckList,

  FAQList,

} from '@/shared/components/Shared';



import {

  services,

} from '@/shared/data/content';



import {

  usePublicFaqs,

} from '@/shared/api/faqApi';





/* =========================================================

   SERVICE ICONS

   ========================================================= */



const serviceIcons = {

  general: House,



  deep: Sparkles,



  'move-in': House,



  'end-of-lease':

    KeyRound,

};





/* =========================================================

   DEMO CUSTOMER REVIEWS



   IMPORTANT:

   Replace these with genuine customer reviews before

   production launch.

   ========================================================= */



const customerReviews = [

  {

    id: 1,



    name:

      'Sarah M.',



    location:

      'Surry Hills, Sydney',



    service:

      'Deep Cleaning',



    rating: 5,



    image:

      'https://i.pravatar.cc/160?img=47',



    text:

      'The whole experience felt simple from the beginning. The team arrived on time, understood exactly what we wanted, and the apartment felt incredibly fresh when they finished.',

  },



  {

    id: 2,



    name:

      'Daniel K.',



    location:

      'Parramatta, Sydney',



    service:

      'End-of-Lease Cleaning',



    rating: 5,



    image:

      'https://i.pravatar.cc/160?img=12',



    text:

      'We booked Matelink for our end-of-lease clean and were really happy with how organised everything was. Communication was clear, the kitchen and bathrooms received a lot of attention, and they made the stressful moving week much easier for us.',

  },



  {

    id: 3,



    name:

      'Emily R.',



    location:

      'Tasmania, Tasmania',



    service:

      'General Cleaning',



    rating: 5,



    image:

      'https://i.pravatar.cc/160?img=32',



    text:

      'Really lovely service. Booking was straightforward and the cleaner was careful with our home. Everything looked tidy, calm and properly refreshed.',

  },



  {

    id: 4,



    name:

      'Michael T.',



    location:

      'Bondi, Sydney',



    service:

      'Move-In Cleaning',



    rating: 5,



    image:

      'https://i.pravatar.cc/160?img=11',



    text:

      'We wanted the house properly cleaned before moving our furniture in. Matelink made the process very easy. They paid attention to the cupboards, kitchen, bathrooms and all the little areas that are easy to miss. Walking into a genuinely clean home on moving day made a huge difference.',

  },



  {

    id: 5,



    name:

      'Olivia N.',



    location:

      'North Sydney',



    service:

      'Deep Cleaning',



    rating: 5,



    image:

      'https://i.pravatar.cc/160?img=45',



    text:

      'Professional, friendly and very easy to deal with. Our home needed a proper reset and that is exactly what it felt like afterwards.',

  },



  {

    id: 6,



    name:

      'James P.',



    location:

      'New Town, Tasmania',



    service:

      'End-of-Lease Cleaning',



    rating: 5,



    image:

      'https://i.pravatar.cc/160?img=14',



    text:

      'I appreciated that the scope was explained clearly rather than just promising everything. The clean itself was thorough, the communication was great, and when I had a question afterwards the team responded quickly and explained what was covered.',

  },



  {

    id: 7,



    name:

      'Ava L.',



    location:

      'Chatswood, Sydney',



    service:

      'General Cleaning',



    rating: 5,



    image:

      'https://i.pravatar.cc/160?img=44',



    text:

      'Exactly what we needed for our busy household. Easy booking, lovely communication and a beautifully fresh home at the end.',

  },



  {

    id: 8,



    name:

      'Noah B.',



    location:

      'Kingston, Tasmania',



    service:

      'Move-In Cleaning',



    rating: 5,



    image:

      'https://i.pravatar.cc/160?img=13',



    text:

      'The property had been empty for a while and needed much more than a quick surface clean. Matelink took the time to understand the condition beforehand, helped us choose the right service and left the place feeling ready for us to actually move into.',

  },

];





/* =========================================================

   REVIEW STARS

   ========================================================= */



function ReviewStars({

  rating = 5,

}) {

  return (

    <div

      className="

        flex

        items-center

        gap-1

      "

      aria-label={`${rating} out of 5 stars`}

    >

      {Array.from({

        length: 5,

      }).map(

        (

          _,

          index

        ) => (

          <Star

            key={index}

            size={15}

            strokeWidth={

              1.8

            }

            className={

              index <

              rating

                ? `

                  fill-[#087e83]

                  text-[#087e83]

                `

                : `

                  text-slate-300

                `

            }

          />

        )

      )}

    </div>

  );

}





/* =========================================================

   REVIEW MODAL

   ========================================================= */



function ReviewModal({

  review,

  onClose,

}) {

  useEffect(() => {

    if (!review) {

      return undefined;

    }





    const previousOverflow =

      document.body.style

        .overflow;





    document.body.style

      .overflow =

      'hidden';





    function handleKeyDown(

      event

    ) {

      if (

        event.key ===

        'Escape'

      ) {

        onClose();

      }

    }





    document.addEventListener(

      'keydown',

      handleKeyDown

    );





    return () => {

      document.body.style

        .overflow =

        previousOverflow;





      document.removeEventListener(

        'keydown',

        handleKeyDown

      );

    };

  }, [

    review,

    onClose,

  ]);





  if (!review) {

    return null;

  }





  return (

    <div

      className="

        fixed

        inset-0

        z-[9999]



        flex

        items-center

        justify-center



        overflow-y-auto



        bg-[#102d43]/65



        p-4



        backdrop-blur-[3px]



        sm:p-6

      "

      onMouseDown={

        event => {

          if (

            event.target ===

            event.currentTarget

          ) {

            onClose();

          }

        }

      }

    >

      <div

        role="dialog"

        aria-modal="true"

        aria-label={`Full review from ${review.name}`}

        className="

          relative



          my-auto



          w-full

          max-w-[650px]



          overflow-hidden



          rounded-[24px]



          border

          border-white/20



          bg-white



          shadow-[0_30px_90px_rgba(16,45,67,0.28)]

        "

      >

        <div

          className="

            h-1.5

            w-full



            bg-[#087e83]

          "

        />





        <button

          type="button"

          onClick={

            onClose

          }

          aria-label="Close full review"

          className="

            absolute

            right-4

            top-5



            grid

            h-10

            w-10

            place-items-center



            rounded-full



            border

            border-slate-200



            bg-white



            text-[#102d43]



            shadow-sm



            transition



            hover:border-[#087e83]/30

            hover:bg-[#edf6f5]

            hover:text-[#087e83]

          "

        >

          <X

            size={18}

          />

        </button>





        <div

          className="

            px-6

            pb-7

            pt-8



            sm:px-8

            sm:pb-9

            sm:pt-9

          "

        >

          <Quote

            size={34}

            strokeWidth={

              1.5

            }

            className="

              mb-5



              fill-[#087e83]/10

              text-[#087e83]

            "

          />





          <ReviewStars

            rating={

              review.rating

            }

          />





          <p

            className="

              mt-6



              text-[17px]

              leading-8



              text-[#334b5c]



              sm:text-[18px]

            "

          >

            “{review.text}”

          </p>





          <div

            className="

              mt-8



              flex

              items-center

              gap-4



              border-t

              border-slate-200



              pt-6

            "

          >

            <img

              src={

                review.image

              }

              alt=""

              loading="lazy"

              className="

                h-12

                w-12

                shrink-0



                rounded-full



                object-cover



                ring-4

                ring-[#edf6f5]

              "

            />





            <div

              className="

                min-w-0

              "

            >

              <p

                className="

                  font-semibold



                  text-[#102d43]

                "

              >

                {

                  review.name

                }

              </p>





              <p

                className="

                  mt-0.5



                  text-xs



                  text-muted-foreground

                "

              >

                {

                  review.location

                }

              </p>

            </div>





            <span

              className="

                ml-auto

                hidden



                rounded-full



                bg-[#edf6f5]



                px-3

                py-1.5



                text-[11px]

                font-semibold



                text-[#087e83]



                sm:inline-flex

              "

            >

              {

                review.service

              }

            </span>

          </div>

        </div>

      </div>

    </div>

  );

}





/* =========================================================

   HOME PAGE

   ========================================================= */



function HomePage() {

  const {

    faqs:

      publicFaqs = [],

  } =

    usePublicFaqs();





  /*

   * Demo number for now.

   *

   * Later we can replace this with settings.phone

   * when you want the phone number controlled

   * by the backend.

   */

  const phone =

    '+61 400 000 000';





  const reviewsTrackRef =

    useRef(null);





  const [

    selectedReview,

    setSelectedReview,

  ] =

    useState(null);





  /* =======================================================

     REVIEW SLIDER

     ======================================================= */



  function scrollReviews(

    direction

  ) {

    const track =

      reviewsTrackRef

        .current;





    if (!track) {

      return;

    }





    const card =

      track.querySelector(

        '[data-review-card]'

      );





    if (!card) {

      return;

    }





    const cardWidth =

      card

        .getBoundingClientRect()

        .width;





    const gap = 18;





    const amount =

      cardWidth + gap;





    const maxScroll =

      Math.max(

        0,



        track.scrollWidth -

          track.clientWidth

      );





    let target =

      track.scrollLeft +

      direction *

        amount;





    /*

     * NEXT from last card

     * returns to beginning.

     */

    if (

      direction > 0 &&

      track.scrollLeft >=

        maxScroll - 8

    ) {

      target = 0;

    }





    /*

     * PREVIOUS from beginning

     * goes to final card.

     */

    if (

      direction < 0 &&

      track.scrollLeft <=

        8

    ) {

      target =

        maxScroll;

    }





    track.scrollTo({

      left: target,



      behavior:

        'smooth',

    });

  }





  return (

    <>

      {/* =====================================================

          HERO

      ====================================================== */}



      <section

        id="home-hero"

        className="

          container-site

          hero-grid



          scroll-mt-[110px]

        "

      >

        {/* HERO LEFT */}



        <div

          className="

            hero-copy

          "

        >

          <h1

            className="

              hero-title

              home-hero-title

            "

          >

            <span

              className="

                home-hero-main-title

              "

            >

              Best Home Cleaning

            </span>





            <span

              className="

                home-hero-location

              "

            >

              Sydney



              <span

                className="

                  home-hero-divider

                "

              >

                |

              </span>



              Tasmania

            </span>

          </h1>





          <p

            className="

              body-copy



              max-w-[470px]

            "

          >

            From a

            much-needed

            refresh to a

            brand-new

            beginning, we

            help you care

            for the place

            you call home.

          </p>





          <PostcodeCheck />





          <p

            className="

              mt-5



              text-sm



              text-muted-foreground

            "

          >

            Something a little

            different?{' '}



            <Link

              to="/get-a-quote"

              className="

                font-semibold



                text-navy



                underline



                underline-offset-4

              "

            >

              Get a tailored

              quote

            </Link>

          </p>





          {/* QUICK ACTIONS */}



          <div

            className="

              mt-8



              grid



              max-w-[520px]



              grid-cols-1



              gap-3



              sm:grid-cols-2



              sm:gap-4

            "

          >

            {/* CALL */}



            <Button

              asChild

              className="

                h-12



                rounded-xl



                px-5



                text-sm

                font-semibold



                shadow-[0_7px_18px_rgba(8,126,131,0.14)]

              "

            >

              <a

                href={`tel:${phone.replace(

                  /\s/g,

                  ''

                )}`}

                aria-label={`Call Matelink Cleaning on ${phone}`}

              >

                <PhoneCall

                  size={17}

                />



                Call Us

              </a>

            </Button>





            {/* TRACK ORDER */}



            <Button

              asChild

              variant="outline"

              className="

                h-12



                rounded-xl



                border-[#087e83]



                bg-[#edf6f5]



                px-5



                text-sm

                font-semibold



                text-[#087e83]



                shadow-[0_7px_18px_rgba(16,45,67,0.04)]



                transition-all

                duration-200



                hover:border-[#087e83]



                hover:bg-[#e4f2f1]



                hover:text-[#087e83]

              "

            >

              <Link to="/track-order">

                <ClipboardCheck size={17} />

                Track Order

              </Link>

            </Button>

          </div>

        </div>





        {/* HERO IMAGE */}



        <div

          className="

            hero-image-wrap

          "

        >

          <img

            src="/images/hero.webp"

            width="1900"

            height="1267"

            fetchPriority="high"

            alt="Light-filled living room with neutral sofas, timber furniture and indoor plants"

          />





          <div

            className="

              hero-image-tag

            "

          >

            <div

              className="

                icon-square

                !h-11

                !w-11

              "

            >

              <Sparkles

                size={22}

              />

            </div>





            <div>

              <p

                className="

                  text-sm

                  font-semibold

                "

              >

                For all of

                life&apos;s fresh

                starts.

              </p>





              <p

                className="

                  mt-1



                  text-xs



                  text-muted-foreground

                "

              >

                Deep clean · Move

                in · Move out

              </p>

            </div>

          </div>

        </div>

      </section>





      {/* =====================================================
          WELCOME20 OFFER
          Static for now: always visible on the homepage.
      ====================================================== */}

      <WelcomeOfferSection />

      {/* =====================================================
          FEATURE STRIP
      ====================================================== */}

      <FeatureStrip />





      {/* =====================================================

          SERVICES

      ====================================================== */}



      <section

        className="

          bg-[#f7f6f2]



          py-12



          lg:py-14

        "

      >

        <div

          className="

            container-site

          "

        >

          {/* SECTION HEADER */}



          <div

            className="

              mb-7



              grid



              gap-4



              lg:grid-cols-[1fr_330px]



              lg:items-end

            "

          >

            <div>

              <p

                className="

                  eyebrow



                  mb-3

                "

              >

                One home.

                Different

                moments.

              </p>





              <h2

                className="

                  section-heading

                "

              >

                The right clean,

                <br />

                right when you

                need it.

              </h2>

            </div>





            <p

              className="

                body-copy



                max-w-[330px]



                text-sm



                lg:justify-self-end

              "

            >

              Four considered

              services. One

              simple way to make

              your space feel

              good again.

            </p>

          </div>





          {/* SERVICE CARDS */}



          <div

            className="

              grid



              grid-cols-1



              gap-3



              md:grid-cols-2



              md:gap-4



              lg:grid-cols-4



              lg:gap-3

            "

          >

            {services.map(

              service => {

                const Icon =

                  serviceIcons[

                    service.id

                  ] ||

                  Sparkles;





                return (

                  <article

                    key={

                      service.id

                    }

                    className="

                      group



                      flex



                      h-full



                      min-w-0



                      flex-col



                      overflow-hidden



                      rounded-[18px]



                      border

                      border-[#dfe3e1]



                      bg-white



                      shadow-[0_6px_18px_rgba(16,45,67,0.035)]



                      transition-all

                      duration-300



                      hover:-translate-y-[2px]



                      hover:border-[#087e83]/25



                      hover:shadow-[0_14px_30px_rgba(16,45,67,0.075)]

                    "

                  >

                    {/* CARD IMAGE */}



                    <Link

                      to={`/${service.slug}`}

                      tabIndex={

                        -1

                      }

                      aria-hidden="true"

                      className="

                        relative



                        block



                        h-[190px]



                        overflow-hidden



                        bg-[#edf1ef]



                        xl:h-[200px]

                      "

                    >

                      <img

                        src={

                          service.cardImage

                        }

                        loading="lazy"

                        width="1600"

                        height="1067"

                        alt={

                          service.cardImageAlt

                        }

                        className="

                          h-full

                          w-full



                          object-cover



                          transition-transform

                          duration-500

                          ease-out



                          group-hover:scale-[1.025]

                        "

                      />





                      <div

                        className="

                          absolute



                          bottom-3

                          left-3



                          grid

                          h-9

                          w-9



                          place-items-center



                          rounded-full



                          border

                          border-white/80



                          bg-white/95



                          text-[#087e83]



                          shadow-sm



                          backdrop-blur

                        "

                      >

                        <Icon

                          size={16}

                        />

                      </div>

                    </Link>





                    {/* CARD CONTENT */}



                    <div

                      className="

                        flex



                        flex-1



                        flex-col



                        px-4

                        pb-4

                        pt-4



                        xl:px-[18px]

                        xl:pb-[18px]

                      "

                    >

                      <p

                        className="

                          text-[9px]

                          font-bold

                          uppercase



                          tracking-[0.12em]



                          text-[#087e83]

                        "

                      >

                        {

                          service.eyebrow

                        }

                      </p>





                      <h3

                        className="

                          mt-2



                          text-[17px]

                          font-semibold

                          leading-[1.25]



                          tracking-[-0.035em]



                          text-[#102d43]



                          xl:text-[18px]

                        "

                      >

                        {

                          service.name

                        }

                      </h3>





                      <p

                        className="

                          mt-2



                          line-clamp-2



                          min-h-[40px]



                          text-[12.5px]

                          leading-5



                          text-muted-foreground

                        "

                      >

                        {

                          service.cardText

                        }

                      </p>





                      <div

                        className="

                          mt-4

                        "

                      >

                        <Link

                          to={`/${service.slug}`}

                          className="

                            inline-flex



                            items-center



                            gap-1.5



                            text-[12px]

                            font-semibold



                            text-[#102d43]



                            transition-colors



                            group-hover:text-[#087e83]

                          "

                        >

                          Explore{' '}

                          {service.short ||

                            service.name}





                          <MoveUpRight

                            size={13}

                            className="

                              transition-transform



                              duration-200



                              group-hover:translate-x-0.5



                              group-hover:-translate-y-0.5

                            "

                          />

                        </Link>





                        <div

                          className="

                            mt-1.5



                            h-px



                            w-8



                            bg-[#102d43]



                            transition-all



                            duration-300



                            group-hover:w-12



                            group-hover:bg-[#087e83]

                          "

                        />

                      </div>

                    </div>

                  </article>

                );

              }

            )}

          </div>

        </div>

      </section>





      {/* =====================================================

          HOW IT WORKS

      ====================================================== */}



      <section

        className="

          section-space

        "

      >

        <div

          className="

            container-site

          "

        >

          <div

            className="

              mb-12

            "

          >

            <p

              className="

                eyebrow



                mb-4

              "

            >

              Less effort. More

              ease.

            </p>





            <h2

              className="

                section-heading

              "

            >

              A fresh start in

              three steps.

            </h2>

          </div>





          <div

            className="

              process-grid

            "

          >

            {[

              [

                '01',



                'Make it your clean',



                'Choose your service, tell us about your home and add the extras you need.',

              ],



              [

                '02',



                'Pick your preferred date',



                'Send your request without paying upfront. We’ll review the details and confirm your clean personally.',

              ],



              [

                '03',



                'Enjoy your space',



                'We take care of the agreed clean. Your payment options stay available after the service.',

              ],

            ].map(

              ([

                number,

                title,

                description,

              ]) => (

                <article

                  key={

                    number

                  }

                >

                  <div

                    className="

                      process-number

                    "

                  >

                    {number}

                  </div>





                  <h3

                    className="

                      mb-4



                      text-xl

                    "

                  >

                    {title}

                  </h3>





                  <p

                    className="

                      body-copy



                      text-sm

                    "

                  >

                    {

                      description

                    }

                  </p>

                </article>

              )

            )}

          </div>

        </div>

      </section>





      {/* =====================================================

          OUR CARE PROMISE

      ====================================================== */}



      <section

        className="

          pb-8

          pt-4



          lg:pb-14

        "

      >

        <div

          className="

            container-site

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



              shadow-[0_18px_50px_rgba(16,45,67,0.12)]



              sm:px-8

              sm:py-10



              lg:px-12

              lg:py-12

            "

          >

            {/* DECORATION */}



            <div

              aria-hidden="true"

              className="

                pointer-events-none



                absolute



                -right-20

                -top-24



                h-72

                w-72



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



                -right-3



                top-6



                h-40

                w-40



                rounded-full



                bg-[#087e83]/20



                blur-3xl

              "

            />





            <div

              className="

                relative



                grid



                gap-10



                lg:grid-cols-[.78fr_1.22fr]



                lg:gap-14

              "

            >

              {/* LEFT */}



              <div>

                <p

                  className="

                    mb-4



                    flex

                    items-center

                    gap-2



                    text-xs

                    font-bold

                    uppercase



                    tracking-[0.14em]



                    text-[#85d3d1]

                  "

                >

                  <ShieldCheck

                    size={16}

                  />



                  Our Care Promise

                </p>





                <h2

                  className="

                    max-w-[500px]



                    text-[2rem]

                    font-semibold

                    leading-[1.06]



                    tracking-[-0.045em]



                    sm:text-[2.5rem]



                    lg:text-[3rem]

                  "

                >

                  Thoughtful

                  service,

                  before, during

                  and after your

                  clean.

                </h2>





                <p

                  className="

                    mt-6



                    max-w-[480px]



                    text-sm

                    leading-7



                    text-white/70



                    sm:text-[15px]

                  "

                >

                  Our promise is

                  simple: clear

                  expectations,

                  considered care

                  and support when

                  you need it. You

                  should know what

                  is being cleaned,

                  what happens next

                  and who to

                  contact if

                  something needs

                  attention.

                </p>





                <Link

                  to="/bond-back-guarantee"

                  className="

                    mt-7



                    inline-flex



                    items-center

                    gap-2



                    border-b

                    border-[#85d3d1]/70



                    pb-1



                    text-sm

                    font-semibold



                    text-[#a7dddb]



                    transition



                    hover:border-white



                    hover:text-white

                  "

                >

                  End-of-Lease

                  Re-clean

                  Guarantee



                  <MoveUpRight

                    size={15}

                  />

                </Link>

              </div>





              {/* PROMISE CARDS */}



              <div

                className="

                  grid



                  gap-3



                  sm:grid-cols-2

                "

              >

                {[

                  {

                    icon:

                      ClipboardCheck,



                    title:

                      'Clear before we start',



                    text:

                      'Your selected service, property details and requested extras are reviewed before the clean is confirmed.',

                  },



                  {

                    icon:

                      HandHeart,



                    title:

                      'Respect for your home',



                    text:

                      'We approach your space with care and work to the cleaning scope agreed with you.',

                  },



                  {

                    icon:

                      MessageCircle,



                    title:

                      'Straightforward support',



                    text:

                      'Questions before or after your clean? Our team is there to help clarify the next step.',

                  },



                  {

                    icon:

                      BadgeCheck,



                    title:

                      'Re-clean support',



                    text:

                      'Eligible End-of-Lease cleaning concerns within the agreed scope can be reviewed for a re-clean where the guarantee applies.',

                  },

                ].map(

                  ({

                    icon:

                      Icon,

                    title,

                    text,

                  }) => (

                    <article

                      key={

                        title

                      }

                      className="

                        rounded-[18px]



                        border

                        border-white/10



                        bg-white/[0.055]



                        p-5



                        backdrop-blur-sm



                        transition



                        hover:border-[#85d3d1]/25



                        hover:bg-white/[0.075]



                        sm:p-6

                      "

                    >

                      <div

                        className="

                          grid



                          h-10

                          w-10



                          place-items-center



                          rounded-xl



                          bg-[#087e83]/20



                          text-[#85d3d1]

                        "

                      >

                        <Icon

                          size={

                            19

                          }

                          strokeWidth={

                            1.8

                          }

                        />

                      </div>





                      <h3

                        className="

                          mt-5



                          text-[17px]

                          font-semibold



                          tracking-[-0.025em]

                        "

                      >

                        {title}

                      </h3>





                      <p

                        className="

                          mt-2.5



                          text-[13px]

                          leading-6



                          text-white/65

                        "

                      >

                        {text}

                      </p>

                    </article>

                  )

                )}

              </div>

            </div>

          </div>

        </div>

      </section>





      {/* =====================================================

          ABOUT / APPROACH

      ====================================================== */}



      <section

        className="

          section-space

        "

      >

        <div

          className="

            container-site

            editorial-grid

          "

        >

          {/* IMAGE */}



          <div

            className="

              service-photo

              !h-[460px]

            "

          >

            <img

              src="/images/about.webp"

              width="1267"

              height="1900"

              loading="lazy"

              alt="Calm modern living room with timber furniture and soft curtains"

            />

          </div>





          {/* CONTENT */}



          <div>

            <p

              className="

                eyebrow



                mb-5

              "

            >

              A thoughtful

              approach

            </p>





            <h2

              className="

                section-heading

              "

            >

              Good cleaning starts

              <br />

              with understanding

              <br />

              your home.

            </h2>





            <p

              className="

                body-copy



                mt-6

              "

            >

              Every space is a

              little different.

              That&apos;s why you

              choose the service

              and extras, and we

              confirm the details

              with you before your

              clean.

            </p>





            <CheckList

              items={[

                'Clear inclusions and considered extras',



                'A simple request, with no customer account',



                'Personal confirmation before we arrive',

              ]}

            />





            <Link

              to="/about"

              className="

                link-line



                mt-7

              "

            >

              A little more about

              Matelink

            </Link>

          </div>

        </div>

      </section>





      {/* =====================================================

          CUSTOMER REVIEWS

      ====================================================== */}



      <section

        className="

          overflow-hidden



          bg-[#f7f6f2]



          py-14



          lg:py-20

        "

      >

        <div

          className="

            container-site

          "

        >

          {/* HEADER */}



          <div

            className="

              mb-8



              flex

              flex-col



              gap-6



              sm:flex-row

              sm:items-end

              sm:justify-between



              lg:mb-10

            "

          >

            <div>

              <p

                className="

                  eyebrow



                  mb-4

                "

              >

                From homes we

                care for

              </p>





              <h2

                className="

                  section-heading



                  max-w-[620px]

                "

              >

                A clean people

                feel good coming

                home to.

              </h2>





              <p

                className="

                  body-copy



                  mt-4



                  max-w-[560px]



                  text-sm

                "

              >

                A little feedback

                from customers

                after their clean.

              </p>

            </div>





            {/* SLIDER BUTTONS */}



            <div

              className="

                flex

                items-center

                gap-2

              "

            >

              <button

                type="button"

                onClick={() =>

                  scrollReviews(

                    -1

                  )

                }

                aria-label="Previous customer review"

                className="

                  grid



                  h-11

                  w-11



                  place-items-center



                  rounded-full



                  border

                  border-[#d7dfdf]



                  bg-white



                  text-[#102d43]



                  shadow-[0_4px_14px_rgba(16,45,67,0.035)]



                  transition-all

                  duration-200



                  hover:border-[#087e83]



                  hover:bg-[#087e83]



                  hover:text-white



                  hover:shadow-[0_8px_18px_rgba(8,126,131,0.14)]

                "

              >

                <ChevronLeft

                  size={19}

                />

              </button>





              <button

                type="button"

                onClick={() =>

                  scrollReviews(

                    1

                  )

                }

                aria-label="Next customer review"

                className="

                  grid



                  h-11

                  w-11



                  place-items-center



                  rounded-full



                  border

                  border-[#d7dfdf]



                  bg-white



                  text-[#102d43]



                  shadow-[0_4px_14px_rgba(16,45,67,0.035)]



                  transition-all

                  duration-200



                  hover:border-[#087e83]



                  hover:bg-[#087e83]



                  hover:text-white



                  hover:shadow-[0_8px_18px_rgba(8,126,131,0.14)]

                "

              >

                <ChevronRight

                  size={19}

                />

              </button>

            </div>

          </div>





          {/* REVIEW TRACK */}



          <div

            ref={

              reviewsTrackRef

            }

            className="

              flex



              snap-x

              snap-mandatory



              gap-[18px]



              overflow-x-auto



              scroll-smooth



              pb-3



              [scrollbar-width:none]



              [&::-webkit-scrollbar]:hidden

            "

          >

            {customerReviews.map(

              review => {

                const longReview =

                  review.text

                    .length >

                  185;





                return (

                  <article

                    key={

                      review.id

                    }

                    data-review-card

                    role={

                      longReview

                        ? 'button'

                        : undefined

                    }

                    tabIndex={

                      longReview

                        ? 0

                        : undefined

                    }

                    onClick={() => {

                      if (

                        longReview

                      ) {

                        setSelectedReview(

                          review

                        );

                      }

                    }}

                    onKeyDown={

                      event => {

                        if (

                          !longReview

                        ) {

                          return;

                        }





                        if (

                          event.key ===

                            'Enter' ||

                          event.key ===

                            ' '

                        ) {

                          event.preventDefault();



                          setSelectedReview(

                            review

                          );

                        }

                      }

                    }

                    className={`

                      group



                      flex



                      min-h-[330px]



                      shrink-0



                      snap-start



                      flex-col



                      rounded-[20px]



                      border

                      border-[#dfe3e1]



                      bg-white



                      p-5



                      shadow-[0_7px_22px_rgba(16,45,67,0.035)]



                      transition-all

                      duration-300



                      sm:p-6



                      ${

                        longReview

                          ? `

                            cursor-pointer



                            hover:-translate-y-[2px]



                            hover:border-[#087e83]/25



                            hover:shadow-[0_16px_38px_rgba(16,45,67,0.08)]

                          `

                          : ''

                      }



                      w-[88%]



                      sm:w-[68%]



                      md:w-[calc((100%_-_18px)/2)]



                      xl:w-[calc((100%_-_36px)/3)]

                    `}

                  >

                    {/* REVIEW HEADER */}



                    <div

                      className="

                        flex



                        items-start

                        justify-between



                        gap-4

                      "

                    >

                      <ReviewStars

                        rating={

                          review.rating

                        }

                      />





                      <Quote

                        size={28}

                        strokeWidth={

                          1.4

                        }

                        className="

                          fill-[#087e83]/5



                          text-[#087e83]/30

                        "

                      />

                    </div>





                    {/* TEXT */}



                    <p

                      className="

                        mt-6



                        line-clamp-5



                        text-[14px]

                        leading-7



                        text-[#405665]



                        sm:text-[15px]

                      "

                    >

                      “{review.text}”

                    </p>





                    {longReview && (

                      <span

                        className="

                          mt-4



                          self-start



                          text-xs

                          font-semibold



                          text-[#087e83]



                          underline



                          decoration-[#087e83]/30



                          underline-offset-4



                          transition



                          group-hover:decoration-[#087e83]

                        "

                      >

                        Read full

                        review

                      </span>

                    )}





                    {/* CUSTOMER */}



                    <div

                      className="

                        mt-auto



                        flex

                        items-center



                        gap-3



                        border-t

                        border-slate-100



                        pt-5

                      "

                    >

                      <img

                        src={

                          review.image

                        }

                        alt=""

                        loading="lazy"

                        className="

                          h-12

                          w-12



                          shrink-0



                          rounded-full



                          object-cover



                          ring-4

                          ring-[#edf6f5]

                        "

                      />





                      <div

                        className="

                          min-w-0

                        "

                      >

                        <p

                          className="

                            truncate



                            text-sm

                            font-semibold



                            text-[#102d43]

                          "

                        >

                          {

                            review.name

                          }

                        </p>





                        <p

                          className="

                            mt-0.5



                            truncate



                            text-[11px]



                            text-muted-foreground

                          "

                        >

                          {

                            review.location

                          }

                        </p>

                      </div>





                      <span

                        className="

                          ml-auto



                          hidden



                          max-w-[130px]



                          truncate



                          rounded-full



                          bg-[#edf6f5]



                          px-2.5

                          py-1



                          text-[10px]

                          font-semibold



                          text-[#087e83]



                          lg:inline-flex

                        "

                      >

                        {

                          review.service

                        }

                      </span>

                    </div>

                  </article>

                );

              }

            )}

          </div>





          <div

            className="

              mt-6



              flex

              items-center



              gap-2



              text-xs



              text-muted-foreground

            "

          >

            <Heart

              size={14}

              className="

                text-[#087e83]

              "

            />



            Thoughtful

            cleaning,

            considered around

            the home and the

            people living in

            it.

          </div>

        </div>

      </section>





      {/* =====================================================

          FAQ

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



            md:grid-cols-[.85fr_1.15fr]

          "

        >

          {/* LEFT */}



          <div>

            <p

              className="

                eyebrow



                mb-5

              "

            >

              Good to know

            </p>





            <h2

              className="

                section-heading

              "

            >

              A few questions,

              <br />

              taken care of.

            </h2>





            <p

              className="

                body-copy



                mt-5



                text-sm

              "

            >

              The details that

              make your next clean

              a little easier.

            </p>





            <Link

              to="/faq"

              className="

                link-line



                mt-5

              "

            >

              All your questions,

              answered

            </Link>

          </div>





          {/* DYNAMIC FAQ */}



          <FAQList

            items={

              publicFaqs.slice(

                0,

                5

              )

            }

          />

        </div>

      </section>





      {/* =====================================================

          FINAL CTA

      ====================================================== */}



      <CTABand />





      {/* =====================================================

          REVIEW MODAL

      ====================================================== */}



      <ReviewModal

        review={

          selectedReview

        }

        onClose={() =>

          setSelectedReview(

            null

          )

        }

      />

    </>

  );

}



function WelcomeOfferSection() {

  return (

    <section

      aria-labelledby="welcome-offer-title"

      className="



      "

    >

      <div

        className="

          container-site

          py-7



          sm:py-8



          lg:py-9

        "

      >

        <div

          className="

            relative

            overflow-hidden



            rounded-[20px]



            border

            border-[#dce6e5]



            bg-[#f7fbfa]



            px-5

            py-6



            sm:px-7

            sm:py-7



            lg:px-8

            lg:py-7

          "

        >

          {/* subtle premium accent */}

          <div

            aria-hidden="true"

            className="

              absolute

              left-0

              top-0



              h-full

              w-[3px]



              bg-[#087e83]

            "

          />



          <div

            className="

              flex

              flex-col

              gap-6



              lg:flex-row

              lg:items-center

              lg:justify-between

            "

          >

            {/* LEFT */}

            <div

              className="

                flex

                min-w-0

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



                  rounded-[12px]



                  border

                  border-[#cde1df]



                  bg-white



                  text-[#087e83]

                "

              >

                <Sparkles

                  size={20}

                  strokeWidth={1.8}

                />

              </div>



              <div className="min-w-0">

                <p

                  className="

                    mb-2



                    text-[0.67rem]

                    font-extrabold



                    uppercase

                    tracking-[0.14em]



                    text-[#087e83]

                  "

                >

                  Matelink welcome offer

                </p>



                <h2

                  id="welcome-offer-title"

                  className="

                    text-[1.45rem]

                    font-semibold

                    leading-tight



                    tracking-[-0.04em]



                    text-[#102d43]



                    sm:text-[1.7rem]

                  "

                >

                  $20 Off Your First Clean

                </h2>



                <p

                  className="

                    mt-2



                    max-w-[650px]



                    text-sm

                    leading-6



                    text-[#60727d]

                  "

                >

                  A little welcome gift for new customers booking

                  Weekly, Fortnightly or Monthly General or Deep

                  Cleaning.

                </p>



                {/* eligibility points */}

                <div

                  className="

                    mt-4



                    flex

                    flex-wrap



                    gap-x-5

                    gap-y-2

                  "

                >

                  <span

                    className="

                      inline-flex

                      items-center

                      gap-1.5



                      text-[0.72rem]

                      font-medium



                      text-[#526a75]

                    "

                  >

                    <Check

                      size={13}

                      className="text-[#087e83]"

                    />



                    Recurring General or Deep Cleaning

                  </span>



                  <span

                    className="

                      inline-flex

                      items-center

                      gap-1.5



                      text-[0.72rem]

                      font-medium



                      text-[#526a75]

                    "

                  >

                    <Check

                      size={13}

                      className="text-[#087e83]"

                    />



                    $180 minimum first visit

                  </span>



                  <span

                    className="

                      inline-flex

                      items-center

                      gap-1.5



                      text-[0.72rem]

                      font-medium



                      text-[#526a75]

                    "

                  >

                    <Check

                      size={13}

                      className="text-[#087e83]"

                    />



                    First eligible visit only

                  </span>

                </div>

              </div>

            </div>





            {/* RIGHT */}

            <div

              className="

                flex

                shrink-0

                flex-col



                gap-3



                border-t

                border-[#dbe6e4]



                pt-5



                sm:flex-row

                sm:items-center



                lg:border-l

                lg:border-t-0



                lg:pl-7

                lg:pt-0

              "

            >

              {/* CODE */}

              <div

                className="

                  min-w-[150px]



                  rounded-[12px]



                  border

                  border-[#cbdedd]



                  bg-white



                  px-4

                  py-3

                "

              >

                <p

                  className="

                    text-[0.6rem]

                    font-bold



                    uppercase

                    tracking-[0.15em]



                    text-[#7b8d96]

                  "

                >

                  Use code

                </p>



                <p

                  className="

                    mt-1



                    text-base

                    font-extrabold



                    tracking-[0.08em]



                    text-[#102d43]

                  "

                >

                  WELCOME20

                </p>

              </div>





              {/* BOOK BUTTON */}

              <Button

                asChild

                className="

                  h-[52px]



                  rounded-[11px]



                  px-6



                  text-sm

                  font-semibold



                  shadow-[0_7px_18px_rgba(8,126,131,0.13)]

                "

              >

                <Link to="/book">

                  Book Your First Clean

                </Link>

              </Button>

            </div>

          </div>





          {/* FINE PRINT */}

          <div

            className="

              mt-5



              border-t

              border-[#dde7e6]



              pt-4

            "

          >

            <p

              className="

                text-[0.67rem]

                leading-5



                text-[#7c8d95]

              "

            >

              New customers only. First eligible visit $180 minimum

              before discount. Recurring General or Deep Cleaning

              only. First visit only. Cannot be combined with other

              offers.

            </p>

          </div>

        </div>

      </div>

    </section>

  );

}

export {

  HomePage,

};



export default HomePage;
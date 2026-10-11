import { useEffect, useState } from 'react';

import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  MapPin,
  Mail,
  Instagram,
  Facebook,
  Phone,
  CalendarDays,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { services } from '@/shared/data/content';
import { postcodeAvailability } from '@/modules/booking/lib/pricing';
import { useApp } from '@/shared/context/AppContext';
import Header, { Wordmark } from '../components/Header';

export { Wordmark };

export function Footer() {

  const { settings } = useApp();



  return (

    <footer className="site-footer">

      <div

        className="

          container-site

          footer-grid



          border-t

          border-slate-200



          pt-12

          pb-12

        "

      >

        <div className="footer-brand">

          <Wordmark />



          <p className="body-copy mt-6 max-w-[280px] text-sm">

            Thoughtful cleaning.

            <br />

            A fresh start for your home.

          </p>



          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">

            <MapPin size={16} />

            Sydney, Australia

          </p>



          <Link

            className="footer-link mt-4"

            to="/about"

          >

            About Matelink

          </Link>

        </div>



        <div>

          <h3 className="text-sm font-bold tracking-normal">

            Our services

          </h3>



          {services.map(service => (

            <Link

              key={service.id}

              className="footer-link"

              to={`/${service.slug}`}

            >

              {service.name}

            </Link>

          ))}



          <Link

            className="footer-link"

            to="/whats-included"

          >

            What’s included

          </Link>

        </div>



        <div>

          <h3 className="text-sm font-bold tracking-normal">

            Customer Support

          </h3>



          <Link

            className="footer-link"

            to="/contact"

          >

            Contact us

          </Link>



          <Link

            className="footer-link"

            to="/faq"

          >

            FAQs

          </Link>



          <Link

            className="footer-link"

            to="/bond-back-guarantee"

          >

            Bond Back Guarantee

          </Link>



          <Link

            className="footer-link !text-xs"

            to="/bond-back-guarantee#request-reclean"

          >

            Request a Re-clean

          </Link>

        </div>



        <div>

          <h3 className="text-sm font-bold tracking-normal">

            Let’s get started

          </h3>



          <Link

            className="footer-link"

            to="/book"

          >

            Book your clean

          </Link>



          <Link

            className="footer-link"

            to="/get-a-quote"

          >

            Get a tailored quote

          </Link>



          {settings.contactEmail && (

            <a

              className="footer-link break-all"

              href={`mailto:${settings.contactEmail}`}

            >

              <Mail

                className="mr-2 inline"

                size={14}

              />



              {settings.contactEmail}

            </a>

          )}



          {settings.showPhone &&

            settings.phone && (

              <a

                className="footer-link"

                href={`tel:${settings.phone}`}

              >

                <Phone

                  className="mr-2 inline"

                  size={14}

                />



                {settings.phone}

              </a>

            )}



          <div className="mt-4 flex gap-3">

            {settings.instagram && (

              <a

                className="rounded-full border p-2"

                aria-label="Matelink on Instagram"

                href={settings.instagram}

                target="_blank"

                rel="noopener noreferrer"

              >

                <Instagram size={17} />

              </a>

            )}



            {settings.facebook && (

              <a

                className="rounded-full border p-2"

                aria-label="Matelink on Facebook"

                href={settings.facebook}

                target="_blank"

                rel="noopener noreferrer"

              >

                <Facebook size={17} />

              </a>

            )}

          </div>

        </div>

      </div>



      <div className="container-site flex flex-wrap items-center justify-between gap-5 border-t py-6 text-xs text-muted-foreground">

        <p>

          © {new Date().getFullYear()} Matelink Cleaning.

        </p>



        <div className="flex flex-wrap gap-5">

          <Link to="/privacy">

            Privacy

          </Link>



          <Link to="/terms">

            Terms & conditions

          </Link>

        </div>

      </div>

    </footer>

  );

}

export default function SiteLayout() {

  const location = useLocation();



  useEffect(() => {

    if (!location.hash) {

      return;

    }



    const timer = window.setTimeout(() => {

      const element = document.querySelector(

        location.hash

      );



      if (!element) {

        return;

      }

      const headerOffset = window.innerWidth <= 900 ? 78 : 92;

      const targetTop =
        element.getBoundingClientRect().top +
        window.scrollY -
        headerOffset -
        12;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: 'smooth',
      });

    }, 50);



    return () => {

      window.clearTimeout(timer);

    };

  }, [

    location.pathname,

    location.hash,

  ]);



  return (

    <>

      <a

        href="#main-content"

        className="

          sr-only

          focus:not-sr-only

          focus:fixed

          focus:left-4

          focus:top-4

          focus:z-[300]

          focus:rounded-lg

          focus:bg-white

          focus:p-3

        "

      >

        Skip to content

      </a>



      <Header />



      <main id="main-content" className="pt-[78px] min-[901px]:pt-[92px]">

        <Outlet />

      </main>



      <Footer />

    </>

  );

}

export function PostcodeCheck({ compact = false, onValid, initialValue = '' }) {

  const [code, setCode] = useState(initialValue);

  const [error, setError] = useState('');

  const { settings } = useApp();

  const navigate = useNavigate();



  function submit(event) {

    event.preventDefault();



    const availability = postcodeAvailability(code.trim(), settings);



    if (availability === 'invalid') {

      setError('Enter a four-digit Australian postcode.');

      return;

    }



    if (availability === 'unavailable') {

      setError(

        'This postcode is outside the current service area. Please request a quote so we can review it.'

      );

      return;

    }



    setError('');



    if (onValid) {

      onValid(code.trim(), availability);

    } else {

      navigate(`/book?postcode=${code.trim()}`);

    }

  }



  return (

    <form

      onSubmit={submit}

      className={compact ? '' : 'postcode-panel postcode-panel-featured'}

      noValidate

    >

      {!compact && (

        <div className="postcode-start-cue" aria-hidden="true">

          <span className="postcode-start-dot"></span>

          Start here

        </div>

      )}

      <Label

        htmlFor={compact ? 'booking-postcode' : 'home-postcode'}

        className={

          compact

            ? 'mb-3 block text-sm font-semibold'

            : 'postcode-panel-label mb-3 block text-sm font-semibold'

        }

      >

        Let’s start with your postcode

      </Label>



      <div className="postcode-input-row flex gap-2">

        <div className="relative min-w-0 flex-1">

          <MapPin

            className="postcode-map-icon absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"

            size={18}

          />



          <Input

            id={compact ? 'booking-postcode' : 'home-postcode'}

            aria-describedby="postcode-help"

            aria-invalid={!!error}

            value={code}

            onChange={(e) => {

              setCode(

                e.target.value

                  .replace(/\D/g, '')

                  .slice(0, 4)

              );



              setError('');

            }}

            inputMode="numeric"

            autoComplete="postal-code"

            placeholder="e.g. 2000"

            className={

              compact

                ? 'h-12 pl-10 text-base'

                : 'postcode-home-input h-12 pl-10 text-base'

            }

            maxLength={4}

          />

        </div>



        <Button

          className={

            compact

              ? 'h-12 px-5'

              : 'postcode-submit-button h-12 px-5'

          }

          type="submit"

        >

          {compact ? 'Continue' : 'Find my clean'}

        </Button>

      </div>



      <p

        id="postcode-help"

        className={

          error

            ? 'field-error mt-3'

            : 'field-help mt-3'

        }

        aria-live="polite"

      >

        {error }

      </p>



      {error.includes('outside') && (

        <Link

          to="/get-a-quote"

          className="link-line mt-2"

        >

          Request a quote

        </Link>

      )}

    </form>

  );

}

export function FeatureStrip() {

  return <div className="container-site feature-strip"><div className="feature-strip-item"><CalendarDays size={20} />A preferred date that works for you</div><div className="feature-strip-item"><ShieldCheck size={20} />No payment at the request stage</div><div className="feature-strip-item"><Sparkles size={20} />A clean shaped around your home</div></div>;

}

export function CTABand({ title = 'Your fresh start begins here.', description = 'Choose a clean for your home, or tell us what you need.' }) {

  return <div className="container-site"><div className="cta-band"><div><p className="eyebrow mb-4 !text-[#a7dddb]">A little less on your to-do list</p><h2 className="text-3xl lg:text-4xl">{title}</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-[#c7d6de]">{description}</p></div><div className="flex shrink-0 flex-wrap gap-3"><Button asChild className="h-12 bg-white px-6 text-navy hover:bg-[#edf6f5]"><Link to="/book">Book now</Link></Button><Button asChild variant="outline" className="h-12 border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"><Link to="/get-a-quote">Get a quote</Link></Button></div></div></div>;

}

export function PageIntro({ eyebrow, title, description, children }) {

  return <section className="page-intro"><div className="container-site"><p className="eyebrow mb-5">{eyebrow}</p><h1 className="page-title">{title}</h1>{description && <p className="body-copy mt-6 max-w-2xl">{description}</p>}{children}</div></section>;

}

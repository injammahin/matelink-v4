import { useEffect, useRef, useState } from 'react';

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Menu,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  House,
  Truck,
  KeyRound,
  UserRound,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { services } from '@/shared/data/content';
import { useAuth } from '@/modules/auth/context/AuthContext';

export function Wordmark({

  className = '',

}) {

  return (

    <Link

      to="/"

      className={`

        ${className}



        flex

        min-w-0

        items-center



        overflow-visible

      `}

      aria-label="Matelink Cleaning home"

    >

      <img

        src="/images/Matelink-logo.png"

        alt="Matelink Cleaning"

        className="

          block

          h-[54px]

          w-[145px]

          shrink-0

          object-contain

          object-left



          sm:h-[66px]

          sm:w-[190px]



          lg:h-[70px]

          lg:w-[200px]

        "

      />

    </Link>

  );

}







export function Header() {

  const [open, setOpen] = useState(false);



  const [servicesOpen, setServicesOpen] = useState(false);



  const [accountOpen, setAccountOpen] = useState(false);



  const [headerScrolled, setHeaderScrolled] = useState(false);



  const serviceMenuRef = useRef(null);



  const accountMenuRef = useRef(null);



  const location = useLocation();

  const navigate = useNavigate();



  const {

    user,

    logout,

  } = useAuth();

  const serviceIcons = {

    general: House,

    deep: Sparkles,

    'move-in': Truck,

    'end-of-lease': KeyRound,

  };





  function getServiceIcon(serviceId) {

    return (

      serviceIcons[serviceId] ||

      Sparkles

    );

  }

  /*

  |--------------------------------------------------------------------------

  | CLOSE MENUS WHEN ROUTE CHANGES

  |--------------------------------------------------------------------------

  */



  useEffect(() => {

    setOpen(false);



    setServicesOpen(false);



    setAccountOpen(false);




  }, [location.pathname]);



  /*

  |--------------------------------------------------------------------------

  | CLOSE ACCOUNT MENU WHEN CLICKING OUTSIDE

  |--------------------------------------------------------------------------

  */



  useEffect(() => {

    function handleDocumentClick(event) {

      if (

        accountMenuRef.current &&

        !accountMenuRef.current.contains(event.target)

      ) {

        setAccountOpen(false);

      }

    }



    document.addEventListener(

      'pointerdown',

      handleDocumentClick

    );



    return () => {

      document.removeEventListener(

        'pointerdown',

        handleDocumentClick

      );

    };

  }, []);



  /*

  |--------------------------------------------------------------------------

  | ESC KEY

  |--------------------------------------------------------------------------

  */



  useEffect(() => {

    function handleEscape(event) {

      if (event.key !== 'Escape') {

        return;

      }



      setServicesOpen(false);



      setAccountOpen(false);

    }



    document.addEventListener(

      'keydown',

      handleEscape

    );



    return () => {

      document.removeEventListener(

        'keydown',

        handleEscape

      );

    };

  }, []);



  /*
  |--------------------------------------------------------------------------
  | HEADER SCROLL BEHAVIOUR
  |--------------------------------------------------------------------------
  |
  | The header is ALWAYS fixed and visible.
  | Scrolling only adds the existing scrolled/shadow style.
  |
  */

  useEffect(() => {
    function handleScroll() {
      setHeaderScrolled(window.scrollY > 15);
    }

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /*

  |--------------------------------------------------------------------------

  | LOGOUT

  |--------------------------------------------------------------------------

  */



  async function handleLogout() {

    setAccountOpen(false);



    setServicesOpen(false);



    setOpen(false);



    await logout();



    navigate(

      '/',

      {

        replace: true,

      }

    );

  }



  const isAdmin = user?.role === 'admin';



  const isServicesRoute =

    services.some((service) => location.pathname === `/${service.slug}`) ||

    location.pathname === '/whats-included' ||

    location.pathname === '/bond-back-guarantee';



  const navLinkClass = ({ isActive }) =>

    `nav-link${isActive ? ' active' : ''}`;



  return (

    <header
      className={[
        'site-header',
        headerScrolled ? 'site-header-scrolled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 200,
      }}
    >

      <div className="container-site nav-row">



        {/* =====================================================

            LOGO

        ====================================================== */}



        <Wordmark />



        {/* =====================================================

            DESKTOP NAVIGATION

        ====================================================== */}



        <nav

          className="nav-links desktop-navigation"

          aria-label="Main navigation"

        >



          <NavLink

            end

            className={navLinkClass}

            to="/"

          >

            Home

          </NavLink>



          {/* =================================================

              SERVICES DROPDOWN

          ================================================== */}



          <div

            ref={serviceMenuRef}

            className="service-menu"

            onMouseEnter={() => {

              setServicesOpen(true);



              setAccountOpen(false);

            }}

            onMouseLeave={() => {

              setServicesOpen(false);

            }}

          >

            <button

              type="button"

              className={`nav-link service-menu-trigger ${

                servicesOpen || isServicesRoute

                  ? 'service-menu-trigger-active'

                  : ''

              }`}

              aria-haspopup="true"

              aria-expanded={servicesOpen}



              /*

               * Clicking still works for laptops/touch devices.

               */

              onClick={() => {

                setServicesOpen(

                  (previous) => !previous

                );



                setAccountOpen(false);

              }}



              /*

               * Keyboard users can tab to Services.

               */

              onFocus={() => {

                setServicesOpen(true);



                setAccountOpen(false);

              }}

            >

              <span>

                Our services

              </span>



              <ChevronDown

                size={14}

                strokeWidth={2}

                className={`service-chevron ${

                  servicesOpen

                    ? 'service-chevron-open'

                    : ''

                }`}

              />

            </button>



            {/* DROPDOWN */}



            <div

              className={`service-dropdown ${

                servicesOpen

                  ? 'service-dropdown-visible'

                  : ''

              }`}

            >

              <div className="service-dropdown-content">



                <p className="service-dropdown-heading">

                  Find the right clean

                </p>



                <div className="service-dropdown-list">



                  {services.map((service) => {

                    const ServiceIcon =

                      getServiceIcon(

                        service.id

                      );



                    return (

                      <Link

                        key={service.id}

                        to={`/${service.slug}`}

                        className="service-dropdown-link"

                        onClick={() =>

                          setServicesOpen(false)

                        }

                      >



                        {/* ICON */}



                        <span className="service-dropdown-icon">



                          <ServiceIcon

                            size={18}

                            strokeWidth={1.9}

                          />



                        </span>





                        {/* TEXT */}



                        <span className="service-dropdown-text">



                          <span className="service-dropdown-title">

                            {service.name}

                          </span>



                          <span className="service-dropdown-description">

                            {service.ideal}

                          </span>



                        </span>



                      </Link>

                    );

                  })}



                </div>



                <div className="service-dropdown-footer">

                  <Link

                    to="/whats-included"

                    onClick={() =>

                      setServicesOpen(false)

                    }

                  >

                    Compare what’s included

                  </Link>

                </div>



              </div>

            </div>



          </div>



          {/* OTHER NAVIGATION */}



          <NavLink

            className={navLinkClass}

            to="/about"

          >

            About us

          </NavLink>



          <NavLink

            className={navLinkClass}

            to="/contact"

          >

            Contact

          </NavLink>



        </nav>



        {/* =====================================================

            DESKTOP ACTIONS

        ====================================================== */}



        <div className="desktop-actions flex items-center gap-4">



          <Link

            to="/get-a-quote"

            className="text-sm font-semibold transition-colors hover:text-primary"

          >

            Get a Quote

          </Link>



          {/* =================================================

              USER ACCOUNT

          ================================================== */}



          <div

            ref={accountMenuRef}

            className="relative"

          >



            <button

              type="button"

              className={`header-user-button ${

                accountOpen

                  ? 'is-active'

                  : ''

              }`}

              aria-haspopup="menu"

              aria-expanded={accountOpen}

              aria-label={

                user

                  ? 'Open account menu'

                  : 'Sign in or register'

              }

              onClick={() => {

                setAccountOpen(

                  (previous) => !previous

                );



                setServicesOpen(false);

              }}

            >

              <UserRound

                size={18}

                strokeWidth={1.8}

              />



              <span className="header-user-name">



              </span>



              {user && (

                <span

                  className="header-user-status"

                  aria-hidden="true"

                />

              )}

            </button>



            {/* ACCOUNT DROPDOWN */}



            <div

              className={`account-dropdown ${

                accountOpen

                  ? 'is-visible'

                  : ''

              }`}

              role="menu"

            >



              {user ? (

                <>



                  <div className="account-dropdown-profile">



                    <div className="account-avatar">

                      <UserRound

                        size={19}

                      />

                    </div>



                    <div className="min-w-0">



                      <p className="truncate text-sm font-bold text-navy">

                        {user.name}

                      </p>



                      <p className="mt-0.5 truncate text-xs text-muted-foreground">

                        {user.email}

                      </p>



                    </div>



                  </div>



                  <div className="account-dropdown-divider" />



                    {user?.role === 'admin' ? (

                      <Link

                        to="/admin"

                        role="menuitem"

                        className="account-dropdown-item"

                        onClick={() =>

                          setAccountOpen(false)

                        }

                      >

                        <ShieldCheck size={17} />



                        Admin dashboard

                      </Link>

                    ) : (

                      <Link

                        to="/account"

                        role="menuitem"

                        className="account-dropdown-item"

                        onClick={() =>

                          setAccountOpen(false)

                        }

                      >

                        <UserRound size={17} />



                        My account

                      </Link>

                    )}



                  <button

                    type="button"

                    role="menuitem"

                    className="account-dropdown-item account-dropdown-logout"

                    onClick={handleLogout}

                  >

                    <LogOut

                      size={17}

                    />



                    Log out

                  </button>



                </>

              ) : (

                <>



                  <div className="account-login-intro">



                    <div className="account-login-icon">

                      <UserRound

                        size={19}

                      />

                    </div>



                    <p className="account-login-title">

                      Your account

                    </p>



                    <p className="account-login-description">

                      Customers and admins can sign in here.

                      New customers can create an account.

                    </p>



                  </div>



                  <div className="account-login-actions">



                    <Button

                      asChild

                      className="h-10 w-full"

                    >

                      <Link

                        to="/login"

                        onClick={() =>

                          setAccountOpen(false)

                        }

                      >

                        <LogIn

                          size={16}

                        />



                        Sign in

                      </Link>

                    </Button>



                    <Link

                      to="/register"

                      className="account-register-link"

                      onClick={() =>

                        setAccountOpen(false)

                      }

                    >

                      <UserPlus

                        size={16}

                      />



                      Create an account

                    </Link>



                  </div>



                </>

              )}



            </div>



          </div>



          {/* BOOK NOW */}



          <Button

            asChild

            className="h-11 px-6"

          >

            <Link to="/book">

              BOOK NOW

            </Link>

          </Button>



        </div>



        {/* =====================================================

            MOBILE NAV

        ====================================================== */}



        <div

            className="

              mobile-menu-button



              ml-auto



              flex

              shrink-0

              items-center

              gap-1.5

            "

          >



          {/* USER */}



          <Button

            asChild

            variant="ghost"

            size="icon"

            className="

              h-10

              w-10

              shrink-0

              rounded-full

              border

            "

          >

            <Link

              to={

                user

                  ? isAdmin

                    ? '/admin'

                    : '/account'

                  : '/login'

              }

              aria-label={

                user

                  ? isAdmin

                    ? 'Admin dashboard'

                    : 'Customer account'

                  : 'Sign in'

              }

            >

              <UserRound

                size={19}

              />

            </Link>

          </Button>



          {/* BOOK */}



            <Button

              asChild

              size="sm"

              className="

                h-10

                shrink-0



                px-3



                text-[12px]



                min-[390px]:px-4

                min-[390px]:text-sm

              "

            >

              <Link to="/book">

                BOOK NOW

              </Link>

            </Button>



          {/* MENU */}



          <Sheet

            open={open}

            onOpenChange={setOpen}

          >



            <SheetTrigger asChild>



              <Button

                variant="ghost"

                size="icon"

                className="

                  h-10

                  w-10

                  shrink-0



                  rounded-xl

                  border

                  border-slate-200



                  bg-white



                  hover:bg-secondary

                "

                aria-label="Open navigation"

              >



                <Menu

                  size={21}

                  strokeWidth={1.9}

                />



              </Button>



            </SheetTrigger>





            <SheetContent

              side="right"

              className="

                top-0

                right-0

                bottom-0



                z-[201]



                h-dvh



                w-[340px]

                max-w-[92vw]



                overflow-y-auto

                overflow-x-hidden



                border-l

                border-slate-200



                bg-[#f7f6f2]



                p-0

              "

            >



              {/* =====================================================

                  TOP AREA

              ====================================================== */}



              <div

                className="

                  border-b

                  border-slate-200



                  bg-[#f7f6f2]



                  px-6

                  pb-5

                  pt-6

                "

              >



                <SheetHeader

                  className="

                    p-0

                    pr-10

                  "

                >



                  <SheetTitle

                    className="

                      text-left

                      text-xl

                      font-semibold

                      tracking-[-0.035em]

                      text-navy

                    "

                  >

                    Explore Matelink

                  </SheetTitle>



                </SheetHeader>



              </div>





              {/* =====================================================

                  SCROLLABLE CONTENT

              ====================================================== */}



              <div

                className="

                  flex

                  min-h-0

                  flex-1

                  flex-col



                  px-6

                  pb-7

                "

              >



                {/* ===================================================

                    ACCOUNT

                ==================================================== */}



                <div

                  className="

                    mt-6

                    rounded-2xl

                    bg-secondary

                    p-4

                  "

                >



                  {user ? (

                    <>



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



                            rounded-full



                            bg-white

                            text-primary

                          "

                        >



                          <UserRound

                            size={18}

                          />



                        </div>





                        <div className="min-w-0">



                          <p

                            className="

                              truncate

                              text-sm

                              font-bold

                              text-navy

                            "

                          >

                            {user.name}

                          </p>



                          <p

                            className="

                              mt-0.5

                              truncate

                              text-xs

                              text-muted-foreground

                            "

                          >

                            {user.email}

                          </p>



                        </div>



                      </div>





                      <Link

                        to={

                          isAdmin

                            ? '/admin'

                            : '/account'

                        }

                        onClick={() =>

                          setOpen(false)

                        }

                        className="

                          mt-4

                          flex

                          items-center

                          gap-2



                          text-sm

                          font-semibold

                          text-primary

                        "

                      >



                        {isAdmin ? (

                          <ShieldCheck

                            size={16}

                          />

                        ) : (

                          <UserRound

                            size={16}

                          />

                        )}



                        {isAdmin

                          ? 'Admin dashboard'

                          : 'My account'}



                      </Link>





                      <button

                        type="button"

                        onClick={handleLogout}

                        className="

                          mt-3

                          flex

                          items-center

                          gap-2



                          border-0

                          bg-transparent



                          p-0



                          text-sm

                          font-semibold

                          text-[#993636]

                        "

                      >



                        <LogOut

                          size={16}

                        />



                        Log out



                      </button>



                    </>

                  ) : (

                    <>



                      <p

                        className="

                          text-sm

                          font-bold

                          text-navy

                        "

                      >

                        Your account

                      </p>



                      <p

                        className="

                          mt-1



                          text-xs

                          leading-5

                          text-muted-foreground

                        "

                      >

                        Customers and admins can sign in here.

                        New customers can create an account.

                      </p>





                      <div

                        className="

                          mt-4

                          flex

                          gap-2

                        "

                      >



                        <Button

                          asChild

                          size="sm"

                        >

                          <Link

                            to="/login"

                            onClick={() =>

                              setOpen(false)

                            }

                          >

                            Sign in

                          </Link>

                        </Button>





                        <Button

                          asChild

                          size="sm"

                          variant="outline"

                        >

                          <Link

                            to="/register"

                            onClick={() =>

                              setOpen(false)

                            }

                          >

                            Register

                          </Link>

                        </Button>



                      </div>



                    </>

                  )}



                </div>





                {/* ===================================================

                    MOBILE NAVIGATION

                ==================================================== */}



                <nav

                  aria-label="Mobile navigation"

                  className="

                    mt-6

                    flex

                    flex-col

                    gap-1

                  "

                >



                  <Link

                    to="/"

                    onClick={() =>

                      setOpen(false)

                    }

                    className="

                      rounded-lg



                      px-3

                      py-3



                      text-center

                      text-sm

                      font-semibold

                      text-[#435966]



                      transition



                      hover:bg-secondary

                      hover:text-primary

                    "

                  >

                    Home

                  </Link>





                  <p

                    className="

                      mt-3



                      px-3



                      text-xs

                      font-bold

                      uppercase



                      tracking-[0.12em]



                      text-primary

                    "

                  >

                    Our services

                  </p>





                  {services.map(

                    (service) => (



                      <Link

                        key={service.id}

                        to={`/${service.slug}`}

                        onClick={() =>

                          setOpen(false)

                        }

                        className="

                          rounded-lg



                          px-3

                          py-3



                          text-center

                          text-sm

                          font-medium

                          text-[#435966]



                          transition



                          hover:bg-secondary

                          hover:text-primary

                        "

                      >



                        {service.name}



                      </Link>



                    )

                  )}





                  <Link

                    to="/about"

                    onClick={() =>

                      setOpen(false)

                    }

                    className="

                      rounded-lg



                      px-3

                      py-3



                      text-center

                      text-sm

                      font-semibold

                      text-[#435966]



                      transition



                      hover:bg-secondary

                      hover:text-primary

                    "

                  >

                    About us

                  </Link>





                  <Link

                    to="/contact"

                    onClick={() =>

                      setOpen(false)

                    }

                    className="

                      rounded-lg



                      px-3

                      py-3



                      text-center

                      text-sm

                      font-semibold

                      text-[#435966]



                      transition



                      hover:bg-secondary

                      hover:text-primary

                    "

                  >

                    Contact

                  </Link>





                  <Button

                    asChild

                    variant="outline"

                    className="

                      mt-4

                      h-11

                      rounded-xl

                    "

                  >



                    <Link

                      to="/get-a-quote"

                      onClick={() =>

                        setOpen(false)

                      }

                    >

                      Get a Quote

                    </Link>



                  </Button>





                  <Button

                    asChild

                    className="

                      mt-1

                      h-11

                      rounded-xl

                    "

                  >



                    <Link

                      to="/book"

                      onClick={() =>

                        setOpen(false)

                      }

                    >

                      BOOK NOW

                    </Link>



                  </Button>



                </nav>



              </div>



            </SheetContent>



          </Sheet>



        </div>



      </div>

    </header>

  );

}

export default Header;

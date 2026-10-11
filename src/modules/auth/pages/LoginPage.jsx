import {
  useState,
} from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Mail,
} from 'lucide-react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  toast,
} from 'sonner';

import {
  Button,
} from '@/shared/components/ui/button';

import {
  Input,
} from '@/shared/components/ui/input';

import {
  Label,
} from '@/shared/components/ui/label';

import AuthShell
  from '@/modules/auth/components/AuthShell';

import PasswordField
  from '@/modules/auth/components/PasswordField';

import {
  useAuth,
} from '@/modules/auth/context/AuthContext';


export default function LoginPage() {
  const {
    login,
    authLoading,
  } = useAuth();


  const navigate =
    useNavigate();

  const location =
    useLocation();


  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const [
    values,
    setValues,
  ] = useState({
    email:
      location.state?.email ||
      '',

    password:
      '',

    remember:
      true,
  });


  const [
    errors,
    setErrors,
  ] = useState({});


  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  function updateField(
    field,
    value
  ) {
    setValues(
      current => ({
        ...current,

        [field]:
          value,
      })
    );


    setErrors(
      current => ({
        ...current,

        [field]:
          '',

        form:
          '',
      })
    );
  }


  /*
  |--------------------------------------------------------------------------
  | VALIDATE
  |--------------------------------------------------------------------------
  */

  function validate() {
    const next =
      {};


    const email =
      values.email.trim();


    if (!email) {
      next.email =
        'Enter your email address.';

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      next.email =
        'Enter a valid email address.';
    }


    if (
      !values.password
    ) {
      next.password =
        'Enter your password.';
    }


    return next;
  }


  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    const nextErrors =
      validate();


    if (
      Object.keys(
        nextErrors
      ).length
    ) {
      setErrors(
        nextErrors
      );

      return;
    }


    try {
      const result =
        await login({
          email:
            values.email
              .trim()
              .toLowerCase(),

          password:
            values.password,

          remember:
            values.remember,
        });


      const loggedInUser =
        result?.user;


      if (!loggedInUser) {
        throw new Error(
          'Login succeeded but user information was not returned.'
        );
      }


      const firstName =
        loggedInUser
          ?.first_name ||
        loggedInUser
          ?.name
          ?.split(' ')[0] ||
        'there';


      toast.success(
        `Welcome back, ${firstName}.`
      );


      /*
      |--------------------------------------------------------------------------
      | ADMIN
      |--------------------------------------------------------------------------
      */

      if (
        loggedInUser
          ?.role ===
        'admin'
      ) {
        navigate(
          '/admin',
          {
            replace:
              true,
          }
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | CUSTOMER
      |--------------------------------------------------------------------------
      */

      const requestedRoute =
        location.state
          ?.from;


      const destination =
        requestedRoute &&
        typeof requestedRoute ===
          'string' &&
        !requestedRoute.startsWith(
          '/admin'
        )
          ? requestedRoute
          : '/account';


      navigate(
        destination,
        {
          replace:
            true,
        }
      );

    } catch (error) {

      console.error(
        'Login failed:',
        error
      );


      setErrors({
        form:
          error
            ?.displayMessage ||
          error
            ?.message ||
          'Unable to sign in. Please try again.',
      });
    }
  }


  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Matelink."
      description="Access your account, booking details and cleaning requests in one place."
    >

      {/* REGISTERED */}

      {location.state
        ?.registered && (
        <div
          className="auth-success-message"
          role="status"
        >
          <CheckCircle2
            size={17}
          />

          Your account was created. Sign in to continue.
        </div>
      )}


      {/* PASSWORD RESET */}

      {location.state
        ?.passwordReset && (
        <div
          className="auth-success-message"
          role="status"
        >
          <CheckCircle2
            size={17}
          />

          Your password has been reset. You can now sign in.
        </div>
      )}


      {/* ERROR */}

      {errors.form && (
        <div
          className="auth-error-message"
          role="alert"
        >
          {errors.form}
        </div>
      )}


      <form
        className="auth-form"
        onSubmit={
          handleSubmit
        }
        noValidate
      >

        {/* EMAIL */}

        <div>
          <Label
            htmlFor="login-email"
            className="auth-label"
          >
            Email address
          </Label>


          <div
            className="auth-input-wrap"
          >
            <Mail
              className="auth-input-icon"
              size={17}
            />


            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={
                values.email
              }
              onChange={
                event =>
                  updateField(
                    'email',
                    event.target.value
                  )
              }
              placeholder="you@example.com"
              aria-invalid={
                Boolean(
                  errors.email
                )
              }
              className="auth-input"
            />
          </div>


          {errors.email && (
            <p
              className="
                field-error
                auth-field-error
              "
            >
              {errors.email}
            </p>
          )}
        </div>


        {/* PASSWORD */}

        <PasswordField
          id="login-password"
          label="Password"
          value={
            values.password
          }
          onChange={
            event =>
              updateField(
                'password',
                event.target.value
              )
          }
          autoComplete="current-password"
          error={
            errors.password
          }
        />


        {/* OPTIONS */}

        <div
          className="auth-form-options"
        >

          <label
            className="auth-remember"
          >
            <input
              type="checkbox"
              checked={
                values.remember
              }
              onChange={
                event =>
                  updateField(
                    'remember',
                    event.target.checked
                  )
              }
            />

            <span>
              Keep me signed in
            </span>
          </label>


          <Link
            to="/forgot-password"
            className="
              text-xs
              font-semibold

              text-[#087e83]

              transition

              hover:text-[#076b70]
              hover:underline
            "
          >
            Forgot password?
          </Link>

        </div>


        {/* SUBMIT */}

        <Button
          type="submit"
          disabled={
            authLoading
          }
          className="auth-submit-button"
        >
          {authLoading
            ? 'Signing in…'
            : 'Sign in'}


          {!authLoading && (
            <ArrowRight
              size={17}
            />
          )}
        </Button>

      </form>


      {/* REGISTER */}

      <div
        className="auth-switch-row"
      >
        <span>
          New to Matelink?
        </span>

        <Link
          to="/register"
        >
          Create an account
        </Link>
      </div>


      {/* LEGAL */}

      <p
        className="auth-legal"
      >
        By signing in, you agree to Matelink’s{' '}

        <Link
          to="/terms"
        >
          Terms
        </Link>

        {' '}and{' '}

        <Link
          to="/privacy"
        >
          Privacy Policy
        </Link>
        .
      </p>

    </AuthShell>
  );
}
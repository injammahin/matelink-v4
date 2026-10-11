import {
  useState,
} from 'react';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

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

import {
  forgotPasswordRequest,
} from '@/modules/auth/api/authApi';


function normalizeErrors(
  error
) {
  const source =
    error?.errors ||
    error?.data?.errors ||
    {};


  const result =
    {};


  Object.entries(
    source
  ).forEach(
    ([
      field,
      messages,
    ]) => {
      result[field] =
        Array.isArray(
          messages
        )
          ? messages[0]
          : String(
              messages
            );
    }
  );


  return result;
}


export default function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] = useState('');


  const [
    errors,
    setErrors,
  ] = useState({});


  const [
    busy,
    setBusy,
  ] = useState(false);


  const [
    sent,
    setSent,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | VALIDATE
  |--------------------------------------------------------------------------
  */

  function validate() {
    const next =
      {};


    const cleanEmail =
      email.trim();


    if (!cleanEmail) {
      next.email =
        'Enter your email address.';

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      next.email =
        'Enter a valid email address.';
    }


    return next;
  }


  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    if (busy) {
      return;
    }


    const validationErrors =
      validate();


    if (
      Object.keys(
        validationErrors
      ).length
    ) {
      setErrors(
        validationErrors
      );

      return;
    }


    setBusy(
      true
    );

    setErrors(
      {}
    );


    try {
      await forgotPasswordRequest(
        email
      );


      /*
       * Generic success screen.
       *
       * This also avoids revealing whether
       * a particular email exists.
       */
      setSent(
        true
      );

    } catch (error) {

      console.error(
        'Forgot password error:',
        error
      );


      if (
        error?.status === 422
      ) {
        const apiErrors =
          normalizeErrors(
            error
          );


        setErrors({
          ...apiErrors,

          form:
            Object.keys(
              apiErrors
            ).length
              ? ''
              : error?.message,
        });

        return;
      }


      setErrors({
        form:
          error?.message ||
          'Unable to send the password reset email. Please try again.',
      });

    } finally {

      setBusy(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | SUCCESS
  |--------------------------------------------------------------------------
  */

  if (sent) {
    return (
      <AuthShell
        eyebrow="Check your inbox"
        title="Reset link sent."
        description="If an account exists for that email address, we’ve sent instructions for resetting the password."
      >
        <div
          className="
            rounded-2xl

            border
            border-[#087e83]/15

            bg-[#f1f8f7]

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
            <div
              className="
                grid

                h-10
                w-10

                shrink-0

                place-items-center

                rounded-full

                bg-white

                text-[#087e83]
              "
            >
              <CheckCircle2
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
                Check your email
              </p>


              <p
                className="
                  mt-1

                  text-sm
                  leading-6

                  text-slate-500
                "
              >
                We sent password reset instructions to{' '}

                <strong
                  className="
                    font-semibold
                    text-[#102d43]
                  "
                >
                  {email.trim()}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>


        <Button
          type="button"
          className="
            auth-submit-button

            mt-5
          "
          onClick={() =>
            setSent(
              false
            )
          }
        >
          Send again

          <ArrowRight
            size={17}
          />
        </Button>


        <div
          className="
            auth-switch-row
          "
        >
          <Link
            to="/login"
            className="
              inline-flex
              items-center
              gap-2
            "
          >
            <ArrowLeft
              size={15}
            />

            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Forgot your password?"
      description="Enter the email address connected to your Matelink account and we’ll send you a password reset link."
    >

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

        <div>
          <Label
            htmlFor="forgot-email"
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
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              value={
                email
              }
              onChange={
                event => {
                  setEmail(
                    event.target.value
                  );


                  setErrors(
                    {}
                  );
                }
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


        <Button
          type="submit"
          disabled={
            busy
          }
          className="auth-submit-button"
        >
          {busy
            ? 'Sending…'
            : 'Send reset link'}


          {!busy && (
            <ArrowRight
              size={17}
            />
          )}
        </Button>

      </form>


      <div
        className="auth-switch-row"
      >
        <Link
          to="/login"
          className="
            inline-flex
            items-center
            gap-2
          "
        >
          <ArrowLeft
            size={15}
          />

          Back to sign in
        </Link>
      </div>

    </AuthShell>
  );
}
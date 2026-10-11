import {
  useMemo,
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
  useNavigate,
  useParams,
  useSearchParams,
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

import PasswordField
  from '@/modules/auth/components/PasswordField';

import {
  resetPasswordRequest,
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


export default function ResetPasswordPage() {
  const navigate =
    useNavigate();


  const params =
    useParams();


  const [
    searchParams,
  ] =
    useSearchParams();


  /*
  |--------------------------------------------------------------------------
  | TOKEN
  |--------------------------------------------------------------------------
  |
  | Supports:
  |
  | /reset-password/:token
  |
  | and
  |
  | /reset-password?token=xxxx
  |
  */

  const token =
    useMemo(
      () =>
        String(
          params.token ||
          searchParams.get(
            'token'
          ) ||
          ''
        ).trim(),
      [
        params.token,
        searchParams,
      ]
    );


  const initialEmail =
    searchParams.get(
      'email'
    ) ||
    '';


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
      initialEmail,

    password:
      '',

    password_confirmation:
      '',
  });


  const [
    errors,
    setErrors,
  ] = useState({});


  const [
    busy,
    setBusy,
  ] = useState(false);


  const [
    completed,
    setCompleted,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | UPDATE FIELD
  |--------------------------------------------------------------------------
  */

  function updateField(
    field,
    value
  ) {
    setValues(
      previous => ({
        ...previous,

        [field]:
          value,
      })
    );


    setErrors(
      previous => ({
        ...previous,

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


    if (
      !values.email.trim()
    ) {
      next.email =
        'Enter your email address.';

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email.trim()
      )
    ) {
      next.email =
        'Enter a valid email address.';
    }


    if (!token) {
      next.form =
        'The password reset token is missing. Please request a new reset link.';
    }


    if (
      values.password.length <
      8
    ) {
      next.password =
        'Your new password must be at least 8 characters.';
    }


    if (
      values.password !==
      values.password_confirmation
    ) {
      next.password_confirmation =
        'Password confirmation does not match.';
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
      await resetPasswordRequest({
        email:
          values.email,

        token,

        password:
          values.password,

        password_confirmation:
          values.password_confirmation,
      });


      setCompleted(
        true
      );


      window.setTimeout(
        () => {
          navigate(
            '/login',
            {
              replace:
                true,

              state: {
                passwordReset:
                  true,

                email:
                  values.email,
              },
            }
          );
        },
        1400
      );

    } catch (error) {

      console.error(
        'Reset password error:',
        error
      );


      if (
        error?.status ===
        422
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
          'Unable to reset your password. The link may have expired.',
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

  if (completed) {
    return (
      <AuthShell
        eyebrow="Password updated"
        title="You’re all set."
        description="Your password has been changed successfully. We’re taking you back to sign in."
      >
        <div
          className="auth-success-message"
          role="status"
        >
          <CheckCircle2
            size={17}
          />

          Password changed successfully.
        </div>
      </AuthShell>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <AuthShell
      eyebrow="Secure password reset"
      title="Choose a new password."
      description="Enter your email address and choose a new password for your Matelink account."
    >

      {errors.form && (
        <div
          className="auth-error-message"
          role="alert"
        >
          {errors.form}
        </div>
      )}


      {!token && (
        <div
          className="auth-error-message"
          role="alert"
        >
          This reset link does not contain a valid token. Please request another password reset email.
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
            htmlFor="reset-email"
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
              id="reset-email"
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
          id="reset-password"
          label="New password"
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
          autoComplete="new-password"
          error={
            errors.password
          }
        />


        {/* CONFIRM PASSWORD */}

        <PasswordField
          id="reset-password-confirmation"
          label="Confirm new password"
          value={
            values
              .password_confirmation
          }
          onChange={
            event =>
              updateField(
                'password_confirmation',
                event.target.value
              )
          }
          autoComplete="new-password"
          error={
            errors
              .password_confirmation
          }
        />


        <Button
          type="submit"
          disabled={
            busy ||
            !token
          }
          className="auth-submit-button"
        >
          {busy
            ? 'Updating password…'
            : 'Reset password'}


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
          to="/forgot-password"
          className="
            inline-flex
            items-center
            gap-2
          "
        >
          <ArrowLeft
            size={15}
          />

          Request another reset link
        </Link>
      </div>

    </AuthShell>
  );
}
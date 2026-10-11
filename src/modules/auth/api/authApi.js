import {
  apiRequest,
} from '@/shared/api/client';


const AUTH_PREFIX =
  '/v1/auth';


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| Frontend calls this with:
|
| {
|   email,
|   password
| }
|
| Backend login expects:
|
| {
|   username,
|   password
| }
|
*/

export function loginRequest({
  email,
  password,
}) {
  return apiRequest(
    `${AUTH_PREFIX}/login`,
    {
      method:
        'POST',

      auth:
        false,

      body: {
        username:
          String(
            email || ''
          )
            .trim()
            .toLowerCase(),

        password:
          password || '',
      },
    }
  );
}


/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export function registerRequest(
  payload
) {
  return apiRequest(
    `${AUTH_PREFIX}/register`,
    {
      method:
        'POST',

      auth:
        false,

      body:
        payload,
    }
  );
}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export function logoutRequest(
  token
) {
  return apiRequest(
    `${AUTH_PREFIX}/logout`,
    {
      method:
        'POST',

      auth:
        true,

      token,
    }
  );
}


/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
|
| POST /v1/auth/password/forgot
|
| {
|   "email": "jane@example.com"
| }
|
*/

export function forgotPasswordRequest(
  email
) {
  return apiRequest(
    `${AUTH_PREFIX}/password/forgot`,
    {
      method:
        'POST',

      auth:
        false,

      body: {
        email:
          String(
            email || ''
          )
            .trim()
            .toLowerCase(),
      },
    }
  );
}


/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
|
| POST /v1/auth/password/reset
|
| {
|   email,
|   token,
|   password,
|   password_confirmation
| }
|
*/

export function resetPasswordRequest({
  email,
  token,
  password,
  password_confirmation,
}) {
  return apiRequest(
    `${AUTH_PREFIX}/password/reset`,
    {
      method:
        'POST',

      auth:
        false,

      body: {
        email:
          String(
            email || ''
          )
            .trim()
            .toLowerCase(),

        token:
          String(
            token || ''
          ).trim(),

        password,

        password_confirmation,
      },
    }
  );
}


/*
|--------------------------------------------------------------------------
| RESEND VERIFICATION
|--------------------------------------------------------------------------
*/

export function resendVerificationRequest(
  email
) {
  return apiRequest(
    `${AUTH_PREFIX}/email/resend`,
    {
      method:
        'POST',

      auth:
        false,

      body: {
        email:
          String(
            email || ''
          )
            .trim()
            .toLowerCase(),
      },
    }
  );
}


/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

export function getCurrentUserRequest(
  token
) {
  return apiRequest(
    `${AUTH_PREFIX}/me`,
    {
      method:
        'GET',

      auth:
        true,

      token,
    }
  );
}
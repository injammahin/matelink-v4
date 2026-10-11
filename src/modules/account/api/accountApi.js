import {
  getAuthToken,
} from '@/shared/api/client';


/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
)
  .trim()
  .replace(/\/+$/, '');


const USER_ENDPOINT =
  'v1/user';


const PASSWORD_ENDPOINT =
  'v1/user/password';


/*
|--------------------------------------------------------------------------
| BUILD URL
|--------------------------------------------------------------------------
*/

function buildUrl(
  path
) {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is not configured.'
    );
  }


  const cleanPath =
    String(path || '')
      .replace(/^\/+/, '');


  return `${API_BASE_URL}/${cleanPath}`;
}


/*
|--------------------------------------------------------------------------
| SAFE JSON
|--------------------------------------------------------------------------
*/

async function parseJsonSafe(
  response
) {
  try {
    const text =
      await response.text();


    if (!text) {
      return {};
    }


    return JSON.parse(
      text
    );
  } catch {
    return {};
  }
}


/*
|--------------------------------------------------------------------------
| AUTHENTICATED REQUEST
|--------------------------------------------------------------------------
*/

async function request(
  path,
  {
    method = 'GET',
    body = undefined,
  } = {}
) {
  const token =
    getAuthToken();


  if (!token) {
    const error =
      new Error(
        'Your session has expired. Please sign in again.'
      );

    error.status =
      401;

    throw error;
  }


  const hasBody =
    body !== undefined &&
    body !== null;


  let response;


  try {
    response =
      await fetch(
        buildUrl(
          path
        ),
        {
          method,

          headers: {
            Accept:
              'application/json',

            Authorization:
              `Bearer ${token}`,

            ...(hasBody
              ? {
                  'Content-Type':
                    'application/json',
                }
              : {}),
          },

          ...(hasBody
            ? {
                body:
                  JSON.stringify(
                    body
                  ),
              }
            : {}),
        }
      );

  } catch (error) {

    console.error(
      'Account API network error:',
      error
    );


    throw new Error(
      'Unable to connect to the server.'
    );
  }


  const data =
    await parseJsonSafe(
      response
    );


  /*
  |--------------------------------------------------------------------------
  | UNAUTHENTICATED
  |--------------------------------------------------------------------------
  */

  if (
    response.status === 401
  ) {
    const error =
      new Error(
        data?.message ||
        'Your session has expired. Please sign in again.'
      );

    error.status =
      401;

    error.data =
      data;

    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | VALIDATION ERROR
  |--------------------------------------------------------------------------
  */

  if (
    response.status === 422
  ) {
    const error =
      new Error(
        data?.message ||
        'Please check the information you entered.'
      );

    error.status =
      422;

    error.data =
      data;

    error.errors =
      data?.errors ||
      data?.data?.errors ||
      {};

    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | OTHER ERRORS
  |--------------------------------------------------------------------------
  */

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
        `Request failed with status ${response.status}.`
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }


  return data;
}


/*
|--------------------------------------------------------------------------
| NORMALIZE USER
|--------------------------------------------------------------------------
*/

function normalizeUser(
  response
) {
  return (
    response?.data?.user ||
    response?.user ||
    response?.data ||
    response ||
    null
  );
}


/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
|
| GET /v1/user
|
*/

export async function getAccount() {
  const response =
    await request(
      USER_ENDPOINT,
      {
        method:
          'GET',
      }
    );


  return normalizeUser(
    response
  );
}


/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
|
| PATCH /v1/user
|
| Email is intentionally NOT sent.
|
*/

export async function updateAccount({
  first_name,
  last_name,
  phone,
  address,
}) {
  const response =
    await request(
      USER_ENDPOINT,
      {
        method:
          'PATCH',

        body: {
          first_name:
            String(
              first_name || ''
            ).trim(),

          last_name:
            String(
              last_name || ''
            ).trim(),

          phone:
            String(
              phone || ''
            ).trim(),

          address:
            String(
              address || ''
            ).trim(),
        },
      }
    );


  return normalizeUser(
    response
  );
}


/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
|
| PUT /v1/user/password
|
*/

export async function changeAccountPassword({
  current_password,
  password,
  password_confirmation,
}) {
  return request(
    PASSWORD_ENDPOINT,
    {
      method:
        'PUT',

      body: {
        current_password,

        password,

        password_confirmation,
      },
    }
  );
}
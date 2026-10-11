import {
  getAuthToken,
} from '@/shared/api/client';


/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
|
| .env.local:
|
| VITE_API_BASE_URL=http://192.168.1.150/matelink/dev/backend/public/api
|
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
)
  .trim()
  .replace(/\/+$/, '');


/*
|--------------------------------------------------------------------------
| CONTACT MESSAGES BASE PATH
|--------------------------------------------------------------------------
*/

const CONTACT_MESSAGES_ENDPOINT =
  'v1/admin/contact-messages';


/*
|--------------------------------------------------------------------------
| BUILD API URL
|--------------------------------------------------------------------------
*/

function buildUrl(
  path,
  query = {}
) {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is not configured.'
    );
  }


  const cleanPath =
    String(path || '')
      .replace(/^\/+/, '');


  const url =
    new URL(
      `${API_BASE_URL}/${cleanPath}`
    );


  Object.entries(
    query || {}
  ).forEach(
    ([key, value]) => {

      /*
       * Do not include empty query parameters.
       */
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'all'
      ) {
        return;
      }


      url.searchParams.set(
        key,
        String(value)
      );
    }
  );


  return url.toString();
}


/*
|--------------------------------------------------------------------------
| GET ADMIN AUTH TOKEN
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Use the SAME token storage system used by AuthContext.
|
| Login:
|     storeAuthToken(...)
|
| Admin APIs:
|     getAuthToken()
|
*/

function getAdminToken() {
  const token =
    getAuthToken();


  if (
    !token ||
    token === 'undefined' ||
    token === 'null'
  ) {
    return '';
  }


  return String(
    token
  ).trim();
}


/*
|--------------------------------------------------------------------------
| SAFE RESPONSE PARSER
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
| GENERIC ADMIN REQUEST
|--------------------------------------------------------------------------
*/

async function request(
  path,
  {
    method = 'GET',
    query = {},
    body = undefined,
  } = {}
) {

  /*
  |--------------------------------------------------------------------------
  | BASE URL CHECK
  |--------------------------------------------------------------------------
  */

  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is not configured.'
    );
  }


  /*
  |--------------------------------------------------------------------------
  | AUTH TOKEN
  |--------------------------------------------------------------------------
  */

  const token =
    getAdminToken();


  if (!token) {
    const error =
      new Error(
        'Admin authentication token is missing. Please log in again.'
      );


    error.status =
      401;


    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | BODY
  |--------------------------------------------------------------------------
  */

  const hasBody =
    body !== undefined &&
    body !== null;


  /*
  |--------------------------------------------------------------------------
  | REQUEST HEADERS
  |--------------------------------------------------------------------------
  */

  const headers = {
    Accept:
      'application/json',

    /*
     * Laravel Sanctum bearer token
     */
    Authorization:
      `Bearer ${token}`,

    ...(hasBody
      ? {
          'Content-Type':
            'application/json',
        }
      : {}),
  };


  let response;


  /*
  |--------------------------------------------------------------------------
  | SEND REQUEST
  |--------------------------------------------------------------------------
  */

  try {
    response =
      await fetch(
        buildUrl(
          path,
          query
        ),
        {
          method,

          headers,

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
      'Admin contact API network error:',
      error
    );


    const networkError =
      new Error(
        'Unable to connect to the server.'
      );


    networkError.originalError =
      error;


    throw networkError;
  }


  /*
  |--------------------------------------------------------------------------
  | PARSE RESPONSE
  |--------------------------------------------------------------------------
  */

  const data =
    await parseJsonSafe(
      response
    );


  /*
  |--------------------------------------------------------------------------
  | 401 UNAUTHORIZED
  |--------------------------------------------------------------------------
  */

  if (
    response.status === 401
  ) {
    const error =
      new Error(
        data?.message ||
        'Your admin session is invalid or expired. Please log in again.'
      );


    error.status =
      401;

    error.data =
      data;

    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | 403 FORBIDDEN
  |--------------------------------------------------------------------------
  */

  if (
    response.status === 403
  ) {
    const error =
      new Error(
        data?.message ||
        'You do not have permission to perform this action.'
      );


    error.status =
      403;

    error.data =
      data;

    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | 422 VALIDATION
  |--------------------------------------------------------------------------
  */

  if (
    response.status === 422
  ) {
    const error =
      new Error(
        data?.message ||
        'Please check the supplied information.'
      );


    error.status =
      422;

    error.data =
      data;

    error.errors =
      data?.errors || {};

    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | OTHER API ERROR
  |--------------------------------------------------------------------------
  */

  if (
    !response.ok
  ) {
    const error =
      new Error(
        data?.message ||
        `Request failed with status ${response.status}.`
      );


    error.status =
      response.status;

    error.data =
      data;

    error.errors =
      data?.errors || {};


    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | SUCCESS
  |--------------------------------------------------------------------------
  */

  return data;
}


/*
|--------------------------------------------------------------------------
| NORMALIZE SINGLE CONTACT MESSAGE
|--------------------------------------------------------------------------
|
| Supports:
|
| {
|   data: {...}
| }
|
| {
|   data: {
|       data: {...}
|   }
| }
|
| {...}
|
*/

function normalizeMessageResponse(
  response
) {

  if (
    response?.data?.data &&
    !Array.isArray(
      response.data.data
    )
  ) {
    return response.data.data;
  }


  if (
    response?.data &&
    !Array.isArray(
      response.data
    )
  ) {
    return response.data;
  }


  return response || {};
}


/*
|--------------------------------------------------------------------------
| NORMALIZE LIST/PAGINATION RESPONSE
|--------------------------------------------------------------------------
|
| Supports Laravel paginator:
|
| {
|   data: {
|       current_page: 1,
|       data: [...],
|       last_page: 5,
|       per_page: 10,
|       total: 42,
|       from: 1,
|       to: 10
|   }
| }
|
| Also supports:
|
| {
|   data: [...],
|   meta: {...}
| }
|
*/

function normalizeListResponse(
  response,
  requestedPage = 1,
  requestedPerPage = 10
) {

  const root =
    response?.data ??
    response ??
    {};


  /*
  |--------------------------------------------------------------------------
  | ITEMS
  |--------------------------------------------------------------------------
  */

  let items =
    [];


  if (
    Array.isArray(
      root
    )
  ) {
    items =
      root;

  } else if (
    Array.isArray(
      root?.data
    )
  ) {
    items =
      root.data;

  } else if (
    Array.isArray(
      root?.items
    )
  ) {
    items =
      root.items;

  } else if (
    Array.isArray(
      response?.items
    )
  ) {
    items =
      response.items;
  }


  /*
  |--------------------------------------------------------------------------
  | META
  |--------------------------------------------------------------------------
  */

  const meta =
    root?.meta ||
    response?.meta ||
    {};


  /*
  |--------------------------------------------------------------------------
  | CURRENT PAGE
  |--------------------------------------------------------------------------
  */

  const currentPage =
    Number(
      root?.current_page ??
      meta?.current_page ??
      meta?.currentPage ??
      requestedPage ??
      1
    ) || 1;


  /*
  |--------------------------------------------------------------------------
  | PER PAGE
  |--------------------------------------------------------------------------
  */

  const perPage =
    Number(
      root?.per_page ??
      meta?.per_page ??
      meta?.perPage ??
      requestedPerPage ??
      10
    ) || 10;


  /*
  |--------------------------------------------------------------------------
  | TOTAL
  |--------------------------------------------------------------------------
  */

  const total =
    Number(
      root?.total ??
      meta?.total ??
      items.length
    ) || 0;


  /*
  |--------------------------------------------------------------------------
  | LAST PAGE
  |--------------------------------------------------------------------------
  */

  let lastPage =
    Number(
      root?.last_page ??
      meta?.last_page ??
      meta?.lastPage ??
      0
    );


  if (!lastPage) {
    lastPage =
      Math.max(
        1,
        Math.ceil(
          total /
          Math.max(
            perPage,
            1
          )
        )
      );
  }


  /*
  |--------------------------------------------------------------------------
  | FROM
  |--------------------------------------------------------------------------
  */

  const from =
    Number(
      root?.from ??
      meta?.from ??
      (
        items.length
          ? (
              (
                currentPage - 1
              ) *
                perPage
            ) + 1
          : 0
      )
    ) || 0;


  /*
  |--------------------------------------------------------------------------
  | TO
  |--------------------------------------------------------------------------
  */

  const to =
    Number(
      root?.to ??
      meta?.to ??
      (
        items.length
          ? from +
            items.length -
            1
          : 0
      )
    ) || 0;


  /*
  |--------------------------------------------------------------------------
  | RETURN NORMALIZED RESULT
  |--------------------------------------------------------------------------
  */

  return {
    items,

    currentPage,

    perPage,

    total,

    lastPage,

    from,

    to,
  };
}


/*
|--------------------------------------------------------------------------
| GET ALL CONTACT MESSAGES
|--------------------------------------------------------------------------
|
| GET
| /v1/admin/contact-messages
|
| Query:
|
| status=new
| search=quote
| page=1
| per_page=10
|
*/

export async function getContactMessages({
  status = '',
  search = '',
  page = 1,
  perPage = 10,
} = {}) {

  const response =
    await request(
      CONTACT_MESSAGES_ENDPOINT,
      {
        method:
          'GET',

        query: {
          status:
            status === 'all'
              ? ''
              : status,

          search,

          page,

          per_page:
            perPage,
        },
      }
    );


  return normalizeListResponse(
    response,
    page,
    perPage
  );
}


/*
|--------------------------------------------------------------------------
| GET SINGLE CONTACT MESSAGE
|--------------------------------------------------------------------------
|
| GET
| /v1/admin/contact-messages/{id}
|
*/

export async function getContactMessage(
  id
) {

  if (!id) {
    throw new Error(
      'Contact message ID is required.'
    );
  }


  const response =
    await request(
      `${CONTACT_MESSAGES_ENDPOINT}/${id}`,
      {
        method:
          'GET',
      }
    );


  return normalizeMessageResponse(
    response
  );
}


/*
|--------------------------------------------------------------------------
| UPDATE CONTACT MESSAGE
|--------------------------------------------------------------------------
|
| PATCH
| /v1/admin/contact-messages/{id}
|
| Example:
|
| {
|   status: 'read'
| }
|
*/

export async function updateContactMessage(
  id,
  payload = {}
) {

  if (!id) {
    throw new Error(
      'Contact message ID is required.'
    );
  }


  const response =
    await request(
      `${CONTACT_MESSAGES_ENDPOINT}/${id}`,
      {
        method:
          'PATCH',

        body:
          payload,
      }
    );


  return normalizeMessageResponse(
    response
  );
}


/*
|--------------------------------------------------------------------------
| MARK ONE CONTACT MESSAGE READ
|--------------------------------------------------------------------------
*/

export async function markContactMessageRead(
  id
) {
  return updateContactMessage(
    id,
    {
      status:
        'read',
    }
  );
}


/*
|--------------------------------------------------------------------------
| MARK MANY CONTACT MESSAGES READ
|--------------------------------------------------------------------------
|
| Your backend currently exposes:
|
| PATCH /v1/admin/contact-messages/{id}
|
| So bulk read is implemented by calling
| the endpoint for each selected ID.
|
*/

export async function markContactMessagesRead(
  ids = []
) {

  const uniqueIds =
    [
      ...new Set(
        ids
          .map(
            id =>
              Number(id)
          )
          .filter(
            Boolean
          )
      ),
    ];


  if (
    !uniqueIds.length
  ) {
    return [];
  }


  return Promise.all(
    uniqueIds.map(
      id =>
        markContactMessageRead(
          id
        )
    )
  );
}


/*
|--------------------------------------------------------------------------
| DELETE CONTACT MESSAGES
|--------------------------------------------------------------------------
|
| DELETE
| /v1/admin/contact-messages
|
| Body:
|
| {
|   "ids": [1,2,3]
| }
|
| Works for:
|
| - one message
| - selected messages
| - all selected
|
*/

export async function deleteContactMessages(
  ids = []
) {

  const uniqueIds =
    [
      ...new Set(
        ids
          .map(
            id =>
              Number(id)
          )
          .filter(
            Boolean
          )
      ),
    ];


  if (
    !uniqueIds.length
  ) {
    throw new Error(
      'No contact messages selected.'
    );
  }


  return request(
    CONTACT_MESSAGES_ENDPOINT,
    {
      method:
        'DELETE',

      body: {
        ids:
          uniqueIds,
      },
    }
  );
}
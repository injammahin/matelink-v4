import {
  getAuthToken,
} from '@/shared/api/client';


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
)
  .trim()
  .replace(/\/+$/, '');


const QUOTE_REQUESTS_ENDPOINT =
  'v1/admin/quote-requests';


/*
|--------------------------------------------------------------------------
| BUILD URL
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
    query
  ).forEach(
    ([key, value]) => {
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
| AUTH
|--------------------------------------------------------------------------
*/

function getAdminToken() {
  const token =
    getAuthToken();


  if (!token) {
    return '';
  }


  return String(
    token
  ).trim();
}


/*
|--------------------------------------------------------------------------
| PARSE JSON
|--------------------------------------------------------------------------
*/

async function parseJsonSafe(
  response
) {
  try {
    const text =
      await response.text();


    return text
      ? JSON.parse(text)
      : {};
  } catch {
    return {};
  }
}


/*
|--------------------------------------------------------------------------
| REQUEST
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


  const hasBody =
    body !== undefined &&
    body !== null;


  let response;


  try {
    response =
      await fetch(
        buildUrl(
          path,
          query
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
      'Quote request API error:',
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


  if (
    response.status === 401
  ) {
    const error =
      new Error(
        data?.message ||
        'Your session has expired. Please log in again.'
      );

    error.status =
      401;

    error.data =
      data;

    throw error;
  }


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
| SINGLE RESPONSE
|--------------------------------------------------------------------------
*/

function normalizeSingleResponse(
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
| LIST RESPONSE
|--------------------------------------------------------------------------
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


  let items =
    [];


  if (
    Array.isArray(root)
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


  const meta =
    root?.meta ||
    response?.meta ||
    {};


  const currentPage =
    Number(
      root?.current_page ??
      meta?.current_page ??
      meta?.currentPage ??
      requestedPage
    ) || 1;


  const perPage =
    Number(
      root?.per_page ??
      meta?.per_page ??
      meta?.perPage ??
      requestedPerPage
    ) || 10;


  const total =
    Number(
      root?.total ??
      meta?.total ??
      items.length
    ) || 0;


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
| GET ALL
|--------------------------------------------------------------------------
|
| GET /v1/admin/quote-requests
|
| Supported filters shown by your API:
|
| status
| postcode
|
*/

export async function getQuoteRequests({
  status = '',
  postcode = '',
  page = 1,
  perPage = 10,
} = {}) {
  const response =
    await request(
      QUOTE_REQUESTS_ENDPOINT,
      {
        method:
          'GET',

        query: {
          status:
            status === 'all'
              ? ''
              : status,

          postcode,

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
| GET SINGLE
|--------------------------------------------------------------------------
|
| GET /v1/admin/quote-requests/{id}
|
*/

export async function getQuoteRequest(
  id
) {
  if (!id) {
    throw new Error(
      'Quote request ID is required.'
    );
  }


  const response =
    await request(
      `${QUOTE_REQUESTS_ENDPOINT}/${id}`,
      {
        method:
          'GET',
      }
    );


  return normalizeSingleResponse(
    response
  );
}


/*
|--------------------------------------------------------------------------
| UPDATE STATUS
|--------------------------------------------------------------------------
|
| PATCH /v1/admin/quote-requests/{id}
|
| {
|   "status": "contacted"
| }
|
*/

export async function updateQuoteRequestStatus(
  id,
  status
) {
  if (!id) {
    throw new Error(
      'Quote request ID is required.'
    );
  }


  return request(
    `${QUOTE_REQUESTS_ENDPOINT}/${id}`,
    {
      method:
        'PATCH',

      body: {
        status,
      },
    }
  );
}


/*
|--------------------------------------------------------------------------
| MARK SELECTED CONTACTED
|--------------------------------------------------------------------------
*/

export async function markQuoteRequestsContacted(
  ids = []
) {
  const normalized =
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


  return Promise.all(
    normalized.map(
      id =>
        updateQuoteRequestStatus(
          id,
          'contacted'
        )
    )
  );
}


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
|
| DELETE /v1/admin/quote-requests
|
| {
|   "ids": [1,2,3]
| }
|
*/

export async function deleteQuoteRequests(
  ids = []
) {
  const normalized =
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
    !normalized.length
  ) {
    throw new Error(
      'No quote requests selected.'
    );
  }


  return request(
    QUOTE_REQUESTS_ENDPOINT,
    {
      method:
        'DELETE',

      body: {
        ids:
          normalized,
      },
    }
  );
}
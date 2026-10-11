import {
  getAuthToken,
} from '@/shared/api/client';


/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
)
  .trim()
  .replace(/\/+$/, '');


const FAQ_ENDPOINT =
  'v1/admin/faqs';


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
    query || {}
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
| TOKEN
|--------------------------------------------------------------------------
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
| PARSE RESPONSE
|--------------------------------------------------------------------------
*/

async function parseResponse(
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
      'FAQ API network error:',
      error
    );


    throw new Error(
      'Unable to connect to the server.'
    );
  }


  const data =
    await parseResponse(
      response
    );


  /*
  |--------------------------------------------------------------------------
  | UNAUTHORIZED
  |--------------------------------------------------------------------------
  */

  if (
    response.status === 401
  ) {
    const error =
      new Error(
        data?.message ||
        'Your admin session has expired. Please log in again.'
      );

    error.status =
      401;

    error.data =
      data;

    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | FORBIDDEN
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
  | VALIDATION
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
| NORMALIZE SINGLE FAQ
|--------------------------------------------------------------------------
*/

function normalizeSingle(
  response
) {
  return (
    response?.data?.faq ||
    response?.faq ||
    response?.data ||
    response ||
    null
  );
}


/*
|--------------------------------------------------------------------------
| NORMALIZE LIST
|--------------------------------------------------------------------------
|
| Your API returns:
|
| {
|   data: [],
|   links: {...},
|   meta: {
|       current_page,
|       last_page,
|       per_page,
|       total,
|       from,
|       to
|   }
| }
|
*/

function normalizeList(
  response
) {
  const items =
    Array.isArray(
      response?.data
    )
      ? response.data
      : [];


  const meta =
    response?.meta ||
    {};


  return {
    items,

    currentPage:
      Number(
        meta.current_page ||
        1
      ),

    lastPage:
      Number(
        meta.last_page ||
        1
      ),

    perPage:
      Number(
        meta.per_page ||
        15
      ),

    total:
      Number(
        meta.total ||
        0
      ),

    from:
      meta.from === null
        ? 0
        : Number(
            meta.from ||
            0
          ),

    to:
      meta.to === null
        ? 0
        : Number(
            meta.to ||
            0
          ),
  };
}


/*
|--------------------------------------------------------------------------
| GET ALL FAQS
|--------------------------------------------------------------------------
|
| GET /v1/admin/faqs
|
| Filters:
|
| is_published=1
| is_published=0
| search=keyword
| page=1
|
*/

export async function getAdminFaqs({
  published = 'all',
  search = '',
  page = 1,
} = {}) {
  const response =
    await request(
      FAQ_ENDPOINT,
      {
        method:
          'GET',

        query: {
          is_published:
            published === 'all'
              ? ''
              : published === 'published'
                ? 1
                : 0,

          search,

          page,
        },
      }
    );


  return normalizeList(
    response
  );
}


/*
|--------------------------------------------------------------------------
| GET SINGLE FAQ
|--------------------------------------------------------------------------
|
| GET /v1/admin/faqs/{id}
|
*/

export async function getAdminFaq(
  id
) {
  if (!id) {
    throw new Error(
      'FAQ ID is required.'
    );
  }


  const response =
    await request(
      `${FAQ_ENDPOINT}/${id}`,
      {
        method:
          'GET',
      }
    );


  return normalizeSingle(
    response
  );
}


/*
|--------------------------------------------------------------------------
| CREATE FAQ
|--------------------------------------------------------------------------
|
| POST /v1/admin/faqs
|
*/

export async function createAdminFaq({
  question,
  answer,
  is_published,
}) {
  const response =
    await request(
      FAQ_ENDPOINT,
      {
        method:
          'POST',

        body: {
          question:
            String(
              question || ''
            ).trim(),

          answer:
            String(
              answer || ''
            ).trim(),

          is_published:
            Boolean(
              is_published
            ),
        },
      }
    );


  return normalizeSingle(
    response
  );
}


/*
|--------------------------------------------------------------------------
| UPDATE FAQ
|--------------------------------------------------------------------------
|
| PATCH /v1/admin/faqs/{id}
|
*/

export async function updateAdminFaq(
  id,
  {
    question,
    answer,
    is_published,
  }
) {
  if (!id) {
    throw new Error(
      'FAQ ID is required.'
    );
  }


  const response =
    await request(
      `${FAQ_ENDPOINT}/${id}`,
      {
        method:
          'PATCH',

        body: {
          question:
            String(
              question || ''
            ).trim(),

          answer:
            String(
              answer || ''
            ).trim(),

          is_published:
            Boolean(
              is_published
            ),
        },
      }
    );


  return normalizeSingle(
    response
  );
}


/*
|--------------------------------------------------------------------------
| QUICK PUBLISH / UNPUBLISH
|--------------------------------------------------------------------------
*/

export async function setAdminFaqPublished(
  faq,
  published
) {
  return updateAdminFaq(
    faq.id,
    {
      question:
        faq.question,

      answer:
        faq.answer,

      is_published:
        published,
    }
  );
}


/*
|--------------------------------------------------------------------------
| DELETE FAQS
|--------------------------------------------------------------------------
|
| DELETE /v1/admin/faqs
|
| {
|   "ids": [1,2,3]
| }
|
*/

export async function deleteAdminFaqs(
  ids = []
) {
  const normalizedIds =
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
    !normalizedIds.length
  ) {
    throw new Error(
      'No FAQs selected.'
    );
  }


  return request(
    FAQ_ENDPOINT,
    {
      method:
        'DELETE',

      body: {
        ids:
          normalizedIds,
      },
    }
  );
}
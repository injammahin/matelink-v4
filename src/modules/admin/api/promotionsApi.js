import {
  getAuthToken,
} from '@/shared/api/client';


/* =========================================================
   CONFIG
   ========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
)
  .trim()
  .replace(/\/+$/, '');


const PROMO_ENDPOINT =
  'v1/admin/promo-codes';

const ANNOUNCEMENT_ENDPOINT =
  'v1/admin/announcement-bar';


/* =========================================================
   URL
   ========================================================= */

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
        value === ''
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


/* =========================================================
   SAFE JSON
   ========================================================= */

async function parseJsonSafe(
  response
) {
  try {
    const text =
      await response.text();

    if (!text) {
      return {};
    }

    return JSON.parse(text);

  } catch {
    return {};
  }
}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function getApiErrorMessage(
  payload,
  response
) {
  if (
    payload?.errors &&
    typeof payload.errors ===
      'object'
  ) {
    const firstError =
      Object.values(
        payload.errors
      )[0];

    if (
      Array.isArray(firstError)
    ) {
      return (
        firstError[0] ||
        payload.message
      );
    }

    if (
      typeof firstError ===
      'string'
    ) {
      return firstError;
    }
  }

  return (
    payload?.message ||
    `Request failed (${response.status}).`
  );
}


/* =========================================================
   REQUEST
   ========================================================= */

async function request(
  path,
  {
    method = 'GET',
    query = {},
    body,
  } = {}
) {
  const token =
    getAuthToken();

  if (!token) {
    const error =
      new Error(
        'Admin authentication token is missing. Please log in again.'
      );

    error.status = 401;

    throw error;
  }

  const hasBody =
    body !== undefined &&
    body !== null;

  const response =
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

  const payload =
    await parseJsonSafe(
      response
    );

  if (!response.ok) {
    const error =
      new Error(
        getApiErrorMessage(
          payload,
          response
        )
      );

    error.status =
      response.status;

    error.errors =
      payload?.errors || {};

    error.response =
      payload;

    throw error;
  }

  return payload;
}


/* =========================================================
   HELPERS
   ========================================================= */

function toBoolean(
  value
) {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true'
  );
}


function toNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


/* =========================================================
   NORMALIZE PROMO
   ========================================================= */

export function normalizePromo(
  raw = {}
) {
  return {
    id:
      Number(raw.id) || raw.id,

    code:
      raw.code || '',

    name:
      raw.name || '',

    description:
      raw.description || '',

    discountType:
      raw.discount_type ||
      raw.discountType ||
      'fixed',

    discountAmount:
      toNumber(
        raw.discount_amount ??
        raw.discountAmount
      ),

    minimumBookingValue:
      toNumber(
        raw.minimum_booking_value ??
        raw.minimumBookingValue
      ),

    visibility:
      raw.visibility ||
      'private',

    isActive:
      toBoolean(
        raw.is_active ??
        raw.isActive
      ),

    createdAt:
      raw.created_at ||
      raw.createdAt ||
      null,

    updatedAt:
      raw.updated_at ||
      raw.updatedAt ||
      null,
  };
}


/* =========================================================
   PROMO PAYLOAD
   ========================================================= */

export function promoToPayload(
  promo
) {
  return {
    code:
      String(
        promo.code || ''
      )
        .trim()
        .toUpperCase(),

    name:
      String(
        promo.name || ''
      ).trim(),

    description:
      String(
        promo.description || ''
      ).trim(),

    discount_type:
      promo.discountType,

    discount_amount:
      Number(
        promo.discountAmount || 0
      ),

    minimum_booking_value:
      Number(
        promo.minimumBookingValue || 0
      ),

    visibility:
      promo.visibility,

    is_active:
      Boolean(
        promo.isActive
      ),
  };
}


/* =========================================================
   GET PROMO CODES
   ========================================================= */

export async function getPromoCodes({
  search = '',
  page = 1,
  perPage = 15,
} = {}) {
  const response =
    await request(
      PROMO_ENDPOINT,
      {
        method: 'GET',

        query: {
          search,
          per_page:
            perPage,
          page,
        },
      }
    );

  /*
   * Supports:
   *
   * {
   *   data: [],
   *   meta: {}
   * }
   *
   * and
   *
   * {
   *   data: {
   *     data: [],
   *     meta: {}
   *   }
   * }
   */

  let rawItems = [];
  let meta = {};

  if (
    Array.isArray(
      response?.data
    )
  ) {
    rawItems =
      response.data;

    meta =
      response?.meta || {};

  } else if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    rawItems =
      response.data.data;

    meta =
      response.data.meta ||
      response.meta ||
      {};

  } else if (
    Array.isArray(response)
  ) {
    rawItems =
      response;
  }

  const items =
    rawItems.map(
      normalizePromo
    );

  return {
    items,

    currentPage:
      Number(
        meta.current_page ||
        page
      ),

    lastPage:
      Number(
        meta.last_page ||
        1
      ),

    total:
      Number(
        meta.total ??
        items.length
      ),

    from:
      meta.from ?? (
        items.length
          ? (
              (page - 1) *
              perPage
            ) + 1
          : null
      ),

    to:
      meta.to ?? (
        items.length
          ? (
              (page - 1) *
              perPage
            ) + items.length
          : null
      ),
  };
}


/* =========================================================
   GET SINGLE PROMO
   ========================================================= */

export async function getPromoCode(
  id
) {
  const response =
    await request(
      `${PROMO_ENDPOINT}/${id}`,
      {
        method:
          'GET',
      }
    );

  const raw =
    response?.data?.promo_code ||
    response?.data?.promo ||
    response?.data ||
    response;

  return normalizePromo(
    raw
  );
}


/* =========================================================
   CREATE PROMO
   ========================================================= */

export async function createPromoCode(
  promo
) {
  const response =
    await request(
      PROMO_ENDPOINT,
      {
        method:
          'POST',

        body:
          promoToPayload(
            promo
          ),
      }
    );

  const raw =
    response?.data?.promo_code ||
    response?.data?.promo ||
    response?.data ||
    response;

  return normalizePromo(
    raw
  );
}


/* =========================================================
   UPDATE PROMO
   ========================================================= */

export async function updatePromoCode(
  id,
  promo
) {
  const response =
    await request(
      `${PROMO_ENDPOINT}/${id}`,
      {
        method:
          'PATCH',

        body:
          promoToPayload(
            promo
          ),
      }
    );

  const raw =
    response?.data?.promo_code ||
    response?.data?.promo ||
    response?.data ||
    response;

  return normalizePromo(
    raw
  );
}


/* =========================================================
   DELETE PROMO CODES
   ========================================================= */

export async function deletePromoCodes(
  ids = []
) {
  const cleanIds =
    [
      ...new Set(
        ids
          .map(
            id =>
              Number(id)
          )
          .filter(Boolean)
      ),
    ];

  if (
    !cleanIds.length
  ) {
    return null;
  }

  return request(
    PROMO_ENDPOINT,
    {
      method:
        'DELETE',

      body: {
        ids:
          cleanIds,
      },
    }
  );
}


/* =========================================================
   NORMALIZE ANNOUNCEMENT
   ========================================================= */

export function normalizeAnnouncement(
  raw = {}
) {
  return {
    enabled:
      toBoolean(
        raw.is_enabled ??
        raw.enabled
      ),

    message:
      raw.message ||
      '',

    promoCodeId:
      raw.promo_code_id ??
      raw.promoCodeId ??
      '',

    showBookNow:
      toBoolean(
        raw.show_cta ??
        raw.showBookNow
      ),

    buttonText:
      raw.cta_text ||
      raw.buttonText ||
      'BOOK NOW',

    buttonLink:
      raw.cta_path ||
      raw.buttonLink ||
      '/book',
  };
}


/* =========================================================
   GET ANNOUNCEMENT
   ========================================================= */

export async function getAnnouncementBar() {
  const response =
    await request(
      ANNOUNCEMENT_ENDPOINT,
      {
        method:
          'GET',
      }
    );

  const raw =
    response?.data?.announcement ||
    response?.data ||
    response;

  return normalizeAnnouncement(
    raw
  );
}


/* =========================================================
   UPDATE ANNOUNCEMENT
   ========================================================= */

export async function updateAnnouncementBar(
  announcement
) {
  const body = {
    is_enabled:
      Boolean(
        announcement.enabled
      ),

    message:
      String(
        announcement.message ||
        ''
      ).trim(),

    promo_code_id:
      announcement.promoCodeId
        ? Number(
            announcement.promoCodeId
          )
        : null,

    show_cta:
      Boolean(
        announcement.showBookNow
      ),

    cta_text:
      String(
        announcement.buttonText ||
        ''
      ).trim(),

    cta_path:
      String(
        announcement.buttonLink ||
        ''
      ).trim(),
  };

  const response =
    await request(
      ANNOUNCEMENT_ENDPOINT,
      {
        method:
          'PUT',

        body,
      }
    );

  const raw =
    response?.data?.announcement ||
    response?.data ||
    body;

  return normalizeAnnouncement(
    raw
  );
}
import { useEffect, useState } from 'react';
import { apiRequest } from '@/shared/api/client';
import { faqs as fallbackFaqs } from '@/shared/data/content';


/*
|--------------------------------------------------------------------------
| PUBLIC FAQ API
|--------------------------------------------------------------------------
| GET /v1/faqs returns only the FAQs an admin has published, in display order.
| No login is needed. The shape is { data: [{ id, question, answer, ... }] }.
*/

export async function fetchPublicFaqs(signal) {
  const payload = await apiRequest('v1/faqs', { auth: false, signal });

  return (payload?.data || []).map((faq) => ({
    id: faq.id,
    q: faq.question,
    a: faq.answer,
  }));
}


/*
|--------------------------------------------------------------------------
| HOOK
|--------------------------------------------------------------------------
| Returns the FAQs in the { q, a } shape that <FAQList> expects.
| While loading, and if the API fails or has no published FAQs yet, it returns
| the built-in FAQs from shared/data/content.js so the page is never empty.
*/

export function usePublicFaqs() {
  const [items, setItems] = useState(fallbackFaqs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchPublicFaqs(controller.signal)
      .then((list) => {
        if (list.length > 0) {
          setItems(list);
        }
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          console.warn('Could not load FAQs from the API, showing the built-in ones.', error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return { faqs: items, loading };
}

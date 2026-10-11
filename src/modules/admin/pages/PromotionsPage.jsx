import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';

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

import {
  Textarea,
} from '@/shared/components/ui/textarea';

import {
  createPromoCode,
  deletePromoCodes,
  getAnnouncementBar,
  getPromoCode,
  getPromoCodes,
  updateAnnouncementBar,
  updatePromoCode,
} from '@/modules/admin/api/promotionsApi';


/* =========================================================
   DEFAULTS
   ========================================================= */

function emptyPromo() {
  return {
    code: '',
    name: '',
    description: '',

    discountType:
      'fixed',

    discountAmount:
      0,

    minimumBookingValue:
      0,

    visibility:
      'public',

    isActive:
      true,
  };
}


const DEFAULT_ANNOUNCEMENT = {
  enabled: false,

  message:
    '',

  promoCodeId:
    '',

  showBookNow:
    true,

  buttonText:
    'BOOK NOW',

  buttonLink:
    '/book',
};


/* =========================================================
   ADMIN HEADING
   ========================================================= */

function AdminHeading({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-5

        lg:flex-row
        lg:items-start
        lg:justify-between
      "
    >
      <div className="max-w-3xl">
        <p
          className="
            mb-3
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-primary
          "
        >
          {eyebrow}
        </p>

        <h1
          className="
            text-3xl
            font-semibold
            tracking-[-0.04em]

            lg:text-4xl
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-4
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          {description}
        </p>
      </div>

      {children && (
        <div
          className="
            flex
            shrink-0
            flex-wrap
            gap-3
          "
        >
          {children}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   TOGGLE
   ========================================================= */

function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() =>
        onChange(!checked)
      }
      className={`
        relative

        h-6
        w-11
        shrink-0

        rounded-full

        transition-colors

        disabled:cursor-not-allowed
        disabled:opacity-50

        ${
          checked
            ? 'bg-primary'
            : 'bg-slate-300'
        }
      `}
    >
      <span
        className={`
          absolute
          top-[3px]

          h-[18px]
          w-[18px]

          rounded-full

          bg-white

          shadow-sm

          transition-all

          ${
            checked
              ? 'left-[23px]'
              : 'left-[3px]'
          }
        `}
      />
    </button>
  );
}


/* =========================================================
   MONEY
   ========================================================= */

function money(
  value
) {
  const number =
    Number(value || 0);

  return new Intl.NumberFormat(
    'en-AU',
    {
      style:
        'currency',

      currency:
        'AUD',
    }
  ).format(number);
}


/* =========================================================
   DISCOUNT LABEL
   ========================================================= */

function discountLabel(
  promo
) {
  if (
    promo.discountType ===
      'percentage' ||
    promo.discountType ===
      'percent'
  ) {
    return `${
      Number(
        promo.discountAmount || 0
      )
    }% off`;
  }

  return `${
    money(
      promo.discountAmount
    )
  } off`;
}


/* =========================================================
   MODAL
   ========================================================= */

function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      'hidden';

    function escape(
      event
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        onClose();
      }
    }

    document.addEventListener(
      'keydown',
      escape
    );

    return () => {
      document.body.style
        .overflow =
        oldOverflow;

      document.removeEventListener(
        'keydown',
        escape
      );
    };
  }, [
    open,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[500]

        flex
        items-center
        justify-center

        overflow-y-auto

        bg-[#102d43]/55

        p-4

        backdrop-blur-[2px]

        sm:p-6
      "
      onMouseDown={event => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          my-auto

          w-full
          max-w-2xl

          overflow-hidden

          rounded-2xl

          border
          border-slate-200

          bg-white

          shadow-[0_30px_80px_rgba(16,45,67,0.24)]
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-6

            border-b
            border-slate-200

            px-6
            py-5
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-semibold
                tracking-[-0.03em]
                text-navy
              "
            >
              {title}
            </h2>

            {description && (
              <p
                className="
                  mt-1
                  max-w-lg
                  text-sm
                  leading-5
                  text-muted-foreground
                "
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              grid
              h-9
              w-9
              shrink-0
              place-items-center

              rounded-lg

              text-muted-foreground

              transition

              hover:bg-secondary
              hover:text-primary
            "
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="
            max-h-[70vh]
            overflow-y-auto

            px-6
            py-6
          "
        >
          {children}
        </div>

        {footer && (
          <div
            className="
              flex
              flex-wrap
              justify-end
              gap-3

              border-t
              border-slate-200

              bg-[#fafaf8]

              px-6
              py-4
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   PROMO FORM
   ========================================================= */

function PromoForm({
  value,
  errors,
  onChange,
}) {
  function patch(
    changes
  ) {
    onChange({
      ...value,
      ...changes,
    });
  }

  return (
    <div
      className="
        grid
        gap-5

        sm:grid-cols-2
      "
    >
      {/* CODE */}

      <div>
        <Label className="mb-2 block">
          Promo code *
        </Label>

        <Input
          value={value.code}
          placeholder="WELCOME20"
          className="
            uppercase
          "
          onChange={event =>
            patch({
              code:
                event.target.value
                  .toUpperCase()
                  .replace(
                    /\s+/g,
                    ''
                  ),
            })
          }
        />

        {errors.code && (
          <p className="field-error mt-1">
            {errors.code}
          </p>
        )}
      </div>


      {/* NAME */}

      <div>
        <Label className="mb-2 block">
          Name *
        </Label>

        <Input
          value={value.name}
          placeholder="Welcome $20 Off"
          onChange={event =>
            patch({
              name:
                event.target.value,
            })
          }
        />

        {errors.name && (
          <p className="field-error mt-1">
            {errors.name}
          </p>
        )}
      </div>


      {/* DESCRIPTION */}

      <div className="sm:col-span-2">
        <Label className="mb-2 block">
          Description
        </Label>

        <Textarea
          rows={3}
          value={
            value.description
          }
          placeholder="Email campaign, website welcome offer, referral, etc."
          onChange={event =>
            patch({
              description:
                event.target.value,
            })
          }
        />
      </div>


      {/* DISCOUNT TYPE */}

      <div>
        <Label className="mb-2 block">
          Discount type *
        </Label>

        <select
          value={
            value.discountType
          }
          onChange={event =>
            patch({
              discountType:
                event.target.value,
            })
          }
          className="
            h-10
            w-full

            rounded-md

            border
            border-input

            bg-white

            px-3

            text-sm

            outline-none

            focus:border-primary
            focus:ring-2
            focus:ring-primary/10
          "
        >
          <option value="fixed">
            Fixed amount
          </option>

          <option value="percentage">
            Percentage
          </option>
        </select>
      </div>


      {/* DISCOUNT AMOUNT */}

      <div>
        <Label className="mb-2 block">
          {value.discountType ===
          'fixed'
            ? 'Discount amount ($)'
            : 'Discount percentage (%)'}
          {' *'}
        </Label>

        <Input
          type="number"
          min="0"
          step={
            value.discountType ===
            'fixed'
              ? '0.01'
              : '1'
          }
          value={
            value.discountAmount
          }
          onChange={event =>
            patch({
              discountAmount:
                event.target.value,
            })
          }
        />

        {errors.discountAmount && (
          <p className="field-error mt-1">
            {errors.discountAmount}
          </p>
        )}
      </div>


      {/* MINIMUM */}

      <div>
        <Label className="mb-2 block">
          Minimum booking value
        </Label>

        <Input
          type="number"
          min="0"
          step="0.01"
          value={
            value.minimumBookingValue
          }
          onChange={event =>
            patch({
              minimumBookingValue:
                event.target.value,
            })
          }
        />

        {errors.minimumBookingValue && (
          <p className="field-error mt-1">
            {errors.minimumBookingValue}
          </p>
        )}
      </div>


      {/* VISIBILITY */}

      <div>
        <Label className="mb-2 block">
          Visibility
        </Label>

        <select
          value={
            value.visibility
          }
          onChange={event =>
            patch({
              visibility:
                event.target.value,
            })
          }
          className="
            h-10
            w-full

            rounded-md

            border
            border-input

            bg-white

            px-3

            text-sm

            outline-none

            focus:border-primary
            focus:ring-2
            focus:ring-primary/10
          "
        >
          <option value="public">
            Public
          </option>

          <option value="private">
            Private
          </option>
        </select>
      </div>


      {/* ACTIVE */}

      <div
        className="
          sm:col-span-2

          flex
          items-center
          justify-between
          gap-6

          rounded-xl

          border

          p-4
        "
      >
        <div>
          <p
            className="
              text-sm
              font-semibold
              text-navy
            "
          >
            Active promo code
          </p>

          <p
            className="
              mt-1
              text-xs
              text-muted-foreground
            "
          >
            Customers can only use
            active promo codes.
          </p>
        </div>

        <Toggle
          checked={
            value.isActive
          }
          onChange={checked =>
            patch({
              isActive:
                checked,
            })
          }
          label="Active promo code"
        />
      </div>
    </div>
  );
}


/* =========================================================
   PAGE
   ========================================================= */

export default function PromotionsPage() {

  /* ---------------------------------------------------------
     PROMOS
  --------------------------------------------------------- */

  const [
    promos,
    setPromos,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    searchInput,
    setSearchInput,
  ] =
    useState('');

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    pagination,
    setPagination,
  ] =
    useState({
      currentPage: 1,
      lastPage: 1,
      total: 0,
      from: null,
      to: null,
    });


  /* ---------------------------------------------------------
     MODAL
  --------------------------------------------------------- */

  const [
    promoModalOpen,
    setPromoModalOpen,
  ] =
    useState(false);

  const [
    editingId,
    setEditingId,
  ] =
    useState(null);

  const [
    promoForm,
    setPromoForm,
  ] =
    useState(
      emptyPromo
    );

  const [
    promoErrors,
    setPromoErrors,
  ] =
    useState({});

  const [
    promoSaving,
    setPromoSaving,
  ] =
    useState(false);

  const [
    promoLoading,
    setPromoLoading,
  ] =
    useState(false);


  /* ---------------------------------------------------------
     DELETE
  --------------------------------------------------------- */

  const [
    deletingPromo,
    setDeletingPromo,
  ] =
    useState(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);


  /* ---------------------------------------------------------
     ANNOUNCEMENT
  --------------------------------------------------------- */

  const [
    announcement,
    setAnnouncement,
  ] =
    useState(
      DEFAULT_ANNOUNCEMENT
    );

  const [
    announcementLoading,
    setAnnouncementLoading,
  ] =
    useState(true);

  const [
    announcementSaving,
    setAnnouncementSaving,
  ] =
    useState(false);


  /* =========================================================
     LOAD PROMOS
     ========================================================= */

  const loadPromos =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        try {
          const result =
            await getPromoCodes({
              search,
              page,
              perPage: 15,
            });

          /*
           * If current page becomes empty
           * after deleting the final row,
           * go back one page.
           */
          if (
            result.items.length ===
              0 &&
            page > 1 &&
            result.total > 0
          ) {
            setPage(
              previous =>
                Math.max(
                  1,
                  previous - 1
                )
            );

            return;
          }

          setPromos(
            result.items
          );

          setPagination({
            currentPage:
              result.currentPage,

            lastPage:
              result.lastPage,

            total:
              result.total,

            from:
              result.from,

            to:
              result.to,
          });

        } catch (error) {
          console.error(
            'Load promotions error:',
            error
          );

          toast.error(
            error?.message ||
            'Unable to load promo codes.'
          );

          setPromos([]);

        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        search,
        page,
      ]
    );


  /* =========================================================
     LOAD ANNOUNCEMENT
     ========================================================= */

  const loadAnnouncement =
    useCallback(
      async () => {
        setAnnouncementLoading(
          true
        );

        try {
          const result =
            await getAnnouncementBar();

          setAnnouncement(
            result
          );

        } catch (error) {
          console.error(
            'Load announcement error:',
            error
          );

          toast.error(
            error?.message ||
            'Unable to load announcement bar settings.'
          );

        } finally {
          setAnnouncementLoading(
            false
          );
        }
      },
      []
    );


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadPromos();
  }, [
    loadPromos,
  ]);


  useEffect(() => {
    loadAnnouncement();
  }, [
    loadAnnouncement,
  ]);


  /* =========================================================
     SEARCH DEBOUNCE
     ========================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setPage(1);

          setSearch(
            searchInput.trim()
          );
        },
        350
      );

    return () =>
      window.clearTimeout(
        timer
      );

  }, [
    searchInput,
  ]);


  /* =========================================================
     PUBLIC PROMOS
     ========================================================= */

  const publicPromos =
    useMemo(
      () =>
        promos.filter(
          promo =>
            promo.visibility ===
              'public' &&
            promo.isActive
        ),
      [
        promos,
      ]
    );


  /* =========================================================
     SELECTED ANNOUNCEMENT PROMO
     ========================================================= */

  const selectedAnnouncementPromo =
    useMemo(
      () =>
        promos.find(
          promo =>
            String(promo.id) ===
            String(
              announcement.promoCodeId
            )
        ) || null,
      [
        promos,
        announcement.promoCodeId,
      ]
    );


  /* =========================================================
     ADD PROMO
     ========================================================= */

  function openAddPromo() {
    setEditingId(null);

    setPromoForm(
      emptyPromo()
    );

    setPromoErrors({});

    setPromoModalOpen(
      true
    );
  }


  /* =========================================================
     EDIT PROMO
     ========================================================= */

  async function openEditPromo(
    id
  ) {
    setEditingId(id);

    setPromoErrors({});

    setPromoForm(
      emptyPromo()
    );

    setPromoModalOpen(
      true
    );

    setPromoLoading(
      true
    );

    try {
      /*
       * Uses:
       *
       * GET
       * /v1/admin/promo-codes/{id}
       */
      const promo =
        await getPromoCode(
          id
        );

      setPromoForm({
        code:
          promo.code,

        name:
          promo.name,

        description:
          promo.description,

        discountType:
          promo.discountType,

        discountAmount:
          promo.discountAmount,

        minimumBookingValue:
          promo.minimumBookingValue,

        visibility:
          promo.visibility,

        isActive:
          promo.isActive,
      });

    } catch (error) {
      console.error(
        'Load promo error:',
        error
      );

      toast.error(
        error?.message ||
        'Unable to load this promo code.'
      );

      setPromoModalOpen(
        false
      );

    } finally {
      setPromoLoading(
        false
      );
    }
  }


  /* =========================================================
     VALIDATE PROMO
     ========================================================= */

  function validatePromo() {
    const errors = {};

    const code =
      promoForm.code
        .trim();

    const name =
      promoForm.name
        .trim();

    const amount =
      Number(
        promoForm.discountAmount
      );

    const minimum =
      Number(
        promoForm.minimumBookingValue
      );

    if (!code) {
      errors.code =
        'Promo code is required.';

    } else if (
      !/^[A-Z0-9_-]+$/i.test(
        code
      )
    ) {
      errors.code =
        'Use letters, numbers, hyphens or underscores only.';
    }

    if (!name) {
      errors.name =
        'Promo name is required.';
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      errors.discountAmount =
        'Enter a discount greater than 0.';
    }

    if (
      (
        promoForm.discountType ===
          'percentage' ||
        promoForm.discountType ===
          'percent'
      ) &&
      amount > 100
    ) {
      errors.discountAmount =
        'Percentage cannot be greater than 100.';
    }

    if (
      !Number.isFinite(
        minimum
      ) ||
      minimum < 0
    ) {
      errors.minimumBookingValue =
        'Minimum booking value cannot be negative.';
    }

    setPromoErrors(
      errors
    );

    return (
      Object.keys(errors)
        .length === 0
    );
  }


  /* =========================================================
     SAVE PROMO
     ========================================================= */

  async function savePromo() {
    if (
      promoSaving ||
      promoLoading ||
      !validatePromo()
    ) {
      return;
    }

    setPromoSaving(
      true
    );

    try {
      if (editingId) {

        /*
         * PATCH
         * /v1/admin/promo-codes/{id}
         */
        await updatePromoCode(
          editingId,
          promoForm
        );

        toast.success(
          'Promo code updated.'
        );

      } else {

        /*
         * POST
         * /v1/admin/promo-codes
         */
        await createPromoCode(
          promoForm
        );

        toast.success(
          'Promo code created.'
        );
      }

      setPromoModalOpen(
        false
      );

      setEditingId(
        null
      );

      await loadPromos({
        silent: true,
      });

    } catch (error) {
      console.error(
        'Save promo error:',
        error
      );

      if (
        error?.errors &&
        typeof error.errors ===
          'object'
      ) {
        const backendErrors = {};

        if (
          error.errors.code
        ) {
          backendErrors.code =
            Array.isArray(
              error.errors.code
            )
              ? error.errors.code[0]
              : error.errors.code;
        }

        if (
          error.errors.name
        ) {
          backendErrors.name =
            Array.isArray(
              error.errors.name
            )
              ? error.errors.name[0]
              : error.errors.name;
        }

        if (
          error.errors
            .discount_amount
        ) {
          backendErrors.discountAmount =
            Array.isArray(
              error.errors
                .discount_amount
            )
              ? error.errors
                  .discount_amount[0]
              : error.errors
                  .discount_amount;
        }

        if (
          error.errors
            .minimum_booking_value
        ) {
          backendErrors
            .minimumBookingValue =
            Array.isArray(
              error.errors
                .minimum_booking_value
            )
              ? error.errors
                  .minimum_booking_value[0]
              : error.errors
                  .minimum_booking_value;
        }

        setPromoErrors(
          backendErrors
        );
      }

      toast.error(
        error?.message ||
        'Unable to save promo code.'
      );

    } finally {
      setPromoSaving(
        false
      );
    }
  }


  /* =========================================================
     DELETE PROMO
     ========================================================= */

  async function confirmDeletePromo() {
    if (
      !deletingPromo ||
      deleting
    ) {
      return;
    }

    setDeleting(
      true
    );

    try {
      /*
       * DELETE
       * /v1/admin/promo-codes
       *
       * {
       *   ids: [id]
       * }
       */
      await deletePromoCodes([
        deletingPromo.id,
      ]);

      toast.success(
        `${deletingPromo.code} deleted.`
      );

      /*
       * If this promo was selected
       * for the announcement, clear it
       * from the local announcement form.
       */
      if (
        String(
          announcement.promoCodeId
        ) ===
        String(
          deletingPromo.id
        )
      ) {
        setAnnouncement(
          previous => ({
            ...previous,

            promoCodeId:
              '',
          })
        );
      }

      setDeletingPromo(
        null
      );

      await loadPromos({
        silent: true,
      });

    } catch (error) {
      console.error(
        'Delete promo error:',
        error
      );

      toast.error(
        error?.message ||
        'Unable to delete promo code.'
      );

    } finally {
      setDeleting(
        false
      );
    }
  }


  /* =========================================================
     SAVE ANNOUNCEMENT
     ========================================================= */

  async function saveAnnouncement() {
    if (
      announcementSaving
    ) {
      return;
    }

    if (
      announcement.enabled &&
      !announcement.message.trim()
    ) {
      toast.error(
        'Enter an announcement message.'
      );

      return;
    }

    if (
      announcement.enabled &&
      !announcement.promoCodeId
    ) {
      toast.error(
        'Select a public promo code for the announcement bar.'
      );

      return;
    }

    if (
      announcement.showBookNow &&
      !announcement.buttonText
        .trim()
    ) {
      toast.error(
        'Enter CTA link text.'
      );

      return;
    }

    if (
      announcement.showBookNow &&
      !announcement.buttonLink
        .trim()
    ) {
      toast.error(
        'Enter CTA link path.'
      );

      return;
    }

    setAnnouncementSaving(
      true
    );

    try {
      /*
       * PUT
       * /v1/admin/announcement-bar
       */
      const updated =
        await updateAnnouncementBar(
          announcement
        );

      setAnnouncement(
        updated
      );

      toast.success(
        'Announcement bar saved.'
      );

    } catch (error) {
      console.error(
        'Save announcement error:',
        error
      );

      toast.error(
        error?.message ||
        'Unable to save announcement bar.'
      );

    } finally {
      setAnnouncementSaving(
        false
      );
    }
  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* =====================================================
          PAGE HEADING
      ====================================================== */}

      <AdminHeading
        eyebrow="Your workspace"
        title="Promotions without developer changes."
        description="Create public or private promo codes and control the website announcement bar from one place."
      >
        <Button
          type="button"
          variant="outline"
          disabled={
            refreshing
          }
          onClick={() => {
            loadPromos({
              silent: true,
            });

            loadAnnouncement();
          }}
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

          Refresh
        </Button>

        <Button
          type="button"
          onClick={
            saveAnnouncement
          }
          disabled={
            announcementSaving ||
            announcementLoading
          }
        >
          {announcementSaving ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}

          Save promotions
        </Button>
      </AdminHeading>


      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <div
        className="
          mt-8
          grid
          gap-6

          xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,.9fr)]
        "
      >

        {/* ===================================================
            LEFT - PROMOS
        ==================================================== */}

        <section
          className="
            min-w-0

            overflow-hidden

            rounded-2xl

            border

            bg-white
          "
        >

          {/* CARD HEADER */}

          <div
            className="
              flex
              flex-col
              gap-5

              border-b

              px-6
              py-6

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  mb-2

                  flex
                  items-center
                  gap-2

                  text-xs
                  font-bold
                  uppercase

                  tracking-[0.12em]

                  text-primary
                "
              >
                <Ticket size={15} />

                Promo codes
              </p>

              <h2
                className="
                  text-2xl
                  font-semibold
                  tracking-[-0.04em]
                "
              >
                Public and private offers
              </h2>

              <p
                className="
                  mt-2
                  max-w-xl

                  text-sm
                  leading-6

                  text-muted-foreground
                "
              >
                Public codes can be
                advertised on the website.
                Private codes still work in
                booking, but are not shown
                publicly.
              </p>
            </div>

            <Button
              type="button"
              onClick={
                openAddPromo
              }
              className="
                shrink-0
              "
            >
              <Plus size={16} />

              Add promo code
            </Button>
          </div>


          {/* SEARCH */}

          <div
            className="
              border-b

              bg-[#fafaf8]

              px-6
              py-4
            "
          >
            <div
              className="
                relative
                max-w-sm
              "
            >
              <Search
                size={16}
                className="
                  absolute
                  left-3
                  top-1/2

                  -translate-y-1/2

                  text-muted-foreground
                "
              />

              <Input
                value={
                  searchInput
                }
                onChange={event =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Search promo code..."
                className="pl-9"
              />
            </div>
          </div>


          {/* LOADING */}

          {loading ? (
            <div
              className="
                flex
                min-h-[360px]
                items-center
                justify-center
                gap-3

                text-sm
                text-muted-foreground
              "
            >
              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading promotions...
            </div>

          ) : promos.length === 0 ? (

            /* EMPTY */

            <div
              className="
                flex
                min-h-[360px]
                flex-col
                items-center
                justify-center

                px-6

                text-center
              "
            >
              <div
                className="
                  grid
                  h-12
                  w-12
                  place-items-center

                  rounded-xl

                  bg-secondary

                  text-primary
                "
              >
                <Ticket size={22} />
              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-semibold
                "
              >
                No promo codes found
              </h3>

              <p
                className="
                  mt-2
                  max-w-sm

                  text-sm
                  text-muted-foreground
                "
              >
                Add your first promo code,
                or change the current search.
              </p>
            </div>

          ) : (

            <>
              {/* DESKTOP TABLE */}

              <div
                className="
                  hidden
                  overflow-x-auto

                  md:block
                "
              >
                <table
                  className="
                    w-full
                    min-w-[720px]
                  "
                >
                  <thead
                    className="
                      bg-[#f7f6f2]

                      text-left
                      text-sm
                    "
                  >
                    <tr>
                      <th
                        className="
                          px-6
                          py-3

                          font-medium
                        "
                      >
                        Code
                      </th>

                      <th
                        className="
                          px-5
                          py-3

                          font-medium
                        "
                      >
                        Discount
                      </th>

                      <th
                        className="
                          px-5
                          py-3

                          font-medium
                        "
                      >
                        Visibility
                      </th>

                      <th
                        className="
                          px-5
                          py-3

                          font-medium
                        "
                      >
                        Status
                      </th>

                      <th
                        className="
                          px-5
                          py-3

                          text-right
                          font-medium
                        "
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {promos.map(
                      promo => (
                        <tr
                          key={promo.id}
                          className="
                            border-t
                          "
                        >
                          {/* CODE */}

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >
                            <p
                              className="
                                text-sm
                                font-extrabold
                                tracking-[0.04em]
                                text-navy
                              "
                            >
                              {promo.code}
                            </p>

                            <p
                              className="
                                mt-1
                                max-w-[210px]

                                truncate

                                text-xs
                                text-muted-foreground
                              "
                              title={
                                promo.name
                              }
                            >
                              {promo.name}
                            </p>
                          </td>


                          {/* DISCOUNT */}

                          <td
                            className="
                              px-5
                              py-5
                            "
                          >
                            <p
                              className="
                                text-sm
                                font-semibold
                              "
                            >
                              {discountLabel(
                                promo
                              )}
                            </p>

                            <p
                              className="
                                mt-1

                                text-xs
                                text-muted-foreground
                              "
                            >
                              Min.{' '}
                              {money(
                                promo.minimumBookingValue
                              )}
                            </p>
                          </td>


                          {/* VISIBILITY */}

                          <td
                            className="
                              px-5
                              py-5
                            "
                          >
                            <span
                              className={`
                                inline-flex

                                rounded-full

                                px-3
                                py-1

                                text-xs
                                font-semibold

                                ${
                                  promo.visibility ===
                                  'public'
                                    ? 'bg-[#e8f5f3] text-[#087e83]'
                                    : 'bg-slate-100 text-slate-600'
                                }
                              `}
                            >
                              {promo.visibility ===
                              'public'
                                ? 'Public'
                                : 'Private'}
                            </span>
                          </td>


                          {/* STATUS */}

                          <td
                            className="
                              px-5
                              py-5
                            "
                          >
                            <span
                              className={`
                                inline-flex

                                rounded-full

                                px-3
                                py-1

                                text-xs
                                font-semibold

                                ${
                                  promo.isActive
                                    ? 'bg-[#eaf7ef] text-[#3b7f55]'
                                    : 'bg-slate-100 text-slate-500'
                                }
                              `}
                            >
                              {promo.isActive
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </td>


                          {/* ACTION */}

                          <td
                            className="
                              px-5
                              py-5
                            "
                          >
                            <div
                              className="
                                flex
                                justify-end
                                gap-2
                              "
                            >
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openEditPromo(
                                    promo.id
                                  )
                                }
                              >
                                <Pencil
                                  size={15}
                                />

                                Edit
                              </Button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeletingPromo(
                                    promo
                                  )
                                }
                                className="
                                  grid
                                  h-9
                                  w-9
                                  place-items-center

                                  rounded-lg

                                  text-[#b63737]

                                  transition

                                  hover:bg-red-50
                                "
                                aria-label={`Delete ${promo.code}`}
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>


              {/* MOBILE PROMOS */}

              <div
                className="
                  divide-y

                  md:hidden
                "
              >
                {promos.map(
                  promo => (
                    <article
                      key={promo.id}
                      className="
                        px-5
                        py-5
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >
                        <div>
                          <p
                            className="
                              text-sm
                              font-extrabold
                              tracking-[0.04em]
                            "
                          >
                            {promo.code}
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-muted-foreground
                            "
                          >
                            {promo.name}
                          </p>
                        </div>

                        <span
                          className={`
                            rounded-full
                            px-2.5
                            py-1

                            text-[11px]
                            font-semibold

                            ${
                              promo.isActive
                                ? 'bg-[#eaf7ef] text-[#3b7f55]'
                                : 'bg-slate-100 text-slate-500'
                            }
                          `}
                        >
                          {promo.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </div>

                      <div
                        className="
                          mt-4

                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <span
                          className="
                            text-sm
                            font-semibold
                          "
                        >
                          {discountLabel(
                            promo
                          )}
                        </span>

                        <span
                          className="
                            text-xs
                            text-muted-foreground
                          "
                        >
                          Min.{' '}
                          {money(
                            promo.minimumBookingValue
                          )}
                        </span>

                        <span
                          className="
                            rounded-full
                            bg-secondary

                            px-2.5
                            py-1

                            text-[11px]
                            font-semibold
                            text-primary
                          "
                        >
                          {promo.visibility}
                        </span>
                      </div>

                      <div
                        className="
                          mt-4
                          flex
                          gap-2
                        "
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEditPromo(
                              promo.id
                            )
                          }
                        >
                          <Pencil
                            size={15}
                          />

                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="
                            text-red-600

                            hover:bg-red-50
                            hover:text-red-700
                          "
                          onClick={() =>
                            setDeletingPromo(
                              promo
                            )
                          }
                        >
                          <Trash2
                            size={15}
                          />

                          Delete
                        </Button>
                      </div>
                    </article>
                  )
                )}
              </div>


              {/* PAGINATION */}

              <div
                className="
                  flex
                  flex-col
                  gap-4

                  border-t

                  px-6
                  py-4

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  {pagination.total > 0
                    ? `Showing ${pagination.from}–${pagination.to} of ${pagination.total} promo codes`
                    : 'No promo codes'}
                </p>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      page <= 1
                    }
                    onClick={() =>
                      setPage(
                        previous =>
                          Math.max(
                            1,
                            previous - 1
                          )
                      )
                    }
                    aria-label="Previous page"
                  >
                    <ChevronLeft
                      size={17}
                    />
                  </Button>

                  <div
                    className="
                      grid
                      h-9
                      min-w-9
                      place-items-center

                      rounded-lg

                      bg-primary

                      px-3

                      text-xs
                      font-bold
                      text-white
                    "
                  >
                    {pagination.currentPage}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      page >=
                      pagination.lastPage
                    }
                    onClick={() =>
                      setPage(
                        previous =>
                          Math.min(
                            pagination.lastPage,
                            previous + 1
                          )
                      )
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight
                      size={17}
                    />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>


        {/* ===================================================
            RIGHT - ANNOUNCEMENT
        ==================================================== */}

        <section
          className="
            rounded-2xl

            border

            bg-white

            p-6

            xl:sticky
            xl:top-6
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className="
                grid
                h-10
                w-10
                shrink-0
                place-items-center

                rounded-xl

                bg-secondary

                text-primary
              "
            >
              <Megaphone
                size={18}
              />
            </div>

            <div>
              <h2
                className="
                  text-2xl
                  font-semibold
                  tracking-[-0.04em]
                "
              >
                Announcement bar
              </h2>

              <p
                className="
                  mt-2

                  text-sm
                  leading-6

                  text-muted-foreground
                "
              >
                Show one active public code
                in the thin bar above the
                website header.
              </p>
            </div>
          </div>


          {announcementLoading ? (
            <div
              className="
                flex
                min-h-[320px]
                items-center
                justify-center
                gap-3

                text-sm
                text-muted-foreground
              "
            >
              <Loader2
                size={18}
                className="animate-spin"
              />

              Loading announcement...
            </div>

          ) : (

            <div className="mt-7 space-y-5">

              {/* ENABLED */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-5

                  rounded-xl

                  border

                  p-4
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                    "
                  >
                    Show announcement bar
                  </p>

                  <p
                    className="
                      mt-1

                      text-xs
                      text-muted-foreground
                    "
                  >
                    Turn the public promotion
                    on or off instantly.
                  </p>
                </div>

                <Toggle
                  checked={
                    announcement.enabled
                  }
                  onChange={enabled =>
                    setAnnouncement(
                      previous => ({
                        ...previous,
                        enabled,
                      })
                    )
                  }
                  label="Show announcement bar"
                />
              </div>


              {/* MESSAGE */}

              <div>
                <Label className="mb-2 block">
                  Offer message
                </Label>

                <Input
                  value={
                    announcement.message
                  }
                  placeholder="New to Matelink? Save $20 on your first clean"
                  onChange={event =>
                    setAnnouncement(
                      previous => ({
                        ...previous,

                        message:
                          event.target.value,
                      })
                    )
                  }
                />
              </div>


              {/* PROMO SELECT */}

              <div>
                <Label className="mb-2 block">
                  Public promo code
                </Label>

                <select
                  value={
                    announcement.promoCodeId ||
                    ''
                  }
                  onChange={event =>
                    setAnnouncement(
                      previous => ({
                        ...previous,

                        promoCodeId:
                          event.target.value
                            ? Number(
                                event.target.value
                              )
                            : '',
                      })
                    )
                  }
                  className="
                    h-10
                    w-full

                    rounded-md

                    border
                    border-input

                    bg-white

                    px-3

                    text-sm

                    outline-none

                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/10
                  "
                >
                  <option value="">
                    Select public promo code
                  </option>

                  {publicPromos.map(
                    promo => (
                      <option
                        key={promo.id}
                        value={promo.id}
                      >
                        {promo.code}
                        {' — '}
                        {discountLabel(
                          promo
                        )}
                      </option>
                    )
                  )}
                </select>

                {publicPromos.length ===
                  0 && (
                  <p
                    className="
                      mt-2

                      text-xs
                      text-amber-700
                    "
                  >
                    You currently have no
                    active public promo code.
                  </p>
                )}
              </div>


              {/* CTA */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-5

                  rounded-xl

                  border

                  p-4
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                    "
                  >
                    Show BOOK NOW link
                  </p>

                  <p
                    className="
                      mt-1

                      text-xs
                      text-muted-foreground
                    "
                  >
                    Optional CTA that takes
                    visitors into the booking
                    journey.
                  </p>
                </div>

                <Toggle
                  checked={
                    announcement.showBookNow
                  }
                  onChange={showBookNow =>
                    setAnnouncement(
                      previous => ({
                        ...previous,

                        showBookNow,
                      })
                    )
                  }
                  label="Show BOOK NOW link"
                />
              </div>


              {/* CTA FIELDS */}

              {announcement.showBookNow && (
                <div
                  className="
                    grid
                    gap-4

                    sm:grid-cols-2
                  "
                >
                  <div>
                    <Label className="mb-2 block">
                      Link text
                    </Label>

                    <Input
                      value={
                        announcement.buttonText
                      }
                      onChange={event =>
                        setAnnouncement(
                          previous => ({
                            ...previous,

                            buttonText:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="BOOK NOW"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Link path
                    </Label>

                    <Input
                      value={
                        announcement.buttonLink
                      }
                      onChange={event =>
                        setAnnouncement(
                          previous => ({
                            ...previous,

                            buttonLink:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="/book"
                    />
                  </div>
                </div>
              )}


              {/* PREVIEW */}

              <div
                className="
                  overflow-hidden

                  rounded-xl

                  bg-[#102d43]

                  p-4

                  text-white
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase

                    tracking-[0.14em]

                    text-[#a7dddb]
                  "
                >
                  Preview
                </p>

                <div
                  className="
                    mt-3

                    flex
                    flex-wrap
                    items-center
                    gap-x-3
                    gap-y-2

                    text-xs
                  "
                >
                  <span
                    className="
                      font-medium
                      text-white/90
                    "
                  >
                    {announcement.message ||
                      'Your promotional message'}
                  </span>

                  {selectedAnnouncementPromo && (
                    <span
                      className="
                        rounded-full

                        border
                        border-white/20

                        bg-white/10

                        px-2.5
                        py-1

                        font-extrabold

                        tracking-[0.07em]
                      "
                    >
                      {
                        selectedAnnouncementPromo.code
                      }
                    </span>
                  )}

                  {announcement.showBookNow &&
                    announcement.buttonText && (
                    <span
                      className="
                        font-bold
                        text-[#a7dddb]
                      "
                    >
                      {
                        announcement.buttonText
                      }{' '}
                      →
                    </span>
                  )}
                </div>
              </div>


              {/* SAVE */}

              <Button
                type="button"
                className="w-full"
                onClick={
                  saveAnnouncement
                }
                disabled={
                  announcementSaving
                }
              >
                {announcementSaving ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={16} />
                )}

                Save announcement
              </Button>

            </div>
          )}
        </section>
      </div>


      {/* =====================================================
          ADD / EDIT PROMO MODAL
      ====================================================== */}

      <Modal
        open={
          promoModalOpen
        }
        title={
          editingId
            ? 'Edit promo code'
            : 'Add promo code'
        }
        description={
          editingId
            ? 'Update the code, discount, visibility and availability.'
            : 'Create a public or private promo code that can be used during booking.'
        }
        onClose={() => {
          if (
            promoSaving
          ) {
            return;
          }

          setPromoModalOpen(
            false
          );
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={
                promoSaving
              }
              onClick={() =>
                setPromoModalOpen(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                promoSaving ||
                promoLoading
              }
              onClick={
                savePromo
              }
            >
              {promoSaving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save size={16} />
              )}

              {editingId
                ? 'Save changes'
                : 'Save promo code'}
            </Button>
          </>
        }
      >
        {promoLoading ? (
          <div
            className="
              flex
              min-h-[260px]
              items-center
              justify-center
              gap-3

              text-sm
              text-muted-foreground
            "
          >
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading promo...
          </div>

        ) : (

          <PromoForm
            value={
              promoForm
            }
            errors={
              promoErrors
            }
            onChange={
              setPromoForm
            }
          />
        )}
      </Modal>


      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      <Modal
        open={
          Boolean(
            deletingPromo
          )
        }
        title="Delete promo code?"
        description={
          deletingPromo
            ? `This will permanently delete ${deletingPromo.code}.`
            : ''
        }
        onClose={() => {
          if (!deleting) {
            setDeletingPromo(
              null
            );
          }
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={
                deleting
              }
              onClick={() =>
                setDeletingPromo(
                  null
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                deleting
              }
              onClick={
                confirmDeletePromo
              }
              className="
                bg-red-600

                hover:bg-red-700
              "
            >
              {deleting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={16}
                />
              )}

              Delete promo
            </Button>
          </>
        }
      >
        <div
          className="
            rounded-xl

            border
            border-red-100

            bg-red-50

            p-4

            text-sm
            leading-6
            text-red-800
          "
        >
          Deleting a promo code cannot be
          undone. Customers will no longer
          be able to use this code.
        </div>
      </Modal>
    </>
  );
}
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Home,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

import {
  toast,
} from 'sonner';

import {
  Button,
} from '@/shared/components/ui/button';

import {
  Card,
} from '@/shared/components/ui/card';

import {
  Input,
} from '@/shared/components/ui/input';

import {
  Label,
} from '@/shared/components/ui/label';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

import {
  deleteQuoteRequests,
  getQuoteRequest,
  getQuoteRequests,
  markQuoteRequestsContacted,
  updateQuoteRequestStatus,
} from '@/modules/admin/api/quoteRequestsApi';


/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const PAGE_SIZE_OPTIONS = [
  10,
  20,
  30,
];


const STATUS_OPTIONS = [
  {
    value:
      'all',

    label:
      'All quotes',
  },

  {
    value:
      'new',

    label:
      'New',
  },

  {
    value:
      'contacted',

    label:
      'Contacted',
  },
];


/*
|--------------------------------------------------------------------------
| BACKEND PUBLIC URL
|--------------------------------------------------------------------------
|
| API:
| /backend/public/api
|
| Media generally lives under:
| /backend/public/...
|
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  ''
)
  .trim()
  .replace(/\/+$/, '');


const BACKEND_PUBLIC_URL =
  API_BASE_URL.replace(
    /\/api\/?$/,
    ''
  );


/*
|--------------------------------------------------------------------------
| ADMIN HEADING
|--------------------------------------------------------------------------
*/

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
      <div
        className="
          max-w-3xl
        "
      >
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


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function quoteId(
  quote
) {
  return Number(
    quote?.id
  );
}


function quoteStatus(
  quote
) {
  return String(
    quote?.status ||
    'new'
  )
    .trim()
    .toLowerCase();
}


function friendlyValue(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return '—';
  }


  return String(
    value
  )
    .replace(
      /_/g,
      ' '
    )
    .replace(
      /-/g,
      ' '
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );
}


function resolvePhotoUrl(
  photo
) {
  const raw =
    typeof photo ===
    'string'
      ? photo
      : photo?.url ||
        photo?.path ||
        photo?.file_url ||
        photo?.file ||
        '';


  if (!raw) {
    return '';
  }


  if (
    /^https?:\/\//i.test(
      raw
    )
  ) {
    return raw;
  }


  const clean =
    String(raw)
      .replace(
        /^\/+/,
        ''
      );


  return `${BACKEND_PUBLIC_URL}/${clean}`;
}


/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function QuoteStatusBadge({
  status,
}) {
  const normalized =
    String(
      status ||
      'new'
    ).toLowerCase();


  const contacted =
    normalized ===
    'contacted';


  return (
    <span
      className={`
        inline-flex

        items-center

        rounded-full

        border

        px-2.5
        py-1

        text-[11px]
        font-semibold

        ${
          contacted
            ? `
              border-emerald-200
              bg-emerald-50
              text-emerald-700
            `
            : `
              border-[#087e83]/20
              bg-[#edf6f5]
              text-[#087e83]
            `
        }
      `}
    >
      {contacted
        ? 'Contacted'
        : friendlyValue(
            normalized
          )}
    </span>
  );
}


/*
|--------------------------------------------------------------------------
| CHECKBOX
|--------------------------------------------------------------------------
*/

function SelectCheckbox({
  checked,
  onChange,
  ariaLabel,
}) {
  return (
    <input
      type="checkbox"
      checked={
        checked
      }
      onChange={
        onChange
      }
      aria-label={
        ariaLabel
      }
      className="
        h-4
        w-4

        cursor-pointer

        rounded

        border-slate-300

        accent-[#087e83]
      "
    />
  );
}


/*
|--------------------------------------------------------------------------
| INFO BLOCK
|--------------------------------------------------------------------------
*/

function InfoBlock({
  label,
  children,
}) {
  return (
    <div
      className="
        border-b
        border-slate-200

        pb-5

        last:border-b-0
        last:pb-0
      "
    >
      <p
        className="
          mb-2

          text-xs
          font-semibold
          uppercase
          tracking-wide

          text-muted-foreground
        "
      >
        {label}
      </p>


      <div
        className="
          break-words

          text-sm
          leading-7

          text-[#102d43]
        "
      >
        {children}
      </div>
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| PAGE NUMBERS
|--------------------------------------------------------------------------
*/

function getPageNumbers(
  currentPage,
  lastPage
) {
  if (
    lastPage <= 5
  ) {
    return Array.from(
      {
        length:
          lastPage,
      },
      (_, index) =>
        index + 1
    );
  }


  if (
    currentPage <= 3
  ) {
    return [
      1,
      2,
      3,
      4,
      5,
    ];
  }


  if (
    currentPage >=
    lastPage - 2
  ) {
    return [
      lastPage - 4,
      lastPage - 3,
      lastPage - 2,
      lastPage - 1,
      lastPage,
    ];
  }


  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}


/*
|--------------------------------------------------------------------------
| QUOTES PAGE
|--------------------------------------------------------------------------
*/

function QuotesPage() {

  /*
  |--------------------------------------------------------------------------
  | LIST
  |--------------------------------------------------------------------------
  */

  const [
    rows,
    setRows,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

  const [
    postcodeInput,
    setPostcodeInput,
  ] = useState('');


  const [
    postcode,
    setPostcode,
  ] = useState('');


  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const [
    page,
    setPage,
  ] = useState(1);


  const [
    perPage,
    setPerPage,
  ] = useState(10);


  const [
    pagination,
    setPagination,
  ] = useState({
    currentPage:
      1,

    lastPage:
      1,

    total:
      0,

    from:
      0,

    to:
      0,
  });


  /*
  |--------------------------------------------------------------------------
  | SELECTED
  |--------------------------------------------------------------------------
  */

  const [
    selectedIds,
    setSelectedIds,
  ] = useState(
    () =>
      new Set()
  );


  /*
  |--------------------------------------------------------------------------
  | VIEW DRAWER
  |--------------------------------------------------------------------------
  */

  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);


  const [
    selectedQuote,
    setSelectedQuote,
  ] = useState(null);


  const [
    viewing,
    setViewing,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | STATUS UPDATE
  |--------------------------------------------------------------------------
  */

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);


  const [
    bulkUpdating,
    setBulkUpdating,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const [
    deleteIds,
    setDeleteIds,
  ] = useState([]);


  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);


  const [
    deleting,
    setDeleting,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  const loadQuotes =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (silent) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }


        try {
          const result =
            await getQuoteRequests({
              status:
                statusFilter,

              postcode,

              page,

              perPage,
            });


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


          setRows(
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
            'Load quote requests error:',
            error
          );


          toast.error(
            error?.message ||
            'Unable to load quote requests.'
          );


          setRows(
            []
          );

        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      [
        statusFilter,
        postcode,
        page,
        perPage,
      ]
    );


  useEffect(() => {
    loadQuotes();
  }, [
    loadQuotes,
  ]);


  /*
  |--------------------------------------------------------------------------
  | POSTCODE DEBOUNCE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setPage(
            1
          );


          setPostcode(
            postcodeInput
              .trim()
          );


          setSelectedIds(
            new Set()
          );
        },
        350
      );


    return () =>
      window.clearTimeout(
        timer
      );

  }, [
    postcodeInput,
  ]);


  /*
  |--------------------------------------------------------------------------
  | CURRENT IDS
  |--------------------------------------------------------------------------
  */

  const currentPageIds =
    useMemo(
      () =>
        rows
          .map(
            quoteId
          )
          .filter(
            Boolean
          ),
      [
        rows,
      ]
    );


  const allCurrentSelected =
    currentPageIds.length >
      0 &&
    currentPageIds.every(
      id =>
        selectedIds.has(
          id
        )
    );


  /*
  |--------------------------------------------------------------------------
  | TOGGLE SELECT
  |--------------------------------------------------------------------------
  */

  function toggleSelected(
    id
  ) {
    setSelectedIds(
      previous => {
        const next =
          new Set(
            previous
          );


        if (
          next.has(
            id
          )
        ) {
          next.delete(
            id
          );
        } else {
          next.add(
            id
          );
        }


        return next;
      }
    );
  }


  function toggleSelectAll() {
    setSelectedIds(
      previous => {
        const next =
          new Set(
            previous
          );


        if (
          allCurrentSelected
        ) {
          currentPageIds.forEach(
            id =>
              next.delete(
                id
              )
          );
        } else {
          currentPageIds.forEach(
            id =>
              next.add(
                id
              )
          );
        }


        return next;
      }
    );
  }


  /*
  |--------------------------------------------------------------------------
  | VIEW SINGLE
  |--------------------------------------------------------------------------
  */

  async function openQuote(
    id
  ) {
    setDrawerOpen(
      true
    );

    setViewing(
      true
    );

    setSelectedQuote(
      null
    );


    try {
      const quote =
        await getQuoteRequest(
          id
        );


      setSelectedQuote(
        quote
      );

    } catch (error) {
      console.error(
        'Get quote error:',
        error
      );


      toast.error(
        error?.message ||
        'Unable to load this quote request.'
      );


      setDrawerOpen(
        false
      );

    } finally {
      setViewing(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | UPDATE ONE STATUS
  |--------------------------------------------------------------------------
  */

  async function changeQuoteStatus(
    status
  ) {
    const id =
      quoteId(
        selectedQuote
      );


    if (!id) {
      return;
    }


    setUpdatingStatus(
      true
    );


    try {
      await updateQuoteRequestStatus(
        id,
        status
      );


      setSelectedQuote(
        previous => ({
          ...previous,

          status,
        })
      );


      setRows(
        previous =>
          previous.map(
            item =>
              quoteId(
                item
              ) === id
                ? {
                    ...item,

                    status,
                  }
                : item
          )
      );


      toast.success(
        `Quote marked as ${friendlyValue(status)}.`
      );


      await loadQuotes({
        silent:
          true,
      });

    } catch (error) {
      toast.error(
        error?.message ||
        'Unable to update quote status.'
      );

    } finally {
      setUpdatingStatus(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | BULK CONTACTED
  |--------------------------------------------------------------------------
  */

  async function markSelectedContacted() {
    const ids =
      Array.from(
        selectedIds
      );


    if (!ids.length) {
      return;
    }


    setBulkUpdating(
      true
    );


    try {
      await markQuoteRequestsContacted(
        ids
      );


      toast.success(
        `${ids.length} quote request${
          ids.length === 1
            ? ''
            : 's'
        } marked contacted.`
      );


      setSelectedIds(
        new Set()
      );


      await loadQuotes({
        silent:
          true,
      });

    } catch (error) {
      toast.error(
        error?.message ||
        'Unable to update selected quotes.'
      );

    } finally {
      setBulkUpdating(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  function askDelete(
    ids
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
      return;
    }


    setDeleteIds(
      normalized
    );

    setDeleteDialogOpen(
      true
    );
  }


  async function confirmDelete() {
    if (
      !deleteIds.length
    ) {
      return;
    }


    setDeleting(
      true
    );


    try {
      await deleteQuoteRequests(
        deleteIds
      );


      const deleted =
        new Set(
          deleteIds
        );


      if (
        selectedQuote &&
        deleted.has(
          quoteId(
            selectedQuote
          )
        )
      ) {
        setDrawerOpen(
          false
        );

        setSelectedQuote(
          null
        );
      }


      setSelectedIds(
        previous => {
          const next =
            new Set(
              previous
            );


          deleteIds.forEach(
            id =>
              next.delete(
                id
              )
          );


          return next;
        }
      );


      toast.success(
        `${deleteIds.length} quote request${
          deleteIds.length === 1
            ? ''
            : 's'
        } deleted.`
      );


      setDeleteDialogOpen(
        false
      );

      setDeleteIds(
        []
      );


      await loadQuotes({
        silent:
          true,
      });

    } catch (error) {
      toast.error(
        error?.message ||
        'Unable to delete quote request.'
      );

    } finally {
      setDeleting(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | PHOTOS
  |--------------------------------------------------------------------------
  */

  const selectedPhotos =
    useMemo(
      () => {
        if (
          !selectedQuote
        ) {
          return [];
        }


        const value =
          selectedQuote.photos ||
          selectedQuote.images ||
          [];


        if (
          !Array.isArray(
            value
          )
        ) {
          return [];
        }


        return value
          .map(
            resolvePhotoUrl
          )
          .filter(
            Boolean
          );
      },
      [
        selectedQuote,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const pageNumbers =
    getPageNumbers(
      pagination.currentPage,
      pagination.lastPage
    );


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* =========================================================
          HEADER
      ========================================================= */}

      <AdminHeading
        eyebrow="Customer enquiries"
        title="Quote requests"
        description="Review custom cleaning quote requests, inspect property requirements and photos, contact customers and manage completed enquiries."
      >
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            loadQuotes({
              silent:
                true,
            })
          }
          disabled={
            refreshing
          }
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
      </AdminHeading>


      {/* =========================================================
          FILTERS
      ========================================================= */}

      <Card
        className="
          mt-7
          gap-0
          p-5
          shadow-none
        "
      >
        <div
          className="
            grid
            gap-4

            lg:grid-cols-[1fr_220px_150px]
            lg:items-end
          "
        >

          {/* Postcode */}

          <div>
            <Label
              htmlFor="quote-postcode-filter"
              className="
                mb-2
                block

                text-xs
                font-semibold
              "
            >
              Postcode
            </Label>


            <div
              className="
                relative
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
                id="quote-postcode-filter"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Filter by postcode, e.g. 2000"
                value={
                  postcodeInput
                }
                onChange={
                  event =>
                    setPostcodeInput(
                      event.target.value
                        .replace(
                          /\D/g,
                          ''
                        )
                        .slice(
                          0,
                          4
                        )
                    )
                }
                className="
                  h-11
                  bg-white
                  pl-10
                "
              />


              {postcodeInput && (
                <button
                  type="button"
                  aria-label="Clear postcode"
                  onClick={() =>
                    setPostcodeInput(
                      ''
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2

                    -translate-y-1/2

                    text-muted-foreground

                    hover:text-foreground
                  "
                >
                  <X
                    size={15}
                  />
                </button>
              )}
            </div>
          </div>


          {/* Status */}

          <div>
            <Label
              htmlFor="quote-status-filter"
              className="
                mb-2
                block

                text-xs
                font-semibold
              "
            >
              Status
            </Label>


            <select
              id="quote-status-filter"
              value={
                statusFilter
              }
              onChange={
                event => {
                  setStatusFilter(
                    event.target.value
                  );

                  setPage(
                    1
                  );

                  setSelectedIds(
                    new Set()
                  );
                }
              }
              className="
                h-11
                w-full

                rounded-lg

                border
                border-input

                bg-white

                px-3

                text-sm

                outline-none
              "
            >
              {STATUS_OPTIONS.map(
                option => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>


          {/* Per page */}

          <div>
            <Label
              htmlFor="quote-per-page"
              className="
                mb-2
                block

                text-xs
                font-semibold
              "
            >
              Per page
            </Label>


            <select
              id="quote-per-page"
              value={
                perPage
              }
              onChange={
                event => {
                  setPerPage(
                    Number(
                      event.target.value
                    )
                  );

                  setPage(
                    1
                  );

                  setSelectedIds(
                    new Set()
                  );
                }
              }
              className="
                h-11
                w-full

                rounded-lg

                border
                border-input

                bg-white

                px-3

                text-sm

                outline-none
              "
            >
              {PAGE_SIZE_OPTIONS.map(
                amount => (
                  <option
                    key={
                      amount
                    }
                    value={
                      amount
                    }
                  >
                    {amount}
                  </option>
                )
              )}
            </select>
          </div>

        </div>
      </Card>


      {/* =========================================================
          BULK ACTIONS
      ========================================================= */}

      {selectedIds.size >
        0 && (
        <div
          className="
            mt-5

            flex
            flex-col

            gap-3

            rounded-xl

            border
            border-[#087e83]/20

            bg-[#edf6f5]

            px-4
            py-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                font-semibold

                text-[#102d43]
              "
            >
              {selectedIds.size}{' '}
              quote request
              {selectedIds.size ===
              1
                ? ''
                : 's'}{' '}
              selected
            </p>
          </div>


          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={
                markSelectedContacted
              }
              disabled={
                bulkUpdating
              }
            >
              {bulkUpdating ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck
                  size={15}
                />
              )}

              Mark contacted
            </Button>


            <Button
              type="button"
              variant="outline"
              className="
                border-red-200
                text-red-600

                hover:bg-red-50
                hover:text-red-700
              "
              onClick={() =>
                askDelete(
                  Array.from(
                    selectedIds
                  )
                )
              }
            >
              <Trash2
                size={15}
              />

              Delete selected
            </Button>
          </div>
        </div>
      )}


      {/* =========================================================
          TABLE
      ========================================================= */}

      <Card
        className="
          mt-5
          gap-0
          overflow-hidden
          p-0
          shadow-none
        "
      >
        <div
          className="
            flex
            items-center
            justify-between

            border-b

            px-5
            py-4

            lg:px-6
          "
        >
          <div>
            <p
              className="
                text-sm
                font-semibold
              "
            >
              Quote enquiries
            </p>

            <p
              className="
                mt-1

                text-xs
                text-muted-foreground
              "
            >
              {pagination.total}{' '}
              request
              {pagination.total ===
              1
                ? ''
                : 's'}
            </p>
          </div>


          {refreshing && (
            <Loader2
              size={16}
              className="
                animate-spin
                text-primary
              "
            />
          )}
        </div>


        {loading ? (
          <div
            className="
              flex

              min-h-[340px]

              items-center
              justify-center

              gap-3
            "
          >
            <Loader2
              size={22}
              className="
                animate-spin
                text-primary
              "
            />

            <span
              className="
                text-sm
                text-muted-foreground
              "
            >
              Loading quote requests…
            </span>
          </div>

        ) : rows.length ? (

          <div
            className="
              overflow-x-auto
            "
          >
            <Table>

              <TableHeader>
                <TableRow
                  className="
                    bg-muted
                  "
                >
                  <TableHead
                    className="
                      w-[50px]
                      pl-6
                    "
                  >
                    <SelectCheckbox
                      checked={
                        allCurrentSelected
                      }
                      onChange={
                        toggleSelectAll
                      }
                      ariaLabel="Select all quotes on this page"
                    />
                  </TableHead>


                  <TableHead>
                    Customer
                  </TableHead>


                  <TableHead>
                    Service
                  </TableHead>


                  <TableHead>
                    Property
                  </TableHead>


                  <TableHead>
                    Postcode
                  </TableHead>


                  <TableHead>
                    Status
                  </TableHead>


                  <TableHead
                    className="
                      pr-6
                      text-right
                    "
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>


              <TableBody>
                {rows.map(
                  quote => {
                    const id =
                      quoteId(
                        quote
                      );

                    const selected =
                      selectedIds.has(
                        id
                      );


                    return (
                      <TableRow
                        key={
                          id
                        }
                        className={
                          selected
                            ? 'bg-[#edf6f5]/70'
                            : ''
                        }
                      >
                        <TableCell
                          className="
                            pl-6
                            align-top
                          "
                        >
                          <SelectCheckbox
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleSelected(
                                id
                              )
                            }
                            ariaLabel={`Select quote ${id}`}
                          />
                        </TableCell>


                        {/* Customer */}

                        <TableCell
                          className="
                            min-w-[220px]
                            py-5
                            align-top
                          "
                        >
                          <div
                            className="
                              flex
                              gap-3
                            "
                          >
                            <div
                              className="
                                grid

                                h-9
                                w-9

                                shrink-0

                                place-items-center

                                rounded-full

                                bg-[#edf6f5]

                                text-[#087e83]
                              "
                            >
                              <UserRound
                                size={16}
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
                                {quote.name ||
                                  'Unknown customer'}
                              </p>

                              <p
                                className="
                                  mt-1

                                  text-xs

                                  text-muted-foreground
                                "
                              >
                                {quote.email ||
                                  'No email'}
                              </p>
                            </div>
                          </div>
                        </TableCell>


                        {/* Service */}

                        <TableCell
                          className="
                            min-w-[150px]
                            py-5
                            align-top

                            text-sm
                          "
                        >
                          {friendlyValue(
                            quote.service
                          )}
                        </TableCell>


                        {/* Property */}

                        <TableCell
                          className="
                            min-w-[150px]
                            py-5
                            align-top

                            text-sm
                          "
                        >
                          {friendlyValue(
                            quote.property_type ||
                            quote.propertyType
                          )}
                        </TableCell>


                        {/* Postcode */}

                        <TableCell
                          className="
                            py-5
                            align-top

                            text-sm
                            font-medium
                          "
                        >
                          {quote.postcode ||
                            '—'}
                        </TableCell>


                        {/* Status */}

                        <TableCell
                          className="
                            py-5
                            align-top
                          "
                        >
                          <QuoteStatusBadge
                            status={
                              quote.status
                            }
                          />
                        </TableCell>


                        {/* Actions */}

                        <TableCell
                          className="
                            min-w-[150px]
                            py-5
                            pr-6
                            align-top
                            text-right
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-end
                              gap-2
                            "
                          >
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openQuote(
                                  id
                                )
                              }
                            >
                              <Eye
                                size={14}
                              />

                              View
                            </Button>


                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label="Delete quote"
                              className="
                                text-red-500

                                hover:bg-red-50
                                hover:text-red-600
                              "
                              onClick={() =>
                                askDelete([
                                  id,
                                ])
                              }
                            >
                              <Trash2
                                size={15}
                              />
                            </Button>
                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  }
                )}
              </TableBody>

            </Table>
          </div>

        ) : (
          <div
            className="
              flex

              min-h-[340px]

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

                rounded-full

                bg-[#edf6f5]

                text-[#087e83]
              "
            >
              <Search
                size={20}
              />
            </div>


            <h3
              className="
                mt-4

                font-semibold
              "
            >
              No quote requests found.
            </h3>


            <p
              className="
                mt-2

                text-sm

                text-muted-foreground
              "
            >
              Try changing the status or postcode filter.
            </p>
          </div>
        )}


        {/* =======================================================
            PAGINATION
        ======================================================= */}

        {!loading &&
          pagination.total >
            0 && (
          <div
            className="
              flex
              flex-col

              gap-4

              border-t

              px-5
              py-4

              sm:flex-row
              sm:items-center
              sm:justify-between

              lg:px-6
            "
          >
            <p
              className="
                text-xs

                text-muted-foreground
              "
            >
              Showing{' '}
              <strong>
                {pagination.from}
              </strong>
              {' – '}
              <strong>
                {pagination.to}
              </strong>
              {' of '}
              <strong>
                {pagination.total}
              </strong>
              {' quote requests'}
            </p>


            <div
              className="
                flex
                flex-wrap
                items-center
                gap-1.5
              "
            >
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={
                  pagination.currentPage <=
                  1
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
              >
                <ChevronLeft
                  size={16}
                />
              </Button>


              {pageNumbers.map(
                pageNumber => (
                  <Button
                    key={
                      pageNumber
                    }
                    type="button"
                    size="sm"
                    variant={
                      pageNumber ===
                      pagination.currentPage
                        ? 'default'
                        : 'outline'
                    }
                    className="
                      min-w-9
                    "
                    onClick={() =>
                      setPage(
                        pageNumber
                      )
                    }
                  >
                    {pageNumber}
                  </Button>
                )
              )}


              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={
                  pagination.currentPage >=
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
              >
                <ChevronRight
                  size={16}
                />
              </Button>
            </div>
          </div>
        )}

      </Card>


      {/* =========================================================
          QUOTE DETAILS
      ========================================================= */}

      <Sheet
        open={
          drawerOpen
        }
        onOpenChange={
          open => {
            setDrawerOpen(
              open
            );


            if (!open) {
              setSelectedQuote(
                null
              );
            }
          }
        }
      >
        <SheetContent
          className="
            w-full

            overflow-y-auto

            p-6

            sm:max-w-[620px]
            sm:p-8
          "
        >
          {viewing ? (
            <div
              className="
                flex

                min-h-[400px]

                items-center
                justify-center

                gap-3
              "
            >
              <Loader2
                size={22}
                className="
                  animate-spin
                  text-primary
                "
              />

              Loading quote…

            </div>

          ) : selectedQuote ? (
            <>
              <SheetHeader>
                <div
                  className="
                    mb-3
                  "
                >
                  <QuoteStatusBadge
                    status={
                      selectedQuote.status
                    }
                  />
                </div>


                <SheetTitle
                  className="
                    text-2xl
                    tracking-[-0.03em]
                  "
                >
                  {selectedQuote.name ||
                    'Quote request'}
                </SheetTitle>


                <SheetDescription>
                  Quote request #
                  {quoteId(
                    selectedQuote
                  )}
                </SheetDescription>
              </SheetHeader>


              {/* =================================================
                  STATUS ACTIONS
              ================================================= */}

              <div
                className="
                  mt-6

                  rounded-xl

                  border
                  border-slate-200

                  bg-slate-50

                  p-4
                "
              >
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide

                    text-muted-foreground
                  "
                >
                  Quote status
                </p>


                <div
                  className="
                    mt-3

                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      quoteStatus(
                        selectedQuote
                      ) === 'new'
                        ? 'default'
                        : 'outline'
                    }
                    disabled={
                      updatingStatus
                    }
                    onClick={() =>
                      changeQuoteStatus(
                        'new'
                      )
                    }
                  >
                    New
                  </Button>


                  <Button
                    type="button"
                    size="sm"
                    variant={
                      quoteStatus(
                        selectedQuote
                      ) ===
                      'contacted'
                        ? 'default'
                        : 'outline'
                    }
                    disabled={
                      updatingStatus
                    }
                    onClick={() =>
                      changeQuoteStatus(
                        'contacted'
                      )
                    }
                  >
                    {updatingStatus && (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    )}

                    Contacted
                  </Button>
                </div>
              </div>


              <div
                className="
                  mt-7
                  space-y-5
                "
              >

                {/* Customer */}

                <InfoBlock
                  label="Customer"
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <UserRound
                      size={15}
                      className="
                        text-primary
                      "
                    />

                    {selectedQuote.name ||
                      '—'}
                  </div>
                </InfoBlock>


                {/* Email */}

                <InfoBlock
                  label="Email"
                >
                  <a
                    href={
                      selectedQuote.email
                        ? `mailto:${selectedQuote.email}`
                        : undefined
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2

                      break-all

                      text-primary
                    "
                  >
                    <Mail
                      size={15}
                    />

                    {selectedQuote.email ||
                      '—'}
                  </a>
                </InfoBlock>


                {/* Mobile */}

                <InfoBlock
                  label="Mobile"
                >
                  {selectedQuote.mobile ? (
                    <a
                      href={`tel:${String(
                        selectedQuote.mobile
                      ).replace(
                        /\s+/g,
                        ''
                      )}`}
                      className="
                        inline-flex
                        items-center
                        gap-2

                        text-primary
                      "
                    >
                      <Phone
                        size={15}
                      />

                      {selectedQuote.mobile}
                    </a>
                  ) : (
                    '—'
                  )}
                </InfoBlock>


                {/* Service */}

                <InfoBlock
                  label="Service"
                >
                  {friendlyValue(
                    selectedQuote.service
                  )}
                </InfoBlock>


                {/* Postcode */}

                <InfoBlock
                  label="Postcode"
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <MapPin
                      size={15}
                      className="
                        text-primary
                      "
                    />

                    {selectedQuote.postcode ||
                      '—'}
                  </div>
                </InfoBlock>


                {/* Address */}

                <InfoBlock
                  label="Property address"
                >
                  {selectedQuote.property_address ||
                    selectedQuote.propertyAddress ||
                    'Not supplied'}
                </InfoBlock>


                {/* Property */}

                <InfoBlock
                  label="Property information"
                >
                  <div
                    className="
                      grid

                      grid-cols-2

                      gap-3
                    "
                  >
                    <PropertyStat
                      label="Type"
                      value={
                        friendlyValue(
                          selectedQuote.property_type ||
                          selectedQuote.propertyType
                        )
                      }
                    />

                    <PropertyStat
                      label="Bedrooms"
                      value={
                        selectedQuote.bedrooms
                      }
                    />

                    <PropertyStat
                      label="Bathrooms"
                      value={
                        selectedQuote.bathrooms
                      }
                    />

                    <PropertyStat
                      label="Kitchens"
                      value={
                        selectedQuote.kitchens
                      }
                    />

                    <PropertyStat
                      label="Living / Dining"
                      value={
                        selectedQuote.living_dining_areas ??
                        selectedQuote.livingDining
                      }
                    />

                    <PropertyStat
                      label="Laundry"
                      value={
                        selectedQuote.laundry_rooms ??
                        selectedQuote.laundry
                      }
                    />
                  </div>
                </InfoBlock>


                {/* Details */}

                <InfoBlock
                  label="Customer requirements"
                >
                  <div
                    className="
                      whitespace-pre-wrap

                      rounded-xl

                      bg-slate-50

                      p-4
                    "
                  >
                    {selectedQuote.details ||
                      selectedQuote.requirements ||
                      'No additional details provided.'}
                  </div>
                </InfoBlock>


                {/* Photos */}

                <InfoBlock
                  label="Photos"
                >
                  {selectedPhotos.length ? (
                    <div
                      className="
                        grid

                        grid-cols-2

                        gap-3
                      "
                    >
                      {selectedPhotos.map(
                        (
                          photo,
                          index
                        ) => (
                          <a
                            key={`${photo}-${index}`}
                            href={
                              photo
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              group

                              relative

                              overflow-hidden

                              rounded-xl

                              border
                              border-slate-200

                              bg-slate-100
                            "
                          >
                            <img
                              src={
                                photo
                              }
                              alt={`Quote attachment ${index + 1}`}
                              className="
                                aspect-square

                                h-full
                                w-full

                                object-cover

                                transition

                                group-hover:scale-[1.02]
                              "
                            />
                          </a>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      className="
                        flex
                        items-center
                        gap-2

                        text-muted-foreground
                      "
                    >
                      <ImageIcon
                        size={16}
                      />

                      No photos uploaded.
                    </div>
                  )}
                </InfoBlock>


                {/* Actions */}

                <div
                  className="
                    grid

                    gap-3

                    pt-2

                    sm:grid-cols-2
                  "
                >
                  {selectedQuote.email && (
                    <Button
                      asChild
                      className="
                        h-11
                      "
                    >
                      <a
                        href={`mailto:${selectedQuote.email}`}
                      >
                        <Mail
                          size={15}
                        />

                        Contact customer
                      </a>
                    </Button>
                  )}


                  <Button
                    type="button"
                    variant="outline"
                    className="
                      h-11

                      border-red-200
                      text-red-600

                      hover:bg-red-50
                      hover:text-red-700
                    "
                    onClick={() =>
                      askDelete([
                        quoteId(
                          selectedQuote
                        ),
                      ])
                    }
                  >
                    <Trash2
                      size={15}
                    />

                    Delete request
                  </Button>
                </div>

              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>


      {/* =========================================================
          DELETE CONFIRMATION
      ========================================================= */}

      <AlertDialog
        open={
          deleteDialogOpen
        }
        onOpenChange={
          open => {
            if (
              deleting
            ) {
              return;
            }


            setDeleteDialogOpen(
              open
            );


            if (!open) {
              setDeleteIds(
                []
              );
            }
          }
        }
      >
        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              {deleteIds.length >
              1
                ? `Delete ${deleteIds.length} quote requests?`
                : 'Delete this quote request?'}
            </AlertDialogTitle>


            <AlertDialogDescription>
              {deleteIds.length >
              1
                ? 'The selected quote requests will be permanently deleted. This action cannot be undone.'
                : 'This quote request will be permanently deleted. This action cannot be undone.'}
            </AlertDialogDescription>

          </AlertDialogHeader>


          <AlertDialogFooter>

            <AlertDialogCancel
              disabled={
                deleting
              }
            >
              Cancel
            </AlertDialogCancel>


            <AlertDialogAction
              disabled={
                deleting
              }
              onClick={
                event => {
                  event.preventDefault();

                  confirmDelete();
                }
              }
              className="
                bg-red-600
                text-white

                hover:bg-red-700
              "
            >
              {deleting ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Deleting…
                </>
              ) : (
                <>
                  <Trash2
                    size={15}
                  />

                  Delete
                </>
              )}
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}


/*
|--------------------------------------------------------------------------
| PROPERTY STAT
|--------------------------------------------------------------------------
*/

function PropertyStat({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl

        border
        border-slate-200

        bg-slate-50

        p-3
      "
    >
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-wide

          text-muted-foreground
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1

          text-sm
          font-semibold

          text-[#102d43]
        "
      >
        {value ===
          undefined ||
        value ===
          null ||
        value ===
          ''
          ? '—'
          : value}
      </p>
    </div>
  );
}


export default QuotesPage;
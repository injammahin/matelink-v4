import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Mail,
  MailOpen,
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
  deleteContactMessages,
  getContactMessage,
  getContactMessages,
  markContactMessageRead,
  markContactMessagesRead,
} from '@/modules/admin/api/contactMessagesApi';


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
      'All messages',
  },

  {
    value:
      'new',

    label:
      'New',
  },

  {
    value:
      'read',

    label:
      'Read',
  },
];


/*
|--------------------------------------------------------------------------
| ADMIN HEADING
|--------------------------------------------------------------------------
*/

function AdminHeading({
  eyebrow =
    'Customer communication',

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
| FORMAT DATE
|--------------------------------------------------------------------------
*/

function formatDateTime(
  value
) {
  if (!value) {
    return '—';
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(
      value
    );
  }


  return date.toLocaleString(
    'en-AU',
    {
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',

      hour:
        'numeric',

      minute:
        '2-digit',
    }
  );
}


/*
|--------------------------------------------------------------------------
| NORMALIZE STATUS
|--------------------------------------------------------------------------
*/

function messageStatus(
  message
) {
  return String(
    message?.status ||
    'new'
  )
    .trim()
    .toLowerCase();
}


/*
|--------------------------------------------------------------------------
| GET ID
|--------------------------------------------------------------------------
*/

function messageId(
  message
) {
  return Number(
    message?.id
  );
}


/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function ContactStatusBadge({
  status,
}) {
  const normalized =
    String(
      status || 'new'
    )
      .toLowerCase();


  const isRead =
    normalized === 'read';


  return (
    <span
      className={`
        inline-flex

        items-center

        gap-1.5

        rounded-full

        border

        px-2.5
        py-1

        text-[11px]
        font-semibold

        ${
          isRead
            ? `
              border-slate-200
              bg-slate-50
              text-slate-600
            `
            : `
              border-[#087e83]/20
              bg-[#edf6f5]
              text-[#087e83]
            `
        }
      `}
    >
      {isRead ? (
        <MailOpen
          size={12}
        />
      ) : (
        <Mail
          size={12}
        />
      )}

      {isRead
        ? 'Read'
        : 'New'}
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
      checked={checked}
      onChange={onChange}
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
| MESSAGE INFO
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

          whitespace-pre-line

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
| CONTACT MESSAGES ADMIN PAGE
|--------------------------------------------------------------------------
*/

function ContactMessagesAdminPage() {

  /*
  |--------------------------------------------------------------------------
  | LIST STATE
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
  | FILTER STATE
  |--------------------------------------------------------------------------
  */

  const [
    searchInput,
    setSearchInput,
  ] = useState('');


  const [
    search,
    setSearch,
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
  | SELECTION
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
    selectedMessage,
    setSelectedMessage,
  ] = useState(null);


  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);


  const [
    viewing,
    setViewing,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | DELETE CONFIRMATION
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
  | MARK READ
  |--------------------------------------------------------------------------
  */

  const [
    markingRead,
    setMarkingRead,
  ] = useState(false);


  const [
    markingAllRead,
    setMarkingAllRead,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOAD CONTACT MESSAGES
  |--------------------------------------------------------------------------
  */

  const loadMessages =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (
          silent
        ) {
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
            await getContactMessages({
              status:
                statusFilter,

              search,

              page,

              perPage,
            });


          /*
           * If we deleted the last item on a page,
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
            'Load contact messages error:',
            error
          );


          toast.error(
            error?.message ||
            'Unable to load contact messages.'
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
        search,
        page,
        perPage,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | INITIAL / FILTER LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadMessages();
  }, [
    loadMessages,
  ]);


  /*
  |--------------------------------------------------------------------------
  | SEARCH DEBOUNCE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          const next =
            searchInput.trim();


          setPage(
            1
          );


          setSearch(
            next
          );


          setSelectedIds(
            new Set()
          );
        },
        350
      );


    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    searchInput,
  ]);


  /*
  |--------------------------------------------------------------------------
  | CURRENT PAGE IDS
  |--------------------------------------------------------------------------
  */

  const currentPageIds =
    useMemo(
      () =>
        rows
          .map(
            messageId
          )
          .filter(
            Boolean
          ),
      [
        rows,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | ALL CURRENT PAGE SELECTED
  |--------------------------------------------------------------------------
  */

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
  | NEW COUNT ON CURRENT PAGE
  |--------------------------------------------------------------------------
  */

  const pageNewCount =
    useMemo(
      () =>
        rows.filter(
          item =>
            messageStatus(
              item
            ) ===
            'new'
        ).length,
      [
        rows,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | TOGGLE ONE
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


  /*
  |--------------------------------------------------------------------------
  | SELECT ALL CURRENT PAGE
  |--------------------------------------------------------------------------
  */

  function toggleSelectAllCurrent() {
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
  | OPEN MESSAGE
  |--------------------------------------------------------------------------
  |
  | Opening the message automatically marks it as read.
  |
  */

  async function openMessage(
    id
  ) {
    setDrawerOpen(
      true
    );

    setViewing(
      true
    );

    setSelectedMessage(
      null
    );


    try {
      let message =
        await getContactMessage(
          id
        );


      /*
       * Automatically mark as read.
       */
      if (
        messageStatus(
          message
        ) === 'new'
      ) {
        const updated =
          await markContactMessageRead(
            id
          );


        message = {
          ...message,
          ...updated,
          status:
            'read',
        };


        /*
         * Update row without reloading everything.
         */
        setRows(
          previous =>
            previous.map(
              item =>
                messageId(
                  item
                ) ===
                Number(id)
                  ? {
                      ...item,
                      status:
                        'read',
                    }
                  : item
            )
        );
      }


      setSelectedMessage(
        message
      );
    } catch (error) {
      console.error(
        'Open contact message error:',
        error
      );


      toast.error(
        error?.message ||
        'Unable to load this contact message.'
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
  | MARK SELECTED READ
  |--------------------------------------------------------------------------
  */

  async function markSelectedRead() {
    const ids =
      Array.from(
        selectedIds
      );


    if (
      !ids.length
    ) {
      return;
    }


    setMarkingRead(
      true
    );


    try {
      await markContactMessagesRead(
        ids
      );


      setRows(
        previous =>
          previous.map(
            item =>
              selectedIds.has(
                messageId(
                  item
                )
              )
                ? {
                    ...item,
                    status:
                      'read',
                  }
                : item
          )
      );


      toast.success(
        `${
          ids.length
        } message${
          ids.length === 1
            ? ''
            : 's'
        } marked as read.`
      );


      setSelectedIds(
        new Set()
      );


      await loadMessages({
        silent:
          true,
      });
    } catch (error) {
      console.error(
        'Mark selected read error:',
        error
      );


      toast.error(
        error?.message ||
        'Unable to mark selected messages as read.'
      );
    } finally {
      setMarkingRead(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | MARK ALL READ
  |--------------------------------------------------------------------------
  |
  | Your API only exposes PATCH /{id}.
  |
  | We repeatedly request page 1 of "new" messages,
  | mark those as read, then request page 1 again.
  |
  | This means it works across ALL pages, not only
  | the page currently visible to the admin.
  |
  */

  async function markAllRead() {
    setMarkingAllRead(
      true
    );


    let changed =
      0;

    let safetyCounter =
      0;


    try {
      while (
        safetyCounter <
        100
      ) {
        safetyCounter +=
          1;


        const batch =
          await getContactMessages({
            status:
              'new',

            search:
              '',

            page:
              1,

            perPage:
              30,
          });


        const unreadIds =
          batch.items
            .filter(
              item =>
                messageStatus(
                  item
                ) ===
                'new'
            )
            .map(
              messageId
            )
            .filter(
              Boolean
            );


        if (
          !unreadIds.length
        ) {
          break;
        }


        await markContactMessagesRead(
          unreadIds
        );


        changed +=
          unreadIds.length;


        /*
         * If fewer than 30 were returned,
         * that was the final unread batch.
         */
        if (
          unreadIds.length <
          30
        ) {
          break;
        }
      }


      if (
        changed
      ) {
        toast.success(
          `${
            changed
          } message${
            changed === 1
              ? ''
              : 's'
          } marked as read.`
        );
      } else {
        toast.info(
          'There are no unread messages.'
        );
      }


      setSelectedIds(
        new Set()
      );


      await loadMessages({
        silent:
          true,
      });
    } catch (error) {
      console.error(
        'Mark all read error:',
        error
      );


      toast.error(
        error?.message ||
        'Unable to mark all messages as read.'
      );
    } finally {
      setMarkingAllRead(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | ASK DELETE
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


  /*
  |--------------------------------------------------------------------------
  | DELETE CONFIRMED
  |--------------------------------------------------------------------------
  */

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
      await deleteContactMessages(
        deleteIds
      );


      const deletedSet =
        new Set(
          deleteIds
        );


      /*
       * Close drawer if its message was deleted.
       */
      if (
        selectedMessage &&
        deletedSet.has(
          messageId(
            selectedMessage
          )
        )
      ) {
        setDrawerOpen(
          false
        );

        setSelectedMessage(
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
        `${
          deleteIds.length
        } contact message${
          deleteIds.length ===
          1
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


      await loadMessages({
        silent:
          true,
      });
    } catch (error) {
      console.error(
        'Delete contact message error:',
        error
      );


      toast.error(
        error?.message ||
        'Unable to delete the selected messages.'
      );
    } finally {
      setDeleting(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | CHANGE STATUS FILTER
  |--------------------------------------------------------------------------
  */

  function changeStatus(
    event
  ) {
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


  /*
  |--------------------------------------------------------------------------
  | CHANGE PER PAGE
  |--------------------------------------------------------------------------
  */

  function changePerPage(
    event
  ) {
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


  /*
  |--------------------------------------------------------------------------
  | PAGE NUMBERS
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
        title="Contact messages"
        description="Review messages submitted from the website, keep unread enquiries visible, and remove messages that are no longer required."
      >
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            loadMessages({
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


        <Button
          type="button"
          variant="outline"
          onClick={
            markAllRead
          }
          disabled={
            markingAllRead ||
            loading
          }
        >
          {markingAllRead ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <CheckCheck
              size={15}
            />
          )}

          Mark all read
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

          {/* Search */}

          <div>
            <Label
              htmlFor="contact-message-search"
              className="
                mb-2
                block
                text-xs
                font-semibold
              "
            >
              Search messages
            </Label>

            <div className="relative">
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
                id="contact-message-search"
                type="search"
                placeholder="Search name, email, mobile, topic or message..."
                value={
                  searchInput
                }
                onChange={
                  event =>
                    setSearchInput(
                      event.target.value
                    )
                }
                className="
                  h-11

                  bg-white

                  pl-10
                "
              />

              {searchInput && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() =>
                    setSearchInput(
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
              htmlFor="contact-status"
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
              id="contact-status"
              value={
                statusFilter
              }
              onChange={
                changeStatus
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

                focus:border-primary
                focus:ring-2
                focus:ring-primary/10
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
              htmlFor="contact-per-page"
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
              id="contact-per-page"
              value={
                perPage
              }
              onChange={
                changePerPage
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

                focus:border-primary
                focus:ring-2
                focus:ring-primary/10
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
          BULK ACTION BAR
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
              message
              {selectedIds.size ===
              1
                ? ''
                : 's'}{' '}
              selected
            </p>

            <p
              className="
                mt-1

                text-xs

                text-slate-500
              "
            >
              Selection is kept while you move between pages.
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
                markSelectedRead
              }
              disabled={
                markingRead
              }
            >
              {markingRead ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Check
                  size={15}
                />
              )}

              Mark selected read
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
          LIST CARD
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

        {/* =======================================================
            TOP INFO BAR
        ======================================================= */}

        <div
          className="
            flex
            flex-col

            gap-3

            border-b

            px-5
            py-4

            sm:flex-row
            sm:items-center
            sm:justify-between

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
              Customer enquiries
            </p>

            <p
              className="
                mt-1
                text-xs
                text-muted-foreground
              "
            >
              {pagination.total}{' '}
              result
              {pagination.total ===
              1
                ? ''
                : 's'}
              {' · '}
              {pageNewCount}{' '}
              unread on this page
            </p>
          </div>


          {refreshing && (
            <div
              className="
                flex
                items-center
                gap-2

                text-xs
                text-muted-foreground
              "
            >
              <Loader2
                size={14}
                className="animate-spin"
              />

              Updating…
            </div>
          )}
        </div>


        {/* =======================================================
            LOADING
        ======================================================= */}

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
              Loading contact messages…
            </span>
          </div>
        ) : rows.length ? (

          /* =====================================================
              TABLE
          ===================================================== */

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

                  {/* Select all */}

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
                        toggleSelectAllCurrent
                      }
                      ariaLabel="Select all messages on this page"
                    />
                  </TableHead>


                  <TableHead>
                    Customer
                  </TableHead>


                  <TableHead>
                    Contact
                  </TableHead>


                  <TableHead>
                    Topic
                  </TableHead>


                  <TableHead>
                    Message
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
                  message => {
                    const id =
                      messageId(
                        message
                      );

                    const status =
                      messageStatus(
                        message
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
                        className={`
                          transition

                          ${
                            status ===
                            'new'
                              ? 'bg-[#fbfefe]'
                              : ''
                          }

                          ${
                            selected
                              ? 'bg-[#edf6f5]/70'
                              : ''
                          }
                        `}
                      >

                        {/* Checkbox */}

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
                            ariaLabel={`Select message from ${
                              message.name ||
                              'customer'
                            }`}
                          />
                        </TableCell>


                        {/* Customer */}

                        <TableCell
                          className="
                            min-w-[170px]
                            py-5
                            align-top
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
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
                                {message.name ||
                                  'Unknown customer'}
                              </p>

                              <p
                                className="
                                  mt-1

                                  text-xs

                                  text-muted-foreground
                                "
                              >
                                ID #{id}
                              </p>
                            </div>
                          </div>
                        </TableCell>


                        {/* Contact */}

                        <TableCell
                          className="
                            min-w-[220px]
                            py-5
                            align-top
                          "
                        >
                          <a
                            href={
                              message.email
                                ? `mailto:${message.email}`
                                : undefined
                            }
                            className="
                              block

                              break-all

                              text-sm
                              font-medium

                              text-[#102d43]

                              hover:text-primary
                            "
                          >
                            {message.email ||
                              '—'}
                          </a>

                          <p
                            className="
                              mt-1.5

                              text-xs

                              text-muted-foreground
                            "
                          >
                            {message.mobile ||
                              'No mobile'}
                          </p>
                        </TableCell>


                        {/* Topic */}

                        <TableCell
                          className="
                            min-w-[140px]
                            py-5
                            align-top
                          "
                        >
                          <span
                            className="
                              inline-flex

                              rounded-full

                              bg-slate-100

                              px-2.5
                              py-1

                              text-xs
                              font-medium

                              capitalize

                              text-slate-600
                            "
                          >
                            {String(
                              message.topic ||
                              'general'
                            )
                              .replace(
                                /_/g,
                                ' '
                              )}
                          </span>
                        </TableCell>


                        {/* Message */}

                        <TableCell
                          className="
                            min-w-[250px]
                            max-w-[340px]
                            py-5
                            align-top
                          "
                        >
                          <p
                            className={`
                              line-clamp-2

                              text-sm
                              leading-6

                              ${
                                status ===
                                'new'
                                  ? 'font-medium text-[#102d43]'
                                  : 'text-slate-500'
                              }
                            `}
                          >
                            {message.message ||
                              '—'}
                          </p>
                        </TableCell>





                        {/* Status */}

                        <TableCell
                          className="
                            py-5
                            align-top
                          "
                        >
                          <ContactStatusBadge
                            status={
                              status
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
                                openMessage(
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
                              aria-label="Delete contact message"
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

          /* =====================================================
              EMPTY
          ===================================================== */

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
              <Mail
                size={20}
              />
            </div>

            <h3
              className="
                mt-4

                text-base
                font-semibold
              "
            >
              No contact messages found.
            </h3>

            <p
              className="
                mt-2

                max-w-md

                text-sm
                leading-6

                text-muted-foreground
              "
            >
              Try changing the search or status filter. New website contact submissions will appear here.
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
              {' messages'}
            </p>


            <div
              className="
                flex
                flex-wrap
                items-center
                gap-1.5
              "
            >

              {/* Previous */}

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


              {/* Pages */}

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


              {/* Next */}

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
          VIEW SINGLE MESSAGE DRAWER
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
              setSelectedMessage(
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

            sm:max-w-[560px]
            sm:p-8
          "
        >

          {viewing ? (
            <div
              className="
                flex

                min-h-[360px]

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
                Loading message…
              </span>
            </div>
          ) : selectedMessage ? (
            <>

              <SheetHeader>

                <div
                  className="
                    mb-3
                  "
                >
                  <ContactStatusBadge
                    status={
                      selectedMessage.status
                    }
                  />
                </div>

                <SheetTitle
                  className="
                    text-2xl
                    tracking-[-0.03em]
                  "
                >
                  {selectedMessage.name ||
                    'Contact enquiry'}
                </SheetTitle>

                <SheetDescription>
                  Submitted{' '}
                  {formatDateTime(
                    selectedMessage.created_at ||
                    selectedMessage.createdAt
                  )}
                </SheetDescription>

              </SheetHeader>


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
                        shrink-0
                        text-primary
                      "
                    />

                    {selectedMessage.name ||
                      '—'}
                  </div>
                </InfoBlock>


                {/* Email */}

                <InfoBlock
                  label="Email"
                >
                  <a
                    href={
                      selectedMessage.email
                        ? `mailto:${selectedMessage.email}`
                        : undefined
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2

                      break-all

                      font-medium

                      text-primary
                    "
                  >
                    <Mail
                      size={15}
                    />

                    {selectedMessage.email ||
                      '—'}
                  </a>
                </InfoBlock>


                {/* Mobile */}

                <InfoBlock
                  label="Mobile"
                >
                  {selectedMessage.mobile ? (
                    <a
                      href={`tel:${String(
                        selectedMessage.mobile
                      ).replace(
                        /\s+/g,
                        ''
                      )}`}
                      className="
                        inline-flex
                        items-center
                        gap-2

                        font-medium

                        text-primary
                      "
                    >
                      <Phone
                        size={15}
                      />

                      {selectedMessage.mobile}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </InfoBlock>


                {/* Topic */}

                <InfoBlock
                  label="Topic"
                >
                  <span
                    className="
                      capitalize
                    "
                  >
                    {String(
                      selectedMessage.topic ||
                      'general'
                    ).replace(
                      /_/g,
                      ' '
                    )}
                  </span>
                </InfoBlock>


                {/* Message */}

                <InfoBlock
                  label="Message"
                >
                  <div
                    className="
                      rounded-xl

                      bg-slate-50

                      p-4

                      whitespace-pre-wrap
                    "
                  >
                    {selectedMessage.message ||
                      'No message provided.'}
                  </div>
                </InfoBlock>


                {/* Received */}

                <InfoBlock
                  label="Received"
                >
                  {formatDateTime(
                    selectedMessage.created_at ||
                    selectedMessage.createdAt
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

                  {selectedMessage.email && (
                    <Button
                      asChild
                      className="
                        h-11
                      "
                    >
                      <a
                        href={`mailto:${selectedMessage.email}`}
                      >
                        <Mail
                          size={15}
                        />

                        Reply by email
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
                        messageId(
                          selectedMessage
                        ),
                      ])
                    }
                  >
                    <Trash2
                      size={15}
                    />

                    Delete message
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
                ? `Delete ${deleteIds.length} contact messages?`
                : 'Delete this contact message?'}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleteIds.length >
              1
                ? 'The selected contact messages will be permanently deleted. This action cannot be undone.'
                : 'This contact message will be permanently deleted. This action cannot be undone.'}
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
                  /*
                   * Prevent AlertDialog from
                   * closing before async delete.
                   */
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


export default ContactMessagesAdminPage;
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  FileQuestion,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
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
  Card,
} from '@/shared/components/ui/card';

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
  createAdminFaq,
  deleteAdminFaqs,
  getAdminFaq,
  getAdminFaqs,
  setAdminFaqPublished,
  updateAdminFaq,
} from '@/modules/admin/api/faqsApi';


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function faqPublished(
  faq
) {
  return (
    faq?.is_published === true ||
    faq?.is_published === 1 ||
    faq?.is_published === '1'
  );
}


function normalizeErrors(
  error
) {
  const source =
    error?.errors ||
    error?.data?.errors ||
    {};


  const result =
    {};


  Object.entries(
    source
  ).forEach(
    ([field, messages]) => {
      result[field] =
        Array.isArray(
          messages
        )
          ? messages[0]
          : String(
              messages || ''
            );
    }
  );


  return result;
}


function pageNumbers(
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
| STATUS
|--------------------------------------------------------------------------
*/

function PublishBadge({
  published,
}) {
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
          published
            ? `
              border-emerald-200
              bg-emerald-50
              text-emerald-700
            `
            : `
              border-amber-200
              bg-amber-50
              text-amber-700
            `
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5

          rounded-full

          ${
            published
              ? 'bg-emerald-500'
              : 'bg-amber-500'
          }
        `}
      />

      {published
        ? 'Published'
        : 'Draft'}
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

        accent-[#087e83]
      "
    />
  );
}


/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

export default function FaqsAdminPage() {

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [
    faqs,
    setFaqs,
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
    searchInput,
    setSearchInput,
  ] = useState('');


  const [
    search,
    setSearch,
  ] = useState('');


  const [
    publishFilter,
    setPublishFilter,
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
    pagination,
    setPagination,
  ] = useState({
    currentPage:
      1,

    lastPage:
      1,

    perPage:
      15,

    total:
      0,

    from:
      0,

    to:
      0,
  });


  /*
  |--------------------------------------------------------------------------
  | SELECTED ROWS
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
  | FORM DRAWER
  |--------------------------------------------------------------------------
  */

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);


  const [
    formMode,
    setFormMode,
  ] = useState(
    'create'
  );


  const [
    editingId,
    setEditingId,
  ] = useState(null);


  const [
    loadingFaq,
    setLoadingFaq,
  ] = useState(false);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    form,
    setForm,
  ] = useState({
    question:
      '',

    answer:
      '',

    is_published:
      true,
  });


  const [
    formErrors,
    setFormErrors,
  ] = useState({});


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
  | QUICK STATUS
  |--------------------------------------------------------------------------
  */

  const [
    statusChangingId,
    setStatusChangingId,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | LOAD FAQS
  |--------------------------------------------------------------------------
  */

  const loadFaqs =
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
            await getAdminFaqs({
              published:
                publishFilter,

              search,

              page,
            });


          /*
           * If current page becomes empty after delete,
           * move back one page.
           */
          if (
            result.items.length === 0 &&
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


          setFaqs(
            result.items
          );


          setPagination({
            currentPage:
              result.currentPage,

            lastPage:
              result.lastPage,

            perPage:
              result.perPage,

            total:
              result.total,

            from:
              result.from,

            to:
              result.to,
          });

        } catch (error) {

          console.error(
            'Load FAQ error:',
            error
          );


          toast.error(
            error?.message ||
            'Unable to load FAQs.'
          );


          setFaqs(
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
        page,
        publishFilter,
        search,
      ]
    );


  useEffect(() => {
    loadFaqs();
  }, [
    loadFaqs,
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
          setSearch(
            searchInput.trim()
          );

          setPage(
            1
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

  const currentIds =
    useMemo(
      () =>
        faqs
          .map(
            faq =>
              Number(
                faq.id
              )
          )
          .filter(
            Boolean
          ),
      [
        faqs,
      ]
    );


  const allSelected =
    currentIds.length >
      0 &&
    currentIds.every(
      id =>
        selectedIds.has(
          id
        )
    );


  /*
  |--------------------------------------------------------------------------
  | SELECT
  |--------------------------------------------------------------------------
  */

  function toggleSelect(
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
          allSelected
        ) {
          currentIds.forEach(
            id =>
              next.delete(
                id
              )
          );

        } else {

          currentIds.forEach(
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
  | CREATE
  |--------------------------------------------------------------------------
  */

  function openCreate() {
    setFormMode(
      'create'
    );


    setEditingId(
      null
    );


    setForm({
      question:
        '',

      answer:
        '',

      is_published:
        true,
    });


    setFormErrors(
      {}
    );


    setFormOpen(
      true
    );
  }


  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  async function openEdit(
    id
  ) {
    setFormMode(
      'edit'
    );


    setEditingId(
      id
    );


    setFormErrors(
      {}
    );


    setFormOpen(
      true
    );


    setLoadingFaq(
      true
    );


    try {
      const faq =
        await getAdminFaq(
          id
        );


      setForm({
        question:
          faq?.question ||
          '',

        answer:
          faq?.answer ||
          '',

        is_published:
          faqPublished(
            faq
          ),
      });

    } catch (error) {

      toast.error(
        error?.message ||
        'Unable to load FAQ.'
      );


      setFormOpen(
        false
      );

    } finally {

      setLoadingFaq(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | FORM FIELD
  |--------------------------------------------------------------------------
  */

  function updateForm(
    field,
    value
  ) {
    setForm(
      previous => ({
        ...previous,

        [field]:
          value,
      })
    );


    setFormErrors(
      previous => ({
        ...previous,

        [field]:
          '',

        form:
          '',
      })
    );
  }


  /*
  |--------------------------------------------------------------------------
  | VALIDATE
  |--------------------------------------------------------------------------
  */

  function validateForm() {
    const errors =
      {};


    if (
      form.question
        .trim()
        .length < 5
    ) {
      errors.question =
        'Enter a clear FAQ question.';
    }


    if (
      form.answer
        .trim()
        .length < 5
    ) {
      errors.answer =
        'Enter the FAQ answer.';
    }


    return errors;
  }


  /*
  |--------------------------------------------------------------------------
  | SAVE CREATE / UPDATE
  |--------------------------------------------------------------------------
  */

  async function saveFaq(
    event
  ) {
    event.preventDefault();


    if (
      saving
    ) {
      return;
    }


    const validationErrors =
      validateForm();


    if (
      Object.keys(
        validationErrors
      ).length
    ) {
      setFormErrors(
        validationErrors
      );

      return;
    }


    setSaving(
      true
    );


    setFormErrors(
      {}
    );


    try {

      if (
        formMode ===
        'create'
      ) {
        await createAdminFaq(
          form
        );


        toast.success(
          'FAQ created successfully.'
        );

      } else {

        await updateAdminFaq(
          editingId,
          form
        );


        toast.success(
          'FAQ updated successfully.'
        );
      }


      setFormOpen(
        false
      );


      await loadFaqs({
        silent:
          true,
      });

    } catch (error) {

      if (
        error?.status ===
        422
      ) {
        const errors =
          normalizeErrors(
            error
          );


        setFormErrors({
          ...errors,

          form:
            Object.keys(
              errors
            ).length
              ? ''
              : error.message,
        });

        return;
      }


      setFormErrors({
        form:
          error?.message ||
          'Unable to save FAQ.',
      });

    } finally {

      setSaving(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | QUICK PUBLISH TOGGLE
  |--------------------------------------------------------------------------
  */

  async function togglePublished(
    faq
  ) {
    const id =
      Number(
        faq.id
      );


    if (!id) {
      return;
    }


    const nextPublished =
      !faqPublished(
        faq
      );


    setStatusChangingId(
      id
    );


    try {
      await setAdminFaqPublished(
        faq,
        nextPublished
      );


      setFaqs(
        previous =>
          previous.map(
            item =>
              Number(
                item.id
              ) === id
                ? {
                    ...item,

                    is_published:
                      nextPublished,
                  }
                : item
          )
      );


      toast.success(
        nextPublished
          ? 'FAQ published.'
          : 'FAQ moved to draft.'
      );


      /*
       * If filtering only published/draft,
       * refresh because item may disappear.
       */
      if (
        publishFilter !==
        'all'
      ) {
        await loadFaqs({
          silent:
            true,
        });
      }

    } catch (error) {

      toast.error(
        error?.message ||
        'Unable to change FAQ status.'
      );

    } finally {

      setStatusChangingId(
        null
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
      return;
    }


    setDeleteIds(
      normalizedIds
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
      await deleteAdminFaqs(
        deleteIds
      );


      const deletedSet =
        new Set(
          deleteIds
        );


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


      setFaqs(
        previous =>
          previous.filter(
            faq =>
              !deletedSet.has(
                Number(
                  faq.id
                )
              )
          )
      );


      toast.success(
        deleteIds.length === 1
          ? 'FAQ deleted successfully.'
          : `${deleteIds.length} FAQs deleted successfully.`
      );


      setDeleteDialogOpen(
        false
      );


      setDeleteIds(
        []
      );


      await loadFaqs({
        silent:
          true,
      });

    } catch (error) {

      toast.error(
        error?.message ||
        'Unable to delete FAQ.'
      );

    } finally {

      setDeleting(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | PAGE NUMBERS
  |--------------------------------------------------------------------------
  */

  const visiblePages =
    pageNumbers(
      pagination.currentPage,
      pagination.lastPage
    );


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <div
        className="
          flex

          flex-col

          gap-5

          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <p
            className="
              text-xs

              font-semibold

              uppercase

              tracking-[0.12em]

              text-[#087e83]
            "
          >
            Website content
          </p>


          <h1
            className="
              mt-3

              text-3xl

              font-semibold

              tracking-[-0.04em]

              text-[#102d43]

              lg:text-4xl
            "
          >
            FAQs
          </h1>


          <p
            className="
              mt-3

              max-w-2xl

              text-sm
              leading-6

              text-slate-500
            "
          >
            Create, update and publish frequently asked questions shown on the Matelink website.
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
            onClick={() =>
              loadFaqs({
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
            onClick={
              openCreate
            }
          >
            <Plus
              size={16}
            />

            Add FAQ
          </Button>
        </div>
      </div>


      {/* =========================================================
          SUMMARY
      ========================================================= */}

      <div
        className="
          mt-7

          grid

          gap-4

          sm:grid-cols-3
        "
      >
        <Card
          className="
            gap-0

            p-5

            shadow-none
          "
        >
          <div
            className="
              flex

              items-center

              justify-between
            "
          >
            <div>
              <p
                className="
                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.1em]

                  text-slate-500
                "
              >
                Total FAQs
              </p>

              <p
                className="
                  mt-2

                  text-3xl

                  font-semibold

                  text-[#102d43]
                "
              >
                {pagination.total}
              </p>
            </div>


            <div
              className="
                grid

                h-11
                w-11

                place-items-center

                rounded-xl

                bg-[#edf6f5]

                text-[#087e83]
              "
            >
              <CircleHelp
                size={20}
              />
            </div>
          </div>
        </Card>


        <Card
          className="
            gap-0

            p-5

            shadow-none
          "
        >
          <p
            className="
              text-[10px]

              font-bold

              uppercase

              tracking-[0.1em]

              text-slate-500
            "
          >
            Current filter
          </p>

          <p
            className="
              mt-2

              text-lg

              font-semibold

              text-[#102d43]
            "
          >
            {publishFilter ===
            'all'
              ? 'All FAQs'
              : publishFilter ===
                  'published'
                ? 'Published'
                : 'Draft'}
          </p>
        </Card>


        <Card
          className="
            gap-0

            p-5

            shadow-none
          "
        >
          <p
            className="
              text-[10px]

              font-bold

              uppercase

              tracking-[0.1em]

              text-slate-500
            "
          >
            Page
          </p>

          <p
            className="
              mt-2

              text-lg

              font-semibold

              text-[#102d43]
            "
          >
            {pagination.currentPage}
            {' / '}
            {pagination.lastPage}
          </p>
        </Card>
      </div>


      {/* =========================================================
          FILTERS
      ========================================================= */}

      <Card
        className="
          mt-5

          gap-0

          p-5

          shadow-none
        "
      >
        <div
          className="
            grid

            gap-4

            lg:grid-cols-[1fr_220px]
          "
        >

          {/* SEARCH */}

          <div>
            <Label
              htmlFor="faq-search"
              className="
                mb-2
                block

                text-xs
                font-semibold
              "
            >
              Search FAQs
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

                  text-slate-400
                "
              />


              <Input
                id="faq-search"
                value={
                  searchInput
                }
                onChange={
                  event =>
                    setSearchInput(
                      event.target.value
                    )
                }
                placeholder="Search question or answer..."
                className="
                  h-11

                  bg-white

                  pl-10
                  pr-10
                "
              />


              {searchInput && (
                <button
                  type="button"
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

                    text-slate-400

                    hover:text-slate-700
                  "
                >
                  <X
                    size={15}
                  />
                </button>
              )}
            </div>
          </div>


          {/* STATUS FILTER */}

          <div>
            <Label
              htmlFor="faq-publish-filter"
              className="
                mb-2
                block

                text-xs
                font-semibold
              "
            >
              Publication status
            </Label>


            <select
              id="faq-publish-filter"
              value={
                publishFilter
              }
              onChange={
                event => {
                  setPublishFilter(
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
                border-slate-200

                bg-white

                px-3

                text-sm

                text-[#102d43]

                outline-none

                focus:border-[#087e83]
              "
            >
              <option value="all">
                All FAQs
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
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
          <p
            className="
              text-sm
              font-semibold

              text-[#102d43]
            "
          >
            {selectedIds.size}{' '}

            FAQ
            {selectedIds.size ===
            1
              ? ''
              : 's'}{' '}

            selected
          </p>


          <Button
            type="button"
            variant="outline"
            className="
              border-red-200

              bg-white

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

                text-[#102d43]
              "
            >
              FAQ library
            </p>


            <p
              className="
                mt-1

                text-xs

                text-slate-500
              "
            >
              Manage the questions displayed to customers.
            </p>
          </div>


          {refreshing && (
            <Loader2
              size={17}
              className="
                animate-spin

                text-[#087e83]
              "
            />
          )}
        </div>


        {loading ? (

          <div
            className="
              flex

              min-h-[330px]

              items-center
              justify-center

              gap-3
            "
          >
            <Loader2
              size={21}
              className="
                animate-spin

                text-[#087e83]
              "
            />

            <span
              className="
                text-sm

                text-slate-500
              "
            >
              Loading FAQs…
            </span>
          </div>

        ) : faqs.length ? (

          <div
            className="
              overflow-x-auto
            "
          >
            <Table>

              <TableHeader>

                <TableRow
                  className="
                    bg-slate-50
                  "
                >

                  <TableHead
                    className="
                      w-[52px]

                      pl-6
                    "
                  >
                    <SelectCheckbox
                      checked={
                        allSelected
                      }
                      onChange={
                        toggleSelectAll
                      }
                      ariaLabel="Select all FAQs on this page"
                    />
                  </TableHead>


                  <TableHead>
                    Question
                  </TableHead>


                  <TableHead>
                    Answer
                  </TableHead>


                  <TableHead
                    className="
                      w-[130px]
                    "
                  >
                    Status
                  </TableHead>


                  <TableHead
                    className="
                      w-[190px]

                      pr-6

                      text-right
                    "
                  >
                    Actions
                  </TableHead>

                </TableRow>

              </TableHeader>


              <TableBody>

                {faqs.map(
                  faq => {
                    const id =
                      Number(
                        faq.id
                      );


                    const published =
                      faqPublished(
                        faq
                      );


                    return (
                      <TableRow
                        key={
                          id
                        }
                        className={
                          selectedIds.has(
                            id
                          )
                            ? 'bg-[#edf6f5]/60'
                            : ''
                        }
                      >

                        {/* CHECK */}

                        <TableCell
                          className="
                            pl-6
                            align-top
                          "
                        >
                          <SelectCheckbox
                            checked={
                              selectedIds.has(
                                id
                              )
                            }
                            onChange={() =>
                              toggleSelect(
                                id
                              )
                            }
                            ariaLabel={`Select FAQ ${id}`}
                          />
                        </TableCell>


                        {/* QUESTION */}

                        <TableCell
                          className="
                            min-w-[280px]

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

                                rounded-xl

                                bg-[#edf6f5]

                                text-[#087e83]
                              "
                            >
                              <FileQuestion
                                size={16}
                              />
                            </div>


                            <p
                              className="
                                max-w-[380px]

                                text-sm

                                font-semibold

                                leading-6

                                text-[#102d43]
                              "
                            >
                              {faq.question ||
                                'Untitled question'}
                            </p>
                          </div>
                        </TableCell>


                        {/* ANSWER */}

                        <TableCell
                          className="
                            min-w-[320px]

                            max-w-[520px]

                            py-5

                            align-top
                          "
                        >
                            <p
                            className="
                                text-sm
                                leading-6
                                text-slate-500
                            "
                            title={faq.answer || ''}
                            >
                            {faq.answer
                                ? faq.answer.length > 50
                                ? `${faq.answer.slice(0, 50)}...`
                                : faq.answer
                                : '—'}
                            </p>
                        </TableCell>


                        {/* STATUS */}

                        <TableCell
                          className="
                            py-5

                            align-top
                          "
                        >
                          <PublishBadge
                            published={
                              published
                            }
                          />
                        </TableCell>


                        {/* ACTIONS */}

                        <TableCell
                          className="
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

                            {/* PUBLISH */}

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                statusChangingId ===
                                id
                              }
                              onClick={() =>
                                togglePublished(
                                  faq
                                )
                              }
                              title={
                                published
                                  ? 'Move to draft'
                                  : 'Publish FAQ'
                              }
                            >
                              {statusChangingId ===
                              id ? (
                                <Loader2
                                  size={14}
                                  className="
                                    animate-spin
                                  "
                                />
                              ) : (
                                <Check
                                  size={14}
                                />
                              )}

                              {published
                                ? 'Draft'
                                : 'Publish'}
                            </Button>


                            {/* EDIT */}

                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                openEdit(
                                  id
                                )
                              }
                              aria-label="Edit FAQ"
                            >
                              <Pencil
                                size={15}
                              />
                            </Button>


                            {/* DELETE */}

                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                askDelete([
                                  id,
                                ])
                              }
                              aria-label="Delete FAQ"
                              className="
                                text-red-500

                                hover:bg-red-50
                                hover:text-red-600
                              "
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

              min-h-[330px]

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
              <CircleHelp
                size={21}
              />
            </div>


            <h3
              className="
                mt-4

                text-base

                font-semibold

                text-[#102d43]
              "
            >
              No FAQs found.
            </h3>


            <p
              className="
                mt-2

                max-w-sm

                text-sm

                text-slate-500
              "
            >
              Change the filters or create a new FAQ.
            </p>


            <Button
              type="button"
              className="
                mt-5
              "
              onClick={
                openCreate
              }
            >
              <Plus
                size={15}
              />

              Add FAQ
            </Button>
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

                text-slate-500
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

              {' FAQs'}
            </p>


            <div
              className="
                flex

                items-center

                gap-1.5
              "
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
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


              {visiblePages.map(
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
                variant="outline"
                size="icon"
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
          CREATE / EDIT FAQ DRAWER
      ========================================================= */}

      <Sheet
        open={
          formOpen
        }
        onOpenChange={
          open => {
            if (
              saving
            ) {
              return;
            }


            setFormOpen(
              open
            );
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
          <SheetHeader>

            <SheetTitle
              className="
                text-2xl

                tracking-[-0.03em]
              "
            >
              {formMode ===
              'create'
                ? 'Add FAQ'
                : 'Edit FAQ'}
            </SheetTitle>


            <SheetDescription>
              {formMode ===
              'create'
                ? 'Create a new question and answer for the public FAQ section.'
                : 'Update the question, answer or publication status.'}
            </SheetDescription>

          </SheetHeader>


          {loadingFaq ? (

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
                size={21}
                className="
                  animate-spin

                  text-[#087e83]
                "
              />

              <span
                className="
                  text-sm

                  text-slate-500
                "
              >
                Loading FAQ…
              </span>
            </div>

          ) : (

            <form
              onSubmit={
                saveFaq
              }
              className="
                mt-7
              "
              noValidate
            >

              {/* GENERAL ERROR */}

              {formErrors.form && (
                <div
                  className="
                    mb-5

                    rounded-xl

                    border
                    border-red-200

                    bg-red-50

                    px-4
                    py-3

                    text-sm

                    text-red-700
                  "
                >
                  {formErrors.form}
                </div>
              )}


              {/* QUESTION */}

              <div>
                <Label
                  htmlFor="faq-question"
                  className="
                    mb-2

                    block

                    text-sm

                    font-semibold

                    text-[#102d43]
                  "
                >
                  Question

                  <span
                    className="
                      ml-1

                      text-[#087e83]
                    "
                  >
                    *
                  </span>
                </Label>


                <Input
                  id="faq-question"
                  value={
                    form.question
                  }
                  onChange={
                    event =>
                      updateForm(
                        'question',
                        event.target.value
                      )
                  }
                  placeholder="e.g. Do I need to be home during the clean?"
                  className={`
                    h-12

                    rounded-xl

                    ${
                      formErrors.question
                        ? 'border-red-300'
                        : ''
                    }
                  `}
                />


                {formErrors.question && (
                  <p
                    className="
                      mt-1.5

                      text-xs

                      text-red-600
                    "
                  >
                    {formErrors.question}
                  </p>
                )}
              </div>


              {/* ANSWER */}

              <div
                className="
                  mt-5
                "
              >
                <Label
                  htmlFor="faq-answer"
                  className="
                    mb-2

                    block

                    text-sm

                    font-semibold

                    text-[#102d43]
                  "
                >
                  Answer

                  <span
                    className="
                      ml-1

                      text-[#087e83]
                    "
                  >
                    *
                  </span>
                </Label>


                <Textarea
                  id="faq-answer"
                  rows={8}
                  value={
                    form.answer
                  }
                  onChange={
                    event =>
                      updateForm(
                        'answer',
                        event.target.value
                      )
                  }
                  placeholder="Write a clear and helpful answer..."
                  className={`
                    min-h-[180px]

                    resize-y

                    rounded-xl

                    ${
                      formErrors.answer
                        ? 'border-red-300'
                        : ''
                    }
                  `}
                />


                {formErrors.answer && (
                  <p
                    className="
                      mt-1.5

                      text-xs

                      text-red-600
                    "
                  >
                    {formErrors.answer}
                  </p>
                )}
              </div>


              {/* PUBLISH */}

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
                <label
                  className="
                    flex

                    cursor-pointer

                    items-start

                    gap-3
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      form.is_published
                    }
                    onChange={
                      event =>
                        updateForm(
                          'is_published',
                          event.target.checked
                        )
                    }
                    className="
                      mt-1

                      h-4
                      w-4

                      accent-[#087e83]
                    "
                  />


                  <div>
                    <p
                      className="
                        text-sm

                        font-semibold

                        text-[#102d43]
                      "
                    >
                      Publish this FAQ
                    </p>


                    <p
                      className="
                        mt-1

                        text-xs
                        leading-5

                        text-slate-500
                      "
                    >
                      Published FAQs can be displayed on the public website. Leave this unchecked to save it as a draft.
                    </p>
                  </div>
                </label>
              </div>


              {/* BUTTONS */}

              <div
                className="
                  mt-7

                  flex

                  flex-col-reverse

                  gap-3

                  sm:flex-row
                  sm:justify-end
                "
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    saving
                  }
                  onClick={() =>
                    setFormOpen(
                      false
                    )
                  }
                >
                  Cancel
                </Button>


                <Button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="
                    min-w-[150px]
                  "
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={15}
                        className="
                          animate-spin
                        "
                      />

                      Saving…
                    </>
                  ) : formMode ===
                    'create' ? (
                    <>
                      <Plus
                        size={15}
                      />

                      Create FAQ
                    </>
                  ) : (
                    <>
                      <Check
                        size={15}
                      />

                      Save changes
                    </>
                  )}
                </Button>
              </div>

            </form>
          )}

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
                ? `Delete ${deleteIds.length} FAQs?`
                : 'Delete this FAQ?'}
            </AlertDialogTitle>


            <AlertDialogDescription>
              {deleteIds.length >
              1
                ? 'The selected FAQs will be permanently deleted. This action cannot be undone.'
                : 'This FAQ will be permanently deleted. This action cannot be undone.'}
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
                    className="
                      animate-spin
                    "
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
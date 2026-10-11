import {
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  ClipboardCheck,
  ImagePlus,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';

import {
  Button,
} from '@/shared/components/ui/button';

import {
  Checkbox,
} from '@/shared/components/ui/checkbox';

import {
  Label,
} from '@/shared/components/ui/label';

import {
  Textarea,
} from '@/shared/components/ui/textarea';

import {
  PageIntro,
} from '@/modules/frontend/layouts/SiteLayout';

import {
  FieldSelect,
} from '@/shared/components/Shared';

import {
  services,
} from '@/shared/data/content';


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
|
| .env.local:
|
| VITE_API_BASE_URL=http://192.168.1.150/matelink/dev/backend/public/api
|
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  ''
)
  .trim()
  .replace(/\/+$/, '');


const QUOTE_ENDPOINT =
  '/v1/quote-requests';


/*
|--------------------------------------------------------------------------
| FILE SETTINGS
|--------------------------------------------------------------------------
*/

const MAX_PHOTOS =
  4;

const MAX_PHOTO_SIZE =
  8 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];


/*
|--------------------------------------------------------------------------
| SERVICE VALUE MAPPING
|--------------------------------------------------------------------------
|
| UI currently uses:
|
| not-sure
| move-in
| end-of-lease
|
| API screenshot uses underscore naming:
|
| not_sure
|
| Keeping mapping here means you don't have to change
| the visible frontend/service data.
|
*/

function apiServiceValue(
  value
) {
  const map = {
    'not-sure':
      'not_sure',

    'move-in':
      'move_in',

    'end-of-lease':
      'end_of_lease',
  };


  return (
    map[value] ||
    value
  );
}


/*
|--------------------------------------------------------------------------
| FIELD INPUT
|--------------------------------------------------------------------------
|
| Used for postcode too, so postcode visually matches
| name, mobile, email and address fields.
|
*/

function QuoteInput({
  id,
  label,
  required = false,
  error,
  className = '',
  ...props
}) {
  return (
    <div
      className={
        className
      }
    >
      <Label
        htmlFor={id}
        className="
          mb-2
          block

          text-sm
          font-medium

          text-[#102d43]
        "
      >
        {label}

        {required && (
          <span
            className="
              ml-1
              text-[#087e83]
            "
          >
            *
          </span>
        )}
      </Label>


      <input
        id={id}
        {...props}
        className={`
          h-12
          w-full

          rounded-xl

          border

          bg-white

          px-4

          text-sm
          text-[#102d43]

          outline-none

          transition

          placeholder:text-slate-400

          focus:border-[#087e83]/60

          focus:ring-4
          focus:ring-[#087e83]/[0.07]

          ${
            error
              ? 'border-red-300'
              : 'border-slate-200'
          }
        `}
      />


      {error && (
        <p
          className="
            mt-1.5
            text-xs
            text-red-600
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| PHOTO UPLOAD
|--------------------------------------------------------------------------
*/

function QuotePhotoUpload({
  photos,
  onChange,
  error,
}) {
  /*
  |--------------------------------------------------------------------------
  | PREVIEWS
  |--------------------------------------------------------------------------
  */

  const previews =
    useMemo(
      () =>
        photos.map(
          file => ({
            file,

            url:
              URL.createObjectURL(
                file
              ),
          })
        ),
      [
        photos,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | ADD PHOTOS
  |--------------------------------------------------------------------------
  */

  function handleFiles(
    event
  ) {
    const selected =
      Array.from(
        event.target.files ||
        []
      );


    event.target.value =
      '';


    if (
      !selected.length
    ) {
      return;
    }


    const accepted =
      [];


    for (
      const file of selected
    ) {
      /*
       * Maximum 4 total.
       */
      if (
        photos.length +
          accepted.length >=
        MAX_PHOTOS
      ) {
        break;
      }


      /*
       * File type
       */
      if (
        !ALLOWED_PHOTO_TYPES.includes(
          file.type
        )
      ) {
        continue;
      }


      /*
       * 8 MB
       */
      if (
        file.size >
        MAX_PHOTO_SIZE
      ) {
        continue;
      }


      accepted.push(
        file
      );
    }


    onChange([
      ...photos,
      ...accepted,
    ]);
  }


  /*
  |--------------------------------------------------------------------------
  | REMOVE
  |--------------------------------------------------------------------------
  */

  function removePhoto(
    index
  ) {
    onChange(
      photos.filter(
        (_, photoIndex) =>
          photoIndex !== index
      )
    );
  }


  return (
    <div>
      <Label
        className="
          mb-2
          block

          text-sm
          font-medium

          text-[#102d43]
        "
      >
        Photos
        {' '}

        <span
          className="
            font-normal
            text-slate-500
          "
        >
          (optional)
        </span>
      </Label>


      {photos.length <
        MAX_PHOTOS && (
        <label
          htmlFor="quote-photos"
          className={`
            flex

            min-h-[150px]

            cursor-pointer

            flex-col

            items-center
            justify-center

            rounded-xl

            border
            border-dashed

            bg-[#fbfdfd]

            px-5
            py-6

            text-center

            transition

            hover:border-[#087e83]/50
            hover:bg-[#f7fbfa]

            ${
              error
                ? 'border-red-300'
                : 'border-[#a9cbd0]'
            }
          `}
        >
          <UploadCloud
            size={26}
            className="
              text-[#087e83]
            "
          />


          <p
            className="
              mt-4

              text-sm
              font-semibold

              text-[#102d43]
            "
          >
            A picture helps us understand your space
          </p>


          <p
            className="
              mt-2

              text-xs

              text-slate-500
            "
          >
            Up to 4 photos · JPG, PNG or WebP · 8 MB each
          </p>


          <span
            className="
              mt-4

              inline-flex

              h-10

              items-center
              justify-center

              gap-2

              rounded-lg

              border
              border-slate-200

              bg-white

              px-4

              text-xs
              font-semibold

              text-[#102d43]
            "
          >
            <ImagePlus
              size={15}
            />

            Choose photos
          </span>


          <input
            id="quote-photos"
            type="file"
            accept="
              image/jpeg,
              image/png,
              image/webp
            "
            multiple
            onChange={
              handleFiles
            }
            className="sr-only"
          />
        </label>
      )}


      {/* =========================================================
          PHOTO PREVIEWS
      ========================================================= */}

      {previews.length >
        0 && (
        <div
          className="
            mt-4

            grid

            grid-cols-2

            gap-3

            sm:grid-cols-4
          "
        >
          {previews.map(
            (
              item,
              index
            ) => (
              <div
                key={`${item.file.name}-${index}`}
                className="
                  group

                  relative

                  overflow-hidden

                  rounded-xl

                  border
                  border-slate-200

                  bg-white
                "
              >
                <img
                  src={
                    item.url
                  }
                  alt=""
                  className="
                    aspect-square

                    h-full
                    w-full

                    object-cover
                  "
                />


                <button
                  type="button"
                  onClick={() =>
                    removePhoto(
                      index
                    )
                  }
                  aria-label="Remove photo"
                  className="
                    absolute

                    right-2
                    top-2

                    grid

                    h-8
                    w-8

                    place-items-center

                    rounded-full

                    bg-white/95

                    text-red-600

                    shadow

                    transition

                    hover:bg-red-50
                  "
                >
                  <Trash2
                    size={14}
                  />
                </button>
              </div>
            )
          )}
        </div>
      )}


      {error && (
        <p
          className="
            mt-2

            text-xs

            text-red-600
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| BACKEND VALIDATION ERROR
|--------------------------------------------------------------------------
*/

function firstError(
  value
) {
  if (
    Array.isArray(
      value
    )
  ) {
    return (
      value[0] ||
      ''
    );
  }


  return (
    value
      ? String(value)
      : ''
  );
}


/*
|--------------------------------------------------------------------------
| MAP BACKEND ERRORS TO FRONTEND FIELD NAMES
|--------------------------------------------------------------------------
*/

function mapApiErrors(
  apiErrors
) {
  if (
    !apiErrors ||
    typeof apiErrors !==
      'object'
  ) {
    return {};
  }


  const fieldMap = {
    service:
      'service',

    postcode:
      'postcode',

    property_type:
      'property',

    bedrooms:
      'bedrooms',

    bathrooms:
      'bathrooms',

    kitchens:
      'kitchens',

    living_dining_areas:
      'livingDining',

    laundry_rooms:
      'laundry',

    property_address:
      'address',

    details:
      'requirements',

    name:
      'name',

    mobile:
      'mobile',

    email:
      'email',

    privacy_accepted:
      'consent',

    photos:
      'photos',
  };


  const result =
    {};


  Object.entries(
    apiErrors
  ).forEach(
    ([
      backendField,
      messages,
    ]) => {
      /*
       * Laravel may return:
       *
       * photos.0
       * photos.1
       */
      const rootField =
        backendField.split(
          '.'
        )[0];


      const frontendField =
        fieldMap[
          rootField
        ] ||
        rootField;


      result[
        frontendField
      ] =
        firstError(
          messages
        );
    }
  );


  return result;
}


/*
|--------------------------------------------------------------------------
| QUOTE PAGE
|--------------------------------------------------------------------------
*/

function QuotePage() {
  const navigate =
    useNavigate();


  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const [
    values,
    setValues,
  ] = useState({
    service:
      'not-sure',

    postcode:
      '',

    property:
      'apartment',

    bedrooms:
      2,

    bathrooms:
      1,

    kitchens:
      1,

    livingDining:
      1,

    laundry:
      0,

    address:
      '',

    requirements:
      '',

    photos:
      [],

    name:
      '',

    mobile:
      '',

    email:
      '',
  });


  const [
    consent,
    setConsent,
  ] = useState(false);


  const [
    errors,
    setErrors,
  ] = useState({});


  const [
    busy,
    setBusy,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | OPTIONS
  |--------------------------------------------------------------------------
  */

  const serviceOptions =
    useMemo(
      () => [
        ...services.map(
          service => ({
            label:
              service.name,

            value:
              service.id,
          })
        ),

        {
          label:
            'I’m not sure',

          value:
            'not-sure',
        },
      ],
      []
    );


  const propertyOptions = [
    {
      label:
        'Apartment',

      value:
        'apartment',
    },

    {
      label:
        'House',

      value:
        'house',
    },

    {
      label:
        'Townhouse',

      value:
        'townhouse',
    },

    {
      label:
        'Other',

      value:
        'other',
    },
  ];


  const bedroomOptions =
    Array.from(
      {
        length:
          10,
      },
      (_, index) => ({
        label:
          index === 9
            ? '9+'
            : String(
                index
              ),

        value:
          String(
            index
          ),
      })
    );


  const bathroomOptions =
    Array.from(
      {
        length:
          8,
      },
      (_, index) => ({
        label:
          index === 7
            ? '8+'
            : String(
                index + 1
              ),

        value:
          String(
            index + 1
          ),
      })
    );


  const roomOptions =
    Array.from(
      {
        length:
          9,
      },
      (_, index) => ({
        label:
          index === 8
            ? '8+'
            : String(
                index
              ),

        value:
          String(
            index
          ),
      })
    );


  /*
  |--------------------------------------------------------------------------
  | PATCH
  |--------------------------------------------------------------------------
  */

  function patch(
    part
  ) {
    setValues(
      previous => ({
        ...previous,
        ...part,
      })
    );


    setErrors(
      previous => {
        const next = {
          ...previous,
        };


        Object.keys(
          part
        ).forEach(
          key => {
            delete next[
              key
            ];
          }
        );


        delete next.form;


        return next;
      }
    );
  }


  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  function validate() {
    const found =
      {};


    if (
      !values.service
    ) {
      found.service =
        'Please select a service.';
    }


    if (
      !/^\d{4}$/.test(
        values.postcode
      )
    ) {
      found.postcode =
        'Enter a four-digit Australian postcode.';
    }


    if (
      !values.property
    ) {
      found.property =
        'Please select the property type.';
    }


    if (
      values.requirements
        .trim()
        .length < 10
    ) {
      found.requirements =
        'Please tell us a little more about what you need.';
    }


    if (
      values.name
        .trim()
        .length < 2
    ) {
      found.name =
        'Please enter your full name.';
    }


    if (
      !values.mobile
        .trim()
    ) {
      found.mobile =
        'Please enter your mobile number.';
    }


    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email.trim()
      )
    ) {
      found.email =
        'Please enter a valid email address.';
    }


    if (
      values.photos.length >
      MAX_PHOTOS
    ) {
      found.photos =
        'You can upload a maximum of 4 photos.';
    }


    const invalidPhoto =
      values.photos.find(
        file =>
          !ALLOWED_PHOTO_TYPES.includes(
            file.type
          ) ||
          file.size >
            MAX_PHOTO_SIZE
      );


    if (
      invalidPhoto
    ) {
      found.photos =
        'Photos must be JPG, PNG or WebP and no larger than 8 MB each.';
    }


    if (
      !consent
    ) {
      found.consent =
        'Please acknowledge the privacy details.';
    }


    setErrors(
      found
    );


    return (
      Object.keys(
        found
      ).length === 0
    );
  }


  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function submit(
    event
  ) {
    event.preventDefault();


    if (
      busy
    ) {
      return;
    }


    if (
      !validate()
    ) {
      return;
    }


    if (
      !API_BASE_URL
    ) {
      setErrors({
        form:
          'VITE_API_BASE_URL is not configured.',
      });

      return;
    }


    setBusy(
      true
    );


    setErrors(
      {}
    );


    /*
    |--------------------------------------------------------------------------
    | FORM DATA
    |--------------------------------------------------------------------------
    */

    const formData =
      new FormData();


    formData.append(
      'service',
      apiServiceValue(
        values.service
      )
    );


    formData.append(
      'postcode',
      values.postcode
    );


    formData.append(
      'property_type',
      values.property
    );


    formData.append(
      'bedrooms',
      String(
        values.bedrooms
      )
    );


    formData.append(
      'bathrooms',
      String(
        values.bathrooms
      )
    );


    formData.append(
      'kitchens',
      String(
        values.kitchens
      )
    );


    formData.append(
      'living_dining_areas',
      String(
        values.livingDining
      )
    );


    formData.append(
      'laundry_rooms',
      String(
        values.laundry
      )
    );


    /*
     * Optional address.
     */
    if (
      values.address
        .trim()
    ) {
      formData.append(
        'property_address',
        values.address.trim()
      );
    }


    formData.append(
      'details',
      values.requirements
        .trim()
    );


    /*
    |--------------------------------------------------------------------------
    | PHOTOS
    |--------------------------------------------------------------------------
    */

    values.photos.forEach(
      file => {
        formData.append(
          'photos[]',
          file
        );
      }
    );


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    formData.append(
      'name',
      values.name.trim()
    );


    formData.append(
      'mobile',
      values.mobile.trim()
    );


    formData.append(
      'email',
      values.email
        .trim()
        .toLowerCase()
    );


    formData.append(
      'privacy_accepted',
      '1'
    );


    try {
      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | DO NOT manually add:
      |
      | Content-Type: multipart/form-data
      |
      | The browser must create the multipart boundary itself.
      |
      */

      const response =
        await fetch(
          `${API_BASE_URL}${QUOTE_ENDPOINT}`,
          {
            method:
              'POST',

            headers: {
              Accept:
                'application/json',
            },

            body:
              formData,
          }
        );


      const responseData =
        await response
          .json()
          .catch(
            () => ({})
          );


      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (
        response.status ===
        422
      ) {
        const backendErrors =
          mapApiErrors(
            responseData
              ?.errors ||
            responseData
              ?.data
              ?.errors ||
            {}
          );


        setErrors({
          ...backendErrors,

          form:
            responseData
              ?.message ||
            'Please check the highlighted fields and try again.',
        });


        window.scrollTo({
          top:
            0,

          behavior:
            'smooth',
        });


        return;
      }


      /*
      |--------------------------------------------------------------------------
      | OTHER ERROR
      |--------------------------------------------------------------------------
      */

      if (
        !response.ok
      ) {
        throw new Error(
          responseData
            ?.message ||
          `Unable to submit quote request. Server returned ${response.status}.`
        );
      }


      /*
      |--------------------------------------------------------------------------
      | GET REFERENCE IF API RETURNS ONE
      |--------------------------------------------------------------------------
      */

      const reference =
        responseData
          ?.data
          ?.reference ||
        responseData
          ?.reference ||
        responseData
          ?.data
          ?.quote
          ?.reference ||
        '';


      /*
      |--------------------------------------------------------------------------
      | SUCCESS -> SHARED THANK YOU PAGE
      |--------------------------------------------------------------------------
      */

      navigate(
        '/thank-you',
        {
          replace:
            true,

          state: {
            type:
              'quote',

            name:
              values.name.trim(),

            reference,

            message:
              responseData
                ?.message ||
              '',
          },
        }
      );

    } catch (error) {
      console.error(
        'Quote request error:',
        error
      );


      setErrors({
        form:
          error
            ?.message ||
          'Unable to submit your quote request. Please try again.',
      });


      window.scrollTo({
        top:
          0,

        behavior:
          'smooth',
      });

    } finally {
      setBusy(
        false
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <PageIntro
        eyebrow="A clean as individual as your home"
        title="Tell us what you have in mind."
        description="Unusual property? A few extra requirements? Or simply not sure where to start? Let’s shape a quote around your space."
      />


      <section
        className="
          section-space
        "
      >
        <div
          className="
            container-site

            grid

            items-start

            gap-10

            lg:grid-cols-[1.4fr_.6fr]
          "
        >

          {/* =====================================================
              FORM
          ===================================================== */}

          <form
            className="
              surface

              p-6

              sm:p-9
            "
            onSubmit={
              submit
            }
            noValidate
          >

            <h2
              className="
                mb-7

                text-2xl
              "
            >
              A little about your clean
            </h2>


            {/* ===================================================
                GENERAL ERROR
            =================================================== */}

            {errors.form && (
              <div
                className="
                  mb-6

                  rounded-xl

                  border
                  border-red-200

                  bg-red-50

                  px-4
                  py-3

                  text-sm
                  leading-6

                  text-red-700
                "
              >
                {errors.form}
              </div>
            )}


            {/* ===================================================
                SERVICE + POSTCODE
            =================================================== */}

            <div
              className="
                grid

                gap-5

                sm:grid-cols-2
              "
            >

              <div>
                <FieldSelect
                  id="quote-service"
                  label="Which service?"
                  value={
                    values.service
                  }
                  onChange={
                    service =>
                      patch({
                        service,
                      })
                  }
                  options={
                    serviceOptions
                  }
                />

                {errors.service && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600
                    "
                  >
                    {errors.service}
                  </p>
                )}
              </div>


              {/* =================================================
                  POSTCODE

                  SAME INPUT HEIGHT / BORDER / RADIUS
                  AS THE OTHER TEXT FIELDS
              ================================================= */}

              <QuoteInput
                id="quote-postcode"
                label="Postcode"
                required
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={4}
                placeholder="e.g. 2000"
                value={
                  values.postcode
                }
                onChange={
                  event =>
                    patch({
                      postcode:
                        event.target.value
                          .replace(
                            /\D/g,
                            ''
                          )
                          .slice(
                            0,
                            4
                          ),
                    })
                }
                error={
                  errors.postcode
                }
              />

            </div>


            {/* ===================================================
                PROPERTY / BEDROOM / BATHROOM
            =================================================== */}

            <div
              className="
                mt-5

                grid

                gap-5

                sm:grid-cols-[1.2fr_.6fr_.6fr]
              "
            >

              <div>
                <FieldSelect
                  id="quote-property"
                  label="Property type"
                  value={
                    values.property
                  }
                  onChange={
                    property =>
                      patch({
                        property,
                      })
                  }
                  options={
                    propertyOptions
                  }
                />

                {errors.property && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600
                    "
                  >
                    {errors.property}
                  </p>
                )}
              </div>


              <div>
                <FieldSelect
                  id="quote-bedrooms"
                  label="Bedrooms"
                  value={
                    String(
                      values.bedrooms
                    )
                  }
                  onChange={
                    value =>
                      patch({
                        bedrooms:
                          Number(
                            value
                          ),
                      })
                  }
                  options={
                    bedroomOptions
                  }
                />

                {errors.bedrooms && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600
                    "
                  >
                    {errors.bedrooms}
                  </p>
                )}
              </div>


              <div>
                <FieldSelect
                  id="quote-bathrooms"
                  label="Bathrooms"
                  value={
                    String(
                      values.bathrooms
                    )
                  }
                  onChange={
                    value =>
                      patch({
                        bathrooms:
                          Number(
                            value
                          ),
                      })
                  }
                  options={
                    bathroomOptions
                  }
                />

                {errors.bathrooms && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600
                    "
                  >
                    {errors.bathrooms}
                  </p>
                )}
              </div>

            </div>


            {/* ===================================================
                KITCHEN / LIVING / LAUNDRY
            =================================================== */}

            <div
              className="
                mt-5

                grid

                gap-5

                sm:grid-cols-3
              "
            >

              <div>
                <FieldSelect
                  id="quote-kitchen"
                  label="Kitchen"
                  value={
                    String(
                      values.kitchens
                    )
                  }
                  onChange={
                    value =>
                      patch({
                        kitchens:
                          Number(
                            value
                          ),
                      })
                  }
                  options={
                    roomOptions
                  }
                />

                {errors.kitchens && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600
                    "
                  >
                    {errors.kitchens}
                  </p>
                )}
              </div>


              <div>
                <FieldSelect
                  id="quote-living-dining"
                  label="Living & Dining Areas"
                  value={
                    String(
                      values.livingDining
                    )
                  }
                  onChange={
                    value =>
                      patch({
                        livingDining:
                          Number(
                            value
                          ),
                      })
                  }
                  options={
                    roomOptions
                  }
                />

                {errors.livingDining && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600
                    "
                  >
                    {errors.livingDining}
                  </p>
                )}
              </div>


              <div>
                <FieldSelect
                  id="quote-laundry"
                  label="Laundry Room / Cupboard"
                  value={
                    String(
                      values.laundry
                    )
                  }
                  onChange={
                    value =>
                      patch({
                        laundry:
                          Number(
                            value
                          ),
                      })
                  }
                  options={
                    roomOptions
                  }
                />

                {errors.laundry && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600
                    "
                  >
                    {errors.laundry}
                  </p>
                )}
              </div>

            </div>


            {/* ===================================================
                PROPERTY ADDRESS
            =================================================== */}

            <div
              className="
                mt-5
              "
            >
              <QuoteInput
                id="quote-address"
                label="Property address (optional)"
                type="text"
                autoComplete="street-address"
                placeholder="e.g. 1 George St, Sydney"
                value={
                  values.address
                }
                onChange={
                  event =>
                    patch({
                      address:
                        event.target.value,
                    })
                }
                error={
                  errors.address
                }
              />
            </div>


            {/* ===================================================
                DETAILS
            =================================================== */}

            <div
              className="
                mt-5
              "
            >
              <Label
                htmlFor="quote-requirements"
                className="
                  mb-2
                  block

                  text-sm
                  font-medium

                  text-[#102d43]
                "
              >
                What would you like us to know?

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
                id="quote-requirements"
                className={`
                  min-h-36

                  rounded-xl

                  ${
                    errors.requirements
                      ? 'border-red-300'
                      : ''
                  }
                `}
                placeholder="Tell us about the property, the clean you need and anything that needs extra care…"
                value={
                  values.requirements
                }
                onChange={
                  event =>
                    patch({
                      requirements:
                        event.target.value,
                    })
                }
                maxLength={
                  4000
                }
                aria-invalid={
                  Boolean(
                    errors.requirements
                  )
                }
              />


              {errors.requirements && (
                <p
                  className="
                    mt-2

                    text-xs

                    text-red-600
                  "
                >
                  {errors.requirements}
                </p>
              )}
            </div>


            {/* ===================================================
                PHOTOS
            =================================================== */}

            <div
              className="
                mt-5
              "
            >
              <QuotePhotoUpload
                photos={
                  values.photos
                }
                onChange={
                  photos =>
                    patch({
                      photos,
                    })
                }
                error={
                  errors.photos
                }
              />
            </div>


            {/* ===================================================
                CUSTOMER
            =================================================== */}

            <h2
              className="
                mb-6
                mt-9

                border-t
                border-slate-200

                pt-8

                text-2xl
              "
            >
              Where can we reach you?
            </h2>


            <div
              className="
                grid

                gap-5

                sm:grid-cols-2
              "
            >

              <QuoteInput
                id="quote-name"
                label="Full name"
                required
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={
                  values.name
                }
                onChange={
                  event =>
                    patch({
                      name:
                        event.target.value,
                    })
                }
                error={
                  errors.name
                }
              />


              <QuoteInput
                id="quote-mobile"
                label="Mobile number"
                required
                type="tel"
                autoComplete="tel"
                placeholder="04XX XXX XXX"
                value={
                  values.mobile
                }
                onChange={
                  event =>
                    patch({
                      mobile:
                        event.target.value,
                    })
                }
                error={
                  errors.mobile
                }
              />


              <QuoteInput
                id="quote-email"
                label="Email address"
                required
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="
                  sm:col-span-2
                "
                value={
                  values.email
                }
                onChange={
                  event =>
                    patch({
                      email:
                        event.target.value,
                    })
                }
                error={
                  errors.email
                }
              />

            </div>


            {/* ===================================================
                PRIVACY
            =================================================== */}

            <div
              className="
                mt-6

                flex

                items-start

                gap-3
              "
            >
              <Checkbox
                id="quote-consent"
                className="
                  mt-1
                "
                checked={
                  consent
                }
                onCheckedChange={
                  value => {
                    setConsent(
                      value ===
                      true
                    );


                    setErrors(
                      previous => ({
                        ...previous,

                        consent:
                          undefined,

                        form:
                          undefined,
                      })
                    );
                  }
                }
              />


              <Label
                htmlFor="quote-consent"
                className="
                  block

                  text-sm
                  font-normal
                  leading-relaxed
                "
              >
                I acknowledge the{' '}

                <Link
                  className="
                    text-[#087e83]
                    underline
                  "
                  to="/privacy"
                  target="_blank"
                >
                  privacy details
                </Link>

                {' '}and understand Matelink will review this enquiry.
              </Label>
            </div>


            {errors.consent && (
              <p
                className="
                  mt-2

                  text-xs

                  text-red-600
                "
              >
                {errors.consent}
              </p>
            )}


            {/* ===================================================
                SUBMIT
            =================================================== */}

            <Button
              type="submit"
              disabled={
                busy
              }
              className="
                mt-7

                h-12

                w-full

                px-8

                sm:w-auto
              "
            >
              {busy ? (
                <>
                  <Loader2
                    size={16}
                    className="
                      animate-spin
                    "
                  />

                  Sending request…
                </>
              ) : (
                'Request my quote'
              )}
            </Button>

          </form>


          {/* =====================================================
              RIGHT INFO CARD
          ===================================================== */}

          <aside
            className="
              rounded-2xl

              bg-secondary

              p-8
            "
          >
            <div
              className="
                icon-square

                !bg-white
              "
            >
              <MessageSquare
                size={24}
              />
            </div>


            <h2
              className="
                mt-6

                text-2xl
              "
            >
              A little more flexibility.
            </h2>


            <p
              className="
                body-copy

                mt-5

                text-sm
              "
            >
              Share the details once. We’ll use them to understand your requirements and put together the right scope.
            </p>


            <div
              className="
                mt-7

                space-y-5

                text-sm
              "
            >
              <p
                className="
                  flex
                  gap-3
                "
              >
                <ClipboardCheck
                  className="
                    shrink-0
                    text-primary
                  "
                  size={19}
                />

                A quote tailored to your property
              </p>


              <p
                className="
                  flex
                  gap-3
                "
              >
                <ShieldCheck
                  className="
                    shrink-0
                    text-primary
                  "
                  size={19}
                />

                No payment to submit an enquiry
              </p>


              <p
                className="
                  flex
                  gap-3
                "
              >
                <Sparkles
                  className="
                    shrink-0
                    text-primary
                  "
                  size={19}
                />

                Your details carry into an accepted booking
              </p>
            </div>


            <div
              className="
                mt-8

                border-t
                border-primary/20

                pt-6
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                "
              >
                Know exactly what you need?
              </p>


              <Link
                to="/book"
                className="
                  link-line
                  mt-3
                "
              >
                Request a standard clean
              </Link>
            </div>

          </aside>

        </div>
      </section>
    </>
  );
}


export default QuotePage;
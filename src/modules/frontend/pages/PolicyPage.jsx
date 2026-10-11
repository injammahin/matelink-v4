import {
  PageIntro,
} from '@/modules/frontend/layouts/SiteLayout';


/* =========================================================
   POLICY CONTENT
   ========================================================= */

const privacySections = [
  {
    title:
      'Information in a request',

    text:
      'The forms collect contact details, property information, preferred dates and optional photos. The final policy should explain the business purposes and approved handling of this information.',
  },

  {
    title:
      'Storage and access',

    text:
      'The production privacy policy should describe hosting, retention, authorised access and any third-party email, security or payment providers used by Matelink.',
  },

  {
    title:
      'Your privacy enquiries',

    text:
      'The final policy should provide Matelink’s approved contact details and process for privacy enquiries, corrections and other privacy-related requests.',
  },
];


const termsSections = [
  {
    title:
      'Booking requests',

    text:
      'Submitting a request does not automatically confirm a booking. Matelink reviews the property, selected service, scope, price and preferred date before confirmation.',
  },

  {
    title:
      'Prices and payment',

    text:
      'No payment is collected at the initial request stage unless otherwise clearly stated. Pricing and available payment options should be confirmed as part of the accepted booking.',
  },

  {
    title:
      'Cleaning scope and access',

    text:
      'The confirmed booking should state the agreed cleaning scope, selected optional extras, exclusions and any access requirements for the property.',
  },

  {
    title:
      'Cancellations and changes',

    text:
      'The final terms should clearly explain Matelink’s approved notice periods, cancellation conditions, applicable charges, refunds and rescheduling rules.',
  },

  {
    title:
      'Bond Back Guarantee',

    text:
      'Eligible cleaning issues within the agreed End-of-Lease scope may be reviewed for a re-clean where the Bond Back Guarantee applies. The guarantee does not promise that a customer will receive a full bond refund.',
  },
];


/* =========================================================
   POLICY PAGE
   ========================================================= */

function PolicyPage({
  type,
}) {
  const privacy =
    type ===
    'privacy';


  const sections =
    privacy
      ? privacySections
      : termsSections;


  return (
    <>
      {/* =====================================================
          INTRO
      ====================================================== */}

      <PageIntro
        eyebrow="The finer details"
        title={
          privacy
            ? 'Privacy Policy'
            : 'Terms & Conditions'
        }
        description={
          privacy
            ? 'How information provided to Matelink is collected, used and handled.'
            : 'The important details that support a clear cleaning request and booking experience.'
        }
      />


      {/* =====================================================
          POLICY BODY
      ====================================================== */}

      <section
        className="
          section-space
        "
      >
        <div
          className="
            container-site

            max-w-[860px]
          "
        >
          <div
            className="
              mb-8

              rounded-xl

              border
              border-[#dfe5e5]

              bg-secondary

              p-6

              text-sm
              leading-6
            "
          >
            The final legal
            wording should be
            reviewed and approved
            by Matelink before
            production launch.
          </div>


          <div
            className="
              divide-y
              divide-slate-200
            "
          >
            {sections.map(
              (
                section,
                index
              ) => (
                <article
                  key={
                    section.title
                  }
                  className={`
                    ${
                      index === 0
                        ? 'pb-8'
                        : 'py-8'
                    }
                  `}
                >
                  <h2
                    className="
                      mb-4

                      text-2xl

                      tracking-[-0.025em]

                      text-[#102d43]
                    "
                  >
                    {
                      section.title
                    }
                  </h2>


                  <p
                    className="
                      body-copy
                    "
                  >
                    {
                      section.text
                    }
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}


export {
  PolicyPage,
};

export default PolicyPage;
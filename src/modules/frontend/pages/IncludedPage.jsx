import {
  Check,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import {
  CTABand,
  PageIntro,
} from '@/modules/frontend/layouts/SiteLayout';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

import {
  inclusionRows,
} from '@/shared/data/content';


/* =========================================================
   INCLUDED PAGE
   ========================================================= */

function IncludedPage() {
  function displayCell(
    value
  ) {
    if (
      value === true
    ) {
      return (
        <Check
          className="
            mx-auto
            text-primary
          "
          size={20}
          aria-label="Included in suggested scope"
        />
      );
    }


    if (
      value ===
      'extra'
    ) {
      return (
        <span
          className="
            text-xs
            text-primary
          "
        >
          Optional extra
        </span>
      );
    }


    if (
      value ===
      'quote'
    ) {
      return (
        <span
          className="
            text-xs
            text-muted-foreground
          "
        >
          Ask for a quote
        </span>
      );
    }


    return (
      <span
        className="
          text-muted-foreground
        "
        aria-label="Not included"
      >
        —
      </span>
    );
  }


  return (
    <>
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}

      <PageIntro
        eyebrow="The details, made clear"
        title="Know what goes into your clean."
        description="Compare the services and find the scope that fits your home. Your confirmed booking will set out the final agreed inclusions."
      />


      {/* =====================================================
          INCLUDED TABLE
      ====================================================== */}

      <section
        className="
          section-space
        "
      >
        <div
          className="
            container-site
          "
        >
          <div
            className="
              mb-6

              rounded-xl

              bg-secondary

              px-6
              py-4

              text-sm
            "
          >
            This is a suggested
            cleaning scope.
            Optional extras are
            charged separately
            where applicable.
            Your confirmed booking
            sets out the final
            agreed scope.
          </div>


          <div
            className="
              surface

              overflow-hidden
            "
          >
            <div
              className="
                overflow-x-auto
              "
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="
                        min-w-[290px]

                        p-6
                      "
                    >
                      Cleaning area
                    </TableHead>


                    <TableHead
                      className="
                        min-w-[140px]

                        text-center
                      "
                    >
                      Deep Cleaning
                    </TableHead>


                    <TableHead
                      className="
                        min-w-[140px]

                        text-center
                      "
                    >
                      Move-In
                    </TableHead>


                    <TableHead
                      className="
                        min-w-[150px]

                        text-center
                      "
                    >
                      End-of-Lease
                    </TableHead>
                  </TableRow>
                </TableHeader>


                <TableBody>
                  {inclusionRows.map(
                    (
                      row,
                      index
                    ) => (
                      <TableRow
                        key={
                          `${row.area}-${row.task}-${index}`
                        }
                      >
                        <TableCell
                          className="
                            whitespace-normal

                            px-6
                            py-5
                          "
                        >
                          <p
                            className="
                              mb-1

                              text-xs
                              font-bold
                              uppercase

                              tracking-wide

                              text-primary
                            "
                          >
                            {
                              row.area
                            }
                          </p>


                          <p
                            className="
                              text-sm
                            "
                          >
                            {
                              row.task
                            }
                          </p>
                        </TableCell>


                        <TableCell
                          className="
                            text-center
                          "
                        >
                          {displayCell(
                            row.deep
                          )}
                        </TableCell>


                        <TableCell
                          className="
                            text-center
                          "
                        >
                          {displayCell(
                            row.move
                          )}
                        </TableCell>


                        <TableCell
                          className="
                            text-center
                          "
                        >
                          {displayCell(
                            row.lease
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>


          {/* =================================================
              INFORMATION CARDS
          ================================================= */}

          <div
            className="
              mt-8

              grid

              gap-6

              md:grid-cols-2
            "
          >
            <div
              className="
                surface

                p-7
              "
            >
              <h3
                className="
                  mb-4

                  text-xl
                "
              >
                Help us prepare
              </h3>


              <p
                className="
                  body-copy

                  text-sm
                "
              >
                Tell us about
                access, parking,
                property
                condition and any
                areas needing
                particular care
                when you send
                your request.
              </p>
            </div>


            <div
              className="
                surface

                p-7
              "
            >
              <h3
                className="
                  mb-4

                  text-xl
                "
              >
                Something outside
                this scope?
              </h3>


              <p
                className="
                  body-copy

                  text-sm
                "
              >
                Share your
                requirements
                through our quote
                form so we can
                review the
                property and
                confirm a
                suitable cleaning
                scope.
              </p>


              <Link
                to="/get-a-quote"
                className="
                  link-line

                  mt-4
                "
              >
                Get a tailored
                quote
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <CTABand />
    </>
  );
}


export {
  IncludedPage,
};

export default IncludedPage;
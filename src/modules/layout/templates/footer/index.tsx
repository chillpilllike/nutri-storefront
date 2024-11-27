import { getCategoriesList } from "@lib/data/categories";
import { getCollectionsList } from "@lib/data/collections";
import { Text, clx } from "@medusajs/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import MedusaCTA from "@modules/layout/components/medusa-cta";

import Script from 'next/script';

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6);
  const { product_categories } = await getCategoriesList(0, 6);

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">

        {/* Insert the Trustpilot Widget at the top */}
        <div
          className="trustpilot-widget"
          data-locale="en-US"
          data-template-id="5419b6a8b0d04a076446a9ad"
          data-businessunit-id="641a0120bd3a43fcfbfecb58"
          data-style-height="100%"
          data-style-width="100%"
          data-stars="1,2,3,4,5"
          data-scroll-to-list="false"
          data-allow-robots="true"
        >
          <a
            href="https://www.trustpilot.com/review/nutricity.com.au"
            target="_blank"
            rel="noopener"
          >
            Trustpilot
          </a>
        </div>

        {/* Insert the External Trustpilot Script */}
        <Script
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          type="text/javascript"
          async
          strategy="afterInteractive"
        />

        {/* Rest of the footer content */}
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
            >
              Medusa Store
            </LocalizedClientLink>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {product_categories && product_categories.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {product_categories.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return null;
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null;

                    return (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="hover:text-ui-fg-base"
                                  href={`/categories/${child.handle}`}
                                  data-testid="category-link"
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": collections.length > 3,
                    }
                  )}
                >
                  {collections.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Medusa</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="https://github.com/medusajs"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.medusajs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/medusajs/nextjs-starter-medusa"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Source code
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Medusa Store. All rights reserved.
          </Text>
          <MedusaCTA />
        </div>

        {/* Existing scripts */}
        <Script
          src="https://cdn.reamaze.com/assets/reamaze.js"
          type="text/javascript"
          async
          strategy="afterInteractive"
        />

        <Script id="support-script" type="text/javascript" strategy="afterInteractive">
          {`
            var _support = _support || { 'ui': {}, 'user': {} };
            _support['account'] = 'nutricityau';
            _support['ui']['contactMode'] = 'mixed';
            _support['ui']['enableKb'] = 'true';
            _support['ui']['styles'] = {
              widgetColor: 'rgba(16, 162, 197, 1)',
              gradient: true,
            };
            _support['ui']['shoutboxFacesMode'] = 'default';
            _support['ui']['shoutboxHeaderLogo'] = true;
            _support['ui']['widget'] = {
              displayOn: 'all',
              fontSize: 'default',
              allowBotProcessing: true,
              slug: 'nutricity-au-chat-slash-contact-form-shoutbox',
              label: {
                text: 'Let us know if you have any questions! 😊',
                mode: "notification",
                delay: 3,
                duration: 30,
                primary: 'I have a question',
                secondary: 'No, thanks',
                sound: true,
              },
              position: 'bottom-right',
              mobilePosition: 'bottom-right'
            };
            _support['apps'] = {
              faq: {"enabled":true},
              recentConversations: {},
              orders: {},
              shopper: {}
            };
          `}
        </Script>
      </div>
    </footer>
  );
}

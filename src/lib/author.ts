/**
 * Who stands behind an article, stated as facts a reader can check.
 *
 * Every blog post and guide was credited to "Ramani Steel House" and nothing else. For a reader
 * deciding whether to trust a technical claim, and for a search engine weighing who is behind
 * the page, a bare company name says nothing. This block says what that company is and points to
 * the places the claims can be checked: the About page (which publishes the ISO certificates),
 * the works address, and a mailbox that answers technical questions.
 *
 * The author is deliberately the company, not a person. A named expert would be stronger
 * evidence, but only if the person is real, is willing to be named, and the credentials stated
 * are true, and none of that can be supplied by the code. So there is no invented byline here.
 * If a named author is ever added, it is a one-place change: give NAMED_AUTHOR a value and the
 * byline, the box and the structured data all switch to the person, with the company as the
 * organisation they work for.
 *
 * Plain data, no React, `.js` on relative imports: the Node serverless function loads this.
 */
import { POSTAL_ADDRESS, PRIMARY_EMAIL } from './contact.js';
import { FOUNDED_YEAR, YEARS_IN_BUSINESS } from './heritage.js';

export const AUTHOR_SITE_URL = 'https://www.nickelbusbar.com';
export const AUTHOR_ORG_NAME = 'Ramani Steel House';
const ORGANIZATION_ID = `${AUTHOR_SITE_URL}/#organization`;

/**
 * A real, consenting person with true credentials, or null. Never fill this with a placeholder.
 * Shape when used: { name: 'Full Name', jobTitle: 'Role', url: 'https://linkedin.com/in/...' }.
 */
export const NAMED_AUTHOR: { name: string; jobTitle: string; url?: string } | null = null;

/** The `author` of an Article, pointing at the one Organization entity published in index.html. */
export function authorJsonLd(authorName?: string | null): object {
  if (NAMED_AUTHOR) {
    return {
      '@type': 'Person',
      name: NAMED_AUTHOR.name,
      jobTitle: NAMED_AUTHOR.jobTitle,
      ...(NAMED_AUTHOR.url ? { url: NAMED_AUTHOR.url } : {}),
      worksFor: { '@id': ORGANIZATION_ID },
    };
  }
  const name = authorName?.trim() || AUTHOR_ORG_NAME;
  // The company's own @id when the credit is the company, so it is one entity and not a second
  // organisation with the same name; a different credit in the database keeps its own name.
  return name === AUTHOR_ORG_NAME
    ? { '@type': 'Organization', '@id': ORGANIZATION_ID, name, url: AUTHOR_SITE_URL }
    : { '@type': 'Organization', name, url: AUTHOR_SITE_URL };
}

export type AuthorBoxContent = {
  heading: string;
  /** One sentence: who wrote it and what they do. */
  lead: string;
  /** Checkable facts, each with an optional link to where it can be checked. */
  facts: ReadonlyArray<{ text: string; href?: string; linkText?: string }>;
  contact: { text: string; email: string };
};

export function authorBoxContent(): AuthorBoxContent {
  return {
    heading: 'About the author',
    lead: NAMED_AUTHOR
      ? `Written by ${NAMED_AUTHOR.name}, ${NAMED_AUTHOR.jobTitle} at ${AUTHOR_ORG_NAME}, a nickel strip and nickel busbar manufacturer in Mumbai.`
      : `Written by ${AUTHOR_ORG_NAME}, a manufacturer of nickel strip and nickel busbar for lithium-ion battery makers, working from Mumbai.`,
    facts: [
      { text: `Manufacturing since ${FOUNDED_YEAR}, ${YEARS_IN_BUSINESS} years, with strip made and slit in-house` },
      {
        text: 'ISO 9001:2015 and ISO 14001 certificates are published on the About page',
        href: '/about',
        linkText: 'See the certificates',
      },
      { text: `Works and office: ${POSTAL_ADDRESS.oneLine}` },
    ],
    contact: { text: 'Questions about this article can be sent to:', email: PRIMARY_EMAIL },
  };
}

import { buildProductSpecs, isNickelProduct, MINIMUM_ORDER_QUANTITY, DELIVERY_TIME } from './productSpecs.js';
import { CELL_FORMATS, STANDARD_THICKNESSES_MM, WIDTH_RANGE_MM } from './stripSizes.js';

/**
 * The questions a product page should answer outright.
 *
 * Answer engines — Google's featured snippets and People Also Ask, and the assistants that
 * quote pages back at people — lift a short, self-contained answer to a specific question. The
 * landing pages, the blog posts and the homepage all carry FAQ blocks for that reason. The
 * seventeen product pages carried none, which left the commercial questions ("what thickness is
 * this", "what is the minimum order", "is it pure nickel") answerable only by reading a
 * specification table, which is exactly the shape a machine cannot quote from.
 *
 * Every answer below is derived from data already on the product record — the same source the
 * spec table renders from — or from a published constant. Nothing here invents a figure, and a
 * question whose answer cannot be derived is omitted rather than filled with a guess. Answers
 * are kept to roughly 40-60 words, which is the length a snippet actually shows.
 *
 * Plain data, no React: seoSnapshot.ts renders the same questions for crawlers, so the visible
 * answer and the FAQPage markup can never differ.
 */

export type ProductFaq = { question: string; answer: string };

export type ProductFaqInput = {
  name?: string | null;
  description?: string | null;
  dimensions?: string | null;
  astm_value?: string | null;
  uns_value?: string | null;
};

/** Reads a row out of the spec table rather than re-deriving it here. */
const spec = (rows: ReturnType<typeof buildProductSpecs>, label: string) =>
  rows.find((row) => row.label === label)?.value ?? null;

export function buildProductFaqs(product: ProductFaqInput): ProductFaq[] {
  const name = (product.name ?? '').trim();
  if (!name) return [];

  const rows = buildProductSpecs(product);
  const nickel = isNickelProduct(product);
  const thickness = spec(rows, 'Thickness');
  const width = spec(rows, 'Width');
  const cellFormat = spec(rows, 'Cell format');
  const pattern = spec(rows, 'Pattern');
  const configuration = spec(rows, 'Configuration');
  const grade = spec(rows, 'Grade');
  const purity = spec(rows, 'Purity');
  const standard = spec(rows, 'Standard');

  const faqs: ProductFaq[] = [];

  // 1. The definition question. This doubles as the page's answer-first paragraph, so it leads.
  const identity = [
    purity ? `${purity} strip` : 'a battery interconnect',
    thickness ? `${thickness} thick` : null,
    width ? `${width} wide` : null,
    // "in the H-type pattern", not "in a h-type pattern": the value is a proper name and the
    // article would have to change with it.
    pattern ? `in the ${pattern} pattern` : null,
    cellFormat ? `for ${cellFormat} cells` : null,
    configuration ? `in a ${configuration} layout` : null,
  ].filter(Boolean);
  faqs.push({
    question: `What is ${name}?`,
    answer: `${name} is ${identity.join(', ')}. It is manufactured by Ramani Steel House in Mumbai, India and supplied PAN India and for export, from a ${MINIMUM_ORDER_QUANTITY} minimum order with despatch in about ${DELIVERY_TIME}.`,
  });

  // 2. Thickness — asked more than any other specification, and the answer includes the sizes
  //    that are not listed on this page, because a buyer whose size is missing otherwise leaves.
  if (nickel) {
    faqs.push({
      question: thickness ? `What thickness is ${name}?` : `What thicknesses is ${name} available in?`,
      answer: `${thickness ? `${name} is supplied in ${thickness}. ` : ''}Other thicknesses are made to order: ${STANDARD_THICKNESSES_MM.join(', ')} mm are standard, and widths run ${WIDTH_RANGE_MM.min}–${WIDTH_RANGE_MM.max} mm. Send your thickness and width with the enquiry and it is cut to that size.`,
    });
  }

  // 3. Material. Only for nickel items: the catalogue also holds a copper busbar, and answering
  //    "is it pure nickel" on that one would be a false material claim.
  if (nickel && purity) {
    faqs.push({
      question: `Is ${name} pure nickel or nickel-plated steel?`,
      answer: `It is ${purity}${grade ? `, ${grade}` : ''}${standard ? `, to ${standard}` : ''} — not nickel-plated steel. Pure nickel carries more current for the same cross-section and welds more consistently. A material test certificate is provided on request.`,
    });
  }

  // 4. Cell fit — nickel strip only. The catalogue also holds a copper busbar, which is sized
  //    from the module current rather than cut to a cell pitch, so the question does not apply.
  if (nickel) faqs.push({
    question: `Which battery cells does ${name} fit?`,
    answer: cellFormat
      ? `It is cut for ${cellFormat} cells${configuration ? ` in a ${configuration} arrangement` : ''}. Strip for other formats — ${CELL_FORMATS.filter((cell) => /^\d/.test(cell)).join(', ')} — and for any custom cell pitch is made to your pack drawing.`
      : `It is cut to the cell pitch of your pack. ${CELL_FORMATS.filter((cell) => /^\d/.test(cell)).join(', ')} and custom layouts are all supplied — send the cell arrangement or drawing with your enquiry.`,
  });

  // 5. Minimum order. The question that decides whether a small buyer enquires at all.
  faqs.push({
    question: `What is the minimum order for ${name}?`,
    answer: `The minimum order is ${MINIMUM_ORDER_QUANTITY}, and despatch is typically ${DELIVERY_TIME}. The same material, slitting and test certificates apply at ${MINIMUM_ORDER_QUANTITY} as at bulk quantities, so small battery manufacturers and traders can buy manufacturer-direct without a mill-sized order.`,
  });

  // 6. Custom work, including the tooling the business develops for new pack designs.
  faqs.push({
    question: `Can ${name} be made in a custom size or pattern?`,
    answer: `Yes. Thickness, width, length, pitch and hole pattern are cut to your drawing, and tooling is developed for unique battery pack layouts. Send the drawing or cell arrangement and the quotation is made against it rather than against a nearest standard size.`,
  });

  return faqs;
}

/** schema.org FAQPage for the questions above. */
export const productFaqJsonLd = (faqs: ProductFaq[]) =>
  faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : null;

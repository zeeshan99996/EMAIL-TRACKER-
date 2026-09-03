import * as cheerio from 'cheerio';
import crypto from 'crypto';

export interface ExtractedLink {
  linkId: string;
  originalUrl: string;
  linkLabel: string;
  linkIndex: number;
}

export interface ProcessedEmailHtml {
  trackingId: string;
  trackedHtml: string;
  links: ExtractedLink[];
}

/**
 * Generates a globally unique tracking ID with `trk_` prefix.
 */
export function generateTrackingId(): string {
  const randomHex = crypto.randomBytes(12).toString('hex');
  return `trk_${randomHex}`;
}

/**
 * Generates a unique link ID with `lnk_` prefix.
 */
export function generateLinkId(): string {
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `lnk_${randomHex}`;
}

/**
 * Checks if a given URL is eligible for tracking.
 */
export function isTrackableUrl(url: string, excludedDomains: string[] = []): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmedUrl = url.trim().toLowerCase();

  // Exclude non-HTTP schemes & anchors
  if (
    trimmedUrl.startsWith('mailto:') ||
    trimmedUrl.startsWith('tel:') ||
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('#') ||
    trimmedUrl.startsWith('data:')
  ) {
    return false;
  }

  // Check if URL is already a tracking endpoint
  if (trimmedUrl.includes('/t/click/') || trimmedUrl.includes('/t/open/')) {
    return false;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    // Check excluded domains
    if (excludedDomains.some(domain => parsed.hostname.toLowerCase().includes(domain.toLowerCase()))) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Processes email HTML content:
 * 1. Rewrites eligible links to point to the tracking endpoint.
 * 2. Appends an invisible 1x1 tracking pixel.
 */
export function processEmailHtml(
  html: string,
  appUrl: string,
  existingTrackingId?: string,
  excludedDomains: string[] = []
): ProcessedEmailHtml {
  const trackingId = existingTrackingId || generateTrackingId();
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

  const $ = cheerio.load(html);
  const links: ExtractedLink[] = [];

  let linkIndex = 0;

  $('a').each((_, element) => {
    const $link = $(element);
    const originalUrl = $link.attr('href');

    if (originalUrl && isTrackableUrl(originalUrl, excludedDomains)) {
      const linkId = generateLinkId();
      
      // Determine label
      const rawText = $link.text().trim();
      const titleAttr = $link.attr('title');
      const ariaAttr = $link.attr('aria-label');
      const linkLabel = rawText || titleAttr || ariaAttr || originalUrl;

      // Tracking redirect URL
      const trackingClickUrl = `${baseUrl}/t/click/${trackingId}/${linkId}`;
      $link.attr('href', trackingClickUrl);

      links.push({
        linkId,
        originalUrl,
        linkLabel,
        linkIndex,
      });

      linkIndex++;
    }
  });

  // Inject tracking pixel
  const pixelUrl = `${baseUrl}/t/open/${trackingId}`;
  const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none !important; width:1px !important; height:1px !important; border:0 !important; margin:0 !important; padding:0 !important;" />`;

  if ($('body').length > 0) {
    $('body').append(pixelHtml);
  } else {
    $.root().append(pixelHtml);
  }

  return {
    trackingId,
    trackedHtml: $.html(),
    links,
  };
}

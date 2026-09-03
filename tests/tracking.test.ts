import { describe, it, expect } from 'vitest';
import {
  generateTrackingId,
  generateLinkId,
  isTrackableUrl,
  processEmailHtml,
} from '../lib/tracking/html-parser';

describe('HTML Tracking & Rewriter Engine', () => {
  it('should generate valid trackingId with trk_ prefix', () => {
    const trackingId = generateTrackingId();
    expect(trackingId).toMatch(/^trk_[a-f0-9]{24}$/);
  });

  it('should generate valid linkId with lnk_ prefix', () => {
    const linkId = generateLinkId();
    expect(linkId).toMatch(/^lnk_[a-f0-9]{16}$/);
  });

  it('should correctly identify trackable vs excluded URLs', () => {
    expect(isTrackableUrl('https://erhatechnologies.com/services')).toBe(true);
    expect(isTrackableUrl('http://example.com?query=1#hash')).toBe(true);

    // Excluded schemes
    expect(isTrackableUrl('mailto:client@example.com')).toBe(false);
    expect(isTrackableUrl('tel:+1234567890')).toBe(false);
    expect(isTrackableUrl('javascript:void(0)')).toBe(false);
    expect(isTrackableUrl('#section-1')).toBe(false);

    // Excluded domains
    expect(isTrackableUrl('https://unsubscribe.com/optout', ['unsubscribe.com'])).toBe(false);
  });

  it('should rewrite eligible <a> links and append 1x1 tracking pixel', () => {
    const originalHtml = `
      <html>
        <body>
          <p>Hello</p>
          <a href="https://erhatechnologies.com/services">Our Services</a>
          <a href="mailto:admin@erha.com">Contact Email</a>
        </body>
      </html>
    `;

    const result = processEmailHtml(originalHtml, 'http://localhost:3000');

    expect(result.trackingId).toMatch(/^trk_/);
    expect(result.links.length).toBe(1);
    expect(result.links[0].originalUrl).toBe('https://erhatechnologies.com/services');
    expect(result.links[0].linkLabel).toBe('Our Services');

    // Verify rewritten HTML contains tracking endpoint and pixel
    expect(result.trackedHtml).toContain('/t/click/' + result.trackingId + '/');
    expect(result.trackedHtml).toContain('/t/open/' + result.trackingId);
    expect(result.trackedHtml).toContain('mailto:admin@erha.com'); // mailto should remain un-rewritten
  });
});

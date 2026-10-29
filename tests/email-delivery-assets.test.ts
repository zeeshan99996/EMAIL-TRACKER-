import { describe, it, expect } from 'vitest';
import { processHtmlForDelivery } from '@/lib/mail/smtp';
import { injectCustomActionButton, buildCustomActionButtonHtml } from '@/lib/templates/templates';
import { generateTemplate } from '@/lib/templates/generator';

describe('Email Deliverability & Assets Engine (Gmail Compatibility)', () => {
  it('should convert base64 image data URIs to RFC-compliant CID inline MIME attachments', () => {
    // 1x1 transparent PNG base64
    const sampleBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const backlinkUrl = 'https://erhatechnologies.com/services';

    const inputHtml = `
      <div style="font-family: Arial, sans-serif;">
        <p>Hi Alex,</p>
        <div style="text-align: center;">
          <a href="${backlinkUrl}" target="_blank">
            <img src="${sampleBase64}" alt="Company Portfolio" />
          </a>
        </div>
        <p>Best regards,<br>Team</p>
      </div>
    `;

    const { processedHtml, attachments } = processHtmlForDelivery(inputHtml);

    // 1. Should have extracted 1 attachment
    expect(attachments).toHaveLength(1);
    expect(attachments[0].contentType).toBe('image/png');
    expect(attachments[0].contentDisposition).toBe('inline');
    expect(attachments[0].cid).toMatch(/^graphic_\d+_\d+@mailify\.pro$/);
    expect(Buffer.isBuffer(attachments[0].content)).toBe(true);

    // 2. Processed HTML must not have data:image (Gmail proxy strips data URIs)
    expect(processedHtml).not.toContain('data:image/png');

    // 3. Processed HTML must point to the CID
    expect(processedHtml).toContain(`src="cid:${attachments[0].cid}"`);

    // 4. Backlink must be preserved
    expect(processedHtml).toContain(`href="${backlinkUrl}"`);

    // 5. Must have email-client-bulletproof styling
    expect(processedHtml).toContain('border="0"');
    expect(processedHtml).toContain('max-width: 100%');
  });

  it('should format external images with bulletproof display:block and border:0', () => {
    const inputHtml = `
      <div>
        <p>Check our flyer:</p>
        <a href="https://example.com/promo">
          <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600" />
        </a>
      </div>
    `;

    const { processedHtml, attachments } = processHtmlForDelivery(inputHtml);

    expect(attachments).toHaveLength(0); // external image, not base64
    expect(processedHtml).toContain('border="0"');
    expect(processedHtml).toContain('display: block');
    expect(processedHtml).toContain('alt="Campaign Graphic"');
    expect(processedHtml).toContain('href="https://example.com/promo"');
  });

  it('should build responsive Custom Action Button HTML', () => {
    const buttonHtml = buildCustomActionButtonHtml('our services', 'https://yourwebsite.com/services');

    expect(buttonHtml).toContain('our services &rarr;');
    expect(buttonHtml).toContain('href="https://yourwebsite.com/services"');
    expect(buttonHtml).toContain('background-color: #2563eb');
    expect(buttonHtml).toContain('text-decoration: none');
  });

  it('should inject Custom Action Button before sign-off when configured', () => {
    const rawTemplate = `
      <div style="font-family: Arial;">
        <p>Hi {{first_name}},</p>
        <p>We help businesses like {{company}} scale their customer outreach.</p>
        <p>Best regards,<br>Leadership Team</p>
      </div>
    `;

    const injected = injectCustomActionButton(rawTemplate, 'our services', 'https://yourwebsite.com/services');

    expect(injected).toContain('our services &rarr;');
    expect(injected).toContain('https://yourwebsite.com/services');

    // Button should be placed before 'Best regards'
    const buttonPos = injected.indexOf('our services &rarr;');
    const signoffPos = injected.indexOf('Best regards');
    expect(buttonPos).toBeLessThan(signoffPos);
  });

  it('should not duplicate Custom Action Button if already present in template', () => {
    const initial = `
      <div>
        <p>Hello,</p>
        <div style="text-align: center;">
          <a href="https://yourwebsite.com/services">our services &rarr;</a>
        </div>
        <p>Best regards,<br>Team</p>
      </div>
    `;

    const result = injectCustomActionButton(initial, 'our services', 'https://yourwebsite.com/services');
    const occurrences = (result.match(/https:\/\/yourwebsite\.com\/services/g) || []).length;
    expect(occurrences).toBe(1);
  });

  it('should guarantee button and image in synthesized and AI templates', async () => {
    const result = await generateTemplate({
      prompt: 'Cold email for web development agency',
      tone: 'professional',
      buttonText: 'our services',
      buttonUrl: 'https://yourwebsite.com/services',
      imageUrl: 'https://placehold.co/600x200/eff6ff/2563eb?text=Portfolio',
      imageLinkUrl: 'https://yourwebsite.com/portfolio',
    });

    expect(result.body).toContain('our services &rarr;');
    expect(result.body).toContain('https://yourwebsite.com/services');
    expect(result.body).toContain('https://placehold.co/600x200/eff6ff/2563eb?text=Portfolio');
    expect(result.body).toContain('https://yourwebsite.com/portfolio');
    expect(result.buttonText).toBe('our services');
    expect(result.buttonUrl).toBe('https://yourwebsite.com/services');
  });
});

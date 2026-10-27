import { describe, it, expect } from 'vitest';
import {
  isGoogleSheetUrl,
  getGoogleSheetCsvUrl,
  parseCSV,
  convertCsvToLeads,
} from '@/lib/campaigns/google-sheet-parser';

describe('Google Sheet Parser Engine', () => {
  it('correctly identifies Google Sheets URLs', () => {
    expect(isGoogleSheetUrl('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0')).toBe(true);
    expect(isGoogleSheetUrl('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing')).toBe(true);
    expect(isGoogleSheetUrl('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ/pubhtml')).toBe(true);
    expect(isGoogleSheetUrl('https://script.google.com/macros/s/AKfycbx/exec')).toBe(false);
    expect(isGoogleSheetUrl('https://example.com/spreadsheet')).toBe(false);
  });

  it('generates the appropriate CSV export URL for standard and published sheets', () => {
    const editUrl = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=12345';
    expect(getGoogleSheetCsvUrl(editUrl)).toBe(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv&gid=12345'
    );

    const shareUrl = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing';
    expect(getGoogleSheetCsvUrl(shareUrl)).toBe(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv&gid=0'
    );

    const pubUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ/pubhtml';
    expect(getGoogleSheetCsvUrl(pubUrl)).toBe('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ/pub?output=csv');
  });

  it('robustly parses CSV text with quotes and commas', () => {
    const csv = `Name,Email,Company,Phone\n"John Doe, Jr.","john@example.com","Acme, ""Super"" Corp",+1-555-0199\nJane Smith,jane@test.org,Beta Inc,+1-555-0200`;
    const rows = parseCSV(csv);
    expect(rows.length).toBe(3);
    expect(rows[0]).toEqual(['Name', 'Email', 'Company', 'Phone']);
    expect(rows[1][0]).toBe('John Doe, Jr.');
    expect(rows[1][1]).toBe('john@example.com');
    expect(rows[1][2]).toBe('Acme, "Super" Corp');
    expect(rows[1][3]).toBe('+1-555-0199');
    expect(rows[2][0]).toBe('Jane Smith');
  });

  it('detects private Google Sheet HTML responses gracefully', () => {
    const htmlResponse = `<!DOCTYPE html><html><head><title>Google Accounts</title></head><body>ServiceLogin accounts.google.com</body></html>`;
    const result = convertCsvToLeads(htmlResponse);
    expect(result.success).toBe(false);
    expect(result.isPrivate).toBe(true);
    expect(result.error).toContain('private');
  });

  it('converts parsed CSV into normalized LeadItem objects with column intelligence', () => {
    const csv = `Full Name,Work Email,Organization Name,Website\nAlice Johnson,alice@techgrowth.io,Tech Growth Inc,https://techgrowth.io\nBob Vance,bob@vancerefrigeration.com,Vance Refrigeration,vancerefrigeration.com`;
    const result = convertCsvToLeads(csv);
    expect(result.success).toBe(true);
    expect(result.leads.length).toBe(2);
    expect(result.leads[0].name).toBe('Alice Johnson');
    expect(result.leads[0].email).toBe('alice@techgrowth.io');
    expect(result.leads[0].company).toBe('Tech Growth Inc');
    expect(result.leads[0].website).toBe('https://techgrowth.io');
    expect(result.leads[0].status).toBe('PENDING');
  });

  it('derives company and name intelligently if columns are missing', () => {
    const csv = `Email Address,Notes\nceo@innovatehub.ai,Urgent lead`;
    const result = convertCsvToLeads(csv);
    expect(result.success).toBe(true);
    expect(result.leads.length).toBe(1);
    expect(result.leads[0].email).toBe('ceo@innovatehub.ai');
    expect(result.leads[0].company).toBe('Innovatehub');
    expect(result.leads[0].name).toBe('Ceo');
  });
});

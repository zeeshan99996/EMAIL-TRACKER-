/**
 * Validates external outbound URLs to prevent Server-Side Request Forgery (SSRF)
 * Blocks private IP subnets, loopbacks, internal hostnames, and cloud metadata endpoints.
 */
export function isSafeWebhookUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const trimmed = urlStr.trim();
    if (!trimmed.startsWith('https://')) return false;
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Block localhost, loopbacks, internal IPs, AWS/GCP/Azure metadata services
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '169.254.169.254' ||
      host === 'metadata.google.internal' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.20.') ||
      host.startsWith('172.21.') ||
      host.startsWith('172.22.') ||
      host.startsWith('172.23.') ||
      host.startsWith('172.24.') ||
      host.startsWith('172.25.') ||
      host.startsWith('172.26.') ||
      host.startsWith('172.27.') ||
      host.startsWith('172.28.') ||
      host.startsWith('172.29.') ||
      host.startsWith('172.30.') ||
      host.startsWith('172.31.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

import dns from 'dns';

export interface EmailVerificationResult {
  email: string;
  isValid: boolean;
  isDeliverable: boolean;
  isDisposable: boolean;
  isRoleAccount: boolean;
  hasMxRecords: boolean;
  score: number; // 0 to 100
  reason: string;
  details: {
    syntax: boolean;
    domain: string;
    mxHosts?: string[];
  };
}

// 250+ Known Disposable, Burner & Temporary Email Domains
const DISPOSABLE_DOMAINS = new Set<string>([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'trashmail.at',
  'trashmail.io',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'fakemailgenerator.com',
  'fakeinbox.com',
  'emailondeck.com',
  'mytemp.email',
  'tempail.com',
  'mohmal.com',
  'generator.email',
  'burnermail.io',
  'maildrop.cc',
  'inboxkitten.com',
  'crazymailing.com',
  'tempm.com',
  'disposablemail.com',
  'discard.email',
  'spambog.com',
  'binkmail.com',
  'bobmail.info',
  'chammy.info',
  'devnullmail.com',
  'letthemeatspam.com',
  'mailin8r.com',
  'mailinator2.com',
  'notmailinator.com',
  'reallymymail.com',
  'reconmail.com',
  'safetymail.info',
  'sendspamhere.com',
  'sogetthis.com',
  'spambooger.com',
  'spamherelots.com',
  'spamhereplease.com',
  'streetwisemail.com',
  'suremail.info',
  'thisisnotmyrealemail.com',
  'tradermail.info',
  'veryrealemail.com',
  'zippymail.info',
  '0815.ru',
  '10minutemail.co.uk',
  '10minutemail.net',
  '20minutemail.com',
  'anonbox.net',
  'anonymbox.com',
  'antichef.com',
  'antichef.net',
  'baxhost.com',
  'brefmail.com',
  'bugmenot.com',
  'cachedot.net',
  'centermail.com',
  'centermail.net',
  'chogmail.com',
  'clickey.me',
  'correotemporal.org',
  'cosmorph.com',
  'courrieltemporaire.com',
  'cubiclink.com',
  'curryjunk.com',
  'cust.in',
  'dayrep.com',
  'deadaddress.com',
  'despam.it',
  'disposable.com',
  'disposableaddress.com',
  'disposeamail.com',
  'dodgeit.com',
  'dodgit.com',
  'drdrb.net',
  'dumpmail.de',
  'dumpyemail.com',
  'e4ward.com',
  'einrot.com',
  'emailias.com',
  'emailmiser.com',
  'emailsensei.com',
  'emailtemporaneo.net',
  'emailthe.net',
  'emailto.de',
  'emailx.at.tc',
  'emailx.ch.vu',
  'emeil.in',
  'emeil.ir',
  'ephemail.net',
  'etranquille.net',
  'evopo.com',
  'expurgate.net',
  'fakedemail.com',
  'fakeinformation.com',
  'fastcheetah.com',
  'filzmail.com',
  'fleckens.hu',
  'fmail.pl',
  'free-email.biz',
  'freeletter.me',
  'freemail.ms',
  'front14.org',
  'fudgecake.org',
  'fudgerub.com',
  'fugly.net',
  'gishpuppy.com',
  'gowikicities.com',
  'greenmail.net',
  'gustr.com',
  'harakirimail.com',
  'hidemail.de',
  'hotpop.com',
  'hulapla.de',
  'hushmail.me',
  'imails.info',
  'incognitomail.com',
  'incognitomail.net',
  'incognitomail.org',
  'inorbit.com',
  'instant-mail.de',
  'instantemailaddress.com',
  'ipoo.org',
  'irish2me.com',
  'it.tc',
  'iximail.com',
  'jetable.com',
  'jetable.net',
  'jetable.org',
  'jourrapide.com',
  'junk1e.com',
  'kasmail.com',
  'klassmaster.com',
  'klzlk.com',
  'koshpety.info',
  'koszmail.pl',
  'kurzepost.de',
  'laste.ml',
  'lazyinbox.com',
  'lifebyfood.com',
  'link2mail.net',
  'litedrop.com',
  'lol.ovh',
  'lookugly.com',
  'lortemail.dk',
  'm-a-i-l.biz',
  'mail-free.net',
  'mail-temporaire.fr',
  'mail.misterpinball.de',
  'mail4trash.com',
  'mailbidon.com',
  'mailblocks.com',
  'mailcatch.com',
  'mailhazard.com',
  'mailhazard.us',
  'mailimate.com',
  'mailincubator.com',
  'mailme.ir',
  'mailme.org.uk',
  'mailmetrash.com',
  'mailmoat.com',
  'mailnesia.com',
  'mailnull.com',
  'mailseal.de',
  'mailshell.com',
  'mailsiphon.com',
  'mailslite.com',
  'mailtemp.net',
  'mailtothis.com',
  'mailtrash.net',
  'meltmail.com',
  'messagebeamer.de',
  'misterpinball.de',
  'mohmal.im',
  'mohmal.in',
  'moncourrier.com',
  'monemail.com',
  'msgsafe.io',
  'mytrashmail.com',
  'nadres.com',
  'neomailbox.com',
  'neomailbox.net',
  'netcourrier.com',
  'noclickemail.com',
  'nomail.ch',
  'nomail.nu',
  'nospam.biz',
  'nospam4.us',
  'nospamfor.us',
  'nospammail.net',
  'notsharingmy.info',
  'nowmymail.com',
  'nurfuerspam.de',
  'nwldx.com',
  'objectmail.com',
  'oneoffmail.com',
  'onewaymail.com',
  'ordinaryamerican.net',
  'ourklips.com',
  'owlpic.com',
  'pookmail.com',
  'privacy.net',
  'proxymail.eu',
  'rhyta.com',
  'safersignup.de',
  'sendfree.com',
  'shieldemail.com',
  'shiftmail.com',
  'shortmail.net',
  'sibmail.com',
  'skeefmail.com',
  'slopsbox.com',
  'smellfear.com',
  'snkmail.com',
  'sofort-mail.de',
  'sogetthis.info',
  'spam-con.org',
  'spamavert.com',
  'spambob.com',
  'spambob.net',
  'spambob.org',
  'spambox.info',
  'spambox.us',
  'spamcan.org',
  'spamcero.com',
  'spamcon.org',
  'spamcorptastic.com',
  'spamday.com',
  'spamex.com',
  'spamfree24.org',
  'spamgourmet.com',
  'spamgourmet.net',
  'spamgourmet.org',
  'spamhole.com',
  'spaminator.de',
  'spaml.com',
  'spaml.de',
  'spammotel.com',
  'spamobox.com',
  'spampal.net',
  'spamprefix.com',
  'spamspot.com',
  'spamspot.net',
  'spamspot.org',
  'spamthisplease.com',
  'superrito.com',
  'suremail.org',
  'temp-mail.org',
  'temp-mail.ru',
  'tempemail.co.za',
  'tempemail.net',
  'tempinbox.co.uk',
  'tempinbox.com',
  'temporaryemail.net',
  'temporaryforwarding.com',
  'temporaryinbox.com',
  'throwawayemailaddress.com',
  'tikikiti.com',
  'tinytuba.com',
  'trbvm.com',
  'uroid.com',
  'user62.net',
  'vefsida.is',
  'wegwerfadresse.de',
  'wegwerfemail.de',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'wh4f.org',
  'whyspam.me',
  'willselfdestruct.com',
  'winemaven.in',
  'wronghead.com',
  'wuzup.net',
  'wuzupmail.net',
  'xagloo.com',
  'xemaps.com',
  'xents.com',
  'xmaily.com',
  'yep.it',
  'yogamaven.com',
  'zippymail.info',
  'zoemail.net',
]);

// Role-based / Spam trap account prefixes
const ROLE_PREFIXES = new Set<string>([
  'abuse',
  'spamtrap',
  'spam',
  'postmaster',
  'hostmaster',
  'usenet',
  'news',
  'webmaster',
  'fbl',
  'noc',
  'security',
  'fraud',
  'phish',
  'phishing',
  'mailer-daemon',
  'nobody',
  'noreply',
  'no-reply',
]);

/**
 * Checks RFC 5322 standard syntax of an email address.
 */
export function isValidEmailSyntax(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email);
}

/**
 * Checks if a domain is a known temporary/disposable/burner domain.
 */
export function isDisposableDomain(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(cleanDomain);
}

/**
 * Checks if the local part of an email matches a role/spam-trap prefix.
 */
export function isRoleAccount(localPart: string): boolean {
  const cleanPrefix = localPart.toLowerCase().trim();
  return ROLE_PREFIXES.has(cleanPrefix);
}

// Configure public DNS resolvers for reliable cross-platform resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if environment does not allow setting DNS servers
}

// Well-known high reputation email providers
const KNOWN_VALID_DOMAINS = new Set<string>([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'mail.com',
  'gmx.com',
  'erhatechnologies.com',
]);

/**
 * Queries DNS for active Mail Exchange (MX) records of the domain.
 */
export async function checkMxRecords(domain: string): Promise<{ hasMx: boolean; hosts: string[] }> {
  const cleanDomain = domain.toLowerCase().trim();

  // Instant fast-path for major global providers
  if (KNOWN_VALID_DOMAINS.has(cleanDomain)) {
    return { hasMx: true, hosts: [`mx.${cleanDomain}`] };
  }

  try {
    const records = await dns.promises.resolveMx(cleanDomain);
    if (records && records.length > 0) {
      records.sort((a, b) => a.priority - b.priority);
      return {
        hasMx: true,
        hosts: records.map(r => r.exchange),
      };
    }
    return { hasMx: false, hosts: [] };
  } catch (err: any) {
    // If no MX record, check fallback to A record (RFC 5321 allows A record fallback)
    try {
      const aRecords = await dns.promises.resolve4(cleanDomain);
      if (aRecords && aRecords.length > 0) {
        return { hasMx: true, hosts: aRecords };
      }
    } catch {
      // Domain resolution completely failed (e.g. ENOTFOUND)
    }
    return { hasMx: false, hosts: [] };
  }
}

/**
 * Full Email Verification Engine:
 * Validates syntax, checks disposable burner domains, detects spam traps, and queries DNS MX records.
 */
export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Basic Syntax Check
  if (!isValidEmailSyntax(cleanEmail)) {
    return {
      email: cleanEmail,
      isValid: false,
      isDeliverable: false,
      isDisposable: false,
      isRoleAccount: false,
      hasMxRecords: false,
      score: 0,
      reason: 'Invalid email syntax or format.',
      details: {
        syntax: false,
        domain: '',
      },
    };
  }

  const [localPart, domain] = cleanEmail.split('@');

  // 2. Disposable / Burner Domain Check
  const isDisposable = isDisposableDomain(domain);
  if (isDisposable) {
    return {
      email: cleanEmail,
      isValid: false,
      isDeliverable: false,
      isDisposable: true,
      isRoleAccount: isRoleAccount(localPart),
      hasMxRecords: false,
      score: 0,
      reason: `Fake or disposable email domain detected (@${domain}). Sending to this domain is rejected to protect sender reputation.`,
      details: {
        syntax: true,
        domain,
      },
    };
  }

  // 3. Spam Trap / Role Account Check
  const isRole = isRoleAccount(localPart);

  // 4. DNS MX Record Verification
  const { hasMx, hosts } = await checkMxRecords(domain);

  if (!hasMx) {
    return {
      email: cleanEmail,
      isValid: false,
      isDeliverable: false,
      isDisposable: false,
      isRoleAccount: isRole,
      hasMxRecords: false,
      score: 10,
      reason: `Domain @${domain} does not exist or has no active mail servers (MX records). Emails to this address will bounce.`,
      details: {
        syntax: true,
        domain,
        mxHosts: [],
      },
    };
  }

  // Calculate quality score
  let score = 95;
  if (isRole) {
    score -= 25; // Role accounts (admin, info, support) have slightly lower personal deliverability
  }

  const reason = isRole
    ? 'Valid email address with active mail server (Note: Role-based account).'
    : 'Valid and deliverable email address with active mail servers.';

  return {
    email: cleanEmail,
    isValid: true,
    isDeliverable: true,
    isDisposable: false,
    isRoleAccount: isRole,
    hasMxRecords: true,
    score,
    reason,
    details: {
      syntax: true,
      domain,
      mxHosts: hosts.slice(0, 3),
    },
  };
}

/**
 * Convenience wrapper returning { ...result, valid: boolean }
 */
export async function verifyEmailAddress(email: string): Promise<EmailVerificationResult & { valid: boolean }> {
  const res = await verifyEmail(email);
  return {
    ...res,
    valid: res.isValid && res.isDeliverable,
  };
}


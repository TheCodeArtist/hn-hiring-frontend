/**
 * Utility functions for generating company logo URLs
 */

/**
 * Extracts domain from company website URL or apply link
 * @param url - Company website or apply link
 * @returns Domain name (e.g., 'example.com')
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Attempts to extract domain from apply links
 * @param applyLinks - Array of apply link URLs
 * @returns First valid domain found, or null
 */
function getDomainFromApplyLinks(applyLinks: string[]): string | null {
  for (const link of applyLinks) {
    const domain = extractDomain(link);
    if (domain && !isGenericJobBoard(domain)) {
      return domain;
    }
  }
  return null;
}

/**
 * Check if domain is a generic job board (not company-specific)
 */
function isGenericJobBoard(domain: string): boolean {
  const genericDomains = [
    'lever.co',
    'greenhouse.io',
    'ashbyhq.com',
    'workable.com',
    'breezy.hr',
    'bamboohr.com',
    'smartrecruiters.com',
    'jobvite.com',
    'icims.com',
    'taleo.net',
    'myworkdayjobs.com',
    'ultipro.com',
    'recruitee.com',
    'personio.de',
    'personio.com',
    'workday.com',
    'indeed.com',
    'linkedin.com',
    'angel.co',
    'wellfound.com',
    'glassdoor.com',
    'monster.com',
    'ziprecruiter.com',
    'careers-page.com',
    'jobs.github.com',
    'stackoverflow.com',
    'notion.site',
    'github.com'
  ];
  
  return genericDomains.some(generic => domain.includes(generic));
}

/**
 * Generates a favicon URL using Google's favicon service
 * Falls back to DuckDuckGo if primary fails
 * @param domain - Domain name (e.g., 'example.com')
 * @returns Favicon URL
 */
function getFaviconUrl(domain: string): string {
  // Google's favicon service is reliable and fast
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

/**
 * Generates a fallback logo URL using DuckDuckGo's icon service
 * @param domain - Domain name
 * @returns Fallback favicon URL
 */
function getFallbackFaviconUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

/**
 * Main function to get company logo URL
 * @param companyName - Company name
 * @param companyWebsite - Optional company website
 * @param applyLinks - Optional array of apply links
 * @returns Logo URL and fallback URL, or null if no valid source
 */
export function getCompanyLogoUrl(
  companyName: string | null,
  companyWebsite?: string | null,
  applyLinks?: string[]
): { primary: string; fallback: string } | null {
  if (!companyName) {
    return null;
  }

  let domain: string | null = null;

  // Priority 1: Use company website if provided
  if (companyWebsite) {
    domain = extractDomain(companyWebsite);
  }

  // Priority 2: Extract from apply links (skip generic job boards)
  if (!domain && applyLinks && applyLinks.length > 0) {
    domain = getDomainFromApplyLinks(applyLinks);
  }

  // Priority 3: Try to construct from company name
  if (!domain) {
    // Clean company name and convert to potential domain
    const cleanName = companyName
      .toLowerCase()
      .replace(/\s+inc\.?$/i, '')
      .replace(/\s+llc\.?$/i, '')
      .replace(/\s+ltd\.?$/i, '')
      .replace(/\s+corp\.?$/i, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '')
      .trim();
    
    if (cleanName) {
      domain = `${cleanName}.com`;
    }
  }

  if (!domain) {
    return null;
  }

  return {
    primary: getFaviconUrl(domain),
    fallback: getFallbackFaviconUrl(domain)
  };
}

/**
 * Gets initials from company name for use as a text fallback
 * @param companyName - Company name
 * @returns 1-2 character initials
 */
export function getCompanyInitials(companyName: string | null): string {
  if (!companyName) {
    return '?';
  }

  const words = companyName
    .split(/\s+/)
    .filter(word => word.length > 0)
    .filter(word => !['inc', 'llc', 'ltd', 'corp'].includes(word.toLowerCase()));

  if (words.length === 0) {
    return companyName.charAt(0).toUpperCase();
  }

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/**
 * Sanitize HTML input to prevent XSS attacks.
 * Strips all HTML tags (equivalent to DOMPurify with ALLOWED_TAGS: [], KEEP_CONTENT: true).
 * Uses regex instead of isomorphic-dompurify/jsdom to stay compatible with Vercel Edge/Node runtime.
 */
export function sanitizeHtml(dirty: string): string {
  return dirty.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize user input (text fields)
 * Uklanja HTML tagove i opasne karaktere
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Escape special characters (this also neutralizes HTML tags)
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Sanitize object properties recursively
 * Koristi se za sanitizaciju celog request body-ja
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email).toLowerCase();

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeHtml(url.trim());

  try {
    const parsedUrl = new URL(sanitized);

    // Allow only http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid URL protocol');
    }

    return parsedUrl.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

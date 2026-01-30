/**
 * Input sanitization utilities for user-generated content.
 * Helps prevent XSS attacks and ensures data integrity.
 */

// HTML entities to escape
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - Input string
 * @returns {string} - Escaped string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char]);
}

/**
 * Strip all HTML tags from a string
 * @param {string} str - Input string
 * @returns {string} - String with HTML tags removed
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Remove null bytes and other dangerous characters
 * @param {string} str - Input string
 * @returns {string} - Cleaned string
 */
export function removeNullBytes(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\0/g, '');
}

/**
 * Normalize whitespace (collapse multiple spaces, trim)
 * @param {string} str - Input string
 * @returns {string} - Normalized string
 */
export function normalizeWhitespace(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Remove control characters except newlines and tabs
 * @param {string} str - Input string
 * @returns {string} - Cleaned string
 */
export function removeControlChars(str) {
  if (typeof str !== 'string') return str;
  // Allow newlines (\n), carriage returns (\r), and tabs (\t)
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Truncate string to maximum length
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Truncated string
 */
export function truncate(str, maxLength) {
  if (typeof str !== 'string') return str;
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength);
}

/**
 * Sanitize a username
 * - Alphanumeric, underscore, hyphen only
 * - 3-30 characters
 * @param {string} username - Input username
 * @returns {string} - Sanitized username
 */
export function sanitizeUsername(username) {
  if (typeof username !== 'string') return '';
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 30);
}

/**
 * Sanitize email address
 * @param {string} email - Input email
 * @returns {string} - Sanitized email
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim().slice(0, 254);
}

/**
 * Sanitize general text input (comments, messages, etc.)
 * @param {string} text - Input text
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text, options = {}) {
  const {
    maxLength = 10000,
    preserveNewlines = true,
    escapeHtmlChars = true,
  } = options;

  if (typeof text !== 'string') return '';

  let result = text;

  // Remove null bytes
  result = removeNullBytes(result);

  // Remove control characters
  result = removeControlChars(result);

  // Optionally escape HTML
  if (escapeHtmlChars) {
    result = escapeHtml(result);
  }

  // Handle whitespace
  if (preserveNewlines) {
    // Normalize spaces but preserve newlines
    result = result
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  } else {
    result = normalizeWhitespace(result);
  }

  // Truncate
  result = truncate(result, maxLength);

  return result.trim();
}

/**
 * Sanitize a tag/label
 * @param {string} tag - Input tag
 * @returns {string} - Sanitized tag
 */
export function sanitizeTag(tag) {
  if (typeof tag !== 'string') return '';
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/**
 * Sanitize an array of tags
 * @param {string[]} tags - Input tags
 * @param {number} maxTags - Maximum number of tags
 * @returns {string[]} - Sanitized tags
 */
export function sanitizeTags(tags, maxTags = 5) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map(sanitizeTag)
    .filter((tag) => tag.length > 0)
    .filter((tag, index, self) => self.indexOf(tag) === index) // Unique
    .slice(0, maxTags);
}

/**
 * Sanitize URL
 * @param {string} url - Input URL
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return null;

  try {
    const parsed = new URL(url.trim());

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Sanitize MongoDB ObjectId
 * @param {string} id - Input ID
 * @returns {string|null} - Sanitized ID or null if invalid
 */
export function sanitizeObjectId(id) {
  if (typeof id !== 'string') return null;
  const cleaned = id.trim();
  // Valid ObjectId is 24 hex characters
  if (/^[a-f0-9]{24}$/i.test(cleaned)) {
    return cleaned;
  }
  return null;
}

/**
 * Middleware factory to sanitize request body fields
 * @param {string[]} fields - Fields to sanitize
 * @param {object} options - Sanitization options per field
 * @returns {function} - Express middleware
 */
export function createSanitizeMiddleware(fields, options = {}) {
  return (req, res, next) => {
    if (!req.body) return next();

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        const fieldOptions = options[field] || {};
        const type = fieldOptions.type || 'text';

        switch (type) {
          case 'username':
            req.body[field] = sanitizeUsername(req.body[field]);
            break;
          case 'email':
            req.body[field] = sanitizeEmail(req.body[field]);
            break;
          case 'tag':
            req.body[field] = sanitizeTag(req.body[field]);
            break;
          case 'tags':
            req.body[field] = sanitizeTags(req.body[field], fieldOptions.maxTags);
            break;
          case 'url':
            req.body[field] = sanitizeUrl(req.body[field]);
            break;
          case 'objectId':
            req.body[field] = sanitizeObjectId(req.body[field]);
            break;
          case 'text':
          default:
            req.body[field] = sanitizeText(req.body[field], fieldOptions);
        }
      }
    }

    next();
  };
}

export default {
  escapeHtml,
  stripHtml,
  removeNullBytes,
  normalizeWhitespace,
  removeControlChars,
  truncate,
  sanitizeUsername,
  sanitizeEmail,
  sanitizeText,
  sanitizeTag,
  sanitizeTags,
  sanitizeUrl,
  sanitizeObjectId,
  createSanitizeMiddleware,
};

/**
 * Frontend Input Validation and Sanitization Utilities
 * Provides validation rules and sanitization for all user inputs
 */

/**
 * Validation patterns and rules
 */
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    maxLength: 128,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
  },
  fullName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]*$/,
    message: 'Full name can only contain letters, spaces, hyphens, and apostrophes'
  },
  teamName: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.]*$/,
    message: 'Team name can only contain letters, numbers, spaces, hyphens, underscores, and dots'
  },
  companyName: {
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-_.&()]*$/,
    message: 'Company name can only contain letters, numbers, spaces, and basic symbols'
  },
  industrialSector: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-]*$/,
    message: 'Invalid industry sector'
  },
  keywords: {
    minLength: 1,
    maxLength: 500,
    message: 'Keywords must be between 1 and 500 characters'
  },
  notes: {
    maxLength: 5000,
    message: 'Notes must not exceed 5000 characters'
  },
  tender_id: {
    minLength: 1,
    maxLength: 100,
    message: 'Invalid tender ID'
  },
  status: {
    allowedValues: ['pending', 'under_review', 'shortlisted', 'declined', 'archived'],
    message: 'Invalid status value'
  },
  number: {
    minValue: 0,
    maxValue: 100,
    message: 'Value must be between 0 and 100'
  }
};

/**
 * Sanitizes string input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Sanitizes email input
 * @param {string} email - Raw email input
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  const sanitized = sanitizeString(email);
  return sanitized.toLowerCase();
};

/**
 * Sanitizes numbers - only allow digits and basic math operators
 * @param {any} input - Raw number input
 * @returns {number|null} - Sanitized number or null if invalid
 */
export const sanitizeNumber = (input) => {
  const num = Number(input);
  return isNaN(num) ? null : num;
};

/**
 * Sanitizes array of strings
 * @param {array} arr - Array of strings
 * @returns {array} - Sanitized array
 */
export const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0);
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateEmail = (email) => {
  const rules = VALIDATION_RULES.email;
  const sanitized = sanitizeEmail(email);
  
  if (!sanitized) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: `Email must not exceed ${rules.maxLength} characters` };
  }
  
  if (!rules.pattern.test(sanitized)) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, errors: array }
 */
export const validatePassword = (password) => {
  const rules = VALIDATION_RULES.password;
  const errors = [];
  
  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }
  
  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters`);
  }
  
  if (password.length > rules.maxLength) {
    errors.push(`Password must not exceed ${rules.maxLength} characters`);
  }
  
  if (!rules.hasUpperCase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!rules.hasLowerCase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!rules.hasNumber.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!rules.hasSpecialChar.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Validates full name
 * @param {string} fullName - Name to validate
 * @returns {object} - { valid: boolean, error: string, sanitized: string }
 */
export const validateFullName = (fullName) => {
  const rules = VALIDATION_RULES.fullName;
  const sanitized = sanitizeString(fullName);
  
  if (!sanitized) {
    return { valid: false, error: 'Full name is required' };
  }
  
  if (sanitized.length < rules.minLength) {
    return { valid: false, error: `Full name must be at least ${rules.minLength} characters` };
  }
  
  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: `Full name must not exceed ${rules.maxLength} characters` };
  }
  
  if (!rules.pattern.test(sanitized)) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validates team name
 * @param {string} teamName - Team name to validate
 * @returns {object} - { valid: boolean, error: string, sanitized: string }
 */
export const validateTeamName = (teamName) => {
  const rules = VALIDATION_RULES.teamName;
  const sanitized = sanitizeString(teamName);
  
  if (!sanitized) {
    return { valid: false, error: 'Team name is required' };
  }
  
  if (sanitized.length < rules.minLength) {
    return { valid: false, error: `Team name must be at least ${rules.minLength} character` };
  }
  
  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: `Team name must not exceed ${rules.maxLength} characters` };
  }
  
  if (!rules.pattern.test(sanitized)) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validates company name
 * @param {string} companyName - Company name to validate
 * @returns {object} - { valid: boolean, error: string, sanitized: string }
 */
export const validateCompanyName = (companyName) => {
  const rules = VALIDATION_RULES.companyName;
  const sanitized = sanitizeString(companyName);
  
  if (!sanitized) {
    return { valid: false, error: 'Company name is required' };
  }
  
  if (sanitized.length < rules.minLength) {
    return { valid: false, error: `Company name must be at least ${rules.minLength} character` };
  }
  
  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: `Company name must not exceed ${rules.maxLength} characters` };
  }
  
  if (!rules.pattern.test(sanitized)) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validates keywords/search input
 * @param {string} keywords - Keywords to validate
 * @returns {object} - { valid: boolean, error: string, sanitized: string }
 */
export const validateKeywords = (keywords) => {
  const rules = VALIDATION_RULES.keywords;
  const sanitized = sanitizeString(keywords);
  
  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validates notes field
 * @param {string} notes - Notes to validate
 * @returns {object} - { valid: boolean, error: string, sanitized: string }
 */
export const validateNotes = (notes) => {
  if (!notes) {
    return { valid: true, sanitized: '' };
  }
  
  const rules = VALIDATION_RULES.notes;
  const sanitized = sanitizeString(notes);
  
  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validates tender ID
 * @param {string} tenderId - Tender ID to validate
 * @returns {object} - { valid: boolean, error: string, sanitized: string }
 */
export const validateTenderId = (tenderId) => {
  const rules = VALIDATION_RULES.tender_id;
  const sanitized = sanitizeString(tenderId);
  
  if (!sanitized) {
    return { valid: false, error: 'Tender ID is required' };
  }
  
  if (sanitized.length < rules.minLength || sanitized.length > rules.maxLength) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validates status value
 * @param {string} status - Status to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateStatus = (status) => {
  const rules = VALIDATION_RULES.status;
  
  if (!status || !rules.allowedValues.includes(status)) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true };
};

/**
 * Validates numeric input
 * @param {any} value - Value to validate
 * @returns {object} - { valid: boolean, error: string, value: number }
 */
export const validateNumber = (value) => {
  const rules = VALIDATION_RULES.number;
  const num = sanitizeNumber(value);
  
  if (num === null) {
    return { valid: false, error: 'Invalid number' };
  }
  
  if (num < rules.minValue || num > rules.maxValue) {
    return { valid: false, error: rules.message };
  }
  
  return { valid: true, value: num };
};

/**
 * Validates registration data
 * @param {object} data - Registration form data
 * @returns {object} - { valid: boolean, errors: object, sanitized: object }
 */
export const validateRegistrationForm = (data) => {
  const errors = {};
  const sanitized = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  } else {
    sanitized.email = emailValidation.sanitized;
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.errors;
  } else {
    sanitized.password = data.password;
  }
  
  // Validate full name
  const nameValidation = validateFullName(data.full_name);
  if (!nameValidation.valid) {
    errors.full_name = nameValidation.error;
  } else {
    sanitized.full_name = nameValidation.sanitized;
  }
  
  // Validate team name
  const teamValidation = validateTeamName(data.team_name);
  if (!teamValidation.valid) {
    errors.team_name = teamValidation.error;
  } else {
    sanitized.team_name = teamValidation.sanitized;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : null,
    sanitized
  };
};

/**
 * Validates company profile data
 * @param {object} data - Company profile form data
 * @returns {object} - { valid: boolean, errors: object, sanitized: object }
 */
export const validateCompanyProfileForm = (data) => {
  const errors = {};
  const sanitized = {};
  
  // Validate company name
  const companyValidation = validateCompanyName(data.company_name);
  if (!companyValidation.valid) {
    errors.company_name = companyValidation.error;
  } else {
    sanitized.company_name = companyValidation.sanitized;
  }
  
  // Validate industry sector
  if (data.industry_sector) {
    const rules = VALIDATION_RULES.industrialSector;
    const sanitized_sector = sanitizeString(data.industry_sector);
    
    if (sanitized_sector.length < rules.minLength || sanitized_sector.length > rules.maxLength) {
      errors.industry_sector = rules.message;
    } else if (!rules.pattern.test(sanitized_sector)) {
      errors.industry_sector = rules.message;
    } else {
      sanitized.industry_sector = sanitized_sector;
    }
  }
  
  // Validate years experience
  if (data.years_experience !== undefined) {
    const numValidation = validateNumber(data.years_experience);
    if (!numValidation.valid) {
      errors.years_experience = numValidation.error;
    } else {
      sanitized.years_experience = numValidation.value;
    }
  }
  
  // Sanitize arrays
  if (data.services_provided) {
    sanitized.services_provided = sanitizeArray(data.services_provided);
  }
  
  if (data.geographic_coverage) {
    sanitized.geographic_coverage = sanitizeArray(data.geographic_coverage);
  }
  
  // Sanitize certifications and contact info
  if (data.certifications) {
    sanitized.certifications = {};
    for (const [key, value] of Object.entries(data.certifications)) {
      sanitized.certifications[sanitizeString(key)] = sanitizeString(String(value));
    }
  }
  
  if (data.contact_info) {
    sanitized.contact_info = {};
    for (const [key, value] of Object.entries(data.contact_info)) {
      sanitized.contact_info[sanitizeString(key)] = sanitizeString(String(value));
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : null,
    sanitized
  };
};

/**
 * Validates tender search input
 * @param {object} data - Search parameters
 * @returns {object} - { valid: boolean, errors: object, sanitized: object }
 */
export const validateTenderSearch = (data) => {
  const errors = {};
  const sanitized = {};
  
  // Validate keywords
  if (data.keyword) {
    const keywordValidation = validateKeywords(data.keyword);
    if (!keywordValidation.valid) {
      errors.keyword = keywordValidation.error;
    } else {
      sanitized.keyword = keywordValidation.sanitized;
    }
  }
  
  // Validate province
  if (data.province) {
    sanitized.province = sanitizeString(data.province);
  }
  
  // Validate pagination
  if (data.page) {
    const pageValidation = validateNumber(data.page);
    if (!pageValidation.valid) {
      errors.page = 'Invalid page number';
    } else {
      sanitized.page = pageValidation.value;
    }
  }
  
  // Validate page size
  if (data.page_size) {
    const pageSizeValidation = validateNumber(data.page_size);
    if (!pageSizeValidation.valid) {
      errors.page_size = 'Invalid page size';
    } else {
      sanitized.page_size = Math.min(pageSizeValidation.value, 100); // Max 100
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : null,
    sanitized
  };
};

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeArray,
  validateEmail,
  validatePassword,
  validateFullName,
  validateTeamName,
  validateCompanyName,
  validateKeywords,
  validateNotes,
  validateTenderId,
  validateStatus,
  validateNumber,
  validateRegistrationForm,
  validateCompanyProfileForm,
  validateTenderSearch,
  VALIDATION_RULES
};

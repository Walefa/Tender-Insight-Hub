"""
Backend Sanitization and Validation Utilities
Provides input sanitization and validation for all API endpoints
"""

import re
import logging
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from html import escape

logger = logging.getLogger(__name__)


class SanitizationError(Exception):
    """Custom exception for sanitization errors"""
    pass


class InputSanitizer:
    """Handles input sanitization to prevent XSS, SQL injection, and other attacks"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000, allow_html: bool = False) -> str:
        """
        Sanitizes string input to prevent XSS attacks.
        
        Args:
            value: Raw string input
            max_length: Maximum allowed length
            allow_html: Whether to allow HTML (default: False)
        
        Returns:
            Sanitized string
        """
        if not isinstance(value, str):
            return ""
        
        # Remove extra whitespace
        sanitized = value.strip()
        
        # Enforce length limit
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        if allow_html:
            # HTML escape only dangerous characters
            sanitized = escape(sanitized)
        else:
            # Remove potential HTML tags and JavaScript
            sanitized = re.sub(r'<[^>]*>', '', sanitized)  # Remove HTML tags
            sanitized = re.sub(r'javascript:', '', sanitized, flags=re.IGNORECASE)  # Remove js protocol
            sanitized = re.sub(r'on\w+\s*=', '', sanitized, flags=re.IGNORECASE)  # Remove event handlers
        
        return sanitized
    
    @staticmethod
    def sanitize_email(value: str) -> str:
        """
        Sanitizes email input.
        
        Args:
            value: Raw email input
        
        Returns:
            Sanitized email (lowercase)
        """
        if not isinstance(value, str):
            return ""
        
        sanitized = InputSanitizer.sanitize_string(value, max_length=254)
        return sanitized.lower()
    
    @staticmethod
    def sanitize_number(value: Any, min_value: Optional[float] = None, 
                       max_value: Optional[float] = None) -> float:
        """
        Sanitizes numeric input.
        
        Args:
            value: Raw numeric input
            min_value: Minimum allowed value
            max_value: Maximum allowed value
        
        Returns:
            Sanitized number
        
        Raises:
            SanitizationError: If value is not a valid number
        """
        try:
            num = float(value)
        except (ValueError, TypeError):
            raise SanitizationError(f"Invalid number: {value}")
        
        if min_value is not None and num < min_value:
            raise SanitizationError(f"Number {num} is less than minimum {min_value}")
        
        if max_value is not None and num > max_value:
            raise SanitizationError(f"Number {num} exceeds maximum {max_value}")
        
        return num
    
    @staticmethod
    def sanitize_array(value: List[Any], max_length: int = 100) -> List[str]:
        """
        Sanitizes array of strings.
        
        Args:
            value: Raw array input
            max_length: Maximum array length
        
        Returns:
            List of sanitized strings
        
        Raises:
            SanitizationError: If input is not a list
        """
        if not isinstance(value, list):
            raise SanitizationError("Input must be a list")
        
        if len(value) > max_length:
            raise SanitizationError(f"Array exceeds maximum length of {max_length}")
        
        sanitized = []
        for item in value:
            if isinstance(item, str):
                sanitized_item = InputSanitizer.sanitize_string(item)
                if sanitized_item:  # Only add non-empty strings
                    sanitized.append(sanitized_item)
        
        return sanitized
    
    @staticmethod
    def sanitize_dict(value: Dict[str, Any], max_keys: int = 50) -> Dict[str, Any]:
        """
        Sanitizes dictionary input.
        
        Args:
            value: Raw dictionary input
            max_keys: Maximum number of keys allowed
        
        Returns:
            Dictionary with sanitized keys and values
        
        Raises:
            SanitizationError: If input is not a dict
        """
        if not isinstance(value, dict):
            raise SanitizationError("Input must be a dictionary")
        
        if len(value) > max_keys:
            raise SanitizationError(f"Dictionary exceeds maximum keys of {max_keys}")
        
        sanitized = {}
        for key, val in value.items():
            # Sanitize key
            sanitized_key = InputSanitizer.sanitize_string(key) if isinstance(key, str) else str(key)
            
            # Sanitize value based on type
            if isinstance(val, str):
                sanitized[sanitized_key] = InputSanitizer.sanitize_string(val)
            elif isinstance(val, (int, float)):
                sanitized[sanitized_key] = val
            elif isinstance(val, bool):
                sanitized[sanitized_key] = val
            elif isinstance(val, list):
                try:
                    sanitized[sanitized_key] = InputSanitizer.sanitize_array(val)
                except SanitizationError:
                    sanitized[sanitized_key] = []
            elif val is None:
                sanitized[sanitized_key] = None
            else:
                # For other types, convert to string and sanitize
                sanitized[sanitized_key] = InputSanitizer.sanitize_string(str(val))
        
        return sanitized


class InputValidator:
    """Validates user inputs against defined rules"""
    
    # Validation patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PASSWORD_PATTERN = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$')
    NAME_PATTERN = re.compile(r"^[a-zA-Z\s'-]{2,100}$")
    TEAM_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-_.]{1,100}$')
    COMPANY_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-_.&()]{1,200}$')
    INDUSTRY_PATTERN = re.compile(r'^[a-zA-Z\s\-]{1,100}$')
    TENDER_ID_PATTERN = re.compile(r'^[a-zA-Z0-9\-_]{1,100}$')
    STATUS_PATTERN = re.compile(r'^(pending|under_review|shortlisted|declined|archived)$')
    
    # Valid status values
    VALID_STATUSES = {'pending', 'under_review', 'shortlisted', 'declined', 'archived'}
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validates email format"""
        if not isinstance(email, str) or len(email) > 254:
            return False
        return bool(InputValidator.EMAIL_PATTERN.match(email))
    
    @staticmethod
    def validate_password(password: str) -> bool:
        """
        Validates password strength.
        Requirements: 8+ chars, uppercase, lowercase, number, special char
        """
        if not isinstance(password, str) or len(password) < 8 or len(password) > 128:
            return False
        return bool(InputValidator.PASSWORD_PATTERN.match(password))
    
    @staticmethod
    def validate_full_name(name: str) -> bool:
        """Validates full name format"""
        if not isinstance(name, str):
            return False
        return bool(InputValidator.NAME_PATTERN.match(name))
    
    @staticmethod
    def validate_team_name(name: str) -> bool:
        """Validates team name format"""
        if not isinstance(name, str):
            return False
        return bool(InputValidator.TEAM_NAME_PATTERN.match(name))
    
    @staticmethod
    def validate_company_name(name: str) -> bool:
        """Validates company name format"""
        if not isinstance(name, str):
            return False
        return bool(InputValidator.COMPANY_NAME_PATTERN.match(name))
    
    @staticmethod
    def validate_industry_sector(sector: str) -> bool:
        """Validates industry sector format"""
        if not isinstance(sector, str):
            return False
        return bool(InputValidator.INDUSTRY_PATTERN.match(sector))
    
    @staticmethod
    def validate_tender_id(tender_id: str) -> bool:
        """Validates tender ID format"""
        if not isinstance(tender_id, str):
            return False
        return bool(InputValidator.TENDER_ID_PATTERN.match(tender_id))
    
    @staticmethod
    def validate_status(status: str) -> bool:
        """Validates status value"""
        if not isinstance(status, str):
            return False
        return status in InputValidator.VALID_STATUSES
    
    @staticmethod
    def validate_string_length(value: str, min_length: int = 1, 
                              max_length: int = 1000) -> bool:
        """Validates string length"""
        if not isinstance(value, str):
            return False
        return min_length <= len(value) <= max_length
    
    @staticmethod
    def validate_number_range(value: Union[int, float], min_value: float = 0, 
                             max_value: float = 100) -> bool:
        """Validates numeric range"""
        try:
            num = float(value)
            return min_value <= num <= max_value
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_date_format(date_string: str, format: str = "%Y-%m-%d") -> bool:
        """Validates date format"""
        if not isinstance(date_string, str):
            return False
        try:
            datetime.strptime(date_string, format)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_array_contents(array: list, expected_type: type = str, 
                               min_length: int = 0, max_length: int = 100) -> bool:
        """Validates array contents"""
        if not isinstance(array, list):
            return False
        
        if len(array) < min_length or len(array) > max_length:
            return False
        
        for item in array:
            if not isinstance(item, expected_type):
                return False
        
        return True


def validate_and_sanitize(value: Any, field_type: str, **kwargs) -> Any:
    """
    Unified validation and sanitization function
    
    Args:
        value: Input value to validate/sanitize
        field_type: Type of field (email, password, string, number, etc.)
        **kwargs: Additional validation parameters
    
    Returns:
        Sanitized and validated value
    
    Raises:
        SanitizationError: If validation fails
    """
    if field_type == 'email':
        sanitized = InputSanitizer.sanitize_email(value)
        if not InputValidator.validate_email(sanitized):
            raise SanitizationError(f"Invalid email: {value}")
        return sanitized
    
    elif field_type == 'password':
        if not InputValidator.validate_password(value):
            raise SanitizationError("Password does not meet requirements")
        return value  # Don't sanitize passwords
    
    elif field_type == 'full_name':
        sanitized = InputSanitizer.sanitize_string(value, max_length=100)
        if not InputValidator.validate_full_name(sanitized):
            raise SanitizationError(f"Invalid full name: {value}")
        return sanitized
    
    elif field_type == 'team_name':
        sanitized = InputSanitizer.sanitize_string(value, max_length=100)
        if not InputValidator.validate_team_name(sanitized):
            raise SanitizationError(f"Invalid team name: {value}")
        return sanitized
    
    elif field_type == 'company_name':
        sanitized = InputSanitizer.sanitize_string(value, max_length=200)
        if not InputValidator.validate_company_name(sanitized):
            raise SanitizationError(f"Invalid company name: {value}")
        return sanitized
    
    elif field_type == 'industry':
        sanitized = InputSanitizer.sanitize_string(value, max_length=100)
        if not InputValidator.validate_industry_sector(sanitized):
            raise SanitizationError(f"Invalid industry sector: {value}")
        return sanitized
    
    elif field_type == 'tender_id':
        sanitized = InputSanitizer.sanitize_string(value, max_length=100)
        if not InputValidator.validate_tender_id(sanitized):
            raise SanitizationError(f"Invalid tender ID: {value}")
        return sanitized
    
    elif field_type == 'status':
        if not InputValidator.validate_status(value):
            raise SanitizationError(f"Invalid status: {value}")
        return value
    
    elif field_type == 'number':
        min_val = kwargs.get('min_value', 0)
        max_val = kwargs.get('max_value', 100)
        num = InputSanitizer.sanitize_number(value, min_val, max_val)
        if not InputValidator.validate_number_range(num, min_val, max_val):
            raise SanitizationError(f"Number out of range: {num}")
        return num
    
    elif field_type == 'string':
        max_length = kwargs.get('max_length', 1000)
        sanitized = InputSanitizer.sanitize_string(value, max_length)
        min_length = kwargs.get('min_length', 0)
        if not InputValidator.validate_string_length(sanitized, min_length, max_length):
            raise SanitizationError(f"String length invalid: {len(sanitized)}")
        return sanitized
    
    elif field_type == 'array':
        return InputSanitizer.sanitize_array(value, kwargs.get('max_length', 100))
    
    elif field_type == 'dict':
        return InputSanitizer.sanitize_dict(value, kwargs.get('max_keys', 50))
    
    elif field_type == 'date':
        date_format = kwargs.get('format', "%Y-%m-%d")
        if not InputValidator.validate_date_format(value, date_format):
            raise SanitizationError(f"Invalid date format: {value}")
        return value
    
    else:
        raise SanitizationError(f"Unknown field type: {field_type}")


# Logging sanitizer for debugging
def log_sanitization(original: str, sanitized: str, field: str = "unknown"):
    """Logs sanitization operations for debugging"""
    if original != sanitized:
        logger.info(f"Sanitized {field}: {len(original)} -> {len(sanitized)} chars")

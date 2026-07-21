# Security Guidelines for Developers

1. **Least Privilege**: Always request the minimum necessary permissions.
2. **Secure by Default**: Features should be secure out-of-the-box without requiring user configuration.
3. **Validate Input**: Never trust client input. Validate all incoming data using Pydantic models.
4. **Sanitize Output**: Prevent XSS by relying on React's automatic escaping and explicit sanitization for rich text.
5. **No Hardcoded Secrets**: Use environment variables for all secrets, API keys, and credentials.

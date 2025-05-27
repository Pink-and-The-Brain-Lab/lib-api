import { ValidateEmail } from './ValidateEmail';

describe('ValidateEmail', () => {
    let validateEmail: ValidateEmail;

    beforeEach(() => {
        validateEmail = new ValidateEmail();
    });

    it('should return true for a valid email', () => {
        const email = 'test@example.com';
        const result = validateEmail.validate(email);
        expect(result).toBe(true);
    });

    it('should return false for an email without "@"', () => {
        const email = 'testexample.com';
        const result = validateEmail.validate(email);
        expect(result).toBe(false);
    });

    it('should return false for an email without domain', () => {
        const email = 'test@';
        const result = validateEmail.validate(email);
        expect(result).toBe(false);
    });

    it('should return false for an email with invalid characters', () => {
        const email = 'testexa$mple.com';
        const result = validateEmail.validate(email);
        expect(result).toBe(false);
    });

    it('should return false for an empty string', () => {
        const email = '';
        const result = validateEmail.validate(email);
        expect(result).toBe(false);
    });

    it('should return false for an email with spaces', () => {
        const email = 'test @example.com';
        const result = validateEmail.validate(email);
        expect(result).toBe(false);
    });
});
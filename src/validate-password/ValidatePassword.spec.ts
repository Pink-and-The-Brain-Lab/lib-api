import { ValidatePassword } from './ValidatePassword';

describe('ValidatePassword', () => {
    let validatePassword: ValidatePassword;

    beforeEach(() => {
        validatePassword = new ValidatePassword(8); // Assuming the minimum password length is 8
    });

    it('should return an error if password or confirmPassword is not defined', () => {
        const result = validatePassword.validate('', '');
        expect(result).toBe('API_ERRORS.PASSWORD_AND_PASSWORD_CONFIRMATION_NEED_TO_BE_DEFINED');
    });

    it('should return an error if password and confirmPassword are not equal', () => {
        const result = validatePassword.validate('Password123', 'Password321');
        expect(result).toBe('API_ERRORS.PASSWORD_AND_PASSWORD_CONFIRMATION_NEED_TO_BE_EQUALS');
    });

    it('should return an error if password does not contain a number', () => {
        const result = validatePassword.validate('Password', 'Password');
        expect(result).toBe('API_ERRORS.INVALID_PASSWORD_FORMAT');
    });

    it('should return an error if password does not contain a letter', () => {
        const result = validatePassword.validate('12345678', '12345678');
        expect(result).toBe('API_ERRORS.INVALID_PASSWORD_FORMAT');
    });

    it('should return an error if password is shorter than the required length', () => {
        const result = validatePassword.validate('Pass1', 'Pass1');
        expect(result).toBe('API_ERRORS.INVALID_PASSWORD_FORMAT');
    });

    it('should return an empty string for a valid password', () => {
        const result = validatePassword.validate('Password123', 'Password123');
        expect(result).toBe('');
    });
});

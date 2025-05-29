export class ValidatePassword {
    private lengthPasswordMustBe: number;

    constructor (lengthPasswordMustBe: number) {
        this.lengthPasswordMustBe = lengthPasswordMustBe;
    }

    validate(password: string, confirmPassword: string): string {
        if (!password || !confirmPassword || !password.length || !confirmPassword.length)
            return 'API_ERRORS.PASSWORD_AND_PASSWORD_CONFIRMATION_NEED_TO_BE_DEFINED';
        if (password !== confirmPassword)
            return 'API_ERRORS.PASSWORD_AND_PASSWORD_CONFIRMATION_NEED_TO_BE_EQUALS';
        const hasNumber = new RegExp(/\d/g).test(password);
        const hasLetter = new RegExp(/\D/g).test(password);
        const isLenghtEnougth = password.length >= this.lengthPasswordMustBe;
        if (!hasNumber || !hasLetter || !isLenghtEnougth) return 'API_ERRORS.INVALID_PASSWORD_FORMAT';
        return '';
    }
}

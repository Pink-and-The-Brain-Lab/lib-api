export class ValidateEmail {
    validate(email: string): boolean {
        return new RegExp('^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$').test(email);
    }
}


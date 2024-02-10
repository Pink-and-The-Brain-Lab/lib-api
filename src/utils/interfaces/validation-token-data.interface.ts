export interface IValidationTokenData {
    validateTokenTime?: Date;
    createdAt?: Date;
    validated?: boolean;
    status?: string;
    message?: string;
    statusCode?: number;
    sub?: string;
    expiredAt?: number
}

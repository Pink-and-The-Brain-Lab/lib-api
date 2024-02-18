export interface IValidationTokenData {
    validateTokenTime?: Date;
    createdAt?: Date;
    validated?: boolean;
    status?: string;
    message?: any;
    statusCode?: number;
    sub?: string;
    expiredAt?: number
}

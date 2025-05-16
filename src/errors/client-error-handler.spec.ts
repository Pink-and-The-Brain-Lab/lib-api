import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { clientErrorHandle } from './client-error-handler';

describe('clientErrorHandle Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    it('should handle AppError and return the correct response', () => {
        const error = new AppError('Test AppError', 404);

        clientErrorHandle(
            error,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 404,
            message: 'Test AppError',
        });
    });

    it('should handle generic errors and return the correct response', () => {
        const error = new Error('Generic error');
        clientErrorHandle(
            error,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 500,
            message: 'Generic error',
        });
    });

    it('should handle errors with a custom statusCode property', () => {
        const error: any = new Error('Custom error');
        error.statusCode = 403;
        clientErrorHandle(
            error,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 403,
            message: 'Custom error',
        });
    });

    it('should handle errors without a message and return a default message', () => {
        const error: any = new Error();
        error.statusCode = 500;
        clientErrorHandle(
            error,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 500,
            message: 'API_ERRORS.INTERNAL_SERVER_ERROR',
        });
    });
});
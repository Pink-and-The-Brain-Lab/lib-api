import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { GetTokenData } from "./GetTokenData";
import { ValidateToken } from "./ValidateToken";

jest.mock("./GetTokenData");

describe("ValidateToken", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;
    let validateToken: ValidateToken;

    const queue = "test-queue";
    const responseQueue = "response-queue";
    const connectionString = "amqp://localhost";

    beforeEach(() => {
        mockRequest = { headers: { authorization: "Bearer test-token" } };
        mockResponse = {};
        mockNext = jest.fn();
        validateToken = new ValidateToken(queue, responseQueue, connectionString);
    });

    it("should call next() when token is valid", async () => {
        const mockTokenData = { userId: "123", isValid: true };
        (GetTokenData as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue(mockTokenData),
        }));
        await validateToken.validate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
        );
        expect(GetTokenData).toHaveBeenCalledWith(queue, responseQueue, connectionString);
        expect(mockNext).toHaveBeenCalledWith();
    });

    it("should throw AppError when token is missing", async () => {
        mockRequest.headers = {};
        (GetTokenData as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue(null),
        }));
        await validateToken.validate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
        );
        expect(mockNext).toHaveBeenCalledWith(
            expect.any(AppError)
        );
        const error = mockNext.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe("API_ERRORS.NOT_ALLOWED");
        expect(error.statusCode).toBe(401);
    });

    it("should throw AppError when token is expired or invalid", async () => {
        const mockTokenData = {
            expiredAt: true,
            message: "Token expired",
            statusCode: 401,
        };
        (GetTokenData as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue(mockTokenData),
        }));
        await validateToken.validate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
        );
        expect(mockNext).toHaveBeenCalledWith(
            expect.any(AppError)
        );
        const error = mockNext.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe("Token expired");
        expect(error.statusCode).toBe(401);
    });

    it("should throw AppError when token is expired or invalid with default values", async () => {
        const mockTokenData = {
            expiredAt: true,
        };
        (GetTokenData as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue(mockTokenData),
        }));
        await validateToken.validate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
        );
        expect(mockNext).toHaveBeenCalledWith(
            expect.any(AppError)
        );
        const error = mockNext.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe("API_ERRORS.NOT_ALLOWED");
        expect(error.statusCode).toBe(401);
    });

    it("should pass the error to next() when an unexpected error occurs", async () => {
        const unexpectedError = new Error("Unexpected error");
        (GetTokenData as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockRejectedValue(unexpectedError),
        }));
        await validateToken.validate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
        );
        expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
});

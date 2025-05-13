import { AppError } from './AppError';

describe('AppError', () => {
  it('should create an instance of AppError with the provided message and statusCode', () => {
    const message = 'Test error message';
    const statusCode = 404;
    const error = new AppError(message, statusCode);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
  });

  it('should default statusCode to 500 if not provided', () => {
    const message = 'Default status code error';
    const error = new AppError(message);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(500);
  });

  it('should inherit from the Error class', () => {
    const message = 'Inheritance test';
    const error = new AppError(message);
    expect(error).toBeInstanceOf(Error);
  });
});

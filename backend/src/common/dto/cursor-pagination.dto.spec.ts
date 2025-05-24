import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CursorPaginationDto, CursorUtils } from './cursor-pagination.dto';

describe('CursorPaginationDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CursorPaginationDto, {
      limit: 20,
      cursor: 'validCursorString',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should use default limit when not provided', async () => {
    const dto = plainToInstance(CursorPaginationDto, {});

    // Default limit should be applied
    expect(dto.limit).toBe(20);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate limit is a positive number', async () => {
    const dto = plainToInstance(CursorPaginationDto, {
      limit: -5,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should validate limit does not exceed max value', async () => {
    const dto = plainToInstance(CursorPaginationDto, {
      limit: 101, // Max is 100
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('max');
  });

  it('should allow cursor to be optional', async () => {
    const dto = plainToInstance(CursorPaginationDto, {
      limit: 20,
      // No cursor provided
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate cursor is a string when provided', async () => {
    const dto = plainToInstance(CursorPaginationDto, {
      limit: 20,
      cursor: 123, // Not a string
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should encode and decode cursor correctly', () => {
    const cursorData = {
      id: '12345',
      createdAt: new Date('2023-01-01').toISOString(),
    };

    // Encode cursor
    const encodedCursor = CursorUtils.encodeCursor(cursorData);
    expect(typeof encodedCursor).toBe('string');

    // Decode cursor
    const decodedCursor = CursorUtils.decodeCursor(encodedCursor);
    expect(decodedCursor).toEqual(cursorData);
  });

  it('should handle invalid cursor gracefully', () => {
    const invalidCursor = 'not-a-valid-base64-cursor';

    // Should return null for invalid cursor
    const decodedCursor = CursorUtils.decodeCursor(invalidCursor);
    expect(decodedCursor).toBeNull();
  });
});

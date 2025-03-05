import { HelperService } from '../helpers/helper'

// Spy on console.log to avoid cluttering the test output
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('HelperService', () => {
  let helperService: HelperService;
  const serviceName = 'TestHelper';
  const timeout = 1000;

  beforeEach(() => {
    helperService = new HelperService(serviceName, timeout);
  });

  test('should initialize with provided parameters', () => {
    // Since the properties are private, we can only test indirectly
    expect(console.log).toHaveBeenCalledWith(`Initializing ${serviceName} with timeout ${timeout}ms`);
  });

  test('should process request and return success message', () => {
    // Arrange
    (console.log as jest.Mock).mockClear();

    // Act
    const result = helperService.processRequest();

    // Assert
    expect(console.log).toHaveBeenCalledWith(`${serviceName} processing request...`);
    expect(result).toEqual({
      success: true,
      message: `Request processed successfully by ${serviceName}`
    });
  });
}); 

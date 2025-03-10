import { withExponentialBackoff } from '../utils/backoff';

describe('withExponentialBackoff', () => {
  // Mock console methods to avoid cluttering test output
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      fn();
      return {} as any;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the result of the function if it succeeds on the first try', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    const result = await withExponentialBackoff(mockFn);
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result).toBe('success');
  });

  it('should retry the function if it fails', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce('success');
    
    const result = await withExponentialBackoff(mockFn);
    
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result).toBe('success');
  });

  it('should retry up to the maximum number of times', async () => {
    const error = new Error('Persistent failure');
    const mockFn = jest.fn().mockRejectedValue(error);
    
    await expect(withExponentialBackoff(mockFn, 2)).rejects.toThrow(error);
    expect(mockFn).toHaveBeenCalledTimes(3); // Initial call + 2 retries
  });

  it('should use exponential delay between retries', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValueOnce('success');
    
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    // Mock setTimeout with specific implementation to capture delay values
    let delays: number[] = [];
    setTimeoutSpy.mockImplementation((callback, delay) => {
      if (typeof delay === 'number') {
        delays.push(delay);
      }
      (callback as Function)();
      return {} as any;
    });
    
    await withExponentialBackoff(mockFn, 2, 100);
    
    // Verify setTimeout was called with increasing delays
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
    expect(delays.length).toBe(2);
    
    // Verify the second delay is greater than the first
    expect(delays[1]).toBeGreaterThan(delays[0]);
  });
}); 
export class HelperService {
  private readonly serviceName: string;
  private readonly timeout: number;

  constructor(serviceName: string, timeout: number) {
    this.serviceName = serviceName;
    this.timeout = timeout;
    console.log(`Initializing ${this.serviceName} with timeout ${this.timeout}ms`);
  }

  /**
   * Helper method that returns a success message
   */
  public processRequest(): { success: boolean; message: string } {
    console.log(`${this.serviceName} processing request...`);
    return {
      success: true,
      message: `Request processed successfully by ${this.serviceName}`
    };
  }
} 
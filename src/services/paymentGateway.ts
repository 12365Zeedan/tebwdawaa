import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentMethod, 
  PaymentStatus,
  PAYMENT_METHODS 
} from '@/types/payment';

/**
 * Mock Payment Gateway Service
 * This simulates a real payment gateway for development and testing.
 * Replace with actual gateway integration (e.g., Moyasar, Tap, HyperPay) in production.
 */
class MockPaymentGateway {
  private simulatedDelay = 1500; // Simulate network latency

  /**
   * Process a payment request
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    console.log('[MockGateway] Processing payment:', request);

    // Simulate network delay
    await this.delay(this.simulatedDelay);

    const methodConfig = PAYMENT_METHODS.find(m => m.id === request.paymentMethod);

    // Check if payment method is enabled
    if (!methodConfig?.enabled) {
      return {
        success: false,
        transactionId: this.generateTransactionId(),
        status: 'failed',
        errorMessage: 'Payment method not available',
      };
    }

    // Handle COD - no online processing needed
    if (request.paymentMethod === 'cod') {
      return this.processCOD(request);
    }

    // Handle bank transfer - pending until verified
    if (request.paymentMethod === 'bank_transfer') {
      return this.processBankTransfer(request);
    }

    // Handle online payment methods (mock for now)
    return this.processOnlinePayment(request);
  }

  /**
   * Process Cash on Delivery
   */
  private async processCOD(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = this.generateTransactionId();

    console.log('[MockGateway] COD payment registered:', transactionId);

    return {
      success: true,
      transactionId,
      status: 'pending', // COD is pending until delivery
      gatewayReference: `COD-${transactionId}`,
      gatewayResponse: {
        method: 'cod',
        message: 'Cash on delivery registered. Payment will be collected upon delivery.',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Process Bank Transfer
   */
  private async processBankTransfer(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = this.generateTransactionId();

    console.log('[MockGateway] Bank transfer registered:', transactionId);

    return {
      success: true,
      transactionId,
      status: 'pending', // Bank transfer is pending until admin verifies
      gatewayReference: `BT-${transactionId}`,
      gatewayResponse: {
        method: 'bank_transfer',
        message: 'Bank transfer registered. Awaiting payment verification.',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Process online payment (mock implementation)
   * In production, this would redirect to the actual payment gateway
   */
  private async processOnlinePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = this.generateTransactionId();

    console.log('[MockGateway] Online payment successful:', transactionId);

    return {
      success: true,
      transactionId,
      status: 'completed',
      gatewayReference: `${request.paymentMethod.toUpperCase()}-${transactionId}`,
      gatewayResponse: {
        method: request.paymentMethod,
        message: 'Payment processed successfully',
        timestamp: new Date().toISOString(),
        authCode: this.generateAuthCode(),
      },
    };
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    console.log('[MockGateway] Verifying payment:', transactionId);

    await this.delay(500);

    // In production, this would check with the actual gateway
    return {
      success: true,
      transactionId,
      status: 'completed',
      gatewayReference: transactionId,
    };
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    transactionId: string, 
    amount: number, 
    reason?: string
  ): Promise<PaymentResponse> {
    console.log('[MockGateway] Processing refund:', { transactionId, amount, reason });

    await this.delay(this.simulatedDelay);

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      status: 'refunded',
      gatewayReference: `REFUND-${transactionId}`,
      gatewayResponse: {
        originalTransaction: transactionId,
        refundAmount: amount,
        reason,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Get payment status from gateway
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    console.log('[MockGateway] Getting payment status:', transactionId);

    await this.delay(300);

    // In production, query the actual gateway
    return 'completed';
  }

  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate a mock authorization code
   */
  private generateAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Helper to simulate async delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if a payment method requires online processing
   */
  isOnlinePaymentMethod(method: PaymentMethod): boolean {
    const config = PAYMENT_METHODS.find(m => m.id === method);
    return config?.requiresOnlineProcessing ?? false;
  }

  /**
   * Get available payment methods
   */
  getAvailableMethods(): typeof PAYMENT_METHODS {
    return PAYMENT_METHODS.filter(m => m.enabled);
  }
}

// Export singleton instance
export const paymentGateway = new MockPaymentGateway();

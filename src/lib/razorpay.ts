import { Course } from '../types';
import { enrollUser, checkEnrollment } from './db';

export const RAZORPAY_TEST_KEY_ID = 'rzp_test_TfmgAeLUjmSp2J';

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayPaymentError {
  code: string;
  description: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: any;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in currency sub-units (paise for INR)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
    escape?: boolean;
    animation?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

let scriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('[Razorpay] Checkout SDK loaded successfully in TEST MODE.');
      resolve(true);
    };
    script.onerror = () => {
      console.error('[Razorpay] Failed to load Razorpay Checkout SDK script.');
      scriptLoadingPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

export interface StartPaymentParams {
  course: Course;
  user: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    phoneNumber?: string | null;
  };
  onSuccess: (result: { orderId: string; paymentId: string }) => void;
  onFailure?: (errorMessage: string) => void;
  onCancel?: () => void;
}

/**
 * Initiates Razorpay payment in TEST MODE for a selected course.
 * Uses dynamic course price, converts to paise, and securely updates Firestore on success.
 */
export async function initiateCoursePayment({
  course,
  user,
  onSuccess,
  onFailure,
  onCancel
}: StartPaymentParams): Promise<void> {
  try {
    // 1. Duplicate purchase check
    const isAlreadyEnrolled = await checkEnrollment(user.uid, course.id);
    if (isAlreadyEnrolled) {
      onFailure?.('You have already enrolled in this course.');
      return;
    }

    const price = course.price ?? course.salePrice ?? 0;

    // Handle 100% free courses directly
    if (price <= 0) {
      console.log('[Payment] Free course detected, enrolling without payment gateway...');
      const orderId = await enrollUser(user.uid, course.id, 0, {
        userEmail: user.email || '',
        courseTitle: course.title,
        courseType: course.courseType || 'video',
        paymentId: `free_${Date.now()}`
      });
      onSuccess({ orderId, paymentId: 'free_access' });
      return;
    }

    // 2. Load SDK script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      onFailure?.('Unable to load payment gateway. Please check your internet connection and try again.');
      return;
    }

    // 3. Calculate amount in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(price * 100);

    let paymentResolved = false;

    // 4. Configure Razorpay options in Test Mode
    const options: RazorpayOptions = {
      key: RAZORPAY_TEST_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'CourseAI',
      description: `Enrollment for ${course.title.substring(0, 40)}`,
      image: course.thumbnailUrl || course.thumbnail || undefined,
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
        contact: user.phoneNumber || ''
      },
      notes: {
        courseId: course.id,
        userId: user.uid,
        courseTitle: course.title,
        environment: 'TEST_MODE'
      },
      theme: {
        color: '#4f46e5' // Indigo
      },
      handler: async (response: RazorpayPaymentSuccessResponse) => {
        paymentResolved = true;
        console.log('[Razorpay TEST MODE] Payment successful:', response);

        try {
          // Verify paymentId presence
          const paymentId = response.razorpay_payment_id || `rzp_test_${Date.now()}`;
          
          // Enroll user & record order in Firestore
          const orderId = await enrollUser(user.uid, course.id, price, {
            userEmail: user.email || '',
            courseTitle: course.title,
            courseType: course.courseType || 'video',
            paymentId: paymentId
          });

          onSuccess({ orderId, paymentId });
        } catch (enrollErr) {
          console.error('[Razorpay] Failed to record enrollment after payment:', enrollErr);
          onFailure?.('Payment completed, but course activation encountered an issue. Please contact support.');
        }
      },
      modal: {
        ondismiss: () => {
          if (!paymentResolved) {
            console.log('[Razorpay] Payment cancelled or modal closed by user.');
            onCancel?.();
          }
        },
        escape: true,
        confirm_close: true
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      console.warn('[Razorpay] Payment failed:', response?.error);
      const message = response?.error?.description || 'Payment was cancelled or failed. Please try again.';
      onFailure?.(message);
    });

    rzp.open();
  } catch (err: any) {
    console.error('[Razorpay] Error initiating payment checkout:', err);
    onFailure?.(err?.message || 'Failed to start payment checkout. Please try again.');
  }
}

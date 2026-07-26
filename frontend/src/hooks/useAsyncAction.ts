import { useState, useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFunction<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseAsyncActionReturn<TArgs extends unknown[], TResult> {
  execute: (...args: TArgs) => Promise<TResult | undefined>;
  isSubmitting: boolean;
  error: Error | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAsyncAction<TArgs extends unknown[], TResult>(
  asyncFn: AsyncFunction<TArgs, TResult>,
  onSuccess?: (result: TResult) => void,
  onError?: (error: Error) => void
): UseAsyncActionReturn<TArgs, TResult> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        if (onError) {
          onError(errorObj);
        } else {
          // If no error handler provided, log it by default
          console.error('Action failed:', errorObj);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [asyncFn, onSuccess, onError]
  );

  return { execute, isSubmitting, error };
}

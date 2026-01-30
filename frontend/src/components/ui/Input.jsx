import { forwardRef, useId } from 'react';

export const Input = forwardRef(function Input(
  { label, error, className = '', id: providedId, required, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-4 py-3 bg-surface-900/80 border rounded-lg transition-all duration-200 min-h-[44px]
          text-gray-100 placeholder-gray-500
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:border-transparent
          disabled:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-50
          hover:border-surface-600
          ${error ? 'border-red-500' : 'border-surface-700'}
          ${className}
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        required={required}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;

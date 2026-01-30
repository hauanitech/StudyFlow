import { forwardRef, useId } from 'react';

export const Textarea = forwardRef(function Textarea(
  { label, error, className = '', rows = 4, id: providedId, required, maxLength, ...props },
  ref
) {
  const generatedId = useId();
  const textareaId = providedId || generatedId;
  const errorId = `${textareaId}-error`;
  const descriptionId = maxLength ? `${textareaId}-description` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`
          w-full px-4 py-3 bg-surface-900/80 border rounded-lg transition-all duration-200 resize-y
          text-gray-100 placeholder-gray-500
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:border-transparent
          disabled:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-50
          hover:border-surface-600
          ${error ? 'border-red-500' : 'border-surface-700'}
          ${className}
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={[error && errorId, descriptionId].filter(Boolean).join(' ') || undefined}
        aria-required={required}
        required={required}
        maxLength={maxLength}
        {...props}
      />
      {maxLength && (
        <p id={descriptionId} className="mt-1 text-xs text-gray-500">
          Maximum {maxLength} characters
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Textarea;

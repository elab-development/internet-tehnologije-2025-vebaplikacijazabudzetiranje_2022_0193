import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input props interface
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label tekst iznad input-a
   */
  label?: string;

  /**
   * Error poruka ispod input-a
   */
  error?: string;

  /**
   * Helper tekst ispod input-a (kada nema greške)
   */
  helperText?: string;

  /**
   * Da li je input obavezan (dodaje * u label)
   * @default false
   */
  required?: boolean;

  /**
   * Ikonica sa leve strane input-a
   */
  leftIcon?: React.ReactNode;

  /**
   * Ikonica sa desne strane input-a
   */
  rightIcon?: React.ReactNode;

  /**
   * Puna širina (100%)
   * @default true
   */
  fullWidth?: boolean;
}

/**
 * Reusable Input komponenta sa validacijom
 *
 * @example
 * ```tsx
 * <Input
 * label="Email"
 * type="email"
 * placeholder="Enter your email"
 * error={errors.email}
 * required
 * />
 * <Input
 * label="Password"
 * type="password"
 * helperText="Must be at least 8 characters"
 * />
 * <Input
 * label="Search"
 * leftIcon={<SearchIcon />}
 * placeholder="Search..."
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Generiši ID ako nije prosleđen
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    // Base input styles
    const baseInputStyles =
      'px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Conditional styles
    const conditionalStyles = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';

    // Icon padding
    const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper (za ikonice) */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInputStyles,
              conditionalStyles,
              iconPadding,
              fullWidth && 'w-full',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
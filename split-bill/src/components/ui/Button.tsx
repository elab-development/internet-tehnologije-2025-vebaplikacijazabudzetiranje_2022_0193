import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button variants - različiti stilovi dugmeta
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';

/**
 * Button sizes - različite veličine
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button props interface
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Vizuelni stil dugmeta
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Veličina dugmeta
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Da li je dugme u loading stanju
   * @default false
   */
  isLoading?: boolean;

  /**
   * Ikonica sa leve strane (opciono)
   */
  leftIcon?: ReactNode;

  /**
   * Ikonica sa desne strane (opciono)
   */
  rightIcon?: ReactNode;

  /**
   * Puna širina (100%)
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Sadržaj dugmeta
   */
  children: ReactNode;
}

/**
 * Reusable Button komponenta
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 * Click me
 * </Button>
 * <Button variant="danger" isLoading>
 * Deleting...
 * </Button>
 * <Button variant="outline" leftIcon={<PlusIcon />}>
 * Add Item
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles - zajednički za sve varijante
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant styles - različiti stilovi po varijanti
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
      outline:
        'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100',
      ghost:
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200',
    };

    // Size styles - različite veličine
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    // Loading spinner
    const spinner = (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && spinner}
        {!isLoading && leftIcon && <span>{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
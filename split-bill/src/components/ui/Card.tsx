import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Card variants - različiti stilovi kartice
 */
export type CardVariant = 'default' | 'bordered' | 'elevated';

/**
 * Card props interface
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Naslov kartice (opciono)
   */
  title?: string;

  /**
   * Podnaslov kartice (opciono)
   */
  subtitle?: string;

  /**
   * Header akcije (dugmad, ikone) - prikazuju se desno od naslova
   */
  headerActions?: ReactNode;

  /**
   * Footer sadržaj (opciono)
   */
  footer?: ReactNode;

  /**
   * Vizuelni stil kartice
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Da li kartica može biti kliknuta (dodaje hover efekat)
   * @default false
   */
  clickable?: boolean;

  /**
   * Callback kada se klikne na karticu (ako je clickable)
   */
  onClick?: () => void;

  /**
   * Sadržaj kartice
   */
  children: ReactNode;

  /**
   * Padding unutar kartice
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Reusable Card komponenta za prikaz grupisanog sadržaja
 *
 * @example
 * ```tsx
 * <Card title="User Profile" subtitle="Manage your account">
 * <p>Card content here</p>
 * </Card>
 * * <Card
 * title="Group"
 * headerActions={<Button size="sm">Edit</Button>}
 * footer={<p>3 members</p>}
 * clickable
 * onClick={() => navigate('/group/123')}
 * >
 * <p>Group details</p>
 * </Card>
 * * <Card variant="elevated" padding="lg">
 * <h2>Custom content</h2>
 * </Card>
 * ```
 */
export function Card({
  title,
  subtitle,
  headerActions,
  footer,
  variant = 'default',
  clickable = false,
  onClick,
  children,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  // Base styles
  const baseStyles = 'bg-white rounded-lg transition-all duration-200';

  // Variant styles
  const variantStyles: Record<CardVariant, string> = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-gray-300',
    elevated: 'shadow-md hover:shadow-lg',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Clickable styles
  const clickableStyles = clickable
    ? 'cursor-pointer hover:shadow-lg hover:border-primary-300'
    : '';

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        clickableStyles,
        className
      )}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      {...props}
    >
      {/* Header (Title + Actions) */}
      {(title || headerActions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(title || headerActions ? '' : '')}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>
      )}
    </div>
  );
}
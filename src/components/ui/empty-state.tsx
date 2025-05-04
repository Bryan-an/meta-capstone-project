import { cn } from '@/lib/utils';
import { FileSearch } from 'lucide-react'; // Or another relevant icon
import React from 'react';

/**
 * Props for the EmptyState component.
 */
interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The main title text for the empty state. */
  title: string;
  /** The descriptive text below the title. */
  description: string;
  /** Optional: A different icon component to display. Defaults to FileSearch. */
  icon?: React.ElementType;
  /** Optional: Custom class names for the icon wrapper. */
  iconClassName?: string;
  /** Optional: Custom class names for the title element. */
  titleClassName?: string;
  /** Optional: Custom class names for the description element. */
  descriptionClassName?: string;
}

/**
 * Renders a visually distinct empty state message, often used when lists or searches yield no results.
 * Includes an icon, title, and description.
 *
 * @param  title - The main title text.
 * @param  description - The descriptive text.
 * @param  icon - The icon component to display.
 * @param  className - Additional classes for the main container.
 * @param  iconClassName - Additional classes for the icon wrapper.
 * @param  titleClassName - Additional classes for the title element.
 * @param  descriptionClassName - Additional classes for the description element.
 * @param  props - Other HTMLDivElement attributes.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = FileSearch,
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'p-8',
        className,
      )}
      {...props}
    >
      {/* Icon */}
      <div
        className={cn(
          'mb-4 flex size-20 items-center justify-center rounded-full bg-gray-200',
          iconClassName,
        )}
      >
        <Icon className="size-10 text-gray-500" />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'mb-2 text-xl font-semibold text-gray-800',
          titleClassName,
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p className={cn('text-gray-600', descriptionClassName)}>{description}</p>
    </div>
  );
}

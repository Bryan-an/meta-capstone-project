import { cn } from '@/lib/utils/cn';
import { FileSearch } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

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
  /** Optional: Text for the call-to-action button. If provided with onActionButtonClick, the button will render. */
  actionButtonText?: string;
  /** Optional: Function to call when the action button is clicked. */
  onActionButtonClick?: () => void;
  /** Optional: Additional props for the action button, like `asChild` for Links. Uses React.ComponentProps for type safety. */
  actionButtonProps?: React.ComponentProps<typeof Button>;
}

/**
 * Renders a visually distinct empty state message, often used when lists or searches yield no results.
 * Includes an icon, title, description, and an optional call-to-action button.
 *
 * @param title - The main title text.
 * @param description - The descriptive text.
 * @param icon - The icon component to display.
 * @param className - Additional classes for the main container.
 * @param iconClassName - Additional classes for the icon wrapper.
 * @param titleClassName - Additional classes for the title element.
 * @param descriptionClassName - Additional classes for the description element.
 * @param actionButtonText - Text for the call-to-action button.
 * @param onActionButtonClick - Function for the button's onClick event.
 * @param actionButtonProps - Additional props for the Button component.
 * @param props - Other HTMLDivElement attributes.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = FileSearch,
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
  actionButtonText,
  onActionButtonClick,
  actionButtonProps,
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
          'mb-4 flex size-20 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
          iconClassName,
        )}
      >
        <Icon className="size-10" />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100',
          titleClassName,
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn('text-gray-600 dark:text-gray-400', descriptionClassName)}
      >
        {description}
      </p>

      {/* Action Button */}
      {(actionButtonText || actionButtonProps?.children) && (
        <Button
          onClick={onActionButtonClick}
          className="mt-6"
          {...actionButtonProps}
        >
          {actionButtonText || actionButtonProps?.children}
        </Button>
      )}
    </div>
  );
}

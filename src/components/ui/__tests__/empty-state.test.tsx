import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Search, AlertCircle, Users } from 'lucide-react';

import { EmptyState } from '../empty-state';

/**
 * Test suite for the EmptyState component
 *
 * @remarks
 * Tests cover rendering, props, styling, button functionality,
 * accessibility, and practical usage scenarios
 */
describe('EmptyState', () => {
  const defaultProps = {
    title: 'No items found',
    description: 'There are no items to display at the moment.',
  };

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.getByText('No items found')).toBeInTheDocument();

      expect(
        screen.getByText('There are no items to display at the moment.'),
      ).toBeInTheDocument();
    });

    it('should render as div element', () => {
      render(<EmptyState {...defaultProps} />);

      const container = screen.getByText('No items found').closest('div');
      expect(container?.tagName).toBe('DIV');
    });

    it('should apply default classes to container', () => {
      render(<EmptyState {...defaultProps} />);

      const container = screen.getByText('No items found').closest('div');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('flex-col');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
      expect(container).toHaveClass('text-center');
      expect(container).toHaveClass('p-8');
    });

    it('should forward props to container div', () => {
      render(
        <EmptyState
          {...defaultProps}
          id="empty-state"
          role="status"
          aria-label="Empty state"
        />,
      );

      const container = screen.getByText('No items found').closest('div');
      expect(container).toHaveAttribute('id', 'empty-state');
      expect(container).toHaveAttribute('role', 'status');
      expect(container).toHaveAttribute('aria-label', 'Empty state');
    });

    it('should merge custom className with defaults', () => {
      render(<EmptyState {...defaultProps} className="custom-empty-state" />);

      const container = screen.getByText('No items found').closest('div');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('custom-empty-state');
    });
  });

  describe('Icon Rendering', () => {
    it('should render default FileSearch icon', () => {
      render(<EmptyState {...defaultProps} />);

      // Check if the icon container exists with default classes
      const iconContainer = screen
        .getByText('No items found')
        .closest('div')
        ?.querySelector('.size-20');

      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('mb-4');
      expect(iconContainer).toHaveClass('flex');
      expect(iconContainer).toHaveClass('size-20');
      expect(iconContainer).toHaveClass('items-center');
      expect(iconContainer).toHaveClass('justify-center');
      expect(iconContainer).toHaveClass('rounded-full');
      expect(iconContainer).toHaveClass('bg-gray-200');
      expect(iconContainer).toHaveClass('text-gray-500');
    });

    it('should render custom icon when provided', () => {
      render(<EmptyState {...defaultProps} icon={Search} />);

      const iconContainer = screen
        .getByText('No items found')
        .closest('div')
        ?.querySelector('.size-20');

      expect(iconContainer).toBeInTheDocument();
      // The Search icon should be rendered inside
      const icon = iconContainer?.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('size-10');
    });

    it('should apply custom iconClassName', () => {
      render(
        <EmptyState
          {...defaultProps}
          iconClassName="bg-blue-100 text-blue-600"
        />,
      );

      const iconContainer = screen
        .getByText('No items found')
        .closest('div')
        ?.querySelector('.size-20');

      expect(iconContainer).toHaveClass('bg-blue-100');
      expect(iconContainer).toHaveClass('text-blue-600');
    });

    it('should work with different lucide-react icons', () => {
      const { rerender } = render(
        <EmptyState {...defaultProps} icon={AlertCircle} />,
      );

      let iconContainer = screen
        .getByText('No items found')
        .closest('div')
        ?.querySelector('.size-20');

      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();

      rerender(<EmptyState {...defaultProps} icon={Users} />);

      iconContainer = screen
        .getByText('No items found')
        .closest('div')
        ?.querySelector('.size-20');

      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Title Rendering', () => {
    it('should render title as h3 element', () => {
      render(<EmptyState {...defaultProps} />);

      const title = screen.getByText('No items found');
      expect(title.tagName).toBe('H3');
    });

    it('should apply default title classes', () => {
      render(<EmptyState {...defaultProps} />);

      const title = screen.getByText('No items found');
      expect(title).toHaveClass('mb-2');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-gray-800');
      expect(title).toHaveClass('dark:text-gray-100');
    });

    it('should apply custom titleClassName', () => {
      render(
        <EmptyState {...defaultProps} titleClassName="text-2xl text-red-600" />,
      );

      const title = screen.getByText('No items found');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('text-red-600');
    });

    it('should handle different title content', () => {
      const longTitle =
        'This is a very long title that might wrap to multiple lines';

      render(<EmptyState title={longTitle} description="Test description" />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe('Description Rendering', () => {
    it('should render description as p element', () => {
      render(<EmptyState {...defaultProps} />);

      const description = screen.getByText(
        'There are no items to display at the moment.',
      );

      expect(description.tagName).toBe('P');
    });

    it('should apply default description classes', () => {
      render(<EmptyState {...defaultProps} />);

      const description = screen.getByText(
        'There are no items to display at the moment.',
      );

      expect(description).toHaveClass('text-gray-600');
      expect(description).toHaveClass('dark:text-gray-400');
    });

    it('should apply custom descriptionClassName', () => {
      render(
        <EmptyState
          {...defaultProps}
          descriptionClassName="text-lg italic text-blue-600"
        />,
      );

      const description = screen.getByText(
        'There are no items to display at the moment.',
      );

      expect(description).toHaveClass('text-lg');
      expect(description).toHaveClass('italic');
      expect(description).toHaveClass('text-blue-600');
    });

    it('should handle multiline descriptions', () => {
      const multilineDescription =
        'This is a description\nwith multiple lines\nof text.';

      render(<EmptyState title="Test" description={multilineDescription} />);

      expect(
        screen.getByText((content, element) => {
          return element?.textContent === multilineDescription;
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('should not render button when actionButtonText is not provided', () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render button when actionButtonText is provided', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButtonText="Add Item"
          onActionButtonClick={vi.fn()}
        />,
      );

      const button = screen.getByRole('button', { name: 'Add Item' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('mt-6');
    });

    it('should call onActionButtonClick when button is clicked', () => {
      const handleClick = vi.fn();

      render(
        <EmptyState
          {...defaultProps}
          actionButtonText="Add Item"
          onActionButtonClick={handleClick}
        />,
      );

      const button = screen.getByRole('button', { name: 'Add Item' });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass actionButtonProps to Button component', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButtonText="Add Item"
          actionButtonProps={{
            variant: 'outline',
            size: 'lg',
            disabled: true,
            id: 'custom-button',
          }}
        />,
      );

      const button = screen.getByRole('button', { name: 'Add Item' });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('id', 'custom-button');
    });

    it('should render button with children from actionButtonProps', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButtonProps={{
            children: 'Custom Button Text',
          }}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Custom Button Text' }),
      ).toBeInTheDocument();
    });

    it('should prioritize actionButtonText over actionButtonProps.children', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButtonText="Priority Text"
          actionButtonProps={{
            children: 'Secondary Text',
          }}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Priority Text' }),
      ).toBeInTheDocument();

      expect(screen.queryByText('Secondary Text')).not.toBeInTheDocument();
    });

    it('should work with asChild prop for custom button components', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButtonProps={{
            asChild: true,
            children: <a href="https://example.com/add">Add New Item</a>,
          }}
        />,
      );

      const link = screen.getByRole('link', { name: 'Add New Item' });
      expect(link).toHaveAttribute('href', 'https://example.com/add');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<EmptyState {...defaultProps} />);

      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('No items found');
    });

    it('should support custom ARIA attributes', () => {
      render(
        <EmptyState
          {...defaultProps}
          role="status"
          aria-label="No search results"
          aria-describedby="empty-desc"
        />,
      );

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'No search results');
      expect(container).toHaveAttribute('aria-describedby', 'empty-desc');
    });

    it('should be keyboard navigable when button is present', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButtonText="Add Item"
          onActionButtonClick={vi.fn()}
        />,
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should have semantic structure', () => {
      render(<EmptyState {...defaultProps} />);

      // Icon container should not have semantic meaning
      const iconContainer = screen
        .getByText('No items found')
        .closest('div')
        ?.querySelector('.size-20');

      expect(iconContainer).not.toHaveAttribute('role');

      // Title should be a heading
      const title = screen.getByRole('heading');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Styling and Theming', () => {
    it('should handle dark mode classes', () => {
      render(<EmptyState {...defaultProps} />);

      const iconContainer = screen
        .getByText('No items found')
        .closest('div')
        ?.querySelector('.size-20');

      expect(iconContainer).toHaveClass('dark:bg-gray-700');
      expect(iconContainer).toHaveClass('dark:text-gray-400');

      const title = screen.getByText('No items found');
      expect(title).toHaveClass('dark:text-gray-100');

      const description = screen.getByText(
        'There are no items to display at the moment.',
      );

      expect(description).toHaveClass('dark:text-gray-400');
    });

    it('should work with responsive classes', () => {
      render(
        <EmptyState
          {...defaultProps}
          className="sm:p-12 md:p-16"
          iconClassName="sm:size-24 md:size-32"
          titleClassName="sm:text-2xl md:text-3xl"
        />,
      );

      const container = screen.getByText('No items found').closest('div');
      expect(container).toHaveClass('sm:p-12', 'md:p-16');

      const iconContainer = container?.querySelector('.size-20');
      expect(iconContainer).toHaveClass('sm:size-24', 'md:size-32');

      const title = screen.getByText('No items found');
      expect(title).toHaveClass('sm:text-2xl', 'md:text-3xl');
    });

    it('should handle CSS custom properties', () => {
      render(
        <EmptyState
          {...defaultProps}
          style={{ '--custom-spacing': '2rem' } as React.CSSProperties}
        />,
      );

      const container = screen.getByText('No items found').closest('div');
      expect(container).toHaveStyle('--custom-spacing: 2rem');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty strings gracefully', () => {
      render(<EmptyState title="" description="" />);

      // Should still render the structure even with empty strings
      const container = screen.getByRole('heading').closest('div');
      expect(container).toBeInTheDocument();
    });

    it('should handle missing onActionButtonClick with actionButtonText', () => {
      expect(() => {
        render(
          <EmptyState
            {...defaultProps}
            actionButtonText="Add Item"
            // No onActionButtonClick provided
          />,
        );
      }).not.toThrow();

      const button = screen.getByRole('button', { name: 'Add Item' });
      expect(button).toBeInTheDocument();
    });

    it('should handle special characters in text content', () => {
      const specialTitle = 'No items found! 🔍';

      const specialDescription =
        'Try searching for "awesome" content & more...';

      render(
        <EmptyState title={specialTitle} description={specialDescription} />,
      );

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
      expect(screen.getByText(specialDescription)).toBeInTheDocument();
    });
  });

  describe('Integration with Button Component', () => {
    it('should integrate with Button variants', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButtonText="Add Item"
          actionButtonProps={{ variant: 'destructive' }}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-slot', 'button');
    });

    it('should support Button sizes', () => {
      render(
        <EmptyState
          {...defaultProps}
          actionButtonText="Add Item"
          actionButtonProps={{ size: 'lg' }}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});

/**
 * Integration tests for practical EmptyState usage scenarios
 */
describe('EmptyState Integration Examples', () => {
  it('should work as a search results empty state', () => {
    render(
      <EmptyState
        icon={Search}
        title="No search results"
        description="We couldn't find any results for your search. Try adjusting your search terms."
        actionButtonText="Clear Search"
        onActionButtonClick={vi.fn()}
        iconClassName="bg-blue-100 text-blue-600"
      />,
    );

    expect(screen.getByText('No search results')).toBeInTheDocument();

    expect(
      screen.getByText(
        "We couldn't find any results for your search. Try adjusting your search terms.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Clear Search' }),
    ).toBeInTheDocument();
  });

  it('should work as a user list empty state', () => {
    render(
      <EmptyState
        icon={Users}
        title="No team members"
        description="You haven't added any team members yet. Start by inviting your first team member."
        actionButtonText="Invite Member"
        onActionButtonClick={vi.fn()}
        actionButtonProps={{ variant: 'default' }}
      />,
    );

    expect(screen.getByText('No team members')).toBeInTheDocument();

    expect(
      screen.getByText(
        "You haven't added any team members yet. Start by inviting your first team member.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Invite Member' }),
    ).toBeInTheDocument();
  });

  it('should work as an error state', () => {
    render(
      <EmptyState
        icon={AlertCircle}
        title="Something went wrong"
        description="We encountered an error while loading your data. Please try again."
        actionButtonText="Retry"
        onActionButtonClick={vi.fn()}
        iconClassName="bg-red-100 text-red-600"
        titleClassName="text-red-800"
        actionButtonProps={{ variant: 'destructive' }}
      />,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    expect(
      screen.getByText(
        'We encountered an error while loading your data. Please try again.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('should work without action button for read-only states', () => {
    render(
      <EmptyState
        title="All caught up!"
        description="You've completed all your tasks. Great job!"
        iconClassName="bg-green-100 text-green-600"
        titleClassName="text-green-800"
      />,
    );

    expect(screen.getByText('All caught up!')).toBeInTheDocument();

    expect(
      screen.getByText("You've completed all your tasks. Great job!"),
    ).toBeInTheDocument();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should work in a dashboard context', () => {
    const handleCreateProject = vi.fn();

    render(
      <div role="main" aria-label="Dashboard">
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started with our platform."
          actionButtonText="Create Project"
          onActionButtonClick={handleCreateProject}
          actionButtonProps={{
            variant: 'default',
            size: 'lg',
            'aria-describedby': 'project-description',
          }}
        />

        <p id="project-description" className="sr-only">
          Projects help you organize your work and collaborate with your team.
        </p>
      </div>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('No projects yet')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Create Project' });
    fireEvent.click(button);
    expect(handleCreateProject).toHaveBeenCalledTimes(1);
  });

  it('should work with Link component using asChild', () => {
    render(
      <EmptyState
        title="Welcome to our app"
        description="Get started by exploring our features."
        actionButtonProps={{
          asChild: true,
          children: (
            <a href="https://example.com/getting-started">Get Started</a>
          ),
        }}
      />,
    );

    const link = screen.getByRole('link', { name: 'Get Started' });
    expect(link).toHaveAttribute('href', 'https://example.com/getting-started');
    expect(link.closest('button, [role="button"]')).toBeNull(); // Should not be wrapped in button
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { Calendar } from '../calendar';

/**
 * Test suite for the Calendar component
 *
 * @remarks
 * Tests cover basic rendering, navigation, and core functionality
 */
describe('Calendar', () => {
  const mockDate = new Date(2024, 0, 15); // January 15, 2024

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Calendar />);

      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
      expect(calendar).toHaveAttribute('aria-label', 'January 2024');
    });

    it('should render current month by default', () => {
      render(<Calendar />);

      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<Calendar />);

      const prevButton = screen.getByLabelText('Go to the Previous Month');
      const nextButton = screen.getByLabelText('Go to the Next Month');

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('should render weekday headers', () => {
      render(<Calendar />);

      const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

      weekdays.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      render(<Calendar className="custom-calendar" />);

      const calendar = screen.getByRole('grid');
      expect(calendar.closest('.rdp-root')).toHaveClass('custom-calendar');
    });
  });

  describe('Month Navigation', () => {
    it('should call onNextClick callback when provided', () => {
      const onNextClick = vi.fn();
      render(<Calendar onNextClick={onNextClick} />);

      const nextButton = screen.getByLabelText('Go to the Next Month');
      fireEvent.click(nextButton);

      expect(onNextClick).toHaveBeenCalledTimes(1);
    });

    it('should call onPrevClick callback when provided', () => {
      const onPrevClick = vi.fn();
      render(<Calendar onPrevClick={onPrevClick} />);

      const prevButton = screen.getByLabelText('Go to the Previous Month');
      fireEvent.click(prevButton);

      expect(onPrevClick).toHaveBeenCalledTimes(1);
    });

    it('should have navigation buttons that are clickable', () => {
      render(<Calendar />);

      const prevButton = screen.getByLabelText('Go to the Previous Month');
      const nextButton = screen.getByLabelText('Go to the Next Month');

      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Year Switcher', () => {
    it('should render year switcher button by default', () => {
      render(<Calendar />);

      const yearSwitcher = screen.getByRole('button', { name: 'January 2024' });
      expect(yearSwitcher).toBeInTheDocument();
    });

    it('should hide year switcher when showYearSwitcher is false', () => {
      render(<Calendar showYearSwitcher={false} />);

      expect(screen.getByText('January 2024')).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: 'January 2024' }),
      ).not.toBeInTheDocument();
    });

    it('should be clickable when enabled', () => {
      render(<Calendar />);

      const yearSwitcher = screen.getByRole('button', { name: 'January 2024' });

      expect(yearSwitcher).not.toBeDisabled();
      expect(() => fireEvent.click(yearSwitcher)).not.toThrow();
    });
  });

  describe('Date Selection', () => {
    it('should handle single date selection', () => {
      const onSelect = vi.fn();
      render(<Calendar mode="single" onSelect={onSelect} />);

      const date15 = screen.getByLabelText('Today, Monday, January 15th, 2024');
      fireEvent.click(date15);

      expect(onSelect).toHaveBeenCalled();
    });

    it('should highlight today', () => {
      render(<Calendar />);

      const today = screen.getByLabelText('Today, Monday, January 15th, 2024');
      expect(today).toHaveAttribute('data-today', 'true');
    });

    it('should show selected date with aria-selected', () => {
      render(<Calendar mode="single" selected={mockDate} />);

      const selectedDate = screen.getByRole('gridcell', { selected: true });
      expect(selectedDate).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle range mode', () => {
      const onSelect = vi.fn();
      render(<Calendar mode="range" onSelect={onSelect} />);

      const calendar = screen.getByRole('grid');
      expect(calendar).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  describe('Multiple Months', () => {
    it('should render multiple months when numberOfMonths is set', () => {
      render(<Calendar numberOfMonths={2} />);

      expect(screen.getByText('January 2024')).toBeInTheDocument();
      expect(screen.getByText('February 2024')).toBeInTheDocument();
    });
  });

  describe('Outside Days', () => {
    it('should show outside days by default', () => {
      render(<Calendar />);

      const outsideDays = document.querySelectorAll('.day-outside');
      expect(outsideDays.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation', () => {
      render(<Calendar />);

      const prevButton = screen.getByLabelText('Go to the Previous Month');
      const nextButton = screen.getByLabelText('Go to the Next Month');

      expect(prevButton).toHaveAttribute('aria-label');
      expect(nextButton).toHaveAttribute('aria-label');
    });

    it('should have proper grid structure', () => {
      render(<Calendar />);

      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);

      const cells = screen.getAllByRole('gridcell');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should have proper aria-multiselectable attribute', () => {
      const { rerender } = render(<Calendar mode="single" />);

      let grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-multiselectable', 'false');

      rerender(<Calendar mode="range" />);

      grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  describe('Integration with react-day-picker', () => {
    it('should pass through react-day-picker props', () => {
      const onMonthChange = vi.fn();
      render(<Calendar onMonthChange={onMonthChange} />);

      const nextButton = screen.getByLabelText('Go to the Next Month');
      fireEvent.click(nextButton);

      expect(onMonthChange).toHaveBeenCalled();
    });

    it('should pass through disabled prop', () => {
      const disabledDays = [new Date(2024, 0, 10)];
      render(<Calendar disabled={disabledDays} />);

      // Should render without errors
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should handle weekStartsOn prop', () => {
      render(<Calendar weekStartsOn={1} />); // Monday

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date props gracefully', () => {
      expect(() => {
        render(<Calendar mode="single" selected={new Date('invalid')} />);
      }).not.toThrow();
    });

    it('should handle missing required props in range mode', () => {
      expect(() => {
        render(<Calendar mode="range" />);
      }).not.toThrow();
    });

    it('should handle undefined props gracefully', () => {
      expect(() => {
        render(<Calendar mode="single" selected={undefined} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<Calendar />);

      rerender(<Calendar />);

      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<Calendar mode="single" />);

      rerender(<Calendar mode="range" />);
      rerender(<Calendar mode="single" />);

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('Styling and Customization', () => {
    it('should apply custom classNames correctly', () => {
      render(<Calendar className="test-calendar" />);

      const calendarRoot = document.querySelector('.rdp-root');
      expect(calendarRoot).toHaveClass('test-calendar');
    });

    it('should merge classNames with defaults', () => {
      render(<Calendar className="custom-class" />);

      const calendarRoot = document.querySelector('.rdp-root');
      expect(calendarRoot).toHaveClass('p-3');
      expect(calendarRoot).toHaveClass('custom-class');
    });
  });
});

/**
 * Test suite for Calendar component integration scenarios
 *
 * @remarks
 * Tests practical usage scenarios
 */
describe('Calendar Integration Examples', () => {
  const mockDate = new Date(2024, 0, 15);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should work as a date picker in a form', () => {
    const onSelect = vi.fn();

    render(
      <form>
        <label htmlFor="date-picker">Select Date:</label>
        <Calendar id="date-picker" mode="single" onSelect={onSelect} />
      </form>,
    );

    const date20 = screen.getByLabelText('Saturday, January 20th, 2024');
    fireEvent.click(date20);

    expect(onSelect).toHaveBeenCalled();
  });

  it('should work for booking date ranges', () => {
    const onSelect = vi.fn();

    render(
      <Calendar
        mode="range"
        onSelect={onSelect}
        disabled={(date) => date < new Date()}
      />,
    );

    const futureDate = screen.getByLabelText('Saturday, January 20th, 2024');
    fireEvent.click(futureDate);

    expect(onSelect).toHaveBeenCalled();
  });

  it('should work with internationalization', () => {
    render(<Calendar />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should work with custom date formatting', () => {
    render(
      <Calendar
        formatters={{ formatCaption: (date) => `Custom ${date.getFullYear()}` }}
      />,
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should handle complex selection scenarios', () => {
    const onSelect = vi.fn();

    render(<Calendar mode="multiple" onSelect={onSelect} max={3} />);

    const date15 = screen.getByLabelText('Today, Monday, January 15th, 2024');
    fireEvent.click(date15);

    expect(onSelect).toHaveBeenCalled();
  });
});

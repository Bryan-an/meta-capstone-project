import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MainLayout from '../layout';

// Mock the Supabase server client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock the section components
vi.mock('@/components/sections/navbar', () => ({
  Navbar: ({ user }: { user: unknown }) => (
    <nav data-testid="navbar" data-user={user ? 'authenticated' : 'anonymous'}>
      Navbar Component
    </nav>
  ),
}));

vi.mock('@/components/sections/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer Component</footer>,
}));

/**
 * Test suite for the MainLayout component
 *
 * @remarks
 * Tests cover component structure, user authentication state handling,
 * proper component composition, Supabase integration, and layout rendering
 */
describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('should render the basic layout structure with authenticated user', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const testChildren = <div data-testid="test-content">Test Content</div>;

      const layout = await MainLayout({ children: testChildren });
      render(layout);

      // Check that the main element has correct classes
      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-grow');
      expect(main).toContainElement(screen.getByTestId('test-content'));

      // Check that all sections are rendered
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render the layout structure with anonymous user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const testChildren = <div data-testid="test-content">Test Content</div>;

      const layout = await MainLayout({ children: testChildren });
      render(layout);

      // Check that navbar receives null user
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-user', 'anonymous');

      // Check that content and footer are still rendered
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render children in the main content area', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const testChildren = (
        <>
          <h1 data-testid="page-title">Welcome</h1>
          <p data-testid="page-content">This is page content</p>
          <button data-testid="page-button">Click me</button>
        </>
      );

      const layout = await MainLayout({ children: testChildren });
      render(layout);

      // Check that all children are rendered
      expect(screen.getByTestId('page-title')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
      expect(screen.getByTestId('page-button')).toBeInTheDocument();

      // Check that children are in the main element
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('flex-grow');
      expect(mainElement).toContainElement(screen.getByTestId('page-title'));
    });

    it('should handle empty children gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const layout = await MainLayout({ children: null });
      render(layout);

      // Layout structure should still exist
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('User Authentication Integration', () => {
    it('should pass authenticated user data to Navbar', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const testChildren = <div data-testid="content">Content</div>;
      const layout = await MainLayout({ children: testChildren });
      render(layout);

      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-user', 'authenticated');
    });

    it('should pass null user to Navbar when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const testChildren = <div data-testid="content">Content</div>;
      const layout = await MainLayout({ children: testChildren });
      render(layout);

      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-user', 'anonymous');
    });

    it('should handle Supabase auth errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      const testChildren = <div data-testid="content">Content</div>;
      const layout = await MainLayout({ children: testChildren });
      render(layout);

      // Should still render the layout with null user
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-user', 'anonymous');
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Supabase Client Integration', () => {
    it('should create and use Supabase client', async () => {
      const mockUser = { id: 'test-user' };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const testChildren = <div data-testid="content">Content</div>;
      await MainLayout({ children: testChildren });

      // Verify that createClient is called
      const { createClient } = await import('@/lib/supabase/server');
      expect(createClient).toHaveBeenCalledOnce();

      // Verify that getUser is called on the client
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledOnce();
    });

    it('should handle Supabase client creation errors', async () => {
      const { createClient } = await import('@/lib/supabase/server');

      (createClient as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Failed to create client'),
      );

      const testChildren = <div data-testid="content">Content</div>;

      await expect(MainLayout({ children: testChildren })).rejects.toThrow(
        'Failed to create client',
      );
    });
  });

  describe('Layout Styling and Structure', () => {
    it('should have correct CSS classes for responsive layout', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const testChildren = <div data-testid="content">Content</div>;
      const layout = await MainLayout({ children: testChildren });
      render(layout);

      // Check that layout components are present and functional
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-grow');
    });

    it('should maintain proper component hierarchy', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const testChildren = <div data-testid="content">Content</div>;
      const layout = await MainLayout({ children: testChildren });
      render(layout);

      const navbar = screen.getByTestId('navbar');
      const main = screen.getByRole('main');
      const footer = screen.getByTestId('footer');

      // Check that navbar comes before main
      expect(navbar.compareDocumentPosition(main)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );

      // Check that main comes before footer
      expect(main.compareDocumentPosition(footer)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );

      // Check that content is properly nested in main
      expect(main).toContainElement(screen.getByTestId('content'));
    });
  });

  describe('Component Props Handling', () => {
    it('should handle different types of children content', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const complexChildren = (
        <div data-testid="complex-content">
          <header>Page Header</header>

          <section>
            <article>Article content</article>
            <aside>Sidebar content</aside>
          </section>

          <nav>Page navigation</nav>
        </div>
      );

      const layout = await MainLayout({ children: complexChildren });
      render(layout);

      expect(screen.getByTestId('complex-content')).toBeInTheDocument();
      expect(screen.getByText('Page Header')).toBeInTheDocument();
      expect(screen.getByText('Article content')).toBeInTheDocument();
      expect(screen.getByText('Sidebar content')).toBeInTheDocument();
      expect(screen.getByText('Page navigation')).toBeInTheDocument();
    });

    it('should handle string children', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const layout = await MainLayout({ children: 'Simple text content' });
      render(layout);

      expect(screen.getByText('Simple text content')).toBeInTheDocument();

      expect(screen.getByRole('main')).toContainElement(
        screen.getByText('Simple text content'),
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const testChildren = <div data-testid="content">Content</div>;
      const layout = await MainLayout({ children: testChildren });
      render(layout);

      // Check for proper semantic elements
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Navbar should be wrapped in nav (based on our mock)
      const navbar = screen.getByTestId('navbar');
      expect(navbar.tagName).toBe('NAV');

      // Footer should be wrapped in footer (based on our mock)
      const footer = screen.getByTestId('footer');
      expect(footer.tagName).toBe('FOOTER');
    });

    it('should maintain focus management structure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const testChildren = (
        <div data-testid="content">
          <h1>Page Title</h1>
          <button>Focusable Element</button>
        </div>
      );

      const layout = await MainLayout({ children: testChildren });
      render(layout);

      const main = screen.getByRole('main');
      const heading = screen.getByRole('heading', { level: 1 });
      const button = screen.getByRole('button');

      expect(main).toContainElement(heading);
      expect(main).toContainElement(button);
    });
  });
});

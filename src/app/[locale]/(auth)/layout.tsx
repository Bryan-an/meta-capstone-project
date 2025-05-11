import { ReactNode } from 'react';

/**
 * Props for the AuthLayout component.
 */
interface AuthLayoutProps {
  /** The child elements to render within the layout. */
  children: ReactNode;
}

/**
 * Layout for authentication pages (login, signup, error pages) within the `(auth)` group.
 *
 * @remarks
 * This component provides a centered layout for its children.
 * It does NOT include global navigation elements like Navbar or Footer.
 * Internationalization context is provided by the root `/[locale]/layout.tsx`.
 *
 * @param props - The properties for the layout component.
 * @returns The rendered auth layout element.
 */
export default function AuthLayout(props: AuthLayoutProps) {
  const { children } = props;

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      {children}
    </div>
  );
}

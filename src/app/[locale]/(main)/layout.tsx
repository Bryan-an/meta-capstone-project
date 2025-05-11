import { Footer } from '@/components/sections/footer';
import { Navbar } from '@/components/sections/navbar';
import { ReactNode } from 'react';

/**
 * Props for the MainLayout component.
 */
interface MainLayoutProps {
  /** The child elements to render within the layout (typically pages). */
  children: ReactNode;
}

/**
 * Layout for the main application pages within the `(main)` group.
 *
 * @remarks
 * This layout includes the global `Navbar` and `Footer` components.
 * It receives its internationalization context from the root `/[locale]/layout.tsx`.
 *
 * @param props - The properties for the layout component.
 * @returns The rendered main layout element with Navbar, main content area, and Footer.
 */
export default function MainLayout(props: MainLayoutProps): React.ReactElement {
  const { children } = props;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

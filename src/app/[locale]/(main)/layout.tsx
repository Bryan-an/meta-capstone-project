import { Footer } from '@/components/sections/footer';
import { Navbar } from '@/components/sections/navbar';
import { createClient } from '@/lib/supabase/server';
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
 * It fetches the user session to pass authentication status to the Navbar.
 * It receives its internationalization context from the root `/[locale]/layout.tsx`.
 *
 * @param props - The properties for the layout component.
 * @returns The rendered main layout element with Navbar, main content area, and Footer.
 */
export default async function MainLayout(
  props: MainLayoutProps,
): Promise<React.ReactElement> {
  const { children } = props;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

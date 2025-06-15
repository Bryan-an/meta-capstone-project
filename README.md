# Little Lemon Restaurant 🍋

A modern, full-stack restaurant website built with Next.js, featuring table reservations, menu showcases, customer testimonials, and multi-language support. This is a capstone project for the Meta Front-End Developer Specialization.

## 🌟 Features

- **🏠 Home Page**: Beautiful landing page with hero section, weekly specials, and customer testimonials
- **📅 Table Reservations**: Complete reservation system with user authentication
- **🌍 Internationalization**: Full support for English and Spanish languages
- **👤 User Authentication**: Secure login/signup with Supabase Auth
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🎨 Modern UI**: Built with Shadcn/ui components and Radix UI primitives
- **⚡ Performance**: Optimized with Next.js 15 and React 19
- **🧪 Testing**: Comprehensive test suite with Vitest and Testing Library

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Fonts**: Geist (optimized with `next/font`)

### Backend & Database

- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth with OAuth support
- **Database**: PostgreSQL with RLS (Row Level Security)

### Development Tools

- **Package Manager**: npm
- **Linting**: ESLint with strict rules
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Vitest + React Testing Library + jsdom
- **Git Hooks**: Husky + lint-staged
- **Commit Convention**: Conventional Commits with Commitizen

### Internationalization

- **i18n**: next-intl with ICU message format
- **Languages**: English (en) & Spanish (es)
- **Routing**: Locale-based routing (`/en/`, `/es/`)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd meta-capstone-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   Set up your Supabase database with the required tables:

   - `categories` - Menu categories
   - `menu_items` - Restaurant menu items
   - `specials` - Weekly specials
   - `testimonials` - Customer reviews
   - `restaurant_tables` - Table information
   - `reservations` - Reservation bookings

### Development

**Start the development server:**

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

**Other available scripts:**

```bash
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run format:check # Check code formatting
npm run format:write # Format code with Prettier
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (main)/        # Main application pages
│   │   └── layout.tsx     # Root layout
│   ├── auth/              # Authentication actions
│   └── globals.css        # Global styles with Tailwind
├── components/            # React components
│   ├── sections/         # Page sections (Hero, About, etc.)
│   ├── ui/               # Reusable UI components
│   └── icons/            # Custom SVG icons
├── i18n/                 # Internationalization config
├── lib/                  # Utility libraries
│   ├── data/            # Data fetching functions
│   ├── supabase/        # Supabase client configuration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions

messages/                # Translation files
├── en.json             # English translations
└── es.json             # Spanish translations

public/
└── images/             # Static images and assets
```

## 🌍 Internationalization

The application supports multiple languages using `next-intl`:

- **English** (`/en/`) - Default locale
- **Spanish** (`/es/`) - Secondary locale

Translation files are located in the `messages/` directory. The application automatically detects the user's preferred language and redirects accordingly.

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

Tests are written using:

- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **jsdom** - DOM environment for Node.js

## 🚀 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**

   ```bash
   npm i -g vercel
   vercel
   ```

2. **Environment Variables**

   Add the following environment variables in your Vercel dashboard:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Domain Configuration**

   Configure your custom domain in the Vercel dashboard if needed.

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📄 License

This project is part of the Meta Front-End Developer Specialization capstone project.

## 🤝 Contributing

This is a capstone project, but if you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or support, please contact the development team or refer to the project documentation.

---

**Built with ❤️ using Next.js, Supabase, and modern web technologies.**

# Frontend Architecture

## Overview

The MishMob frontend is a modern React application built with TypeScript, utilizing Vite as the build tool and shadcn/ui for the component library. The architecture emphasizes type safety, component reusability, and developer experience.

## Technology Stack

### Core Technologies
- **React 18.3.1** - UI library with concurrent features
- **TypeScript 5.8** - Type safety and better DX
- **Vite 7.1** - Lightning-fast build tool with HMR
- **SWC** - Rust-based transpiler for faster builds

### UI & Styling
- **shadcn/ui** - Copy-paste component library built on Radix UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS transformations
- **next-themes 0.3** - Theme management with dark mode

### State & Data
- **TanStack Query 5.87** - Server state management
- **React Hook Form 7.62** - Form state management
- **Zod 3.25** - Schema validation

### Routing & Navigation
- **React Router v6 30.1** - Client-side routing
- **Protected routes** - Auth-based route guards

### Visualization
- **Recharts 2.15** - Data visualization charts
- **Lucide React 0.544** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/          # shadcn/ui base components
│   │   └── *.tsx        # Custom components
│   ├── pages/           # Page components (routes)
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client functions
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── assets/          # Static assets (images, etc.)
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles and theme
├── public/              # Static public assets
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── eslint.config.js     # ESLint rules
```

## Component Architecture

### Component Categories

#### 1. UI Components (`/components/ui/`)
Base components from shadcn/ui library:
- `Button`, `Input`, `Select`, `Checkbox`, `Radio`
- `Card`, `Dialog`, `Sheet`, `Popover`, `Tooltip`
- `Table`, `Form`, `Label`, `Textarea`
- `Tabs`, `Accordion`, `Alert`, `Badge`
- `Calendar`, `DatePicker`, `TimePicker`
- `Progress`, `Skeleton`, `Spinner`
- `Avatar`, `Separator`, `ScrollArea`
- 50+ total components

#### 2. Feature Components (`/components/`)
Business logic components:
- `Navigation.tsx` - App navigation bar
- `CollageHero.tsx` - Landing page hero section
- `OpportunityCard.tsx` - Opportunity display card
- `SkillsManager.tsx` - Skill selection and management
- `SkillMatchBreakdown.tsx` - Skill matching visualization
- `RecommendedOpportunities.tsx` - AI-powered recommendations

#### 3. Page Components (`/pages/`)
Route-level components (33 pages):

**Authentication**
- `Login.tsx` - User login
- `Register.tsx` - User registration
- `ForgotPassword.tsx` - Password recovery

**Core Features**
- `Index.tsx` - Landing page
- `Dashboard.tsx` - User dashboard
- `Opportunities.tsx` - Browse opportunities
- `OpportunityDetail.tsx` - Single opportunity view
- `CreateOpportunity.tsx` - Host opportunity creation
- `Profile.tsx` - User profile
- `EditProfile.tsx` - Profile editing

**Applications**
- `MyApplications.tsx` - Volunteer applications
- `ApplicationDetail.tsx` - Application status
- `MyOpportunities.tsx` - Host opportunities

**Organizations**
- `Organization.tsx` - Organization profile
- `Organizations.tsx` - Browse organizations

**Learning (LMS)**
- `Courses.tsx` - Available courses
- `CourseDetail.tsx` - Course information
- `ModuleViewer.tsx` - Course module content
- `LearningDashboard.tsx` - Learning progress

**Events**
- `Events.tsx` - Browse events
- `EventDetail.tsx` - Event information
- `MyEvents.tsx` - User's events

**Communication**
- `Messages.tsx` - Messaging center
- `Notifications.tsx` - Notification center

**Content**
- `Blog.tsx` - Blog posts
- `BlogPost.tsx` - Single blog post
- `Impact.tsx` - Impact stories
- `About.tsx` - About page
- `Help.tsx` - Help center
- `Contact.tsx` - Contact form

**Legal**
- `Privacy.tsx` - Privacy policy
- `Terms.tsx` - Terms of service

**System**
- `NotFound.tsx` - 404 error page
- `Settings.tsx` - User settings

## State Management

### Server State (TanStack Query)
```typescript
// services/api.ts
import { useQuery, useMutation } from '@tanstack/react-query';

// Query for fetching data
export const useOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: fetchOpportunities,
  });
};

// Mutation for updating data
export const useCreateOpportunity = () => {
  return useMutation({
    mutationFn: createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries(['opportunities']);
    },
  });
};
```

### Local State (React Hooks)
```typescript
// Component state
const [isOpen, setIsOpen] = useState(false);

// Form state with React Hook Form
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: '',
    description: '',
  },
});
```

### Global State (React Context)
```typescript
// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Routing Strategy

### Route Configuration
```typescript
// App.tsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/opportunities" element={<Opportunities />} />
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Protected Routes
```typescript
// components/ProtectedRoute.tsx
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
```

## API Integration

### API Client Setup
```typescript
// services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = {
  get: (endpoint: string) =>
    fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    }),

  post: (endpoint: string, data: any) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    }),
};
```

### Type-Safe API Calls
```typescript
// types/api.ts
interface Opportunity {
  id: string;
  title: string;
  description: string;
  organization: Organization;
  skills: Skill[];
}

// services/opportunities.ts
export const fetchOpportunities = async (): Promise<Opportunity[]> => {
  const response = await apiClient.get('/api/opportunities/');
  return response.json();
};
```

## Styling System

### Theme Configuration
```css
/* index.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 214 84% 56%;
    --secondary: 25 95% 53%;
    --accent: 142 76% 36%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
    },
  },
};
```

## Form Handling

### Form Schema Validation
```typescript
// schemas/opportunity.ts
import { z } from 'zod';

export const opportunitySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  date: z.date(),
  location: z.string(),
  skills: z.array(z.string()).min(1),
});

type OpportunityForm = z.infer<typeof opportunitySchema>;
```

### Form Component
```tsx
// pages/CreateOpportunity.tsx
const CreateOpportunity = () => {
  const form = useForm<OpportunityForm>({
    resolver: zodResolver(opportunitySchema),
  });

  const onSubmit = async (data: OpportunityForm) => {
    await createOpportunity(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Memoization
```typescript
// Memoize expensive computations
const expensiveResult = useMemo(() => {
  return computeExpensive(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Query Optimization
```typescript
// Prefetch data
queryClient.prefetchQuery({
  queryKey: ['opportunities'],
  queryFn: fetchOpportunities,
});

// Infinite queries for pagination
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['opportunities'],
  queryFn: ({ pageParam = 1 }) => fetchOpportunities(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

## Testing Strategy

### Unit Testing
```typescript
// components/__tests__/OpportunityCard.test.tsx
import { render, screen } from '@testing-library/react';
import { OpportunityCard } from '../OpportunityCard';

test('renders opportunity title', () => {
  render(<OpportunityCard opportunity={mockOpportunity} />);
  expect(screen.getByText(mockOpportunity.title)).toBeInTheDocument();
});
```

### Integration Testing
```typescript
// pages/__tests__/Dashboard.test.tsx
test('loads and displays opportunities', async () => {
  render(<Dashboard />, { wrapper: QueryWrapper });

  await waitFor(() => {
    expect(screen.getByText('Available Opportunities')).toBeInTheDocument();
  });
});
```

## Build & Deployment

### Development Build
```bash
npm run dev
# Starts Vite dev server on http://localhost:8081
```

### Production Build
```bash
npm run build
# Creates optimized build in /dist
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-*'],
        },
      },
    },
  },
});
```

## Best Practices

### Component Guidelines
1. **Single Responsibility**: Each component should do one thing well
2. **Composition over Inheritance**: Use component composition
3. **Props Interface**: Define TypeScript interfaces for all props
4. **Default Props**: Provide sensible defaults
5. **Error Boundaries**: Wrap features in error boundaries

### Code Organization
1. **Barrel Exports**: Use index.ts files for clean imports
2. **Absolute Imports**: Configure path aliases in tsconfig
3. **Colocation**: Keep related files together
4. **Naming Convention**: PascalCase for components, camelCase for utilities

### Performance Tips
1. **Lazy Load Routes**: Split code at route level
2. **Optimize Images**: Use WebP format and lazy loading
3. **Debounce Input**: Debounce search and filter inputs
4. **Virtual Lists**: Use virtualization for long lists
5. **Cache API Calls**: Leverage TanStack Query caching

## Common Patterns

### Custom Hooks
```typescript
// hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

### HOC Pattern
```typescript
// hoc/withAuth.tsx
export const withAuth = <P extends object>(
  Component: ComponentType<P>
): ComponentType<P> => {
  return (props: P) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <Component {...props} />;
  };
};
```

### Render Props
```typescript
// components/DataFetcher.tsx
interface DataFetcherProps<T> {
  url: string;
  render: (data: T) => ReactNode;
}

export const DataFetcher = <T,>({ url, render }: DataFetcherProps<T>) => {
  const { data, isLoading } = useQuery({
    queryKey: [url],
    queryFn: () => fetch(url).then(res => res.json()),
  });

  if (isLoading) return <Spinner />;
  return <>{render(data)}</>;
};
```

---

Last updated: October 2024
# Client Detail Components

This directory contains the refactored components for the client detail view, breaking down the previously monolithic `ClientDetailView` into smaller, focused, and reusable components.

## 📁 Component Structure

```
client-detail/
├── index.ts                    # Export barrel for all components
├── client-detail-header.tsx    # Top navigation header
├── client-info-section.tsx     # Client name, status, and actions
├── client-contact-card.tsx     # Contact information card
├── client-stats-card.tsx       # Statistics and metrics card
├── rentenchecks-card.tsx       # Rentenchecks list with loading states
├── loading-states.tsx          # Loading and error state components
└── README.md                   # This documentation
```

## 🧩 Components Overview

### ClientDetailHeader

**Purpose**: Top navigation with back button, logo, and user actions

- ✅ **Single Responsibility**: Navigation and user actions only
- 📝 **Props**: `onLogout` function
- 🎨 **Style**: Sticky header with backdrop blur

### ClientInfoSection

**Purpose**: Client name, status badge, and primary action buttons

- ✅ **Single Responsibility**: Client identity and main actions
- 📝 **Props**: `client` object, `clientId` string
- 🎨 **Style**: Large avatar, name, status, and CTA buttons

### ClientContactCard

**Purpose**: Display client's contact information

- ✅ **Single Responsibility**: Contact details only
- 📝 **Props**: `client` object
- 🎨 **Style**: Card with icons and clean layout
- 🔧 **Features**: Conditional rendering for optional fields

### ClientStatsCard

**Purpose**: Show client statistics and metrics

- ✅ **Single Responsibility**: Statistical data display
- 📝 **Props**: `client` object, `rentenchecks` array
- 🎨 **Style**: Card with key-value pairs
- 📊 **Metrics**: Total, completed, and draft rentenchecks

### RentenchecksCard

**Purpose**: List all rentenchecks with actions and states

- ✅ **Single Responsibility**: Rentencheck management
- 📝 **Props**: `clientId`, `rentenchecks` array, `loading` boolean
- 🎨 **Style**: Card with dynamic content
- 🔧 **Features**: Loading, empty, and populated states

### LoadingStates

**Purpose**: Reusable loading and error state components

- ✅ **Single Responsibility**: State management display
- 📝 **Components**: `ClientLoadingState`, `ClientErrorState`
- 🎨 **Style**: Centered cards with appropriate messaging

## 🔧 Usage Example

```tsx
import {
  ClientDetailHeader,
  ClientInfoSection,
  ClientContactCard,
  ClientStatsCard,
  RentenchecksCard,
  ClientLoadingState,
  ClientErrorState,
} from "./client-detail";

function ClientDetailView({ clientId }: { clientId: string }) {
  // ... data loading logic

  if (loading) return <ClientLoadingState />;
  if (!client) return <ClientErrorState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ClientDetailHeader onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-8">
        <ClientInfoSection client={client} clientId={clientId} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <ClientContactCard client={client} />
            <ClientStatsCard client={client} rentenchecks={rentenchecks} />
          </div>

          <div className="lg:col-span-2">
            <RentenchecksCard
              clientId={clientId}
              rentenchecks={rentenchecks}
              loading={rentenchecksLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🛠 Shared Utilities

The components use shared utility functions from `@/lib/utils/client-utils`:

- `getClientStatusColor()` - Client status styling
- `getClientStatusText()` - Client status text
- `getRentencheckStatusColor()` - Rentencheck status styling
- `getRentencheckStatusText()` - Rentencheck status text
- `formatDate()` - German date formatting
- `formatDatetime()` - German datetime formatting

## ✅ Benefits of This Refactoring

1. **🎯 Single Responsibility**: Each component has one clear purpose
2. **🔄 Reusability**: Components can be used independently in other views
3. **🧪 Testability**: Smaller components are easier to unit test
4. **🚀 Performance**: Individual components can be optimized/memoized
5. **📝 Maintainability**: Changes are isolated to specific components
6. **👥 Team Development**: Multiple developers can work on different components
7. **📦 Bundle Splitting**: Smaller components enable better code splitting

## 🔮 Future Enhancements

- Add React.memo() for performance optimization
- Implement skeleton loading states
- Add accessibility (a11y) improvements
- Create Storybook stories for each component
- Add unit tests for individual components
- Implement prop validation with TypeScript strict mode

# Guest Mode & Onboarding Setup

## Overview
The app now includes a comprehensive onboarding flow with a guest/demo mode option that allows users to explore the app before creating an account. This significantly improves conversion rates by reducing friction.

## User Flow

1. **First Launch** → Onboarding slides (7 screens)
2. **After Onboarding** → Two options:
   - "Create Account" → Goes to registration
   - "Try Demo" → Enters app in guest mode with sample data
3. **Guest Mode** → User explores with banners/prompts to create account
4. **Account Creation** → Exits guest mode, saves real data

## Components

### 1. Onboarding Flow
- **Location**: `app/(onboarding)/index.tsx`
- **Features**:
  - 7 slides introducing app features
  - Swipeable gesture navigation
  - Skip button & pagination dots
  - Two CTAs on final slide: "Try Demo" and "Create Account"

### 2. Guest Mode Banner
- **Location**: `src/components/GuestModeBanner.tsx`
- **Usage**:
```tsx
import { GuestModeBanner } from '@/components';

// Inside your screen component
<GuestModeBanner 
  message="Create an account to save your data" 
  compact={false} 
/>
```
- **Props**:
  - `message` (optional): Custom message text
  - `compact` (optional): Smaller version for tight spaces
- Automatically hidden when not in guest mode

### 3. Create Account Prompt Modal
- **Location**: `src/components/CreateAccountPrompt.tsx`
- **Usage**:
```tsx
import { CreateAccountPrompt } from '@/components';
import { useState } from 'react';

function MyScreen() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { isGuestMode } = useAuth();

  const handleSaveData = () => {
    if (isGuestMode) {
      setShowPrompt(true);
      return;
    }
    // Save data normally
  };

  return (
    <>
      {/* Your screen content */}
      <CreateAccountPrompt
        visible={showPrompt}
        onClose={() => setShowPrompt(false)}
        title="Save Your Progress"
        message="Create an account to save your aquarium data."
      />
    </>
  );
}
```

### 4. Auth Context Updates
- **New properties**:
  - `isGuestMode: boolean` - True when user is in demo mode
  - `exitGuestMode: () => Promise<void>` - Exits guest mode
- **Usage**:
```tsx
const { isGuestMode, exitGuestMode } = useAuth();

if (isGuestMode) {
  // Show limited features or prompts
}
```

## Storage Keys

- `onboarding_completed`: Boolean flag for onboarding completion
- `guest_mode`: Boolean flag for guest mode status

## Where to Add Prompts

Add `CreateAccountPrompt` on actions that save data:

1. **Logging Screen** - Before saving a new log entry
2. **Maintenance Screen** - Before adding maintenance tasks
3. **Profile/Settings** - When trying to change preferences
4. **Subscription Screen** - When selecting a plan
5. **Equipment/Livestock** - Before adding items

## Example: Add to Log Screen

```tsx
import { CreateAccountPrompt } from '@/components';
import { useState } from 'react';
import { useAuth } from '@/context';

export default function LogScreen() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { isGuestMode } = useAuth();

  const handleSubmitLog = async (data) => {
    // Check if guest mode
    if (isGuestMode) {
      setShowPrompt(true);
      return;
    }

    // Normal save flow
    await saveLog(data);
  };

  return (
    <View>
      {/* Your form */}
      <CreateAccountPrompt
        visible={showPrompt}
        onClose={() => setShowPrompt(false)}
        title="Save Your Log Entry"
        message="Create an account to save your water parameters and track changes over time."
      />
    </View>
  );
}
```

## Testing Guest Mode

To test guest mode:
1. Clear app data/cache
2. Launch app
3. Complete onboarding
4. Tap "Try Demo" on final slide
5. Navigate through app - you should see banners
6. Try saving data - prompt should appear

To reset onboarding for testing:
```tsx
import { onboardingStorage } from '@/lib';

// In a debug menu or console
await onboardingStorage.resetOnboarding();
```

## Best Practices

1. **Strategic Placement**: Show account prompts at high-intent moments (when user wants to save)
2. **Allow Exploration**: Don't prompt immediately - let users explore first
3. **Clear Value**: Explain WHY they need an account (sync, save, backup)
4. **Multiple Attempts**: Don't just show once - remind periodically
5. **Easy Dismissal**: "Maybe Later" option to avoid frustration

## Conversion Optimization

Research shows that allowing users to try apps before signup increases conversion by 30-50%. Key factors:

- ✅ Low friction entry (guest mode)
- ✅ Value demonstration (see features)
- ✅ Strategic timing (prompt when invested)
- ✅ Multiple CTAs (banner + modal)
- ✅ Clear benefits (data sync, backup)

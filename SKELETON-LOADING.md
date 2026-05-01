# Skeleton Loading Implementation

This project includes skeleton loading UI inspired by [Boneyard](https://github.com/0xGF/boneyard). Skeleton screens improve perceived performance by showing placeholder animations while content loads.

## Files Added

1. **assets/css/skeleton-loading.css** - Skeleton animations and styles
2. **assets/js/site/skeleton.js** - Vue 3 skeleton components
3. Updated **includes/render.php** - Links skeleton CSS in both public and admin pages

## Features

- **Shimmer Animation** - Smooth gradient shimmer effect across skeleton elements
- **Pulse Animation** - Alternative pulsing opacity animation
- **Dark Mode Support** - Automatic dark mode detection
- **Stagger Effect** - Delayed animations for multiple skeleton elements
- **Pre-built Components** - Ready-to-use skeleton loaders for common patterns

## Available Skeleton Components

### SkeletonNotice
Single notice card skeleton
```vue
<skeleton-notice />
```

### SkeletonProgramCard
Single program/course card skeleton
```vue
<skeleton-program-card />
```

### SkeletonWelcomeBanner
Welcome banner section with image and content
```vue
<skeleton-welcome-banner />
```

### SkeletonHero
Page hero section with badge, title, and image
```vue
<skeleton-hero />
```

### SkeletonNoticeGrid
Grid of notice card skeletons
```vue
<skeleton-notice-grid :count="3" />
```

### SkeletonProgramGrid
Grid of program card skeletons
```vue
<skeleton-program-grid :count="3" />
```

### SkeletonLoader (Generic)
Wrapper that conditionally shows skeleton or real content
```vue
<skeleton-loader :loading="isLoading" skeleton="program-grid" :count="3">
  <ProgramList :programs="programs" />
</skeleton-loader>
```

## Usage Example

### In Vue Components

```vue
<script>
import { SkeletonLoader } from './site/skeleton.js'

export default {
  components: { SkeletonLoader },
  data() {
    return {
      programs: [],
      loading: true
    }
  },
  async mounted() {
    try {
      const response = await fetch('/api/programs')
      this.programs = await response.json()
    } finally {
      this.loading = false
    }
  }
}
</script>

<template>
  <skeleton-loader :loading="loading" skeleton="program-grid" :count="3">
    <div class="soft-grid soft-grid--three">
      <article v-for="program in programs" :key="program.id" class="program-card">
        <!-- program content -->
      </article>
    </div>
  </skeleton-loader>
</template>
```

### With Direct Skeleton Components

```vue
<template>
  <div v-if="loading" class="soft-grid soft-grid--three">
    <skeleton-program-card v-for="n in 3" :key="n" />
  </div>
  <div v-else class="soft-grid soft-grid--three">
    <article v-for="program in programs" :key="program.id" class="program-card">
      <!-- program content -->
    </article>
  </div>
</template>
```

## CSS Skeleton Classes

For custom skeletons, use these CSS classes:

### Base Skeleton Classes
- `.skeleton` - Base skeleton element with shimmer animation
- `.skeleton.pulse` - Uses pulse animation instead of shimmer
- `.skeleton.dark` - Dark mode variant

### Text Skeletons
- `.skeleton-text` - Default text height (16px)
- `.skeleton-text.short` - 60% width
- `.skeleton-text.medium` - 80% width
- `.skeleton-heading` - Large heading (32px)

### Component Skeletons
- `.skeleton-avatar` - Circular avatar (48px)
- `.skeleton-card` - Card container
- `.skeleton-image` - Full-width image (16:9 aspect)
- `.skeleton-badge` - Small badge/tag
- `.skeleton-stats` - Statistics grid

### Card Skeletons
- `.skeleton-notice-card` - Notice/announcement card
- `.skeleton-program-card` - Program/course card
- `.skeleton-hero` - Hero section

## Animation Variants

### Shimmer (Default)
```css
background: linear-gradient(...);
animation: skeleton-loading 2s infinite;
```

### Pulse
```css
.skeleton.pulse
animation: skeleton-pulse 2s infinite;
```

### Stagger Effect
Use consecutive child selectors:
```css
.skeleton-container > .skeleton:nth-child(n)
animation-delay: n * 100ms;
```

## Customization

### Change Animation Speed
Modify in `skeleton-loading.css`:
```css
@keyframes skeleton-loading {
  animation: skeleton-loading 1.5s infinite; /* Faster */
}
```

### Change Colors
```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 20%, #f0f0f0 40%);
}
```

### Add New Skeleton Components
```javascript
export const SkeletonCustom = {
  template: `
    <div class="skeleton-custom">
      <div class="skeleton skeleton-element"></div>
      <!-- more skeleton elements -->
    </div>
  `
}
```

## Performance Notes

- Skeletons are lightweight and CSS-based
- No JavaScript overhead during animation
- Automatically uses GPU acceleration via `transform` for smooth performance
- Reduces CLS (Cumulative Layout Shift) by matching final layout

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Dark mode detection via `prefers-color-scheme` media query
- Graceful degradation for older browsers (static gray background)

## See Also

- [Boneyard Skeleton Library](https://github.com/0xGF/boneyard)
- Similar implementations: Facebook's `react-content-loader`, Ant Design Skeleton

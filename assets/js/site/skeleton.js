/**
 * Skeleton loading components for page content
 * Inspired by Boneyard skeleton loading library
 */

export const SkeletonNotice = {
    template: `
        <article class="skeleton-notice-card">
            <div>
                <div class="skeleton skeleton-badge"></div>
                <div class="skeleton skeleton-notice-title"></div>
                <div class="skeleton skeleton-notice-meta"></div>
            </div>
            <div class="skeleton-notice-content">
                <div class="skeleton skeleton-notice-line"></div>
                <div class="skeleton skeleton-notice-line short"></div>
            </div>
        </article>
    `
};

export const SkeletonProgramCard = {
    template: `
        <article class="skeleton-program-card">
            <div class="skeleton skeleton-program-icon"></div>
            <div class="skeleton skeleton-program-subtitle"></div>
            <div class="skeleton skeleton-program-title"></div>
            <div class="skeleton-program-text">
                <div class="skeleton skeleton-program-line"></div>
                <div class="skeleton skeleton-program-line short"></div>
            </div>
        </article>
    `
};

export const SkeletonWelcomeBanner = {
    template: `
        <div class="welcome-banner">
            <div class="skeleton-hero-image skeleton"></div>
            <div class="skeleton-hero-content">
                <div class="skeleton skeleton-hero-badge"></div>
                <div class="skeleton skeleton-hero-title"></div>
                <div class="skeleton-hero-text">
                    <div class="skeleton skeleton-hero-line"></div>
                    <div class="skeleton skeleton-hero-line"></div>
                    <div class="skeleton skeleton-hero-line short"></div>
                </div>
                <div class="skeleton-stats">
                    <div class="skeleton-stat-item" v-for="n in 4" :key="n">
                        <div class="skeleton skeleton-stat-value"></div>
                        <div class="skeleton skeleton-stat-label"></div>
                    </div>
                </div>
            </div>
        </div>
    `
};

export const SkeletonHero = {
    template: `
        <section class="page-hero">
            <div class="skeleton-hero">
                <div class="skeleton-hero-content">
                    <div class="skeleton skeleton-hero-badge"></div>
                    <div class="skeleton skeleton-hero-title"></div>
                    <div class="skeleton-hero-text">
                        <div class="skeleton skeleton-hero-line"></div>
                        <div class="skeleton skeleton-hero-line"></div>
                        <div class="skeleton skeleton-hero-line short"></div>
                    </div>
                    <div class="skeleton-hero-actions">
                        <div class="skeleton skeleton-hero-btn"></div>
                        <div class="skeleton skeleton-hero-btn"></div>
                    </div>
                </div>
                <div class="skeleton-hero-image skeleton"></div>
            </div>
        </section>
    `
};

export const SkeletonNoticeGrid = {
    props: {
        count: { type: Number, default: 3 }
    },
    template: `
        <div class="soft-grid soft-grid--three">
            <skeleton-notice v-for="n in count" :key="n" />
        </div>
    `,
    components: { SkeletonNotice }
};

export const SkeletonProgramGrid = {
    props: {
        count: { type: Number, default: 3 }
    },
    template: `
        <div class="soft-grid soft-grid--three">
            <skeleton-program-card v-for="n in count" :key="n" />
        </div>
    `,
    components: { SkeletonProgramCard }
};

/**
 * Generic skeleton wrapper
 * Usage: <SkeletonLoader :loading="isLoading">
 *   <YourComponent />
 * </SkeletonLoader>
 */
export const SkeletonLoader = {
    props: {
        loading: { type: Boolean, required: true },
        skeleton: { type: String, default: 'card' },
        count: { type: Number, default: 3 }
    },
    template: `
        <div v-if="loading" class="skeleton-container">
            <component :is="skeletonComponent" :count="count" />
        </div>
        <div v-else class="skeleton-fade-in">
            <slot></slot>
        </div>
    `,
    computed: {
        skeletonComponent() {
            const skeletons = {
                notice: SkeletonNotice,
                program: SkeletonProgramCard,
                'notice-grid': SkeletonNoticeGrid,
                'program-grid': SkeletonProgramGrid,
                'welcome-banner': SkeletonWelcomeBanner,
                'hero': SkeletonHero
            };
            return skeletons[this.skeleton] || SkeletonNotice;
        }
    },
    components: {
        SkeletonNotice,
        SkeletonProgramCard,
        SkeletonNoticeGrid,
        SkeletonProgramGrid,
        SkeletonWelcomeBanner,
        SkeletonHero
    }
};

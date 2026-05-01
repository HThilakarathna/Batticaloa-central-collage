import { arrayValue, pageLink, socialIcon } from './helpers.js';

export const SiteHeader = {
    props: {
        site: { type: Object, required: true },
        navigation: { type: Array, required: true },
        page: { type: String, required: true }
    },
    data() {
        return { menuOpen: false, scrolled: false };
    },
    methods: {
        pageLink,
        toggleMenu() { this.menuOpen = !this.menuOpen; },
        closeMenu() { this.menuOpen = false; },
        handleScroll() { this.scrolled = window.scrollY > 20; }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    template: `
        <header class="topbar" :class="{ 'topbar--scrolled': scrolled || menuOpen }">
            <Transition name="fade">
                <div class="nav-overlay" v-if="menuOpen" @click="closeMenu"></div>
            </Transition>
            
            <div class="topbar__inner container">
                <a class="brand-lockup" :href="pageLink('home')" @click="closeMenu">
                    <div class="brand-logo-wrap">
                        <img src="assets/images/logo.png" alt="School logo">
                    </div>
                    <div class="brand-info">
                        <div class="brand-title">{{ site.name || 'BT/BC Central College' }}</div>
                        <span class="brand-subtitle">
                            <i class="bi bi-patch-check-fill me-1"></i>
                            {{ site.tagline || 'National School' }}
                        </span>
                    </div>
                </a>

                <button class="nav-hamburger" @click="toggleMenu" :aria-expanded="menuOpen" aria-label="Toggle navigation">
                    <span :class="menuOpen ? 'open' : ''"></span>
                    <span :class="menuOpen ? 'open' : ''"></span>
                    <span :class="menuOpen ? 'open' : ''"></span>
                </button>

                <nav class="nav-cluster" :class="{ 'nav-cluster--open': menuOpen }">
                    <div class="drawer-header d-lg-none">
                        <div class="brand-lockup">
                            <div class="brand-logo-wrap" style="width: 40px; height: 40px;">
                                <img src="assets/images/logo.png" alt="School logo">
                            </div>
                            <div class="brand-title text-white" style="font-size: 0.9rem;">BT/BC Central</div>
                        </div>
                        <button class="btn-icon" @click="closeMenu">
                            <i class="bi bi-x-lg" style="color: #0a1f44;"></i>
                        </button>
                    </div>

                    <div class="drawer-body">
                        <a
                            v-for="item in navigation"
                            :key="item.key"
                            class="nav-chip"
                            :class="{ 'is-active': item.key === page }"
                            :href="pageLink(item.key)"
                            @click="closeMenu"
                        >
                            {{ item.label }}
                            <i class="bi bi-chevron-right ms-auto d-lg-none opacity-50" style="font-size: 0.8rem;"></i>
                        </a>
                    </div>

                    <div class="drawer-footer d-lg-none">
                        <a class="sidebar-button w-100 text-center" href="admin.php" style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem;">
                            <i class="bi bi-shield-lock me-2"></i>Admin Panel
                        </a>
                    </div>
                </nav>
            </div>
        </header>
    `
};

export const HeroSection = {
    props: {
        page: { type: String, required: true },
        site: { type: Object, required: true },
        pageData: { type: Object, required: true },
        eyebrow: { type: String, required: true },
        metrics: { type: Array, required: true }
    },
    data() {
        return { visible: false };
    },
    mounted() {
        requestAnimationFrame(() => {
            setTimeout(() => { this.visible = true; }, 80);
        });
    },
    template: `
        <section class="page-hero" :class="{ 'page-hero--home': page === 'home' }">
            <div class="hero-bg-image"></div>
            <div class="hero-overlay"></div>
            <div class="hero-particles">
                <span v-for="n in 12" :key="n" class="hero-particle" :style="'--i:' + n"></span>
            </div>

            <div class="container hero-container">
                <div class="page-hero__content" :class="{ 'hero-animate-in': visible }">
                    <span class="eyebrow">
                        <i class="bi bi-stars"></i>
                        {{ eyebrow }}
                    </span>
                    <h1 class="hero-title">{{ pageData.hero_title || site.name }}</h1>
                    <p class="hero-copy">{{ pageData.hero_text || 'A modern school experience built around strong values, ambitious learners, and a connected community.' }}</p>

                    <div class="hero-actions" v-if="page === 'home'">
                        <a class="btn-brand" href="apply.php">
                            Apply Now <i class="bi bi-arrow-right-circle-fill"></i>
                        </a>
                        <a class="btn-glass" href="contact.php">
                            <i class="bi bi-telephone-fill me-2"></i>Contact Us
                        </a>
                    </div>

                    <div class="hero-actions" v-else>
                        <a class="btn-brand-alt" href="apply.php">
                            Start Application <i class="bi bi-arrow-right"></i>
                        </a>
                        <a class="btn-glass" href="contact.php">Talk to Admissions</a>
                    </div>

                    <div class="hero-metrics" v-if="page === 'home'">
                        <div class="hero-metric" v-for="metric in metrics" :key="metric.label">
                            <strong>{{ metric.value }}</strong>
                            <span>{{ metric.label }}</span>
                        </div>
                    </div>
                </div>

                <div class="hero-image-panel" v-if="page === 'home'">
                    <div class="hero-school-img-wrap" :class="{ 'hero-animate-in': visible }">
                        <img src="assets/images/Image (School Building).png" alt="BT/BC Oddamavadi Central College Building" class="hero-school-img">
                        <div class="hero-img-badge">
                            <i class="bi bi-award-fill"></i>
                            <span>National School</span>
                        </div>
                        <div class="hero-img-stat">
                            <strong>Est. 1917</strong>
                            <span>109+ Years of Excellence</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `
};

export const SiteFooter = {
    props: {
        site: { type: Object, required: true },
        navigation: { type: Array, required: true }
    },
    methods: {
        pageLink,
        socialIcon,
        arrayValue
    },
    template: `
        <footer class="site-footer">
            <div class="container py-5">
                <div class="site-footer__grid">
                    <div>
                        <a class="brand-lockup mb-3" :href="pageLink('home')">
                            <img src="assets/images/logo.png" alt="School logo">
                            <div>
                                <div class="brand-title text-white">{{ site.name }}</div>
                                <span class="brand-subtitle">{{ site.tagline }}</span>
                            </div>
                        </a>
                        <p class="mb-0">{{ site.footer_note }}</p>
                    </div>

                    <div>
                        <h5>Quick Links</h5>
                        <div class="d-grid gap-2">
                            <a v-for="item in navigation" :key="'footer-' + item.key" :href="pageLink(item.key)">{{ item.label }}</a>
                        </div>
                    </div>

                    <div>
                        <h5>Contact</h5>
                        <div class="d-grid gap-2">
                            <div>{{ site.address }}</div>
                            <div>{{ site.phone }}</div>
                            <div>{{ site.email }}</div>
                        </div>
                    </div>

                    <div>
                        <h5>Follow Us</h5>
                        <div class="footer-socials mb-3">
                            <a v-for="social in arrayValue(site.social_links)" :key="social.label" :href="social.url" target="_blank" rel="noopener">
                                <i :class="socialIcon(social.label)"></i>
                            </a>
                        </div>
                        <div class="tiny-copy text-white-50" v-for="(line, index) in arrayValue(site.working_hours)" :key="'footer-hours-' + index">
                            {{ line }}
                        </div>
                    </div>
                </div>

                <div class="footer-bottom">
                    <div>&copy; 2026 {{ site.name }}. All rights reserved.</div>
                    <div class="footer-dev-credit">
                        Designed &amp; Developed by
                        <a href="https://www.kingsparrowgroups.com/" class="footer-dev-link" target="new tab" rel="developers">King Sparrow Group of Companies Pvt Ltd</a>
                    </div>
                </div>
            </div>
        </footer>
    `
};

export const AchievementModal = {
    props: {
        achievement: { type: Object, default: null }
    },
    emits: ['close'],
    methods: {
        arrayValue
    },
    template: `
        <div class="modal-surface" v-if="achievement" @click.self="$emit('close')">
            <div class="modal-surface__card">
                <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                        <span class="pill-badge mb-2" data-tone="Academic">{{ achievement.year_label }}</span>
                        <h2 class="mb-1">{{ achievement.title }}</h2>
                        <div class="staff-meta">{{ achievement.category }}</div>
                    </div>
                    <button type="button" class="btn-icon" @click="$emit('close')">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <p class="body-copy">{{ achievement.overview || achievement.description }}</p>

                <div class="soft-grid soft-grid--two mt-4">
                    <div class="feature-card">
                        <h3>Key Achievements</h3>
                        <div class="d-grid gap-2 mt-3">
                            <div class="pill-badge" data-tone="Event" v-for="(item, index) in arrayValue(achievement.key_achievements)" :key="'key-item-' + index">
                                <i class="bi bi-check2-circle"></i>
                                {{ item }}
                            </div>
                        </div>
                    </div>
                    <div class="feature-card">
                        <h3>Outstanding Students</h3>
                        <div class="d-grid gap-2 mt-3">
                            <div class="pill-badge" data-tone="News" v-for="(student, index) in arrayValue(achievement.outstanding_students)" :key="'student-item-' + index">
                                <i class="bi bi-person-fill"></i>
                                {{ student }}
                            </div>
                            <div class="tiny-copy" v-if="arrayValue(achievement.outstanding_students).length === 0">No student names listed for this item.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

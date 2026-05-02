import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';
import { applicationSteps, navigationItems } from './site/constants.js';
import { arrayValue } from './site/helpers.js';
import { SiteHeader, HeroSection, SiteFooter, AchievementModal } from './site/components.js';
import { HomePage, AboutPage, NoticesPage, HistoryPage, AchievementsPage, StaffPage, ContactPage, ApplyPage } from './site/pages.js';

const pageComponents = {
    home: HomePage,
    about: AboutPage,
    notices: NoticesPage,
    history: HistoryPage,
    achievements: AchievementsPage,
    staff: StaffPage,
    contact: ContactPage,
    apply: ApplyPage
};

createApp({
    components: {
        SiteHeader,
        HeroSection,
        SiteFooter,
        AchievementModal
    },
    template: `
        <div class="site-shell">
            <site-header :site="site" :navigation="navigation" :page="page" />
            <main>
                <hero-section :page="page" :site="site" :page-data="pageData" :eyebrow="heroEyebrow" :metrics="heroMetrics" />

                <section class="container" v-if="error">
                    <div class="status-note status-note--error mb-4">{{ error }}</div>
                </section>

                <component
                    v-if="!loading"
                    :is="currentPageComponent"
                    v-bind="currentPageProps"
                    @open-achievement="openAchievement"
                    @update:query="noticeQuery = $event"
                    @update:form="contactForm = $event"
                    @submit="submitContact"
                    @prev-step="previousApplicationStep"
                    @next-step="nextApplicationStep"
                    @update-field="updateApplicationField"
                    @update-file="handleFileUpload"
                />
            </main>

            <site-footer :site="site" :navigation="navigation" />
            <achievement-modal :achievement="selectedAchievement" @close="closeAchievement" />
            
            <button class="back-to-top" :class="{ 'is-visible': showBackToTop }" @click="scrollToTop">
                <i class="bi bi-arrow-up"></i>
            </button>
        </div>
    `,
    data() {
        return {
            page: window.SITE_CONTEXT.page,
            apiUrl: window.SITE_CONTEXT.apiUrl,
            navigation: navigationItems,
            applicationSteps,
            loading: true,
            error: '',
            payload: {
                site: {},
                page: {},
                collections: {},
                database: {}
            },
            noticeQuery: '',
            selectedAchievement: null,
            contactSending: false,
            contactStatus: { ok: false, message: '' },
            contactForm: {
                full_name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            },
            applicationStep: 0,
            applicationSending: false,
            applicationStatus: { ok: false, message: '' },
            applicationForm: {
                student_name: '',
                name_with_initials: '',
                gender: '',
                date_of_birth: '',
                grade_applying: '',
                medium: '',
                birth_certificate_no: '',
                distance_from_school: '',
                student_address: '',
                father_name: '',
                mother_name: '',
                parent_phone: '',
                parent_email: '',
                father_occupation: '',
                mother_occupation: '',
                guardian_name: '',
                guardian_phone: '',
                family_members: '',
                monthly_income_range: '',
                emergency_contact: '',
                medical_notes: '',
                special_talents: '',
                previous_school: '',
                last_grade_studied: '',
                results_summary: '',
                extra_curricular: ''
            },
            applicationFiles: {},
            showBackToTop: false
        };
    },
    computed: {
        site() {
            return this.payload.site || {};
        },
        pageData() {
            return this.payload.page || {};
        },
        collections() {
            return this.payload.collections || {};
        },
        currentPageComponent() {
            return pageComponents[this.page] || HomePage;
        },
        currentPageProps() {
            const base = {
                pageData: this.pageData,
                collections: this.collections
            };

            if (this.page === 'home') {
                return base;
            }

            if (this.page === 'about') {
                return { pageData: this.pageData };
            }

            if (this.page === 'notices') {
                return {
                    notices: this.filteredNotices,
                    query: this.noticeQuery
                };
            }

            if (this.page === 'history') {
                return {
                    pageData: this.pageData,
                    events: arrayValue(this.collections.history_events)
                };
            }

            if (this.page === 'achievements') {
                return {
                    pageData: this.pageData,
                    groups: this.achievementGroups
                };
            }

            if (this.page === 'staff') {
                return {
                    pageData: this.pageData,
                    staff: arrayValue(this.collections.staff_members)
                };
            }

            if (this.page === 'contact') {
                return {
                    site: this.site,
                    pageData: this.pageData,
                    form: this.contactForm,
                    status: this.contactStatus,
                    sending: this.contactSending
                };
            }

            if (this.page === 'apply') {
                return {
                    pageData: this.pageData,
                    steps: this.applicationSteps,
                    currentStepIndex: this.applicationStep,
                    form: this.applicationForm,
                    files: this.applicationFiles,
                    status: this.applicationStatus,
                    sending: this.applicationSending
                };
            }

            return base;
        },
        heroEyebrow() {
            const labels = {
                home: this.site.badge || 'Welcome',
                about: 'Who We Are',
                notices: 'Latest Updates',
                history: 'School Legacy',
                achievements: 'Excellence in Action',
                staff: 'People of the School',
                contact: 'Let’s Connect',
                apply: 'Admissions Portal'
            };

            return labels[this.page] || this.site.badge || 'School Portal';
        },
        heroMetrics() {
            return this.page === 'home' ? arrayValue(this.pageData.welcome_stats) : [];
        },
        filteredNotices() {
            const notices = arrayValue(this.collections.notices);
            const query = this.noticeQuery.trim().toLowerCase();

            if (!query) {
                return notices;
            }

            return notices.filter((notice) => [notice.title, notice.content, notice.type].join(' ').toLowerCase().includes(query));
        },
        achievementGroups() {
            const items = arrayValue(this.collections.achievements);
            const groups = [
                {
                    key: 'academic',
                    kicker: 'Academic Excellence',
                    title: 'Academic Excellence',
                    description: 'Outstanding performance in examinations, olympiads, and school-wide learning outcomes.',
                    items: []
                },
                {
                    key: 'sports',
                    kicker: 'Sports Achievements',
                    title: 'Sports Achievements',
                    description: 'Team and individual success across athletics, cricket, and provincial competitions.',
                    items: []
                },
                {
                    key: 'culture',
                    kicker: 'Cultural Excellence',
                    title: 'Cultural Excellence',
                    description: 'A strong record in arts, drama, music, and creative school representation.',
                    items: []
                }
            ];

            items.forEach((item) => {
                const category = String(item.category || '').toLowerCase();
                if (category.includes('sport') || category.includes('athletic') || category.includes('cricket')) {
                    groups[1].items.push(item);
                } else if (category.includes('culture') || category.includes('art') || category.includes('drama')) {
                    groups[2].items.push(item);
                } else {
                    groups[0].items.push(item);
                }
            });

            return groups.filter((group) => group.items.length > 0);
        }
    },
    methods: {
        arrayValue,
        initScrollReveal() {
            const targets = document.querySelectorAll(
                '.reveal-on-scroll, .section-card, .feature-card, .notice-card, .program-card, ' +
                '.timeline-card, .staff-card, .recognition-card, .stat-chip, ' +
                '.highlight-panel, .form-shell, .map-card, .section-head, ' +
                '.welcome-banner, .notice-card-modern, .program-card-modern, ' +
                '.achievement-card-modern, .admission-cta-banner, .welcome-stat, ' +
                '.dynamic-section-head, .history-event-modern'
            );
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
            targets.forEach((el, i) => {
                if (!el.classList.contains('is-revealed')) {
                    el.classList.add('reveal-on-scroll');
                    el.style.transitionDelay = `${(i % 6) * 60}ms`;
                    observer.observe(el);
                }
            });
        },
        async fetchPage() {
            this.loading = true;
            this.error = '';

            try {
                const response = await fetch(`${this.apiUrl}?action=site&page=${encodeURIComponent(this.page)}`);
                const payload = await response.json();
                if (!response.ok || !payload.ok) {
                    throw new Error(payload.message || 'Unable to load page content.');
                }
                this.payload = payload.data;
            } catch (error) {
                this.error = error.message || 'Unable to load page content.';
            } finally {
                this.loading = false;
            }
        },
        openAchievement(item) {
            this.selectedAchievement = item;
            document.body.style.overflow = 'hidden';
        },
        closeAchievement() {
            this.selectedAchievement = null;
            document.body.style.overflow = '';
        },
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        handleScroll() {
            this.showBackToTop = window.scrollY > 400;
        },
        async submitContact() {
            this.contactSending = true;
            this.contactStatus = { ok: false, message: '' };

            try {
                const response = await fetch(`${this.apiUrl}?action=contact-submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.contactForm)
                });
                const payload = await response.json();
                if (!response.ok || !payload.ok) {
                    throw new Error(payload.message || 'Unable to send message.');
                }
                this.contactStatus = { ok: true, message: payload.message };
                this.contactForm = { full_name: '', email: '', phone: '', subject: '', message: '' };
            } catch (error) {
                this.contactStatus = { ok: false, message: error.message || 'Unable to send message.' };
            } finally {
                this.contactSending = false;
            }
        },
        updateApplicationField({ key, value }) {
            this.applicationForm[key] = value;
        },
        handleFileUpload({ key, event }) {
            const [file] = event.target.files || [];
            if (file) {
                this.applicationFiles[key] = file;
            } else {
                delete this.applicationFiles[key];
            }
        },
        previousApplicationStep() {
            if (this.applicationStep > 0) {
                this.applicationStep -= 1;
            }
        },
        nextApplicationStep() {
            this.applicationStatus = { ok: false, message: '' };

            if (!this.validateCurrentApplicationStep()) {
                return;
            }

            if (this.applicationStep < this.applicationSteps.length - 1) {
                this.applicationStep += 1;
                return;
            }

            this.submitApplication();
        },
        validateCurrentApplicationStep() {
            const current = this.applicationSteps[this.applicationStep];

            for (const field of current.fields) {
                if (!field.required) {
                    continue;
                }

                if (field.type === 'file') {
                    if (!this.applicationFiles[field.key]) {
                        this.applicationStatus = { ok: false, message: `Please upload ${field.label}.` };
                        return false;
                    }
                    continue;
                }

                const value = String(this.applicationForm[field.key] || '').trim();
                if (!value) {
                    this.applicationStatus = { ok: false, message: `Please fill in ${field.label}.` };
                    return false;
                }
            }

            return true;
        },
        async submitApplication() {
            this.applicationSending = true;
            this.applicationStatus = { ok: false, message: '' };

            try {
                const formData = new FormData();
                Object.entries(this.applicationForm).forEach(([key, value]) => formData.append(key, value || ''));
                Object.entries(this.applicationFiles).forEach(([key, file]) => formData.append(key, file));

                const response = await fetch(`${this.apiUrl}?action=application-submit`, {
                    method: 'POST',
                    body: formData
                });
                const payload = await response.json();
                if (!response.ok || !payload.ok) {
                    throw new Error(payload.message || 'Unable to submit application.');
                }

                this.applicationStatus = { ok: true, message: payload.message };
                this.applicationStep = 0;
                this.applicationFiles = {};
                Object.keys(this.applicationForm).forEach((key) => {
                    this.applicationForm[key] = '';
                });
            } catch (error) {
                this.applicationStatus = { ok: false, message: error.message || 'Unable to submit application.' };
            } finally {
                this.applicationSending = false;
            }
        }
    },
    mounted() {
        this.fetchPage();

        // Lenis smooth scroll removed for performance optimization
        // See PERFORMANCE-OPTIMIZATION.md for details

        this.handleEscape = (event) => {
            if (event.key === 'Escape' && this.selectedAchievement) {
                this.closeAchievement();
            }
        };
        window.addEventListener('keydown', this.handleEscape);
        window.addEventListener('scroll', this.handleScroll, { passive: true });

        // Smooth scroll-reveal using IntersectionObserver
        this.$nextTick(() => {
            this.initScrollReveal();
        });
    },
    updated() {
        this.$nextTick(() => {
            this.initScrollReveal();
        });
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleEscape);
        window.removeEventListener('scroll', this.handleScroll);
    }
}).mount('#app');

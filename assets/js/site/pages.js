import { arrayValue, formatDate, previewText } from './helpers.js';

export const HomePage = {
    props: {
        pageData: Object,
        collections: Object
    },
    emits: ['open-achievement'],
    methods: {
        arrayValue,
        formatDate
    },
    setup() { return { previewText }; },
    template: `
        <section class="section-shell">
            <div class="container d-grid gap-5">

                <!-- Welcome Banner with school image -->
                <div class="welcome-banner reveal-on-scroll">
                    <div class="welcome-banner__image">
                        <img src="assets/images/Image (School Building).png" alt="School Building">
                        <div class="welcome-banner__image-overlay">
                            <div class="welcome-badge">
                                <i class="bi bi-building-fill-check"></i>
                                <span>Est. 1917 &middot; National School</span>
                            </div>
                        </div>
                    </div>
                    <div class="welcome-banner__content">
                        <span class="section-kicker">
                            <i class="bi bi-star-fill"></i> Welcome
                        </span>
                        <h2>{{ pageData.welcome_title }}</h2>
                        <p class="body-copy mb-3" v-for="(paragraph, index) in arrayValue(pageData.welcome_paragraphs)" :key="'welcome-' + index">
                            {{ paragraph }}
                        </p>
                        <div class="welcome-stats">
                            <div class="welcome-stat" v-for="stat in arrayValue(pageData.welcome_stats)" :key="'stat-' + stat.label">
                                <strong>{{ stat.value }}</strong>
                                <span>{{ stat.label }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Latest Notices -->
                <div>
                    <div class="dynamic-section-head reveal-on-scroll">
                        <div>
                            <span class="section-kicker"><i class="bi bi-megaphone-fill"></i> Updates</span>
                            <h2>Latest Notices</h2>
                            <p>Important announcements, events, and academic reminders from the school office.</p>
                        </div>
                        <a class="btn-outline-brand" href="notices.php">
                            View All <i class="bi bi-arrow-right ms-1"></i>
                        </a>
                    </div>
                    <div class="soft-grid soft-grid--three">
                        <article class="notice-card-modern reveal-on-scroll" v-for="notice in arrayValue(collections.notices)" :key="'home-notice-' + notice.id" :data-tone="notice.type">
                            <div class="notice-card-modern__top">
                                <span class="pill-badge" :data-tone="notice.type">
                                    <i class="bi bi-bell-fill me-1"></i>{{ notice.type }}
                                </span>
                                <span class="tiny-copy">{{ formatDate(notice.notice_date) }}</span>
                            </div>
                            <h3>{{ notice.title }}</h3>
                            <p>{{ previewText(notice.content, 140) }}</p>
                            <div class="notice-card-modern__footer">
                                <i class="bi bi-clock me-1"></i>{{ notice.notice_time || 'School Hours' }}
                            </div>
                        </article>
                    </div>
                </div>

                <!-- Academic Programs -->
                <div>
                    <div class="dynamic-section-head reveal-on-scroll">
                        <div>
                            <span class="section-kicker"><i class="bi bi-journal-bookmark-fill"></i> Programs</span>
                            <h2>Academic Pathways</h2>
                            <p>Structured learning experiences from lower secondary to advanced level streams.</p>
                        </div>
                    </div>
                    <div class="soft-grid soft-grid--three">
                        <article class="program-card-modern reveal-on-scroll" v-for="(program, idx) in arrayValue(collections.programs)" :key="'program-' + program.id" :data-idx="idx">
                            <div class="program-card-modern__icon">
                                <i :class="program.icon"></i>
                            </div>
                            <div class="program-card-modern__grade">{{ program.subtitle }}</div>
                            <h3>{{ program.title }}</h3>
                            <p>{{ program.description }}</p>
                            <a class="program-card-modern__link" href="apply.php">
                                Apply Now <i class="bi bi-arrow-right ms-1"></i>
                            </a>
                        </article>
                    </div>
                </div>

                <!-- Featured Achievements -->
                <div>
                    <div class="dynamic-section-head reveal-on-scroll">
                        <div>
                            <span class="section-kicker"><i class="bi bi-trophy-fill"></i> Success Stories</span>
                            <h2>Featured Achievements</h2>
                            <p>Celebrating our strongest recent academic, sports, and cultural milestones.</p>
                        </div>
                        <a class="btn-outline-brand" href="achievements.php">
                            Explore All <i class="bi bi-arrow-right ms-1"></i>
                        </a>
                    </div>
                    <div class="soft-grid soft-grid--four">
                        <article class="achievement-card-modern reveal-on-scroll" v-for="achievement in arrayValue(collections.achievements)" :key="'featured-achievement-' + achievement.id">
                            <div class="achievement-card-modern__header">
                                <div class="achievement-card-modern__icon">
                                    <i :class="achievement.icon"></i>
                                </div>
                                <span class="pill-badge" data-tone="Academic">{{ achievement.year_label }}</span>
                            </div>
                            <h3>{{ achievement.title }}</h3>
                            <div class="achievement-card-modern__cat">{{ achievement.category }}</div>
                            <p>{{ achievement.description }}</p>
                            <button type="button" class="achievement-card-modern__btn" @click="$emit('open-achievement', achievement)">
                                View Details <i class="bi bi-box-arrow-up-right ms-1"></i>
                            </button>
                        </article>
                    </div>
                </div>

                <!-- Admission CTA Banner -->
                <div class="admission-cta-banner reveal-on-scroll">
                    <div class="admission-cta-banner__bg"></div>
                    <div class="admission-cta-banner__overlay"></div>
                    <div class="admission-cta-banner__content">
                        <div class="admission-cta-banner__text">
                            <span class="section-kicker text-white-50"><i class="bi bi-door-open-fill"></i> Admissions</span>
                            <h2>{{ pageData.admission_title }}</h2>
                            <p>{{ pageData.admission_text }}</p>
                        </div>
                        <div class="admission-cta-banner__actions">
                            <a class="btn-brand" href="apply.php">
                                Apply Online <i class="bi bi-arrow-right-circle-fill ms-1"></i>
                            </a>
                            <a class="btn-glass" href="contact.php">
                                <i class="bi bi-telephone-fill me-2"></i>Contact Us
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    `
};

export const AboutPage = {
    props: { pageData: Object },
    methods: { arrayValue },
    template: `
        <section class="section-shell">
            <div class="container d-grid gap-5">

                <!-- About Hero Image Split -->
                <div class="welcome-banner reveal-on-scroll">
                    <div class="welcome-banner__content">
                        <span class="section-kicker">
                            <i class="bi bi-info-circle-fill"></i> Our Story
                        </span>
                        <h2>{{ pageData.welcome_title }}</h2>
                        <p class="body-copy mb-3" v-for="(paragraph, index) in arrayValue(pageData.welcome_paragraphs)" :key="'about-welcome-' + index">
                            {{ paragraph }}
                        </p>
                    </div>
                    <div class="welcome-banner__image">
                        <img src="assets/images/Image (School Building).png" alt="School Heritage">
                        <div class="welcome-banner__image-overlay">
                            <div class="welcome-badge">
                                <i class="bi bi-clock-history"></i>
                                <span>A Century of Educational Excellence</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vision & Mission with Modern Cards -->
                <div class="soft-grid soft-grid--two">
                    <div class="program-card-modern reveal-on-scroll">
                        <div class="program-card-modern__icon"><i class="bi bi-bullseye"></i></div>
                        <div class="program-card-modern__grade">Our Mission</div>
                        <h3>{{ pageData.mission?.title }}</h3>
                        <p>{{ pageData.mission?.text }}</p>
                    </div>
                    <div class="program-card-modern reveal-on-scroll">
                        <div class="program-card-modern__icon"><i class="bi bi-eye-fill"></i></div>
                        <div class="program-card-modern__grade">Our Vision</div>
                        <h3>{{ pageData.vision?.title }}</h3>
                        <p>{{ pageData.vision?.text }}</p>
                    </div>
                </div>

                <!-- Principal/Vice Message -->
                <div class="section-card reveal-on-scroll">
                    <div class="dynamic-section-head">
                        <div>
                            <span class="section-kicker"><i class="bi bi-person-badge-fill"></i> Leadership</span>
                            <h2>Messages from the School</h2>
                        </div>
                    </div>
                    <div class="soft-grid soft-grid--two">
                        <article class="notice-card-modern reveal-on-scroll" v-for="(message, index) in arrayValue(pageData.messages)" :key="'message-' + index" data-tone="Academic">
                            <div class="notice-card-modern__top">
                                <span class="pill-badge" data-tone="Academic">
                                    <i class="bi bi-chat-quote-fill me-1"></i> Leadership
                                </span>
                            </div>
                            <div class="staff-meta mb-2">{{ message.title }} &middot; {{ message.name }}</div>
                            <h3>{{ message.role }}</h3>
                            <p>{{ message.text }}</p>
                        </article>
                    </div>
                </div>

                <!-- Core Values -->
                <div>
                    <div class="dynamic-section-head reveal-on-scroll">
                        <div>
                            <span class="section-kicker"><i class="bi bi-heart-pulse-fill"></i> Values</span>
                            <h2>Our Core Values</h2>
                        </div>
                    </div>
                    <div class="soft-grid soft-grid--four">
                        <article class="achievement-card-modern reveal-on-scroll" v-for="(value, index) in arrayValue(pageData.core_values)" :key="'value-' + index">
                            <div class="achievement-card-modern__header">
                                <div class="achievement-card-modern__icon"><i class="bi bi-check2-circle"></i></div>
                            </div>
                            <h3>{{ value.title }}</h3>
                            <p>{{ value.text }}</p>
                        </article>
                    </div>
                </div>

            </div>
        </section>
    `
};

export const NoticesPage = {
    props: {
        notices: Array,
        query: String
    },
    emits: ['update:query'],
    methods: { formatDate },
    template: `
        <section class="section-shell">
            <div class="container d-grid gap-4">
                <div class="section-card">
                    <div class="row g-3 align-items-center">
                        <div class="col-lg-8">
                            <div class="section-head d-block mb-0">
                                <span class="muted-kicker">Search Notices</span>
                                <h2>Find Recent Announcements</h2>
                                <p>Search by title, content, or notice type.</p>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <input :value="query" @input="$emit('update:query', $event.target.value)" class="form-control" type="text" placeholder="Search notices...">
                        </div>
                    </div>
                </div>

                <div class="soft-grid">
                    <article class="notice-card" v-for="notice in notices" :key="'notice-' + notice.id">
                        <div class="d-flex flex-wrap justify-content-between gap-2 mb-3">
                            <span class="pill-badge" :data-tone="notice.type">{{ notice.type }}</span>
                            <div class="tiny-copy">{{ formatDate(notice.notice_date) }} &middot; {{ notice.notice_time }}</div>
                        </div>
                        <h3>{{ notice.title }}</h3>
                        <p>{{ notice.content }}</p>
                    </article>
                </div>

                <div class="empty-state" v-if="notices.length === 0">No notices matched your search.</div>
            </div>
        </section>
    `
};

export const HistoryPage = {
    props: {
        pageData: Object,
        events: Array
    },
    methods: { arrayValue },
    template: `
        <section class="section-shell">
            <div class="container d-grid gap-5">

                <!-- History Intro Banner -->
                <div class="welcome-banner reveal-on-scroll">
                    <div class="welcome-banner__image">
                        <img src="assets/images/hero-bg.png" alt="School Heritage">
                        <div class="welcome-banner__image-overlay">
                            <div class="welcome-badge">
                                <i class="bi bi-bank"></i>
                                <span>Rooted in Tradition</span>
                            </div>
                        </div>
                    </div>
                    <div class="welcome-banner__content">
                        <span class="section-kicker">
                            <i class="bi bi-clock-history"></i> Legacy
                        </span>
                        <h2>{{ pageData.intro_title }}</h2>
                        <p class="body-copy mb-3" v-for="(paragraph, index) in arrayValue(pageData.intro_paragraphs)" :key="'history-intro-' + index">
                            {{ paragraph }}
                        </p>
                    </div>
                </div>

                <!-- History Feature Cards -->
                <div class="soft-grid soft-grid--three reveal-on-scroll">
                    <article class="program-card-modern" v-for="(card, index) in arrayValue(pageData.intro_cards)" :key="'history-card-' + index">
                        <div class="program-card-modern__icon"><i class="bi bi-bank2"></i></div>
                        <h3>{{ card.title }}</h3>
                        <p>{{ card.text }}</p>
                    </article>
                </div>

                <!-- Community Highlight -->
                <div class="admission-cta-banner reveal-on-scroll">
                    <div class="admission-cta-banner__bg"></div>
                    <div class="admission-cta-banner__overlay"></div>
                    <div class="admission-cta-banner__content">
                        <div class="admission-cta-banner__text">
                            <span class="section-kicker text-white-50"><i class="bi bi-people-fill"></i> Community</span>
                            <h2 class="text-white">{{ pageData.community_title }}</h2>
                            <p class="mb-3" v-for="(paragraph, index) in arrayValue(pageData.community_paragraphs)" :key="'community-' + index">
                                {{ paragraph }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Timeline Milestones -->
                <div class="section-card reveal-on-scroll">
                    <div class="dynamic-section-head">
                        <div>
                            <span class="section-kicker"><i class="bi bi-calendar-event-fill"></i> Milestones</span>
                            <h2>Timeline of Growth</h2>
                        </div>
                    </div>
                    <div class="timeline-stack">
                        <article class="timeline-card" v-for="event in events" :key="'timeline-' + event.id">
                            <div class="timeline-card__period">
                                <i :class="event.icon"></i>
                                {{ event.period_label }}
                            </div>
                            <h3>{{ event.title }}</h3>
                            <p>{{ event.description }}</p>
                        </article>
                    </div>
                </div>

            </div>
        </section>
    `
};

export const AchievementsPage = {
    props: {
        pageData: Object,
        groups: Array
    },
    emits: ['open-achievement'],
    methods: { arrayValue },
    template: `
        <section class="section-shell">
            <div class="container d-grid gap-5">

                <!-- Top Recognitions -->
                <div class="soft-grid soft-grid--four">
                    <article class="recognition-card reveal-on-scroll" v-for="(recognition, index) in arrayValue(pageData.recognitions)" :key="'recognition-' + index" :data-theme="recognition.theme">
                        <h3>{{ recognition.title }}</h3>
                        <p>{{ recognition.text }}</p>
                    </article>
                </div>

                <!-- Achievement Groups -->
                <div v-for="group in groups" :key="group.key">
                    <div class="dynamic-section-head reveal-on-scroll">
                        <div>
                            <span class="section-kicker"><i class="bi bi-award-fill"></i> {{ group.kicker }}</span>
                            <h2>{{ group.title }}</h2>
                            <p>{{ group.description }}</p>
                        </div>
                    </div>
                    <div class="soft-grid soft-grid--three">
                        <article class="achievement-card-modern reveal-on-scroll" v-for="achievement in group.items" :key="'achievement-' + achievement.id">
                            <div class="achievement-card-modern__header">
                                <div class="achievement-card-modern__icon"><i :class="achievement.icon"></i></div>
                                <span class="pill-badge" data-tone="Academic">{{ achievement.year_label }}</span>
                            </div>
                            <h3>{{ achievement.title }}</h3>
                            <div class="achievement-card-modern__cat">{{ achievement.category }}</div>
                            <p>{{ achievement.description }}</p>
                            <button type="button" class="achievement-card-modern__btn" @click="$emit('open-achievement', achievement)">
                                View Details <i class="bi bi-box-arrow-up-right ms-1"></i>
                            </button>
                        </article>
                    </div>
                </div>

                <!-- Achievements Stats Banner -->
                <div class="admission-cta-banner reveal-on-scroll">
                    <div class="admission-cta-banner__bg"></div>
                    <div class="admission-cta-banner__overlay"></div>
                    <div class="admission-cta-banner__content">
                        <div class="admission-cta-banner__text">
                            <span class="section-kicker text-white-50"><i class="bi bi-bar-chart-fill"></i> In Numbers</span>
                            <h2 class="text-white">Achievement Statistics</h2>
                        </div>
                        <div class="welcome-stats">
                            <div class="hero-metric" v-for="stat in arrayValue(pageData.stats)" :key="'achievement-stat-' + stat.label">
                                <strong>{{ stat.value }}</strong>
                                <span>{{ stat.label }}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    `
};

export const StaffPage = {
    props: {
        pageData: Object,
        staff: Array
    },
    methods: { arrayValue },
    template: `
        <section class="section-shell">
            <div class="container d-grid gap-5">

                <!-- Faculty Grid -->
                <div>
                    <div class="dynamic-section-head reveal-on-scroll">
                        <div>
                            <span class="section-kicker"><i class="bi bi-people-fill"></i> Faculty</span>
                            <h2>Our Teaching Team</h2>
                            <p>{{ pageData.staff_intro }}</p>
                        </div>
                    </div>
                    <div class="soft-grid soft-grid--three">
                        <article class="program-card-modern reveal-on-scroll" v-for="member in staff" :key="'staff-' + member.id">
                            <div class="program-card-modern__icon"><i :class="member.emoji"></i></div>
                            <div class="program-card-modern__grade">{{ member.group_name }}</div>
                            <h3>{{ member.name }}</h3>
                            <div class="staff-meta mb-2">{{ member.role }}</div>
                            <p class="mb-1"><strong>Subject:</strong> {{ member.subject }}</p>
                            <p class="mb-0"><strong>Experience:</strong> {{ member.experience }}</p>
                        </article>
                    </div>
                </div>

                <!-- Student Life -->
                <div>
                    <div class="dynamic-section-head reveal-on-scroll">
                        <div>
                            <span class="section-kicker"><i class="bi bi-balloon-fill"></i> Student Life</span>
                            <h2>Beyond the Classroom</h2>
                            <p>{{ pageData.student_life_intro }}</p>
                        </div>
                    </div>
                    <div class="soft-grid soft-grid--two">
                        <article class="notice-card-modern reveal-on-scroll" v-for="(item, index) in arrayValue(pageData.student_life_items)" :key="'student-life-' + index" data-tone="News">
                            <div class="notice-card-modern__top">
                                <span class="pill-badge" data-tone="News">
                                    <i class="bi bi-stars me-1"></i> Life at School
                                </span>
                            </div>
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.text }}</p>
                        </article>
                    </div>
                </div>

                <!-- Snapshot Stats -->
                <div class="admission-cta-banner reveal-on-scroll">
                    <div class="admission-cta-banner__bg"></div>
                    <div class="admission-cta-banner__overlay"></div>
                    <div class="admission-cta-banner__content">
                        <div class="admission-cta-banner__text">
                            <span class="section-kicker text-white-50"><i class="bi bi-pie-chart-fill"></i> Community</span>
                            <h2 class="text-white">Student Body Snapshot</h2>
                        </div>
                        <div class="welcome-stats">
                            <div class="hero-metric" v-for="stat in arrayValue(pageData.student_body_stats)" :key="'student-stat-' + stat.label">
                                <strong>{{ stat.value }}</strong>
                                <span>{{ stat.label }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Call to Action -->
                <div class="section-card reveal-on-scroll text-center py-5">
                    <span class="section-kicker">Join Us</span>
                    <h2 class="mb-3">{{ pageData.join_title }}</h2>
                    <p class="mb-4 mx-auto" style="max-width: 600px;">{{ pageData.join_text }}</p>
                    <a class="btn-brand px-5" href="apply.php">Apply Online <i class="bi bi-arrow-right-circle-fill ms-2"></i></a>
                </div>

            </div>
        </section>
    `
};

export const ContactPage = {
    props: {
        site: Object,
        pageData: Object,
        form: Object,
        status: Object,
        sending: Boolean
    },
    emits: ['update:form', 'submit'],
    methods: {
        arrayValue,
        updateField(key, value) {
            this.$emit('update:form', { ...this.form, [key]: value });
        }
    },
    template: `
        <section class="section-shell">
            <div class="container d-grid gap-5">
                <div class="contact-grid">
                    <div class="form-shell reveal-on-scroll">
                        <div class="dynamic-section-head d-block mb-4">
                            <span class="section-kicker"><i class="bi bi-envelope-fill"></i> Contact Form</span>
                            <h2>Send Us a Message</h2>
                        </div>
                        <div class="status-note mb-3" :class="status.ok ? 'status-note--success' : 'status-note--error'" v-if="status.message">
                            {{ status.message }}
                        </div>
                        <form @submit.prevent="$emit('submit')">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label>Full Name *</label>
                                    <input :value="form.full_name" @input="updateField('full_name', $event.target.value)" class="form-control" type="text">
                                </div>
                                <div class="col-md-6">
                                    <label>Email *</label>
                                    <input :value="form.email" @input="updateField('email', $event.target.value)" class="form-control" type="email">
                                </div>
                                <div class="col-md-6">
                                    <label>Phone</label>
                                    <input :value="form.phone" @input="updateField('phone', $event.target.value)" class="form-control" type="text">
                                </div>
                                <div class="col-md-6">
                                    <label>Subject *</label>
                                    <input :value="form.subject" @input="updateField('subject', $event.target.value)" class="form-control" type="text">
                                </div>
                                <div class="col-12">
                                    <label>Message *</label>
                                    <textarea :value="form.message" @input="updateField('message', $event.target.value)" class="form-control" rows="6"></textarea>
                                </div>
                                <div class="col-12">
                                    <button class="btn-brand-alt w-100" type="submit" :disabled="sending">
                                        <span v-if="sending">Sending...</span>
                                        <span v-else>Send Message <i class="bi bi-send-fill ms-2"></i></span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="d-grid gap-4">
                        <div class="program-card-modern reveal-on-scroll" style="text-align: left;">
                            <div class="dynamic-section-head d-block mb-4">
                                <span class="section-kicker"><i class="bi bi-info-square-fill"></i> Reach Out</span>
                                <h2>Contact Info</h2>
                            </div>
                            <div class="d-grid gap-3">
                                <div class="notice-card-modern" data-tone="Academic">
                                    <div class="staff-meta">Address</div>
                                    <div class="info-copy"><strong>{{ site.address }}</strong></div>
                                </div>
                                <div class="notice-card-modern" data-tone="News">
                                    <div class="staff-meta">Phone & Email</div>
                                    <div class="info-copy"><strong>{{ site.phone }}</strong></div>
                                    <div class="info-copy">{{ site.email }}</div>
                                </div>
                                <div class="notice-card-modern" data-tone="Event">
                                    <div class="staff-meta">Working Hours</div>
                                    <div class="info-copy" v-for="(line, index) in arrayValue(site.working_hours)" :key="'hour-' + index">{{ line }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="admission-cta-banner reveal-on-scroll" style="padding: 2rem;">
                            <div class="admission-cta-banner__bg"></div>
                            <div class="admission-cta-banner__overlay"></div>
                            <div class="admission-cta-banner__content" style="flex-direction: column; align-items: flex-start; text-align: left;">
                                <span class="section-kicker text-white-50">Admissions Office</span>
                                <h3 class="text-white">{{ pageData.admissions_title }}</h3>
                                <p class="mb-0" style="font-size: 0.9rem;">{{ pageData.admissions_text }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Map Section -->
                <div class="welcome-banner reveal-on-scroll">
                    <div class="welcome-banner__image">
                        <img src="assets/images/Image (School Building).png" alt="School Location">
                        <div class="welcome-banner__image-overlay">
                            <a class="welcome-badge" :href="site.map_link || '#'" target="_blank" rel="noopener">
                                <i class="bi bi-geo-alt-fill"></i>
                                <span>Get Directions</span>
                            </a>
                        </div>
                    </div>
                    <div class="welcome-banner__content">
                        <span class="section-kicker">Campus Visit</span>
                        <h2>{{ pageData.map_title }}</h2>
                        <p class="body-copy mb-3">{{ pageData.map_text }}</p>
                        <a class="btn-outline-brand" :href="site.map_link || '#'" target="_blank" rel="noopener">Open in Google Maps <i class="bi bi-box-arrow-up-right ms-2"></i></a>
                    </div>
                </div>

                <!-- Legacy Statistics -->
                <div class="admission-cta-banner reveal-on-scroll">
                    <div class="admission-cta-banner__bg" style="background-image: url('assets/images/hero-bg.png');"></div>
                    <div class="admission-cta-banner__overlay"></div>
                    <div class="admission-cta-banner__content">
                        <div class="admission-cta-banner__text">
                            <span class="section-kicker text-white-50">Our Legacy</span>
                            <h2 class="text-white">{{ pageData.legacy_title }}</h2>
                            <p class="text-white-50">{{ pageData.legacy_text }}</p>
                        </div>
                        <div class="welcome-stats">
                            <div class="hero-metric" v-for="stat in arrayValue(pageData.legacy_stats)" :key="'legacy-' + stat.label">
                                <strong>{{ stat.value }}</strong>
                                <span>{{ stat.label }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `
};

export const ApplyPage = {
    props: {
        pageData: Object,
        steps: Array,
        currentStepIndex: Number,
        form: Object,
        files: Object,
        status: Object,
        sending: Boolean
    },
    emits: ['prev-step', 'next-step', 'update-field', 'update-file'],
    computed: {
        currentStep() {
            return this.steps[this.currentStepIndex];
        },
        progress() {
            return Math.round(((this.currentStepIndex + 1) / this.steps.length) * 100);
        },
        summary() {
            return [
                { label: 'Student Name', value: this.form.student_name || 'Not provided' },
                { label: 'Grade Applying', value: this.form.grade_applying || 'Not provided' },
                { label: 'Parent Phone', value: this.form.parent_phone || 'Not provided' },
                { label: 'Previous School', value: this.form.previous_school || 'Not provided' }
            ];
        }
    },
    methods: {
        updateField(key, value) {
            this.$emit('update-field', { key, value });
        },
        isSimpleInput(type) {
            return ['text', 'email', 'date', 'number'].includes(type);
        }
    },
    template: `
        <section class="section-shell">
            <div class="container apply-layout">
                <div class="section-card">
                    <div class="section-head d-block mb-4">
                        <span class="muted-kicker">Admissions</span>
                        <h2>Online Application Journey</h2>
                        <p>{{ pageData.intro_text }}</p>
                    </div>
                    <div class="progress-line mb-4">
                        <span :style="{ width: progress + '%' }"></span>
                    </div>
                    <div class="stepper">
                        <div v-for="(step, index) in steps" :key="'step-' + index" class="stepper__item" :class="{ 'is-active': index === currentStepIndex }">
                            <div class="stepper__index">{{ index + 1 }}</div>
                            <strong>{{ step.title }}</strong>
                            <div class="tiny-copy mt-1">{{ step.description }}</div>
                        </div>
                    </div>
                </div>

                <div class="form-shell">
                    <div class="status-note mb-3" :class="status.ok ? 'status-note--success' : 'status-note--error'" v-if="status.message">
                        {{ status.message }}
                    </div>

                    <template v-if="currentStep.fields.length > 0">
                        <div class="section-head d-block mb-4">
                            <span class="muted-kicker">Step {{ currentStepIndex + 1 }} of {{ steps.length }}</span>
                            <h2>{{ currentStep.title }}</h2>
                            <p>{{ currentStep.description }}</p>
                        </div>

                        <div class="row g-3">
                            <div v-for="field in currentStep.fields" :key="field.key" :class="field.width || 'col-md-6'">
                                <label>{{ field.label }}<span v-if="field.required"> *</span></label>

                                <input
                                    v-if="isSimpleInput(field.type)"
                                    :value="form[field.key]"
                                    @input="updateField(field.key, $event.target.value)"
                                    class="form-control"
                                    :type="field.type"
                                >

                                <select
                                    v-else-if="field.type === 'select'"
                                    :value="form[field.key]"
                                    @change="updateField(field.key, $event.target.value)"
                                    class="form-select"
                                >
                                    <option value="">Select an option</option>
                                    <option v-for="option in field.options" :key="field.key + option" :value="option">{{ option }}</option>
                                </select>

                                <textarea
                                    v-else-if="field.type === 'textarea'"
                                    :value="form[field.key]"
                                    @input="updateField(field.key, $event.target.value)"
                                    class="form-control"
                                    rows="4"
                                ></textarea>

                                <input
                                    v-else-if="field.type === 'file'"
                                    class="form-control"
                                    type="file"
                                    @change="$emit('update-file', { key: field.key, event: $event })"
                                >

                                <div class="tiny-copy mt-2" v-if="field.type === 'file' && files[field.key]">
                                    Selected: {{ files[field.key].name }}
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div class="section-head d-block mb-4">
                            <span class="muted-kicker">Final Step</span>
                            <h2>Review Your Application</h2>
                            <p>Please confirm the key details before submitting the form.</p>
                        </div>

                        <div class="soft-grid soft-grid--two">
                            <div class="feature-card" v-for="summaryItem in summary" :key="summaryItem.label">
                                <div class="staff-meta mb-2">{{ summaryItem.label }}</div>
                                <h3>{{ summaryItem.value }}</h3>
                            </div>
                        </div>

                        <div class="developer-note mt-4">
                            By submitting this form, you confirm that the information provided is accurate and ready for school review.
                        </div>
                    </template>

                    <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mt-4">
                        <button class="btn-outline-brand" type="button" @click="$emit('prev-step')" :disabled="currentStepIndex === 0">Previous</button>
                        <button class="btn-brand-alt" type="button" @click="$emit('next-step')" :disabled="sending">
                            <span v-if="sending">Submitting...</span>
                            <span v-else>{{ currentStepIndex === steps.length - 1 ? 'Submit Application' : 'Continue' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    `
};

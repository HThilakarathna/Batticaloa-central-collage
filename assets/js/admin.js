const { createApp: createAdminApp } = Vue;


const RESOURCE_CONFIGS = {
    notices: {
        label: 'Notices',
        fields: [
            { key: 'type', label: 'Type', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'content', label: 'Content', type: 'textarea' },
            { key: 'notice_date', label: 'Date', type: 'date' },
            { key: 'notice_time', label: 'Time', type: 'text' },
            { key: 'link_url', label: 'Link URL', type: 'text' },
            { key: 'is_published', label: 'Published', type: 'checkbox' },
            { key: 'sort_order', label: 'Sort Order', type: 'number' }
        ]
    },
    programs: {
        label: 'Programs',
        fields: [
            { key: 'icon', label: 'Bootstrap Icon Class', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'subtitle', label: 'Subtitle', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'sort_order', label: 'Sort Order', type: 'number' }
        ]
    },
    achievements: {
        label: 'Achievements',
        fields: [
            { key: 'icon', label: 'Bootstrap Icon Class', type: 'text' },
            { key: 'year_label', label: 'Year Label', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'category', label: 'Category', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'overview', label: 'Overview', type: 'textarea' },
            { key: 'key_achievements', label: 'Key Achievements (one per line)', type: 'list' },
            { key: 'outstanding_students', label: 'Outstanding Students (one per line)', type: 'list' },
            { key: 'featured', label: 'Featured on Home', type: 'checkbox' },
            { key: 'sort_order', label: 'Sort Order', type: 'number' }
        ]
    },
    history_events: {
        label: 'History Events',
        fields: [
            { key: 'period_label', label: 'Period Label', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'icon', label: 'Bootstrap Icon Class', type: 'text' },
            { key: 'sort_order', label: 'Sort Order', type: 'number' }
        ]
    },
    staff_members: {
        label: 'Staff Members',
        fields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'role', label: 'Role', type: 'text' },
            { key: 'subject', label: 'Subject', type: 'text' },
            { key: 'experience', label: 'Experience', type: 'text' },
            { key: 'emoji', label: 'Bootstrap Icon Class', type: 'text' },
            { key: 'group_name', label: 'Group Name', type: 'text' },
            { key: 'sort_order', label: 'Sort Order', type: 'number' }
        ]
    }
};

const ADMIN_TEMPLATE = `
<div>
    <!-- Sign Out Confirmation -->
    <div class="logout-overlay" :class="{ 'is-active': confirmingLogout }">
        <div class="logout-modal">
            <i class="bi bi-door-open-fill"></i>
            <h2>Sign Out?</h2>
            <p class="body-copy mb-4">Are you sure you want to end your session? You will need to sign in again to manage the school website.</p>
            <div class="d-grid gap-2">
                <button class="btn-brand-alt" @click="executeLogout">Yes, Sign Out</button>
                <button class="btn-outline-brand" @click="confirmingLogout = false">Cancel</button>
            </div>
        </div>
    </div>

    <div class="auth-shell" v-if="checking">
        <div class="shell-loader">
            <div class="shell-loader__ring"></div>
            <p>Checking admin access...</p>
        </div>
    </div>

    <div class="auth-shell" v-else-if="!dbReady">
        <div class="auth-card">
            <span class="muted-kicker">Database Setup Required</span>
            <h1 class="mt-2 mb-3">Admin Panel Needs MySQL</h1>
            <div class="developer-note mb-4">{{ databaseMessage }}</div>
            <p class="body-copy">
                1. Create your MySQL database.
                <br>
                2. Import <code>database/schema.sql</code>.
                <br>
                3. Copy <code>config/env.example</code> to <code>.env</code>.
                <br>
                4. Add your MySQL credentials and refresh this page.
            </p>
        </div>
    </div>

    <div class="auth-shell" v-else-if="!authenticated">
        <div class="auth-card">
            <span class="muted-kicker">Secure Access</span>
            <h1 class="mt-2 mb-3">School Website Admin</h1>
            <p class="body-copy mb-4">Sign in to manage pages, notices, achievements, submissions, and applications.</p>

            <div class="status-note mb-3" :class="loginStatus.ok ? 'status-note--success' : 'status-note--error'" v-if="loginStatus.message">
                {{ loginStatus.message }}
            </div>

            <form @submit.prevent="login">
                <div class="mb-3">
                    <label>Email</label>
                    <input v-model="loginForm.email" type="email" class="form-control">
                </div>
                <div class="mb-4">
                    <label>Password</label>
                    <input v-model="loginForm.password" type="password" class="form-control">
                </div>
                <button class="btn-brand-alt w-100" type="submit" :disabled="loggingIn">
                    <span v-if="loggingIn">Signing in...</span>
                    <span v-else>Sign In</span>
                </button>
            </form>


        </div>
    </div>

    <div class="admin-shell" v-else>
        <div class="logout-overlay" :class="{ 'is-active': selectedNotice !== null }" v-if="selectedNotice">
            <div class="logout-modal text-start" style="width:min(760px, 100%);">
                <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                        <div class="muted-kicker">Notice Details</div>
                        <h2 class="mt-2 mb-0">{{ selectedNotice.title }}</h2>
                    </div>
                    <button class="btn-icon" @click="closeNoticeView">
                        <i class="bi bi-x-lg" style="font-size: 1rem; color: inherit; margin-bottom: 0;"></i>
                    </button>
                </div>

                <div class="d-flex flex-wrap gap-2 mb-4">
                    <span class="pill-badge" :data-tone="selectedNotice.type">{{ selectedNotice.type }}</span>
                    <span class="pill-badge" data-tone="Academic">{{ selectedNotice.is_published ? 'Published' : 'Draft' }}</span>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="small text-uppercase text-slate-500 fw-bold mb-1">Notice Date</div>
                        <div>{{ previewValue(selectedNotice.notice_date) }}</div>
                    </div>
                    <div class="col-md-6">
                        <div class="small text-uppercase text-slate-500 fw-bold mb-1">Notice Time</div>
                        <div>{{ selectedNotice.notice_time || 'School Hours' }}</div>
                    </div>
                    <div class="col-md-6">
                        <div class="small text-uppercase text-slate-500 fw-bold mb-1">Sort Order</div>
                        <div>{{ previewValue(selectedNotice.sort_order) }}</div>
                    </div>
                    <div class="col-md-6">
                        <div class="small text-uppercase text-slate-500 fw-bold mb-1">Link</div>
                        <a v-if="selectedNotice.link_url && selectedNotice.link_url !== '#'" :href="selectedNotice.link_url" target="_blank" rel="noopener">
                            Open linked notice <i class="bi bi-box-arrow-up-right ms-1" style="font-size: inherit; color: inherit; margin-bottom: 0;"></i>
                        </a>
                        <span v-else>No linked document</span>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="small text-uppercase text-slate-500 fw-bold mb-1">Content</div>
                    <div class="body-copy mb-0">{{ selectedNotice.content }}</div>
                </div>

                <div class="d-grid gap-2">
                    <button class="btn-brand-alt" @click="startEdit(selectedNotice); closeNoticeView();">Edit Notice</button>
                    <button class="btn-outline-brand" @click="closeNoticeView">Close</button>
                </div>
            </div>
        </div>

        <header class="admin-mobile-head d-lg-none">
            <a class="brand-lockup" href="index.php">
                <img src="assets/images/logo.png" alt="School logo">
                <div class="brand-title text-white">BT/BC Central</div>
            </a>
            <button class="nav-hamburger" @click="sidebarOpen = !sidebarOpen" :aria-expanded="sidebarOpen">
                <span :class="{ 'open': sidebarOpen }"></span>
                <span :class="{ 'open': sidebarOpen }"></span>
                <span :class="{ 'open': sidebarOpen }"></span>
            </button>
        </header>

        <aside class="admin-sidebar" :class="{ 'admin-sidebar--open': sidebarOpen }">
            <div class="d-flex justify-content-between align-items-center mb-4 d-lg-none">
                <span class="muted-kicker">Navigation</span>
                <button @click="sidebarOpen = false">
                    <i class="bi bi-x-lg" style="color: #0a1f44;"></i>
                </button>
            </div>

            <a class="brand-lockup d-none d-lg-flex" href="index.php">
                <img src="assets/images/logo.png" alt="School logo">
                <div>
                    <div class="brand-title text-white">BT/BC Central College</div>
                    <span class="brand-subtitle">Admin Panel</span>
                </div>
            </a>

            <div class="sidebar-menu">
                <button
                    v-for="item in menuItems"
                    :key="item.key"
                    class="sidebar-button"
                    :class="{ 'is-active': section === item.key }"
                    @click="activateSection(item.key)"
                >
                    <i :class="item.icon"></i>
                    {{ item.label }}
                </button>
            </div>

            <div class="mt-4 pt-4 border-top border-secondary">
                <button class="sidebar-button text-danger" @click="confirmingLogout = true">
                    <i class="bi bi-box-arrow-left"></i>
                    Sign Out
                </button>
            </div>
        </aside>

        <main class="admin-main">
            <div class="admin-top">
                <div>
                    <span class="muted-kicker">Management</span>
                    <h1 class="mt-2 mb-1">{{ currentSectionTitle }}</h1>
                    <p class="body-copy mb-0">{{ currentSectionDescription }}</p>
                </div>

                <div class="table-actions" v-if="isResourceSection && !isReadOnlySection">
                    <button type="button" class="btn-brand-alt" @click="startCreate">Add New</button>
                    <button type="button" class="btn-outline-brand" @click="loadCurrentSection">Refresh</button>
                </div>
            </div>

            <div class="status-note mb-4" :class="flash.ok ? 'status-note--success' : 'status-note--error'" v-if="flash.message">
                {{ flash.message }}
            </div>

            <section v-if="section === 'dashboard'" class="d-grid gap-4">
                <div class="welcome-greeting">
                    <div class="welcome-greeting__icon">👋</div>
                    <div>
                        <h2>Welcome back, {{ admin?.name }}!</h2>
                        <p>Everything is looking great today. You have total control over the school's digital presence.</p>
                    </div>
                </div>

                <div class="metric-grid">
                    <article
                        class="metric-card metric-card--clickable"
                        v-for="stat in dashboard.stats"
                        :key="stat.label"
                        role="button"
                        tabindex="0"
                        @click="openDashboardStat(stat)"
                        @keydown.enter.prevent="openDashboardStat(stat)"
                        @keydown.space.prevent="openDashboardStat(stat)"
                    >
                        <strong>{{ stat.value }}</strong>
                        <span>{{ stat.label }}</span>
                    </article>
                </div>

                <div class="admin-card">
                    <span class="muted-kicker">Status</span>
                    <h2 class="mt-2 mb-3">Project Health</h2>
                    <p class="body-copy mb-0">{{ dashboard.message }}</p>
                </div>
            </section>

            <section v-else class="d-grid gap-4">
                <div class="admin-card" v-if="isReadOnlySection">
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th v-for="column in visibleColumns" :key="'readonly-head-' + column">{{ humanize(column) }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in items" :key="'readonly-row-' + row.id">
                                    <td v-for="column in visibleColumns" :key="'readonly-cell-' + row.id + column">
                                        {{ previewValue(row[column]) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="empty-state mt-3" v-if="items.length === 0">No records yet.</div>
                </div>

                <div class="editor-shell" v-else>
                    <div class="admin-card">
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th v-for="column in visibleColumns" :key="'resource-head-' + column">{{ humanize(column) }}</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in items" :key="'resource-row-' + row.id">
                                        <td v-for="column in visibleColumns" :key="'resource-cell-' + row.id + column">
                                            {{ previewValue(row[column]) }}
                                        </td>
                                        <td>
                                            <div class="table-actions">
                                                <button v-if="section === 'notices'" class="btn-icon" @click="viewNotice(row)"><i class="bi bi-eye"></i></button>
                                                <button class="btn-icon" @click="startEdit(row)"><i class="bi bi-pencil-square"></i></button>
                                                <button class="btn-icon btn-danger-soft" @click="removeRow(row)"><i class="bi bi-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="empty-state mt-3" v-if="items.length === 0">No records yet. Add the first one from the editor panel.</div>
                    </div>

                    <div class="admin-card" ref="editorPanel">
                        <span class="muted-kicker">{{ editorMode === 'create' ? 'Create' : 'Edit' }}</span>
                        <h2 class="mt-2 mb-3">{{ resourceLabel }}</h2>

                        <div class="d-grid gap-3">
                            <div v-for="field in resourceFields" :key="'field-' + field.key">
                                <label class="mb-2 d-block fw-bold small text-uppercase text-slate-500">{{ field.label }}</label>

                                <input
                                    v-if="isInputField(field.type)"
                                    v-model="editorModel[field.key]"
                                    class="form-control"
                                    :type="field.type"
                                >

                                <textarea
                                    v-else-if="field.type === 'textarea' || field.type === 'list'"
                                    v-model="editorModel[field.key]"
                                    class="form-control"
                                    rows="4"
                                ></textarea>

                                <div v-else-if="field.type === 'checkbox'" class="form-check form-switch mt-2">
                                    <input v-model="editorModel[field.key]" class="form-check-input" type="checkbox">
                                    <label class="form-check-label">{{ field.label }}</label>
                                </div>
                            </div>
                        </div>

                        <div class="table-actions mt-4">
                            <button class="btn-brand-alt w-100" @click="saveResource">{{ editorMode === 'create' ? 'Create Record' : 'Save Changes' }}</button>
                            <button class="btn-outline-brand w-100" @click="resetEditor">Clear</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</div>
`
;

createAdminApp({
    template: ADMIN_TEMPLATE,
    data() {
        return {
            apiUrl: window.ADMIN_CONTEXT.apiUrl,
            checking: true,
            dbReady: false,
            databaseMessage: '',
            authenticated: false,
            admin: null,
            loggingIn: false,
            loginForm: {
                email: '',
                password: ''
            },
            loginStatus: {
                ok: false,
                message: ''
            },
            flash: {
                ok: false,
                message: ''
            },
            dashboard: {
                stats: [],
                message: ''
            },
            section: 'dashboard',
            items: [],
            selectedNotice: null,
            editorMode: 'create',
            editorModel: {},
            menuItems: [
                { key: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
                { key: 'notices', label: 'Notices', icon: 'bi-megaphone' },
                { key: 'programs', label: 'Programs', icon: 'bi-book' },
                { key: 'achievements', label: 'Achievements', icon: 'bi-trophy' },
                { key: 'history_events', label: 'History Events', icon: 'bi-clock-history' },
                { key: 'staff_members', label: 'Staff Members', icon: 'bi-people' },
                { key: 'contact_messages', label: 'Inbox', icon: 'bi-envelope' },
                { key: 'applications', label: 'Applications', icon: 'bi-file-earmark-text' }
            ],
            confirmingLogout: false,
            sidebarOpen: false
        };
    },
    computed: {
        currentSectionTitle() {
            const current = this.menuItems.find((item) => item.key === this.section);
            return current ? current.label : 'Admin Panel';
        },
        currentSectionDescription() {
            const descriptions = {
                dashboard: 'Review overall content volume and submission activity.',
                notices: 'List, view, edit, publish, and remove school notices.',
                programs: 'Manage academic programs displayed on the homepage.',
                achievements: 'Update school achievement stories and featured highlights.',
                history_events: 'Control the school timeline and legacy milestones.',
                staff_members: 'Keep teacher and leadership profiles current.',
                contact_messages: 'Read incoming messages from the public contact form.',
                applications: 'Track new online admission applications.'
            };

            return descriptions[this.section] || '';
        },
        isResourceSection() {
            return Object.prototype.hasOwnProperty.call(RESOURCE_CONFIGS, this.section);
        },
        isReadOnlySection() {
            return ['contact_messages', 'applications'].includes(this.section);
        },
        resourceConfig() {
            return RESOURCE_CONFIGS[this.section] || null;
        },
        resourceLabel() {
            return this.resourceConfig ? this.resourceConfig.label : '';
        },
        resourceFields() {
            return this.resourceConfig ? this.resourceConfig.fields : [];
        },
        visibleColumns() {
            if (this.isReadOnlySection) {
                return this.section === 'contact_messages'
                    ? ['created_at', 'full_name', 'email', 'subject', 'status']
                    : ['created_at', 'student_name', 'grade_applying', 'parent_phone', 'status'];
            }

            if (this.section === 'notices') {
                return ['type', 'title', 'notice_date', 'notice_time', 'is_published'];
            }

            return this.resourceFields.slice(0, 4).map((field) => field.key);
        }
    },
    methods: {
        async apiRequest(url, options = {}) {
            const response = await fetch(url, options);
            const payload = await response.json();

            if (!response.ok || !payload.ok) {
                throw new Error(payload.message || 'Request failed.');
            }

            return payload;
        },
        async initialize() {
            this.checking = true;

            try {
                const payload = await this.apiRequest(`${this.apiUrl}?action=me`);
                this.dbReady = payload.data.database.connected;
                this.databaseMessage = payload.data.database.message;
                this.authenticated = payload.data.authenticated;
                this.admin = payload.data.admin;

                if (this.authenticated) {
                    await this.loadDashboard();
                }
            } catch (error) {
                this.dbReady = false;
                this.databaseMessage = error.message || 'Unable to initialize admin panel.';
            } finally {
                this.checking = false;
            }
        },
        async login() {
            this.loggingIn = true;
            this.loginStatus = { ok: false, message: '' };

            // Client-side validation
            const email = this.loginForm.email.trim();
            const password = this.loginForm.password.trim();

            if (!email || !password) {
                this.loginStatus = {
                    ok: false,
                    message: 'Email and password are required.'
                };
                this.loggingIn = false;
                return;
            }

            try {
                const payload = await this.apiRequest(`${this.apiUrl}?action=login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.loginForm)
                });

                this.authenticated = true;
                this.admin = payload.data;
                this.loginStatus = { ok: true, message: 'Signed in successfully.' };
                await this.loadDashboard();
            } catch (error) {
                this.loginStatus = { ok: false, message: error.message || 'Unable to sign in.' };
            } finally {
                this.loggingIn = false;
            }
        },
        logout() {
            this.confirmingLogout = true;
        },
        async executeLogout() {
            try {
                await this.apiRequest(`${this.apiUrl}?action=logout`, {
                    method: 'POST'
                });
            } catch (error) {
                // ignore and clear local state
            }

            this.confirmingLogout = false;
            this.authenticated = false;
            this.admin = null;
            this.section = 'dashboard';
            this.flash = { ok: true, message: 'You have been signed out.' };
        },
        activateSection(section) {
            this.section = section;
            this.sidebarOpen = false;
            this.flash = { ok: false, message: '' };
            this.closeNoticeView();
            this.loadCurrentSection();
        },
        async loadCurrentSection() {
            if (this.section === 'dashboard') {
                await this.loadDashboard();
                return;
            }

            await this.loadItems();
        },
        async loadDashboard() {
            const payload = await this.apiRequest(`${this.apiUrl}?action=dashboard`);
            this.dashboard = payload.data;
        },
        openDashboardStat(stat) {
            if (!stat || !stat.section) {
                return;
            }

            this.activateSection(stat.section);
        },
        async loadItems() {
            const payload = await this.apiRequest(`${this.apiUrl}?action=resource&name=${encodeURIComponent(this.section)}`);
            this.items = payload.data;
            if (!this.isReadOnlySection) {
                this.resetEditor();
            }
        },
        resetEditor() {
            this.editorMode = 'create';
            this.editorModel = this.emptyEditor();
        },
        emptyEditor() {
            const model = {};
            this.resourceFields.forEach((field) => {
                model[field.key] = field.type === 'checkbox' ? false : '';
            });
            return model;
        },
        startCreate() {
            this.editorMode = 'create';
            this.editorModel = this.emptyEditor();
            this.flash = { ok: true, message: `Creating a new ${this.resourceLabel.toLowerCase()}.` };
            this.scrollToEditor();
        },
        viewNotice(row) {
            this.selectedNotice = { ...row };
        },
        closeNoticeView() {
            this.selectedNotice = null;
        },
        startEdit(row) {
            this.editorMode = 'edit';
            this.editorModel = {};

            this.resourceFields.forEach((field) => {
                const value = row[field.key];
                if (field.type === 'list') {
                    this.editorModel[field.key] = Array.isArray(value) ? value.join('\n') : '';
                } else {
                    this.editorModel[field.key] = value ?? (field.type === 'checkbox' ? false : '');
                }
            });

            this.editorModel.id = row.id;
            this.scrollToEditor();
        },
        scrollToEditor() {
            Vue.nextTick(() => {
                this.$refs.editorPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        },
        serializeEditor() {
            const payload = {};
            this.resourceFields.forEach((field) => {
                const value = this.editorModel[field.key];
                if (field.type === 'list') {
                    payload[field.key] = String(value || '')
                        .split(/\r?\n/)
                        .map((item) => item.trim())
                        .filter(Boolean);
                } else if (field.type === 'checkbox') {
                    payload[field.key] = !!value;
                } else {
                    payload[field.key] = value ?? '';
                }
            });
            return payload;
        },
        async saveResource() {
            try {
                const body = JSON.stringify(this.serializeEditor());
                if (this.editorMode === 'create') {
                    await this.apiRequest(`${this.apiUrl}?action=resource&name=${encodeURIComponent(this.section)}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body
                    });
                    this.flash = { ok: true, message: `${this.resourceLabel} record created.` };
                } else {
                    await this.apiRequest(`${this.apiUrl}?action=resource&name=${encodeURIComponent(this.section)}&id=${this.editorModel.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body
                    });
                    this.flash = { ok: true, message: `${this.resourceLabel} record updated.` };
                }

                await this.loadItems();
            } catch (error) {
                this.flash = { ok: false, message: error.message || 'Unable to save record.' };
            }
        },
        async removeRow(row) {
            const approved = window.confirm(`Delete "${row.title || row.name || row.period_label || 'this record'}"?`);
            if (!approved) {
                return;
            }

            try {
                await this.apiRequest(`${this.apiUrl}?action=resource&name=${encodeURIComponent(this.section)}&id=${row.id}`, {
                    method: 'DELETE'
                });
                this.flash = { ok: true, message: 'Record deleted successfully.' };
                await this.loadItems();
            } catch (error) {
                this.flash = { ok: false, message: error.message || 'Unable to delete record.' };
            }
        },
        previewValue(value) {
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value);
            }
            if (typeof value === 'boolean') {
                return value ? 'Yes' : 'No';
            }
            return value ?? '';
        },
        humanize(value) {
            return String(value)
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (letter) => letter.toUpperCase());
        },
        isInputField(type) {
            return ['text', 'date', 'number'].includes(type);
        }
    },
    mounted() {
        this.initialize();
    }
}).mount('#admin-app');

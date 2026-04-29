export function arrayValue(value) {
    return Array.isArray(value) ? value : [];
}

export function pageLink(page) {
    return page === 'home' ? 'index.php' : `${page}.php`;
}

export function formatDate(value) {
    if (!value) {
        return '';
    }

    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function socialIcon(label) {
    const key = String(label || '').toLowerCase();
    if (key.includes('facebook')) {
        return 'bi bi-facebook';
    }
    if (key.includes('instagram')) {
        return 'bi bi-instagram';
    }
    if (key.includes('youtube')) {
        return 'bi bi-youtube';
    }
    return 'bi bi-link-45deg';
}

export function previewText(value, limit = 160) {
    const text = String(value || '').trim();
    if (text.length <= limit) {
        return text;
    }
    return `${text.slice(0, limit).trim()}...`;
}

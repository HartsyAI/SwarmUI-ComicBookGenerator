/**
 * Comic Book Generator - Main Controller with Shared Utilities
 * Central hub for all reusable components and base functionality
 */

// ============================================================================
// BASE MANAGER CLASS - All modules extend this
// ============================================================================

class BaseManager {
    constructor(main, name) {
        this.main = main;
        this.name = name;
        this.debug = true;
        this.isInitialized = false;
        this.debounceTimers = {};
    }

    /**
     * Initialize the manager - override in subclasses
     */
    async initialize() {
        this.log(`Initializing ${this.name}...`);
        this.isInitialized = true;
    }

    /**
     * Render the manager interface - override in subclasses
     */
    async render() {
        this.log(`Rendering ${this.name} interface...`);
    }

    /**
     * Save manager data - override in subclasses
     */
    async saveData() {
        this.log(`Saving ${this.name} data...`);
    }

    /**
     * Load manager data - override in subclasses
     */
    loadData(data) {
        this.log(`Loading ${this.name} data...`);
    }

    /**
     * Unified logging
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:${this.name} ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * Unified error handling
     */
    handleError(message, error) {
        console.error(`[CBG:${this.name} ERROR] ${message}:`, error);
        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        }
    }

    /**
     * Unified debounce
     */
    debounce(key, func, delay) {
        if (this.debounceTimers[key]) {
            clearTimeout(this.debounceTimers[key]);
        }
        this.debounceTimers[key] = setTimeout(() => {
            func();
            delete this.debounceTimers[key];
        }, delay);
    }

    /**
     * Run an async action while managing a button's disabled state and label.
     * @param {string|HTMLElement} buttonOrId - Element id or the element itself
     * @param {string} busyHtml - InnerHTML to show while running
     * @param {Function} action - Async function to execute
     */
    async runWithButton(buttonOrId, busyHtml, action) {
        const btn = typeof buttonOrId === 'string' ? document.getElementById(buttonOrId) : buttonOrId;
        const hadBtn = !!btn;
        const originalHtml = hadBtn ? btn.innerHTML : '';
        try {
            if (hadBtn) {
                btn.innerHTML = busyHtml;
                btn.disabled = true;
            }
            await action();
        } catch (err) {
            this.handleError('Action failed', err);
        } finally {
            if (hadBtn) {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }
    }

    /**
     * Get form value using SwarmUI's method
     */
    getFormValue(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return '';
        return typeof getInputVal === 'function' ? (getInputVal(element) || '') : (element.value || '');
    }

    /**
     * Cleanup resources
     */
    destroy() {
        Object.keys(this.debounceTimers).forEach(key => {
            clearTimeout(this.debounceTimers[key]);
        });
        this.debounceTimers = {};
        this.isInitialized = false;
        this.log(`${this.name} destroyed`);
    }
}

// ============================================================================
// UI BUILDER - Centralized UI generation using SwarmUI components
// ============================================================================

class UIBuilder {
    /**
     * Create a card component
     */
    static createCard(config) {
        const card = createDiv(config.id, `cbg-card ${config.className || ''}`);

        if (config.thumbnail) {
            const thumb = createDiv(null, 'card-thumbnail');
            thumb.innerHTML = config.thumbnail;
            card.appendChild(thumb);
        }

        if (config.title) {
            const title = createDiv(null, 'card-title');
            title.textContent = config.title;
            card.appendChild(title);
        }

        if (config.description) {
            const desc = createDiv(null, 'card-description');
            desc.textContent = config.description;
            card.appendChild(desc);
        }

        if (config.actions) {
            const actions = createDiv(null, 'card-actions');
            config.actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'basic-button small-button';
                btn.textContent = action.label;
                btn.onclick = action.onclick;
                actions.appendChild(btn);
            });
            card.appendChild(actions);
        }

        return card;
    }

    /**
     * Create a grid container
     */
    static createGrid(items, renderer, container) {
        const grid = container || createDiv(null, 'cbg-grid');
        grid.innerHTML = '';

        items.forEach(item => {
            const element = renderer(item);
            grid.appendChild(element);
        });

        return grid;
    }

    /**
     * Create section with header
     */
    static createSection(config) {
        const section = createDiv(config.id, 'cbg-section');

        const header = createDiv(null, 'section-header');
        header.innerHTML = `
            <h4>${escapeHtml(config.title)}</h4>
            ${config.actions ? `
                <div class="section-actions">
                    ${config.actions.map(a =>
            `<button class="basic-button small-button" onclick="${a.onclick}">${a.label}</button>`
        ).join('')}
                </div>
            ` : ''}
        `;

        const content = createDiv(null, 'section-content');
        section.appendChild(header);
        section.appendChild(content);

        return { section, content };
    }

    /**
     * Update element content efficiently
     */
    static updateContent(elementId, content) {
        const element = getRequiredElementById(elementId);
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else {
            element.innerHTML = '';
            element.appendChild(content);
        }
    }

    /**
     * Create form using SwarmUI components
     */
    static createForm(fields) {
        let html = '';

        fields.forEach(field => {
            switch (field.type) {
                case 'text':
                    html += makeTextInput(null, field.id, field.paramId, field.label,
                        field.description, field.value || '', field.format || 'normal', field.placeholder || '');
                    break;
                case 'number':
                    html += makeNumberInput(null, field.id, field.paramId, field.label,
                        field.description, field.value || 0, field.min || 0, field.max || 100, field.step || 1);
                    break;
                case 'dropdown':
                    html += makeDropdownInput(null, field.id, field.paramId, field.label,
                        field.description, field.options, field.value || field.options[0]);
                    break;
                case 'checkbox':
                    html += makeCheckboxInput(null, field.id, field.paramId, field.label,
                        field.description, field.value || false);
                    break;
                case 'image':
                    html += makeImageInput(null, field.id, field.paramId, field.label,
                        field.description);
                    break;
            }
        });

        return html;
    }
}

// ============================================================================
// EVENT MANAGER - Centralized event handling
// ============================================================================

class EventManager {
    constructor() {
        this.handlers = new Map();
        this.delegatedHandlers = new Map();
    }

    /**
     * Register event handler
     */
    on(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            const key = `${elementId}_${event}`;
            this.off(elementId, event); // Remove existing

            element.addEventListener(event, handler);
            this.handlers.set(key, { element, event, handler });
        }
    }

    /**
     * Remove event handler
     */
    off(elementId, event) {
        const key = `${elementId}_${event}`;
        const existing = this.handlers.get(key);
        if (existing) {
            existing.element.removeEventListener(existing.event, existing.handler);
            this.handlers.delete(key);
        }
    }

    /**
     * Setup delegated event handler
     */
    delegate(container, selector, event, handler) {
        const containerEl = typeof container === 'string' ?
            document.getElementById(container) : container;

        if (!containerEl) return;

        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler(e, target);
            }
        };

        containerEl.addEventListener(event, delegatedHandler);

        const key = `${container}_${selector}_${event}`;
        this.delegatedHandlers.set(key, {
            container: containerEl,
            event,
            handler: delegatedHandler
        });
    }

    /**
     * Clear all handlers
     */
    clear() {
        this.handlers.forEach((data, key) => {
            data.element.removeEventListener(data.event, data.handler);
        });
        this.handlers.clear();

        this.delegatedHandlers.forEach((data, key) => {
            data.container.removeEventListener(data.event, data.handler);
        });
        this.delegatedHandlers.clear();
    }
}

// ============================================================================
// DATA HELPER - Simplified data persistence
// ============================================================================

class DataHelper {
    /**
     * Save to backend
     */
    static async save(endpoint, data) {
        try {
            if (typeof genericRequest === 'function') {
                return await genericRequest(endpoint, data, (response) => response);
            }
            console.log(`TODO: Save to ${endpoint}`, data);
            return { success: true };
        } catch (e) {
            console.error('[DataHelper.save] Failed:', e);
            throw e;
        }
    }

    /**
     * Load from backend
     */
    static async load(endpoint, params = {}) {
        try {
            if (typeof genericRequest === 'function') {
                return await genericRequest(endpoint, params, (response) => response?.data ?? response);
            }
            console.log(`TODO: Load from ${endpoint}`, params);
            return null;
        } catch (e) {
            console.error('[DataHelper.load] Failed:', e);
            throw e;
        }
    }

    /**
     * Generate with AI
     */
    static async generateWithAI(type, params) {
        try {
            if (typeof genericRequest === 'function') {
                return await genericRequest(`Generate${type}`, params, (response) => response?.result ?? response);
            }
            console.log(`TODO: Generate ${type} with AI`, params);
            return { generated: true, placeholder: true };
        } catch (e) {
            console.error('[DataHelper.generateWithAI] Failed:', e);
            throw e;
        }
    }
}

// ============================================================================
// MAIN COMIC BOOK GENERATOR CLASS
// ============================================================================

class ComicBookGenerator {
    constructor() {
        this.debug = true;
        this.currentMode = 'characters_mode';
        this.projectData = null;
        this.isInitialized = false;
        this.managers = {};
        this.eventManager = new EventManager();
        this.ui = UIBuilder;
        this.data = DataHelper;
    }

    /**
     * Retrieve a manager by name (case-insensitive)
     * @param {string} name - Manager key, e.g., 'layout', 'characters', 'story', 'publication', 'data'
     * @returns {*} manager instance or null
     */
    getManager(name) {
        if (!name) return null;
        const key = String(name).toLowerCase();
        return this.managers[key] || null;
    }

    async initialize() {
        try {
            console.log('[CBG] Initializing Comic Book Generator...');

            const root = getRequiredElementById('comicbook-generator');

            // Initialize managers
            this.managers = {
                data: new DataManager(this),
                characters: new CharacterManager(this),
                story: new StoryManager(this),
                layout: new LayoutManager(this),
                publication: new PublicationManager(this)
            };

            // Setup mode switching
            this.setupModeHandling();
            this.setupGlobalHandlers();

            // Initialize all managers
            await Promise.all(Object.values(this.managers).map(m => m.initialize()));

            // Load or create project
            await this.loadOrCreateProject();

            // Set initial mode
            await this.setActiveMode('characters_mode');

            this.isInitialized = true;
            console.log('[CBG] Comic Book Generator initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize', error);
        }
    }

    setupModeHandling() {
        // Use event delegation for mode switching
        this.eventManager.delegate(document.body, 'input[name="cbg_mode"]', 'change', async (e, target) => {
            if (target.checked) {
                await this.setActiveMode(target.id);
            }
        });
    }

    setupGlobalHandlers() {
        // Save button
        this.eventManager.on('cbg-save-project', 'click', () => this.saveProject());

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.saveProject(true);
        });
    }

    async setActiveMode(mode) {
        if (this.currentMode === mode) return;

        // Save current mode data
        if (this.currentMode && this.managers[this.currentMode.replace('_mode', '')]) {
            await this.managers[this.currentMode.replace('_mode', '')].saveData();
        }

        // Hide all modes
        document.querySelectorAll('.mode-content').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });

        // Show new mode
        const content = document.getElementById(mode.replace('_mode', '_content'));
        if (content) {
            content.classList.add('active');
            content.style.display = 'flex';
            this.currentMode = mode;

            // Render new mode
            const managerName = mode.replace('_mode', '');
            if (this.managers[managerName]) {
                await this.managers[managerName].render();
            }
        }
    }

    async loadOrCreateProject() {
        // TODO (C# backend): Implement 'GetLastProject' endpoint and wire DataHelper.load to genericRequest.
        // Example direct usage if bypassing DataHelper:
        // const existingProject = await genericRequest('GetLastProject', {});
        const existingProject = await DataHelper.load('GetLastProject');

        if (existingProject) {
            this.projectData = existingProject;
        } else {
            this.projectData = this.createNewProject();
        }

        // Load data into managers
        Object.values(this.managers).forEach(manager => {
            if (manager.loadData) {
                const key = manager.name.toLowerCase();
                manager.loadData(this.projectData[key]);
            }
        });
    }

    createNewProject() {
        return {
            projectInfo: {
                title: 'New Comic Project',
                author: '',
                description: '',
                version: '1.0',
                created: Date.now(),
                lastModified: Date.now(),
                id: `project_${Date.now()}`
            },
            data: {},
            characters: [],
            story: {},
            layout: {},
            assets: {},
            publication: {}
        };
    }

    async saveProject(isAutoSave = false) {
        try {
            const statusEl = getRequiredElementById('cbg-save-status');
            if (!isAutoSave && statusEl) {
                statusEl.innerHTML = '<span class="cbg-spinner"></span>Saving...';
            }

            // Gather data from all managers
            for (const [key, manager] of Object.entries(this.managers)) {
                if (manager.saveData) {
                    await manager.saveData();
                }
            }

            // TODO (C# backend): Implement 'SaveComicProject' endpoint and wire DataHelper.save to genericRequest.
            // Example direct usage if bypassing DataHelper:
            // await genericRequest('SaveComicProject', { projectData: this.projectData, isAutoSave });
            await DataHelper.save('SaveComicProject', {
                projectData: this.projectData,
                isAutoSave
            });

            if (statusEl) {
                statusEl.textContent = isAutoSave ? 'Auto-saved' : 'Saved';
                if (!isAutoSave) {
                    setTimeout(() => statusEl.textContent = 'Ready', 2000);
                }
            }

        } catch (error) {
            this.handleError('Save failed', error);
        }
    }

    updateProjectData(data) {
        this.projectData = { ...this.projectData, ...data };
    }

    handleError(message, error) {
        console.error(`[CBG ERROR] ${message}:`, error);
        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        }
    }

    destroy() {
        this.eventManager.clear();
        Object.values(this.managers).forEach(m => m.destroy());
        this.isInitialized = false;
    }
}

// Initialize when DOM is ready
let comicBookGenerator = null;

const initializeComicBook = async () => {
    try {
        const root = document.getElementById('comicbook-generator');
        if (!root) {
            setTimeout(initializeComicBook, 1000);
            return;
        }

        comicBookGenerator = new ComicBookGenerator();
        await comicBookGenerator.initialize();

    } catch (error) {
        console.error('[CBG] Failed to initialize:', error);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComicBook);
} else {
    setTimeout(initializeComicBook, 100);
}

// Make available globally
window.ComicBookGenerator = ComicBookGenerator;
window.comicBookGenerator = comicBookGenerator;

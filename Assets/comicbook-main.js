/**
 * <summary>Comic Book Generator - Main Controller Module</summary>
 * Handles mode switching, initialization, and coordination between modules
 */

import { CharacterManager } from './comicbook-characters.js';
import { StoryManager } from './comicbook-story.js';
import { LayoutManager } from './comicbook-layout.js';
import { AssetManager } from './comicbook-assets.js';
import { PreviewManager } from './comicbook-preview.js';
import { DataManager } from './comicbook-data.js';

class ComicBookGenerator {
    constructor() {
        this.debug = true;
        this.currentMode = 'characters_mode';
        this.projectData = null;
        this.isInitialized = false;
        this.autoSaveInterval = null;
        this.managers = {};

        this.log('ComicBookGenerator constructor called');
    }

    /**
     * <summary>Initialize the comic book generator</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Comic Book Generator...');

            const root = document.getElementById('comicbook-generator');
            if (!root) {
                throw new Error('Comic book generator root element not found');
            }

            // Initialize managers
            this.dataManager = new DataManager(this);
            this.characterManager = new CharacterManager(this);
            this.storyManager = new StoryManager(this);
            this.layoutManager = new LayoutManager(this);
            this.assetManager = new AssetManager(this);
            this.previewManager = new PreviewManager(this);

            this.managers = {
                data: this.dataManager,
                characters: this.characterManager,
                story: this.storyManager,
                layout: this.layoutManager,
                assets: this.assetManager,
                preview: this.previewManager
            };

            // Setup mode switching
            this.setupModeHandling();

            // Setup resize handles
            this.setupResizeHandles();

            // Setup global event handlers
            this.setupGlobalHandlers();

            // Initialize each manager
            await Promise.all([
                this.characterManager.initialize(),
                this.storyManager.initialize(),
                this.layoutManager.initialize(),
                this.assetManager.initialize(),
                this.previewManager.initialize()
            ]);

            // Load or create new project
            await this.loadOrCreateProject();

            // Setup auto-save
            this.setupAutoSave();

            // Initialize with characters mode active
            await this.setActiveMode('characters_mode');

            this.isInitialized = true;
            this.log('Comic Book Generator initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Comic Book Generator', error);
        }
    }

    /**
     * <summary>Setup mode switching functionality</summary>
     */
    setupModeHandling() {
        this.log('Setting up mode handling...');

        const modeRadios = document.querySelectorAll('input[name="cbg_mode"]');
        const modeContents = {
            'characters_mode': document.getElementById('characters_content'),
            'story_mode': document.getElementById('story_content'),
            'layout_mode': document.getElementById('layout_content'),
            'assets_mode': document.getElementById('assets_content'),
            'preview_mode': document.getElementById('preview_content')
        };

        this.log(`Found ${modeRadios.length} mode radio buttons`);

        // Validate all mode content containers exist
        Object.entries(modeContents).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Mode content container not found: ${key}`);
            }
        });

        modeRadios.forEach(radio => {
            radio.addEventListener('change', async (event) => {
                if (event.target.checked) {
                    this.log(`Mode changed to: ${event.target.id}`);
                    await this.setActiveMode(event.target.id);
                }
            });
        });

        this.modeContents = modeContents;
    }

    /**
     * <summary>Set the active mode and update UI</summary>
     * @param {string} mode - The mode ID to activate
     */
    async setActiveMode(mode) {
        try {
            this.log(`Setting active mode: ${mode}`);

            if (this.currentMode === mode) {
                this.log(`Mode ${mode} is already active, skipping`);
                return;
            }

            // Save current mode data before switching
            if (this.isInitialized && this.currentMode) {
                await this.saveCurrentModeData();
            }

            // Hide all content sections
            Object.values(this.modeContents).forEach(content => {
                content.classList.remove('active');
            });

            // Show the active section
            const activeContent = this.modeContents[mode];
            if (activeContent) {
                activeContent.classList.add('active');
                this.currentMode = mode;

                // Initialize the active mode if not already done
                await this.initializeMode(mode);

                this.log(`Successfully activated mode: ${mode}`);
            } else {
                throw new Error(`No content found for mode: ${mode}`);
            }

        } catch (error) {
            this.handleError(`Failed to set active mode: ${mode}`, error);
        }
    }

    /**
     * <summary>Initialize a specific mode</summary>
     * @param {string} mode - Mode to initialize
     */
    async initializeMode(mode) {
        try {
            this.log(`Initializing mode: ${mode}`);

            switch (mode) {
                case 'characters_mode':
                    await this.characterManager.render();
                    break;
                case 'story_mode':
                    await this.storyManager.render();
                    break;
                case 'layout_mode':
                    await this.layoutManager.render();
                    break;
                case 'assets_mode':
                    await this.assetManager.render();
                    break;
                case 'preview_mode':
                    await this.previewManager.render();
                    break;
                default:
                    this.log(`Unknown mode: ${mode}`);
            }

        } catch (error) {
            this.handleError(`Failed to initialize mode: ${mode}`, error);
        }
    }

    /**
     * <summary>Setup resize handle functionality</summary>
     */
    setupResizeHandles() {
        this.log('Setting up resize handles...');

        const resizeHandles = document.querySelectorAll('.resize-handle');

        resizeHandles.forEach(handle => {
            let isResizing = false;
            let startX = 0;
            let startWidth = 0;
            let leftPanel = null;

            handle.addEventListener('mousedown', (e) => {
                this.log(`Resize started on handle: ${handle.id}`);
                isResizing = true;
                startX = e.clientX;
                leftPanel = handle.previousElementSibling;

                if (leftPanel) {
                    const computedStyle = window.getComputedStyle(leftPanel);
                    startWidth = parseInt(computedStyle.width, 10);
                }

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);

                document.body.style.userSelect = 'none';
                e.preventDefault();
            });

            const handleMouseMove = (e) => {
                if (!isResizing || !leftPanel) return;

                const deltaX = e.clientX - startX;
                const newWidth = Math.max(200, Math.min(800, startWidth + deltaX));

                leftPanel.style.minWidth = `${newWidth}px`;
            };

            const handleMouseUp = () => {
                if (isResizing) {
                    this.log('Resize completed');
                    isResizing = false;
                }
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.userSelect = '';
            };
        });
    }

    /**
     * <summary>Setup global event handlers</summary>
     */
    setupGlobalHandlers() {
        this.log('Setting up global event handlers...');

        // Save project button
        const saveButton = document.getElementById('cbg-save-project');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveProject());
        }

        // Handle page visibility changes for auto-save
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.log('Page hidden, saving project...');
                this.saveProject();
            }
        });

        // Handle beforeunload for unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
    }

    /**
     * <summary>Setup auto-save functionality</summary>
     */
    setupAutoSave() {
        this.log('Setting up auto-save...');

        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.log('Auto-saving project...');
                this.saveProject(true);
            }
        }, 30000);
    }

    /**
     * <summary>Load existing project or create new one</summary>
     */
    async loadOrCreateProject() {
        try {
            this.log('Loading or creating project...');

            // TODO: Check for existing project in C# backend
            // const existingProject = await this.dataManager.loadLastProject();

            const existingProject = null; // Placeholder

            if (existingProject) {
                this.projectData = existingProject;
                this.log('Loaded existing project');
            } else {
                this.projectData = this.dataManager.createNewProject();
                this.log('Created new project');
            }

            this.updateUI();

        } catch (error) {
            this.handleError('Failed to load or create project', error);
            // Create fallback project
            this.projectData = this.dataManager.createNewProject();
        }
    }

    /**
     * <summary>Save current mode data</summary>
     */
    async saveCurrentModeData() {
        try {
            this.log(`Saving data for current mode: ${this.currentMode}`);

            switch (this.currentMode) {
                case 'characters_mode':
                    await this.characterManager.saveData();
                    break;
                case 'story_mode':
                    await this.storyManager.saveData();
                    break;
                case 'layout_mode':
                    await this.layoutManager.saveData();
                    break;
                case 'assets_mode':
                    await this.assetManager.saveData();
                    break;
                case 'preview_mode':
                    await this.previewManager.saveData();
                    break;
            }

        } catch (error) {
            this.handleError(`Failed to save data for mode: ${this.currentMode}`, error);
        }
    }

    /**
     * <summary>Save the entire project</summary>
     * @param {boolean} isAutoSave - Whether this is an auto-save
     */
    async saveProject(isAutoSave = false) {
        try {
            const statusElement = document.getElementById('cbg-save-status');

            if (!isAutoSave && statusElement) {
                statusElement.innerHTML = '<span class="cbg-spinner"></span>Saving...';
            }

            this.log(`${isAutoSave ? 'Auto-saving' : 'Saving'} project...`);

            // Save current mode data first
            await this.saveCurrentModeData();

            // Update project metadata
            this.projectData.lastModified = Date.now();

            // TODO: Save to C# backend
            // await this.dataManager.saveProject(this.projectData);

            this.log('Project saved successfully');

            if (statusElement) {
                statusElement.textContent = isAutoSave ? 'Auto-saved' : 'Saved';

                if (!isAutoSave) {
                    setTimeout(() => {
                        statusElement.textContent = 'Ready';
                    }, 2000);
                }
            }

        } catch (error) {
            this.handleError('Failed to save project', error);

            const statusElement = document.getElementById('cbg-save-status');
            if (statusElement) {
                statusElement.innerHTML = '<span style="color: var(--danger);">Save failed</span>';
                setTimeout(() => {
                    statusElement.textContent = 'Ready';
                }, 3000);
            }
        }
    }

    /**
     * <summary>Check if there are unsaved changes</summary>
     * @returns {boolean} True if there are unsaved changes
     */
    hasUnsavedChanges() {
        // TODO: Implement proper change tracking
        return false;
    }

    /**
     * <summary>Update UI elements based on project data</summary>
     */
    updateUI() {
        this.log('Updating UI...');

        // Update title or project info if needed
        if (this.projectData && this.projectData.projectInfo) {
            document.title = `Comic Creator - ${this.projectData.projectInfo.title || 'Untitled'}`;
        }
    }

    /**
     * <summary>Get project data</summary>
     * @returns {Object} Current project data
     */
    getProjectData() {
        return this.projectData;
    }

    /**
     * <summary>Update project data</summary>
     * @param {Object} data - Updated project data
     */
    updateProjectData(data) {
        this.projectData = { ...this.projectData, ...data };
        this.log('Project data updated');
    }

    /**
     * <summary>Get a specific manager</summary>
     * @param {string} name - Manager name
     * @returns {Object} Manager instance
     */
    getManager(name) {
        return this.managers[name];
    }

    /**
     * <summary>Debug logging helper</summary>
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:Main ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    handleError(message, error) {
        console.error(`[CBG:Main ERROR] ${message}:`, error);

        // Show error to user using SwarmUI's error system
        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        } else {
            alert(`${message}: ${error.message}`);
        }
    }

    /**
     * <summary>Cleanup resources</summary>
     */
    destroy() {
        this.log('Destroying Comic Book Generator...');

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Cleanup managers
        Object.values(this.managers).forEach(manager => {
            if (manager && typeof manager.destroy === 'function') {
                manager.destroy();
            }
        });

        this.isInitialized = false;
        this.log('Comic Book Generator destroyed');
    }
}

// Initialize when DOM is ready
let comicBookGenerator = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('[CBG] DOM loaded, initializing...');
        comicBookGenerator = new ComicBookGenerator();
        await comicBookGenerator.initialize();
    } catch (error) {
        console.error('[CBG] Failed to initialize:', error);
        if (typeof showError === 'function') {
            showError(`Failed to initialize Comic Book Generator: ${error.message}`);
        }
    }
});

// Export for use by other modules
export { ComicBookGenerator, comicBookGenerator };

/**
 * <summary>Comic Book Generator - Asset Management Module</summary>
 * Handles asset library, templates, and resource management
 */

export class AssetManager {
    constructor(main) {
        this.main = main;
        this.debug = true;
        this.assets = new Map();
        this.templates = new Map();
        this.stylePresets = new Map();
        this.currentFilter = 'all';
        this.selectedAsset = null;
        this.isInitialized = false;

        this.log('AssetManager constructor called');
    }

    /**
     * <summary>Initialize the asset manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Asset Manager...');

            this.initializeDefaultAssets();
            this.initializeTemplates();
            this.initializeStylePresets();
            this.setupEventHandlers();
            this.isInitialized = true;

            this.log('Asset Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Asset Manager', error);
        }
    }

    /**
     * <summary>Initialize default assets</summary>
     */
    initializeDefaultAssets() {
        // Default sample assets (these would normally be loaded from the backend)
        const defaultAssets = [
            {
                id: 'bg_castle',
                name: 'Castle Background',
                type: 'backgrounds',
                category: 'Architecture',
                tags: ['medieval', 'castle', 'fantasy'],
                thumbnail: '🏰',
                filePath: null, // Would be actual file path
                description: 'Medieval castle background',
                createdDate: Date.now()
            },
            {
                id: 'bg_forest',
                name: 'Forest Background',
                type: 'backgrounds',
                category: 'Nature',
                tags: ['forest', 'trees', 'nature'],
                thumbnail: '🌲',
                filePath: null,
                description: 'Dense forest scene',
                createdDate: Date.now()
            },
            {
                id: 'prop_sword',
                name: 'Medieval Sword',
                type: 'props',
                category: 'Weapons',
                tags: ['sword', 'weapon', 'medieval'],
                thumbnail: '⚔️',
                filePath: null,
                description: 'Classic medieval sword',
                createdDate: Date.now()
            },
            {
                id: 'effect_explosion',
                name: 'Explosion Effect',
                type: 'effects',
                category: 'Action',
                tags: ['explosion', 'boom', 'action'],
                thumbnail: '💥',
                filePath: null,
                description: 'Dynamic explosion effect',
                createdDate: Date.now()
            }
        ];

        defaultAssets.forEach(asset => {
            this.assets.set(asset.id, asset);
        });

        this.log(`Initialized ${defaultAssets.length} default assets`);
    }

    /**
     * <summary>Initialize panel templates</summary>
     */
    initializeTemplates() {
        const defaultTemplates = [
            {
                id: 'template_2x2',
                name: '2×2 Grid Layout',
                type: 'panel_layout',
                description: 'Classic 4-panel grid layout',
                thumbnail: '⊞',
                data: {
                    panels: [
                        { x: 50, y: 50, width: 320, height: 200 },
                        { x: 430, y: 50, width: 320, height: 200 },
                        { x: 50, y: 300, width: 320, height: 200 },
                        { x: 430, y: 300, width: 320, height: 200 }
                    ]
                },
                createdDate: Date.now()
            },
            {
                id: 'template_manga',
                name: 'Manga Style Layout',
                type: 'panel_layout',
                description: 'Vertical manga-style panel arrangement',
                thumbnail: '⊟',
                data: {
                    panels: [
                        { x: 50, y: 50, width: 700, height: 150 },
                        { x: 50, y: 220, width: 340, height: 200 },
                        { x: 410, y: 220, width: 340, height: 200 },
                        { x: 50, y: 440, width: 700, height: 180 }
                    ]
                },
                createdDate: Date.now()
            },
            {
                id: 'bubble_oval',
                name: 'Speech Bubble - Oval',
                type: 'speech_bubble',
                description: 'Standard oval speech bubble',
                thumbnail: '💭',
                data: {
                    shape: 'oval',
                    borderWidth: 2,
                    borderColor: '#000000',
                    fillColor: '#ffffff',
                    tailStyle: 'curved'
                },
                createdDate: Date.now()
            },
            {
                id: 'bubble_thought',
                name: 'Thought Bubble - Cloud',
                type: 'speech_bubble',
                description: 'Cloud-style thought bubble',
                thumbnail: '☁️',
                data: {
                    shape: 'cloud',
                    borderWidth: 1,
                    borderColor: '#666666',
                    fillColor: '#f0f0f0',
                    tailStyle: 'dots'
                },
                createdDate: Date.now()
            }
        ];

        defaultTemplates.forEach(template => {
            this.templates.set(template.id, template);
        });

        this.log(`Initialized ${defaultTemplates.length} default templates`);
    }

    /**
     * <summary>Initialize style presets</summary>
     */
    initializeStylePresets() {
        const defaultPresets = [
            {
                id: 'style_classic',
                name: 'Classic Comic',
                description: 'Bold lines, vibrant colors, traditional speech bubbles',
                thumbnail: '📚',
                data: {
                    panelBorderWidth: 3,
                    panelBorderColor: '#000000',
                    panelBorderStyle: 'solid',
                    speechBubbleStyle: 'oval',
                    fontFamily: 'Comic Sans MS, sans-serif',
                    colorPalette: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2'],
                    artStyle: 'Comic Book'
                },
                createdDate: Date.now()
            },
            {
                id: 'style_manga',
                name: 'Manga Style',
                description: 'Clean lineart, screentones, dramatic angles',
                thumbnail: '🎌',
                data: {
                    panelBorderWidth: 2,
                    panelBorderColor: '#000000',
                    panelBorderStyle: 'solid',
                    speechBubbleStyle: 'rectangle',
                    fontFamily: 'Arial, sans-serif',
                    colorPalette: ['#000000', '#FFFFFF', '#808080', '#D3D3D3', '#A9A9A9'],
                    artStyle: 'Manga'
                },
                createdDate: Date.now()
            },
            {
                id: 'style_modern',
                name: 'Modern Digital',
                description: 'Clean digital art, contemporary design',
                thumbnail: '💻',
                data: {
                    panelBorderWidth: 1,
                    panelBorderColor: '#333333',
                    panelBorderStyle: 'solid',
                    speechBubbleStyle: 'rounded_rectangle',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    colorPalette: ['#6C5CE7', '#A29BFE', '#FD79A8', '#E17055', '#00B894'],
                    artStyle: 'Digital'
                },
                createdDate: Date.now()
            }
        ];

        defaultPresets.forEach(preset => {
            this.stylePresets.set(preset.id, preset);
        });

        this.log(`Initialized ${defaultPresets.length} default style presets`);
    }

    /**
     * <summary>Setup event handlers for asset management</summary>
     */
    setupEventHandlers() {
        this.log('Setting up asset event handlers...');

        // Asset filter dropdown
        const filterSelect = document.getElementById('cbg-asset-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.render();
            });
        }

        // Upload asset button
        const uploadBtn = document.getElementById('cbg-assets-upload');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadAsset());
        }

        // Organize assets button
        const organizeBtn = document.getElementById('cbg-assets-organize');
        if (organizeBtn) {
            organizeBtn.addEventListener('click', () => this.organizeAssets());
        }
    }

    /**
     * <summary>Render the asset management interface</summary>
     */
    async render() {
        try {
            this.log('Rendering asset interface...');

            await this.renderTemplatesSection();
            await this.renderAssetsLibrary();

        } catch (error) {
            this.handleError('Failed to render asset interface', error);
        }
    }

    /**
     * <summary>Render the templates and resources section</summary>
     */
    async renderTemplatesSection() {
        const container = document.getElementById('cbg-templates-content');
        if (!container) {
            throw new Error('Templates container not found');
        }

        this.log('Rendering templates section...');

        try {
            let html = '';

            // Panel Templates Section
            html += '<div class="templates-section" style="margin-bottom: 2rem;">';
            html += '<div class="d-flex align-items-center justify-content-between" style="margin-bottom: 1rem;">';
            html += '<h4 style="margin: 0;">Panel Templates</h4>';
            html += '<div>';
            html += '<button class="basic-button small-button me-2" id="cbg-templates-import">Import</button>';
            html += '<button class="basic-button small-button" id="cbg-templates-add">+ Add Template</button>';
            html += '</div>';
            html += '</div>';

            const panelTemplates = Array.from(this.templates.values()).filter(t => t.type === 'panel_layout');

            html += '<div class="template-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem;">';

            panelTemplates.forEach(template => {
                html += `
                    <div class="template-card" data-template-id="${template.id}" 
                         style="aspect-ratio: 4/3; border: 1px solid var(--shadow); border-radius: 0.5rem; background-color: var(--background-soft); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.2s; position: relative;">
                        <div class="template-thumbnail" style="font-size: 2rem; margin-bottom: 0.5rem;">
                            ${template.thumbnail}
                        </div>
                        <div class="template-name" style="font-size: 0.9rem; font-weight: 500; text-align: center; margin-bottom: 0.25rem;">
                            ${escapeHtml(template.name)}
                        </div>
                        <div class="template-description" style="font-size: 0.7rem; color: var(--text-soft); text-align: center; padding: 0 0.5rem;">
                            ${escapeHtml(template.description)}
                        </div>
                        <div class="template-actions" style="position: absolute; top: 0.5rem; right: 0.5rem; opacity: 0; transition: opacity 0.2s;">
                            <button class="basic-button small-button template-use-btn" title="Use Template" style="padding: 0.25rem 0.5rem; margin-right: 0.25rem;">Use</button>
                            <button class="basic-button small-button template-delete-btn" title="Delete Template" style="padding: 0.25rem 0.5rem; color: var(--danger);">×</button>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            html += '</div>';

            // Speech Bubble Templates Section
            html += '<div class="templates-section" style="margin-bottom: 2rem;">';
            html += '<div class="d-flex align-items-center justify-content-between" style="margin-bottom: 1rem;">';
            html += '<h4 style="margin: 0;">Speech Bubble Templates</h4>';
            html += '<button class="basic-button small-button" id="cbg-bubbles-add">+ Add Bubble</button>';
            html += '</div>';

            const bubbleTemplates = Array.from(this.templates.values()).filter(t => t.type === 'speech_bubble');

            html += '<div class="bubble-list" style="display: flex; flex-direction: column; gap: 0.5rem;">';

            bubbleTemplates.forEach(template => {
                html += `
                    <div class="bubble-template" data-template-id="${template.id}"
                         style="padding: 0.75rem; border: 1px solid var(--shadow); border-radius: 0.5rem; background-color: var(--background-soft); cursor: pointer; transition: border-color 0.2s; display: flex; align-items: center;">
                        <div class="bubble-thumbnail" style="font-size: 1.5rem; margin-right: 0.75rem;">
                            ${template.thumbnail}
                        </div>
                        <div class="bubble-info" style="flex-grow: 1;">
                            <div class="bubble-name" style="font-weight: 500; margin-bottom: 0.25rem;">
                                ${escapeHtml(template.name)}
                            </div>
                            <div class="bubble-description" style="font-size: 0.8rem; color: var(--text-soft);">
                                ${escapeHtml(template.description)}
                            </div>
                        </div>
                        <div class="bubble-actions">
                            <button class="basic-button small-button bubble-use-btn" title="Use Bubble">Use</button>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            html += '</div>';

            // Style Presets Section
            html += '<div class="templates-section">';
            html += '<div class="d-flex align-items-center justify-content-between" style="margin-bottom: 1rem;">';
            html += '<h4 style="margin: 0;">Style Presets</h4>';
            html += '<div>';
            html += '<button class="basic-button small-button me-2" id="cbg-styles-export">Export</button>';
            html += '<button class="basic-button small-button" id="cbg-styles-add">+ Add Style</button>';
            html += '</div>';
            html += '</div>';

            html += '<div class="style-list" style="display: flex; flex-direction: column; gap: 0.5rem;">';

            Array.from(this.stylePresets.values()).forEach(preset => {
                html += `
                    <div class="style-preset" data-preset-id="${preset.id}"
                         style="padding: 0.75rem; border: 1px solid var(--shadow); border-radius: 0.5rem; background-color: var(--background-soft); cursor: pointer; transition: border-color 0.2s; display: flex; align-items: center;">
                        <div class="style-thumbnail" style="font-size: 1.5rem; margin-right: 0.75rem;">
                            ${preset.thumbnail}
                        </div>
                        <div class="style-info" style="flex-grow: 1;">
                            <div class="style-name" style="font-weight: 500; margin-bottom: 0.25rem;">
                                ${escapeHtml(preset.name)}
                            </div>
                            <div class="style-description" style="font-size: 0.8rem; color: var(--text-soft);">
                                ${escapeHtml(preset.description)}
                            </div>
                        </div>
                        <div class="style-actions">
                            <button class="basic-button small-button style-apply-btn" title="Apply Style">Apply</button>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            html += '</div>';

            container.innerHTML = html;

            // Setup template section event handlers
            this.setupTemplateHandlers();

        } catch (error) {
            this.handleError('Failed to render templates section', error);
            container.innerHTML = '<div class="cbg-error">Failed to load templates</div>';
        }
    }

    /**
     * <summary>Render the asset library section</summary>
     */
    async renderAssetsLibrary() {
        const container = document.getElementById('cbg-assets-library-content');
        if (!container) {
            throw new Error('Assets library container not found');
        }

        this.log(`Rendering assets library with filter: ${this.currentFilter}`);

        try {
            let filteredAssets = Array.from(this.assets.values());

            if (this.currentFilter !== 'all') {
                filteredAssets = filteredAssets.filter(asset => asset.type === this.currentFilter);
            }

            let html = '';

            if (filteredAssets.length === 0) {
                html += `
                    <div class="assets-empty" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--text-soft);">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📁</div>
                        <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">No assets found</div>
                        <div style="font-size: 0.9rem;">Upload some assets to get started</div>
                        <button class="basic-button btn-primary" style="margin-top: 1rem;" onclick="document.getElementById('cbg-assets-upload').click()">Upload Assets</button>
                    </div>
                `;
            } else {
                html += '<div class="asset-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem;">';

                filteredAssets.forEach(asset => {
                    const typeColor = this.getAssetTypeColor(asset.type);
                    const typeLabel = this.getAssetTypeLabel(asset.type);

                    html += `
                        <div class="asset-card" data-asset-id="${asset.id}"
                             style="aspect-ratio: 1; border: 1px solid var(--shadow); border-radius: 0.5rem; background-color: var(--background-soft); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.2s; position: relative; overflow: hidden;">
                            
                            <div class="asset-thumbnail" style="font-size: 2rem; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; height: 60px;">
                                ${asset.thumbnail}
                            </div>
                            
                            <div class="asset-name" style="font-size: 0.8rem; font-weight: 500; text-align: center; margin-bottom: 0.25rem; padding: 0 0.5rem; line-height: 1.2;">
                                ${escapeHtml(asset.name)}
                            </div>
                            
                            <div class="asset-type-badge" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 0.7rem; color: white; background: ${typeColor}; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-weight: 500;">
                                ${typeLabel}
                            </div>
                            
                            <div class="asset-actions" style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); padding: 0.5rem; opacity: 0; transition: opacity 0.2s; display: flex; justify-content: center; gap: 0.25rem;">
                                <button class="basic-button small-button asset-use-btn" title="Use Asset" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">Use</button>
                                <button class="basic-button small-button asset-edit-btn" title="Edit Asset" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">Edit</button>
                                <button class="basic-button small-button asset-delete-btn" title="Delete Asset" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; color: var(--danger);">Del</button>
                            </div>
                        </div>
                    `;
                });

                // Add upload placeholder card
                html += `
                    <div class="asset-upload-placeholder" style="aspect-ratio: 1; border: 2px dashed var(--shadow); border-radius: 0.5rem; background-color: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.2s; color: var(--text-soft);">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">+</div>
                        <div style="font-size: 0.8rem; text-align: center;">Add Asset</div>
                    </div>
                `;

                html += '</div>';
            }

            container.innerHTML = html;

            // Setup asset library event handlers
            this.setupAssetHandlers();

        } catch (error) {
            this.handleError('Failed to render asset library', error);
            container.innerHTML = '<div class="cbg-error">Failed to load asset library</div>';
        }
    }

    /**
     * <summary>Setup event handlers for templates section</summary>
     */
    setupTemplateHandlers() {
        const container = document.getElementById('cbg-templates-content');
        if (!container) return;

        // Template card hover effects
        container.addEventListener('mouseenter', (e) => {
            const card = e.target.closest('.template-card, .bubble-template, .style-preset');
            if (card) {
                const actions = card.querySelector('.template-actions, .bubble-actions, .style-actions');
                if (actions && actions.style) {
                    actions.style.opacity = '1';
                }
            }
        }, true);

        container.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.template-card, .bubble-template, .style-preset');
            if (card) {
                const actions = card.querySelector('.template-actions, .bubble-actions, .style-actions');
                if (actions && actions.style) {
                    actions.style.opacity = '0';
                }
            }
        }, true);

        // Template use buttons
        container.addEventListener('click', (e) => {
            e.stopPropagation();

            if (e.target.classList.contains('template-use-btn')) {
                const card = e.target.closest('.template-card');
                const templateId = card.dataset.templateId;
                this.useTemplate(templateId);
            } else if (e.target.classList.contains('bubble-use-btn')) {
                const card = e.target.closest('.bubble-template');
                const templateId = card.dataset.templateId;
                this.useSpeechBubble(templateId);
            } else if (e.target.classList.contains('style-apply-btn')) {
                const card = e.target.closest('.style-preset');
                const presetId = card.dataset.presetId;
                this.applyStylePreset(presetId);
            } else if (e.target.classList.contains('template-delete-btn')) {
                const card = e.target.closest('.template-card');
                const templateId = card.dataset.templateId;
                this.deleteTemplate(templateId);
            }
        });

        // Add buttons
        const importBtn = container.querySelector('#cbg-templates-import');
        const addTemplateBtn = container.querySelector('#cbg-templates-add');
        const addBubbleBtn = container.querySelector('#cbg-bubbles-add');
        const exportStylesBtn = container.querySelector('#cbg-styles-export');
        const addStyleBtn = container.querySelector('#cbg-styles-add');

        if (importBtn) {
            importBtn.addEventListener('click', () => this.importTemplates());
        }

        if (addTemplateBtn) {
            addTemplateBtn.addEventListener('click', () => this.addTemplate());
        }

        if (addBubbleBtn) {
            addBubbleBtn.addEventListener('click', () => this.addSpeechBubble());
        }

        if (exportStylesBtn) {
            exportStylesBtn.addEventListener('click', () => this.exportStyles());
        }

        if (addStyleBtn) {
            addStyleBtn.addEventListener('click', () => this.addStylePreset());
        }
    }

    /**
     * <summary>Setup event handlers for asset library</summary>
     */
    setupAssetHandlers() {
        const container = document.getElementById('cbg-assets-library-content');
        if (!container) return;

        // Asset card hover effects
        container.addEventListener('mouseenter', (e) => {
            const card = e.target.closest('.asset-card');
            if (card) {
                const actions = card.querySelector('.asset-actions');
                if (actions && actions.style) {
                    actions.style.opacity = '1';
                }
            }
        }, true);

        container.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.asset-card');
            if (card) {
                const actions = card.querySelector('.asset-actions');
                if (actions && actions.style) {
                    actions.style.opacity = '0';
                }
            }
        }, true);

        // Asset action buttons
        container.addEventListener('click', (e) => {
            e.stopPropagation();

            if (e.target.classList.contains('asset-use-btn')) {
                const card = e.target.closest('.asset-card');
                const assetId = card.dataset.assetId;
                this.useAsset(assetId);
            } else if (e.target.classList.contains('asset-edit-btn')) {
                const card = e.target.closest('.asset-card');
                const assetId = card.dataset.assetId;
                this.editAsset(assetId);
            } else if (e.target.classList.contains('asset-delete-btn')) {
                const card = e.target.closest('.asset-card');
                const assetId = card.dataset.assetId;
                this.deleteAsset(assetId);
            }
        });

        // Upload placeholder click
        const uploadPlaceholder = container.querySelector('.asset-upload-placeholder');
        if (uploadPlaceholder) {
            uploadPlaceholder.addEventListener('click', () => this.uploadAsset());
        }

        // Asset card selection
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.asset-card');
            if (card) {
                const assetId = card.dataset.assetId;
                this.selectAsset(assetId);
            }
        });
    }

    /**
     * <summary>Get asset type color</summary>
     * @param {string} type - Asset type
     * @returns {string} CSS color
     */
    getAssetTypeColor(type) {
        const colors = {
            'backgrounds': '#3498db',
            'characters': '#e74c3c',
            'props': '#f39c12',
            'effects': '#9b59b6'
        };
        return colors[type] || '#95a5a6';
    }

    /**
     * <summary>Get asset type label</summary>
     * @param {string} type - Asset type
     * @returns {string} Display label
     */
    getAssetTypeLabel(type) {
        const labels = {
            'backgrounds': 'BG',
            'characters': 'CHAR',
            'props': 'PROP',
            'effects': 'FX'
        };
        return labels[type] || 'ASSET';
    }

    /**
     * <summary>Upload new asset</summary>
     */
    uploadAsset() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';

        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            this.log(`Uploading ${files.length} asset(s)...`);

            files.forEach(file => {
                this.processAssetFile(file);
            });
        });

        input.click();
    }

    /**
     * <summary>Process uploaded asset file</summary>
     * @param {File} file - File to process
     */
    processAssetFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const assetData = {
                id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name.split('.')[0],
                type: this.guessAssetType(file.name),
                category: 'User Upload',
                tags: [],
                thumbnail: e.target.result,
                filePath: e.target.result, // In production, this would be a server path
                description: `Uploaded asset: ${file.name}`,
                fileSize: file.size,
                createdDate: Date.now()
            };

            this.assets.set(assetData.id, assetData);
            this.render(); // Refresh display

            this.log('Asset uploaded:', assetData.name);
        };

        reader.onerror = () => {
            this.handleError('Failed to read asset file', reader.error);
        };

        reader.readAsDataURL(file);
    }

    /**
     * <summary>Guess asset type from filename</summary>
     * @param {string} filename - File name
     * @returns {string} Guessed asset type
     */
    guessAssetType(filename) {
        const name = filename.toLowerCase();

        if (name.includes('background') || name.includes('bg') || name.includes('scene')) {
            return 'backgrounds';
        }
        if (name.includes('character') || name.includes('person') || name.includes('hero')) {
            return 'characters';
        }
        if (name.includes('effect') || name.includes('explosion') || name.includes('magic')) {
            return 'effects';
        }

        return 'props';
    }

    /**
     * <summary>Use a template</summary>
     * @param {string} templateId - Template ID to use
     */
    useTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            this.log(`Template not found: ${templateId}`);
            return;
        }

        this.log(`Using template: ${template.name}`);

        // Switch to layout mode and apply template
        const layoutManager = this.main.getManager('layout');
        if (layoutManager && template.type === 'panel_layout') {
            // Switch to layout mode first
            const layoutRadio = document.getElementById('layout_mode');
            if (layoutRadio) {
                layoutRadio.checked = true;
                this.main.setActiveMode('layout_mode').then(() => {
                    // Apply the template
                    layoutManager.applyTemplate(templateId);
                });
            }
        }
    }

    /**
     * <summary>Use a speech bubble template</summary>
     * @param {string} templateId - Bubble template ID
     */
    useSpeechBubble(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            this.log(`Speech bubble template not found: ${templateId}`);
            return;
        }

        this.log(`Using speech bubble: ${template.name}`);

        // TODO: Apply speech bubble to selected panel in layout mode
        // This would require integration with the layout manager
    }

    /**
     * <summary>Apply a style preset</summary>
     * @param {string} presetId - Style preset ID
     */
    applyStylePreset(presetId) {
        const preset = this.stylePresets.get(presetId);
        if (!preset) {
            this.log(`Style preset not found: ${presetId}`);
            return;
        }

        if (confirm(`Apply "${preset.name}" style to all panels?`)) {
            this.log(`Applying style preset: ${preset.name}`);

            // TODO: Apply style preset to layout manager
            const layoutManager = this.main.getManager('layout');
            if (layoutManager) {
                // This would apply the style data to all panels
                // layoutManager.applyStylePreset(preset.data);
            }
        }
    }

    /**
     * <summary>Use an asset</summary>
     * @param {string} assetId - Asset ID to use
     */
    useAsset(assetId) {
        const asset = this.assets.get(assetId);
        if (!asset) {
            this.log(`Asset not found: ${assetId}`);
            return;
        }

        this.log(`Using asset: ${asset.name}`);

        // TODO: Apply asset based on type
        // - backgrounds: set as panel background
        // - characters: add to character library or use in panel
        // - props: add to panel as overlay
        // - effects: add as effect layer
    }

    /**
     * <summary>Edit an asset</summary>
     * @param {string} assetId - Asset ID to edit
     */
    editAsset(assetId) {
        const asset = this.assets.get(assetId);
        if (!asset) {
            this.log(`Asset not found: ${assetId}`);
            return;
        }

        // TODO: Open asset editor modal/interface
        this.log(`Editing asset: ${asset.name}`);
    }

    /**
     * <summary>Delete an asset</summary>
     * @param {string} assetId - Asset ID to delete
     */
    deleteAsset(assetId) {
        const asset = this.assets.get(assetId);
        if (!asset) {
            this.log(`Asset not found: ${assetId}`);
            return;
        }

        if (confirm(`Delete "${asset.name}"? This action cannot be undone.`)) {
            this.assets.delete(assetId);
            this.render();

            this.log(`Deleted asset: ${asset.name}`);
        }
    }

    /**
     * <summary>Delete a template</summary>
     * @param {string} templateId - Template ID to delete
     */
    deleteTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            this.log(`Template not found: ${templateId}`);
            return;
        }

        if (confirm(`Delete template "${template.name}"? This action cannot be undone.`)) {
            this.templates.delete(templateId);
            this.render();

            this.log(`Deleted template: ${template.name}`);
        }
    }

    /**
     * <summary>Select an asset</summary>
     * @param {string} assetId - Asset ID to select
     */
    selectAsset(assetId) {
        const asset = this.assets.get(assetId);
        if (!asset) return;

        // Remove previous selection
        document.querySelectorAll('.asset-card.selected').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to new card
        const card = document.querySelector(`[data-asset-id="${assetId}"]`);
        if (card) {
            card.classList.add('selected');
        }

        this.selectedAsset = asset;
        this.log(`Selected asset: ${asset.name}`);
    }

    /**
     * <summary>Add new template</summary>
     */
    addTemplate() {
        // TODO: Open template creation interface
        this.log('Adding new template...');
    }

    /**
     * <summary>Add new speech bubble template</summary>
     */
    addSpeechBubble() {
        // TODO: Open speech bubble creation interface
        this.log('Adding new speech bubble...');
    }

    /**
     * <summary>Add new style preset</summary>
     */
    addStylePreset() {
        // TODO: Open style preset creation interface
        this.log('Adding new style preset...');
    }

    /**
     * <summary>Import templates</summary>
     */
    importTemplates() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const templateData = JSON.parse(e.target.result);

                    if (templateData.templates) {
                        templateData.templates.forEach(template => {
                            template.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            this.templates.set(template.id, template);
                        });
                    }

                    this.render();
                    this.log(`Imported ${templateData.templates?.length || 0} templates`);

                } catch (error) {
                    this.handleError('Failed to import templates', error);
                }
            };
            reader.readAsText(file);
        });

        input.click();
    }

    /**
     * <summary>Export style presets</summary>
     */
    exportStyles() {
        const styleData = {
            stylePresets: Array.from(this.stylePresets.values()),
            exportDate: Date.now(),
            version: '1.0'
        };

        const filename = 'comic_style_presets.json';
        const content = JSON.stringify(styleData, null, 2);

        if (typeof downloadPlainText === 'function') {
            downloadPlainText(filename, content);
            this.log('Style presets exported');
        }
    }

    /**
     * <summary>Organize assets</summary>
     */
    organizeAssets() {
        // TODO: Open asset organization interface
        this.log('Opening asset organization...');
    }

    /**
     * <summary>Save all asset data</summary>
     */
    async saveData() {
        try {
            this.log('Saving all asset data...');

            const assetData = {
                assets: Array.from(this.assets.values()),
                templates: Array.from(this.templates.values()),
                stylePresets: Array.from(this.stylePresets.values()),
                currentFilter: this.currentFilter
            };

            // Update project data
            this.main.updateProjectData({ assets: assetData });

            this.log(`Saved ${assetData.assets.length} assets, ${assetData.templates.length} templates, ${assetData.stylePresets.length} style presets`);

        } catch (error) {
            this.handleError('Failed to save asset data', error);
        }
    }

    /**
     * <summary>Load asset data</summary>
     * @param {Object} assetData - Asset data to load
     */
    loadData(assetData = {}) {
        try {
            this.log('Loading asset data...');

            if (assetData.assets) {
                this.assets.clear();
                assetData.assets.forEach(asset => {
                    this.assets.set(asset.id, asset);
                });
            }

            if (assetData.templates) {
                // Merge with defaults, don't replace completely
                assetData.templates.forEach(template => {
                    this.templates.set(template.id, template);
                });
            }

            if (assetData.stylePresets) {
                // Merge with defaults, don't replace completely
                assetData.stylePresets.forEach(preset => {
                    this.stylePresets.set(preset.id, preset);
                });
            }

            if (assetData.currentFilter) {
                this.currentFilter = assetData.currentFilter;
            }

            // Clear selection
            this.selectedAsset = null;

            this.log('Asset data loaded successfully');

        } catch (error) {
            this.handleError('Failed to load asset data', error);
        }
    }

    /**
     * <summary>Get all assets</summary>
     * @returns {Array} Array of asset data
     */
    getAllAssets() {
        return Array.from(this.assets.values());
    }

    /**
     * <summary>Get assets by type</summary>
     * @param {string} type - Asset type to filter by
     * @returns {Array} Filtered assets
     */
    getAssetsByType(type) {
        return Array.from(this.assets.values()).filter(asset => asset.type === type);
    }

    /**
     * <summary>Get asset by ID</summary>
     * @param {string} assetId - Asset ID
     * @returns {Object} Asset data
     */
    getAsset(assetId) {
        return this.assets.get(assetId);
    }

    /**
     * <summary>Get template by ID</summary>
     * @param {string} templateId - Template ID
     * @returns {Object} Template data
     */
    getTemplate(templateId) {
        return this.templates.get(templateId);
    }

    /**
     * <summary>Debug logging helper</summary>
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:Assets ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    handleError(message, error) {
        console.error(`[CBG:Assets ERROR] ${message}:`, error);

        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        }
    }

    /**
     * <summary>Cleanup resources</summary>
     */
    destroy() {
        this.log('Destroying Asset Manager...');

        this.assets.clear();
        this.templates.clear();
        this.stylePresets.clear();
        this.selectedAsset = null;
        this.isInitialized = false;

        this.log('Asset Manager destroyed');
    }
}

/**
 * <summary>Comic Book Generator - Enhanced Layout Management Module</summary>
 * Handles visual panel creation, scene generation, and page layout with AI integration
 */

class LayoutManager extends BaseManager {
    constructor(main) {
        super(main, 'Layout');
        this.main = main;
        this.debug = true;
        this.pages = [];
        this.currentPage = 0;
        this.selectedPanel = null;
        this.canvasZoom = 100;
        this.canvasOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.isResizing = false;
        this.resizeHandle = null;
        this.panelTemplates = new Map();
        this.layoutTemplates = new Map();
        this.generationQueue = [];
        this.isGenerating = false;
        this.snapToGrid = true;
        this.gridSize = 10;
        this.showGrid = true;
        this.undoStack = [];
        this.redoStack = [];
        this.isInitialized = false;

        this.log('LayoutManager constructor called');
    }

    /**
     * <summary>Initialize the layout manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Layout Manager...');

            this.initializePanelTemplates();
            this.initializeLayoutTemplates();
            this.createDefaultPage();
            this.setupEventHandlers();
            this.setupCanvasInteraction();
            this.isInitialized = true;

            this.log('Layout Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Layout Manager', error);
        }
    }

    /**
     * <summary>Initialize panel templates</summary>
     */
    initializePanelTemplates() {
        const templates = [
            {
                id: 'standard_rect',
                name: 'Standard Rectangle',
                shape: 'rectangle',
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: '#000000',
                aspectRatio: null
            },
            {
                id: 'square_panel',
                name: 'Square Panel',
                shape: 'rectangle',
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: '#000000',
                aspectRatio: 1
            },
            {
                id: 'wide_panel',
                name: 'Wide Panel',
                shape: 'rectangle',
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: '#000000',
                aspectRatio: 2.5
            },
            {
                id: 'tall_panel',
                name: 'Tall Panel',
                shape: 'rectangle',
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: '#000000',
                aspectRatio: 0.6
            },
            {
                id: 'circular_panel',
                name: 'Circular Panel',
                shape: 'circle',
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: '#000000',
                aspectRatio: 1
            },
            {
                id: 'splash_panel',
                name: 'Splash Panel',
                shape: 'splash',
                borderStyle: 'solid',
                borderWidth: 3,
                borderColor: '#000000',
                aspectRatio: 1.3
            }
        ];

        templates.forEach(template => {
            this.panelTemplates.set(template.id, template);
        });

        this.log(`Initialized ${templates.length} panel templates`);
    }

    /**
     * <summary>Initialize layout templates</summary>
     */
    initializeLayoutTemplates() {
        const templates = [
            {
                id: 'grid_2x2',
                name: '2×2 Grid Layout',
                description: 'Classic 4-panel grid',
                panels: [
                    { x: 50, y: 50, width: 320, height: 200, templateId: 'standard_rect' },
                    { x: 430, y: 50, width: 320, height: 200, templateId: 'standard_rect' },
                    { x: 50, y: 300, width: 320, height: 200, templateId: 'standard_rect' },
                    { x: 430, y: 300, width: 320, height: 200, templateId: 'standard_rect' }
                ]
            },
            {
                id: 'manga_vertical',
                name: 'Manga Vertical Layout',
                description: 'Vertical manga-style panels',
                panels: [
                    { x: 50, y: 50, width: 700, height: 120, templateId: 'wide_panel' },
                    { x: 50, y: 190, width: 340, height: 180, templateId: 'standard_rect' },
                    { x: 410, y: 190, width: 340, height: 180, templateId: 'standard_rect' },
                    { x: 50, y: 390, width: 700, height: 160, templateId: 'wide_panel' }
                ]
            },
            {
                id: 'action_sequence',
                name: 'Action Sequence Layout',
                description: 'Dynamic action flow',
                panels: [
                    { x: 50, y: 50, width: 200, height: 200, templateId: 'square_panel' },
                    { x: 270, y: 50, width: 480, height: 120, templateId: 'wide_panel' },
                    { x: 270, y: 190, width: 230, height: 180, templateId: 'standard_rect' },
                    { x: 520, y: 190, width: 230, height: 180, templateId: 'standard_rect' },
                    { x: 50, y: 280, width: 200, height: 240, templateId: 'tall_panel' }
                ]
            },
            {
                id: 'splash_focus',
                name: 'Splash Focus Layout',
                description: 'Large focus panel with supporting panels',
                panels: [
                    { x: 50, y: 50, width: 500, height: 350, templateId: 'splash_panel' },
                    { x: 570, y: 50, width: 180, height: 170, templateId: 'standard_rect' },
                    { x: 570, y: 240, width: 180, height: 160, templateId: 'standard_rect' }
                ]
            }
        ];

        templates.forEach(template => {
            this.layoutTemplates.set(template.id, template);
        });

        this.log(`Initialized ${templates.length} layout templates`);
    }

    /**
     * <summary>Create default page</summary>
     */
    createDefaultPage() {
        const defaultPage = this.createPageData();
        this.pages.push(defaultPage);
        this.currentPage = 0;
    }

    /**
     * <summary>Create new page data structure</summary>
     */
    createPageData() {
        return {
            id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            number: this.pages.length + 1,
            title: `Page ${this.pages.length + 1}`,
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            backgroundImage: null,
            panels: [],
            readingFlow: [],
            notes: '',
            createdDate: Date.now(),
            lastModified: Date.now()
        };
    }

    /**
     * <summary>Setup event handlers</summary>
     */
    setupEventHandlers() {
        this.log('Setting up layout event handlers...');

        // Page navigation
        this.main.eventManager.on('cbg-current-page', 'change', (e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val)) this.switchToPage(val - 1);
        });
        
        // Layout templates
        this.main.eventManager.on('cbg-layout-templates', 'change', (e) => {
            if (e.target.value) {
                this.applyLayoutTemplate(e.target.value);
            }
        });

        // Add panel button
        this.main.eventManager.on('cbg-add-panel', 'click', () => this.addPanel());

        // Save page button
        this.main.eventManager.on('cbg-save-page', 'click', () => this.savePage());

        // Keyboard shortcuts (document-level)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.savePage();
                        break;
                    case 'd':
                        e.preventDefault();
                        if (this.selectedPanel) {
                            this.duplicatePanel(this.selectedPanel.id);
                        }
                        break;
                    case 'Delete':
                    case 'Backspace':
                        if (this.selectedPanel) {
                            e.preventDefault();
                            this.deletePanel(this.selectedPanel.id);
                        }
                        break;
                }
            }
        });
}

/**
 * <summary>Render the layout management interface</summary>
 */
async render() {
    try {
        this.log('Rendering layout interface...');

        await this.renderCanvas();
        await this.renderPanelInspector();
        this.updatePageNavigation();

    } catch (error) {
        this.handleError('Failed to render layout interface', error);
    }
}

/**
 * <summary>Render the main canvas</summary>
 */
async renderCanvas() {
    const canvas = getRequiredElementById('cbg-layout-canvas');

    const currentPageData = this.getCurrentPage();
    if (!currentPageData) {
        canvas.innerHTML = '<div class="empty-canvas">No page selected</div>';
        return;
    }

    this.log(`Rendering canvas for page ${currentPageData.number}`);

    // Clear canvas
    canvas.innerHTML = '';

    // Apply canvas styles
    canvas.style.position = 'relative';
    canvas.style.width = `${currentPageData.width}px`;
    canvas.style.height = `${currentPageData.height}px`;
    canvas.style.backgroundColor = currentPageData.backgroundColor;
    canvas.style.transform = `scale(${this.canvasZoom / 100})`;
    canvas.style.transformOrigin = 'top left';
    canvas.style.border = '2px solid #ccc';
    canvas.style.borderRadius = '8px';
    canvas.style.overflow = 'hidden';

    // Add background image if set
    if (currentPageData.backgroundImage) {
        canvas.style.backgroundImage = `url(${currentPageData.backgroundImage})`;
        canvas.style.backgroundSize = 'cover';
        canvas.style.backgroundPosition = 'center';
    }

    // Render grid if enabled
    if (this.showGrid) {
        this.renderGrid(canvas, currentPageData);
    }

    // Render panels
    currentPageData.panels.forEach(panel => {
        this.renderPanel(canvas, panel);
    });

    // Render reading flow if panels exist
    if (currentPageData.panels.length > 1) {
        this.renderReadingFlow(canvas, currentPageData);
    }
}

    /**
     * <summary>Render scene tab for panel inspector</summary>
     */
    async renderSceneTab(panel) {
        const storyManager = this.main.getManager('story');
        const characterManager = this.main.getManager('characters');
        const characters = characterManager ? characterManager.getAllCharacters() : [];

        return `
            <!-- Scene Context -->
            <div class="scene-context mb-4">
                <h6>Scene Context</h6>
                
                ${makeTextInput(null, 'cbg-panel-scene-summary', 'panel_scene_summary', 'What\'s Happening',
            'Brief description of this scene', panel.sceneSummary || '', 'big',
            'Hero confronts villain on rooftop, tension builds...')}

                <div class="row">
                    <div class="col-6">
                        ${makeDropdownInput(null, 'cbg-panel-shot-type', 'panel_shot_type', 'Shot Type',
                'Camera angle/framing',
                ['Wide Shot', 'Medium Shot', 'Close-up', 'Extreme Close-up', 'Bird\'s Eye', 'Low Angle', 'High Angle'],
                panel.shotType || 'Medium Shot')}
                    </div>
                    <div class="col-6">
                        ${makeDropdownInput(null, 'cbg-panel-time-of-day', 'panel_time_of_day', 'Time/Lighting',
                    'Scene lighting and atmosphere',
                    ['Dawn', 'Morning', 'Midday', 'Afternoon', 'Sunset', 'Night', 'Indoor', 'Artificial Light'],
                    panel.timeOfDay || 'Midday')}
                    </div>
                </div>

                ${makeTextInput(null, 'cbg-panel-mood', 'panel_mood', 'Mood & Atmosphere',
                        'Emotional tone of the scene', panel.mood || '', 'normal',
                        'Tense, peaceful, chaotic, mysterious...')}
            </div>

            <!-- Narrative Flow -->
            <div class="narrative-flow mb-4">
                <h6>Narrative Flow</h6>
                
                <div class="flow-context">
                    <div class="row">
                        <div class="col-12 mb-2">
                            <label class="form-label small">Previous Panel Context:</label>
                            <textarea class="form-control form-control-sm" id="cbg-previous-context" rows="2" 
                                      placeholder="What happened in the previous panel...">${panel.previousContext || ''}</textarea>
                        </div>
                        <div class="col-12">
                            <label class="form-label small">Next Panel Setup:</label>
                            <textarea class="form-control form-control-sm" id="cbg-next-context" rows="2" 
                                      placeholder="How this sets up the next panel...">${panel.nextContext || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Character Selection -->
            <div class="character-selection mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6>Characters in Scene</h6>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-add-character-to-scene">
                        <i class="fas fa-plus"></i> Add Character
                    </button>
                </div>
                
                <div id="cbg-scene-characters">
                    ${this.renderSceneCharacters(panel, characters)}
                </div>
            </div>

            <!-- Scene Generation -->
            <div class="scene-generation mb-4">
                <h6>AI Scene Generation</h6>
                
                <div class="generation-controls">
                    <div class="row mb-2">
                        <div class="col-6">
                            <select class="form-select form-select-sm" id="cbg-art-style">
                                <option value="comic">Comic Book Style</option>
                                <option value="manga">Manga Style</option>
                                <option value="realistic">Realistic</option>
                                <option value="cartoon">Cartoon</option>
                                <option value="noir">Film Noir</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <select class="form-select form-select-sm" id="cbg-generation-quality">
                                <option value="draft">Draft Quality</option>
                                <option value="standard">Standard Quality</option>
                                <option value="high">High Quality</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="generation-buttons d-flex gap-1 flex-wrap">
                        <button class="btn btn-sm btn-success" id="cbg-generate-scene">
                            <i class="fas fa-magic"></i> Generate Scene
                        </button>
                        <button class="btn btn-sm btn-info" id="cbg-generate-background">
                            <i class="fas fa-image"></i> Background Only
                        </button>
                        <button class="btn btn-sm btn-warning" id="cbg-generate-variations">
                            <i class="fas fa-dice"></i> Variations
                        </button>
                        <button class="btn btn-sm btn-secondary" id="cbg-refine-scene">
                            <i class="fas fa-sync-alt"></i> Refine
                        </button>
                    </div>
                </div>

                <!-- Generation Progress -->
                <div id="cbg-generation-progress" class="generation-progress mt-2" style="display: none;">
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                    </div>
                    <small class="text-muted mt-1 d-block" id="cbg-generation-status">Initializing...</small>
                </div>

                <!-- Generated Images -->
                <div id="cbg-generated-images" class="generated-images mt-3">
                    ${panel.generatedImages ? this.renderGeneratedImages(panel.generatedImages) : ''}
                </div>
            </div>

            <!-- Manual Image Upload -->
            <div class="manual-upload">
                <h6>Manual Scene Image</h6>
                <div class="upload-area">
                    <input type="file" id="cbg-scene-image-upload" accept="image/*" class="d-none">
                    <button class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('cbg-scene-image-upload').click()">
                        <i class="fas fa-upload"></i> Upload Image
                    </button>
                    ${panel.sceneImage ? '<button class="btn btn-outline-danger btn-sm ms-2" id="cbg-remove-scene-image"><i class="fas fa-trash"></i> Remove</button>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render scene characters</summary>
     */
    renderSceneCharacters(panel, characters) {
        const sceneCharacters = panel.characters || [];

        if (sceneCharacters.length === 0) {
            return `
                <div class="empty-characters text-center p-3 text-muted">
                    <i class="fas fa-users fa-2x mb-2"></i>
                    <p class="small mb-0">No characters in this scene</p>
                </div>
            `;
        }

        return sceneCharacters.map((sceneChar, index) => {
            const character = characters.find(c => c.id === sceneChar.characterId);
            if (!character) return '';

            return `
                <div class="scene-character-card mb-2" data-scene-char-index="${index}">
                    <div class="card card-body p-2">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <div class="character-avatar me-2" style="width: 32px; height: 32px; border-radius: 50%; background: ${this.getRoleColor(character.role)}20; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${this.getRoleColor(character.role)};">
                                    ${character.name ? character.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                    <div class="fw-bold small">${character.name || 'Unnamed Character'}</div>
                                    <div class="text-muted" style="font-size: 11px;">${character.role || 'Unknown Role'}</div>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger remove-scene-character" data-character-id="${character.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="character-scene-details mt-2">
                            <div class="row">
                                <div class="col-6">
                                    <label class="form-label" style="font-size: 11px;">Position:</label>
                                    <select class="form-select form-select-sm character-position" data-character-id="${character.id}">
                                        <option value="foreground" ${sceneChar.position === 'foreground' ? 'selected' : ''}>Foreground</option>
                                        <option value="midground" ${sceneChar.position === 'midground' ? 'selected' : ''}>Midground</option>
                                        <option value="background" ${sceneChar.position === 'background' ? 'selected' : ''}>Background</option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label class="form-label" style="font-size: 11px;">Expression:</label>
                                    <select class="form-select form-select-sm character-expression" data-character-id="${character.id}">
                                        <option value="neutral" ${sceneChar.expression === 'neutral' ? 'selected' : ''}>Neutral</option>
                                        <option value="happy" ${sceneChar.expression === 'happy' ? 'selected' : ''}>Happy</option>
                                        <option value="sad" ${sceneChar.expression === 'sad' ? 'selected' : ''}>Sad</option>
                                        <option value="angry" ${sceneChar.expression === 'angry' ? 'selected' : ''}>Angry</option>
                                        <option value="surprised" ${sceneChar.expression === 'surprised' ? 'selected' : ''}>Surprised</option>
                                        <option value="worried" ${sceneChar.expression === 'worried' ? 'selected' : ''}>Worried</option>
                                        <option value="determined" ${sceneChar.expression === 'determined' ? 'selected' : ''}>Determined</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="mt-2">
                                <label class="form-label" style="font-size: 11px;">Action/Pose:</label>
                                <input type="text" class="form-control form-control-sm character-action" 
                                       data-character-id="${character.id}"
                                       placeholder="What is the character doing?"
                                       value="${sceneChar.action || ''}">
                            </div>
                            
                            <div class="character-quick-ref mt-2 p-1 bg-light rounded">
                                <small class="text-muted">
                                    <strong>Appearance:</strong> ${character.appearance ? character.appearance.substring(0, 80) + '...' : 'Not defined'}<br>
                                    <strong>Personality:</strong> ${character.personality ? character.personality.substring(0, 80) + '...' : 'Not defined'}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * <summary>Render dialogue tab</summary>
     */
    renderDialogueTab(panel) {
        const dialogues = panel.dialogues || [];

        return `
            <div class="dialogue-management">
                <!-- Dialogue List -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6>Speech Bubbles & Dialogue</h6>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-add-dialogue">
                        <i class="fas fa-plus"></i> Add Dialogue
                    </button>
                </div>

                <div id="cbg-dialogue-list">
                    ${dialogues.length === 0 ? `
                        <div class="empty-dialogues text-center p-3 text-muted">
                            <i class="fas fa-comment fa-2x mb-2"></i>
                            <p class="small mb-0">No dialogue in this panel</p>
                        </div>
                    ` : dialogues.map((dialogue, index) => this.renderDialogueCard(dialogue, index)).join('')}
                </div>

                <!-- AI Dialogue Tools -->
                <div class="ai-dialogue-tools mt-4">
                    <h6>AI Dialogue Enhancement</h6>
                    <div class="d-flex gap-1 flex-wrap">
                        <button class="btn btn-sm btn-outline-success" id="cbg-suggest-dialogue">
                            <i class="fas fa-robot"></i> Suggest Dialogue
                        </button>
                        <button class="btn btn-sm btn-outline-info" id="cbg-improve-dialogue">
                            <i class="fas fa-sync-alt"></i> Improve Existing
                        </button>
                        <button class="btn btn-sm btn-outline-warning" id="cbg-check-voice-consistency">
                            <i class="fas fa-check-circle"></i> Check Voice
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render individual dialogue card</summary>
     */
    renderDialogueCard(dialogue, index) {
        const characterManager = this.main.getManager('characters');
        const character = dialogue.characterId && characterManager ?
            characterManager.getCharacter(dialogue.characterId) : null;

        return `
            <div class="dialogue-card mb-3" data-dialogue-index="${index}">
                <div class="card">
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="dialogue-header">
                                <div class="d-flex align-items-center">
                                    <span class="badge bg-secondary me-2">${index + 1}</span>
                                    <select class="form-select form-select-sm me-2" style="width: auto;" id="cbg-dialogue-character-${index}">
                                        <option value="">Select Character...</option>
                                        ${characterManager ? characterManager.getAllCharacters().map(char =>
            `<option value="${char.id}" ${dialogue.characterId === char.id ? 'selected' : ''}>${char.name}</option>`
        ).join('') : ''}
                                        <option value="narrator" ${dialogue.characterId === 'narrator' ? 'selected' : ''}>Narrator</option>
                                    </select>
                                    <select class="form-select form-select-sm" style="width: auto;" id="cbg-dialogue-type-${index}">
                                        <option value="speech" ${dialogue.type === 'speech' ? 'selected' : ''}>Speech</option>
                                        <option value="thought" ${dialogue.type === 'thought' ? 'selected' : ''}>Thought</option>
                                        <option value="caption" ${dialogue.type === 'caption' ? 'selected' : ''}>Caption</option>
                                        <option value="whisper" ${dialogue.type === 'whisper' ? 'selected' : ''}>Whisper</option>
                                        <option value="shout" ${dialogue.type === 'shout' ? 'selected' : ''}>Shout</option>
                                    </select>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger remove-dialogue" data-dialogue-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>

                        <div class="dialogue-content">
                            <textarea class="form-control form-control-sm mb-2" 
                                      id="cbg-dialogue-text-${index}"
                                      placeholder="Enter dialogue text..."
                                      rows="2">${dialogue.text || ''}</textarea>
                            
                            <div class="row">
                                <div class="col-6">
                                    <label class="form-label small">X Position (%):</label>
                                    <input type="range" class="form-range" 
                                           id="cbg-dialogue-x-${index}"
                                           min="0" max="80" value="${dialogue.x || 20}">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small">Y Position (%):</label>
                                    <input type="range" class="form-range" 
                                           id="cbg-dialogue-y-${index}"
                                           min="0" max="80" value="${dialogue.y || 20}">
                                </div>
                            </div>
                        </div>

                        ${character ? `
                            <div class="character-voice-hint mt-2 p-2 bg-light rounded">
                                <small class="text-muted">
                                    <strong>${character.name}'s voice:</strong> ${character.speechPattern || character.personality || 'No voice info available'}
                                </small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render style tab</summary>
     */
    renderStyleTab(panel) {
        return `
            <div class="panel-style-editor">
                <!-- Panel Appearance -->
                <div class="panel-appearance mb-4">
                    <h6>Panel Appearance</h6>
                    
                    <div class="row">
                        <div class="col-6">
                            <label class="form-label small">Border Width:</label>
                            <input type="range" class="form-range" id="cbg-panel-border-width" 
                                   min="0" max="10" value="${panel.borderWidth || 2}">
                            <small class="text-muted">${panel.borderWidth || 2}px</small>
                        </div>
                        <div class="col-6">
                            <label class="form-label small">Border Color:</label>
                            <input type="color" class="form-control form-control-sm" 
                                   id="cbg-panel-border-color" value="${panel.borderColor || '#000000'}">
                        </div>
                    </div>

                    <div class="row mt-2">
                        <div class="col-6">
                            <label class="form-label small">Border Style:</label>
                            <select class="form-select form-select-sm" id="cbg-panel-border-style">
                                <option value="solid" ${panel.borderStyle === 'solid' ? 'selected' : ''}>Solid</option>
                                <option value="dashed" ${panel.borderStyle === 'dashed' ? 'selected' : ''}>Dashed</option>
                                <option value="dotted" ${panel.borderStyle === 'dotted' ? 'selected' : ''}>Dotted</option>
                                <option value="double" ${panel.borderStyle === 'double' ? 'selected' : ''}>Double</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="form-label small">Background:</label>
                            <input type="color" class="form-control form-control-sm" 
                                   id="cbg-panel-bg-color" value="${panel.backgroundColor || '#ffffff'}">
                        </div>
                    </div>
                </div>

                <!-- Panel Shape -->
                <div class="panel-shape mb-4">
                    <h6>Panel Shape</h6>
                    <div class="shape-options">
                        <div class="row">
                            <div class="col-6">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="panelShape" value="rectangle" 
                                           ${(panel.shape || 'rectangle') === 'rectangle' ? 'checked' : ''}>
                                    <label class="form-check-label">Rectangle</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="panelShape" value="circle" 
                                           ${panel.shape === 'circle' ? 'checked' : ''}>
                                    <label class="form-check-label">Circle</label>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="panelShape" value="splash" 
                                           ${panel.shape === 'splash' ? 'checked' : ''}>
                                    <label class="form-check-label">Splash</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="panelShape" value="irregular" 
                                           ${panel.shape === 'irregular' ? 'checked' : ''}>
                                    <label class="form-check-label">Irregular</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${panel.shape === 'rectangle' ? `
                        <div class="border-radius-control mt-2">
                            <label class="form-label small">Corner Radius:</label>
                            <input type="range" class="form-range" id="cbg-panel-border-radius" 
                                   min="0" max="20" value="${panel.borderRadius || 0}">
                            <small class="text-muted">${panel.borderRadius || 0}px</small>
                        </div>
                    ` : ''}
                </div>

                <!-- Visual Effects -->
                <div class="panel-effects mb-4">
                    <h6>Visual Effects</h6>
                    
                    <div class="effect-options">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="cbg-panel-shadow" 
                                   ${panel.dropShadow ? 'checked' : ''}>
                            <label class="form-check-label">Drop Shadow</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="cbg-panel-glow" 
                                   ${panel.glow ? 'checked' : ''}>
                            <label class="form-check-label">Inner Glow</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="cbg-panel-vintage" 
                                   ${panel.vintageEffect ? 'checked' : ''}>
                            <label class="form-check-label">Vintage Effect</label>
                        </div>
                    </div>
                </div>

                <!-- Style Presets -->
                <div class="style-presets">
                    <h6>Style Presets</h6>
                    <div class="preset-buttons d-flex gap-1 flex-wrap">
                        <button class="btn btn-sm btn-outline-secondary apply-style-preset" data-preset="classic">Classic</button>
                        <button class="btn btn-sm btn-outline-secondary apply-style-preset" data-preset="manga">Manga</button>
                        <button class="btn btn-sm btn-outline-secondary apply-style-preset" data-preset="modern">Modern</button>
                        <button class="btn btn-sm btn-outline-secondary apply-style-preset" data-preset="noir">Noir</button>
                        <button class="btn btn-sm btn-outline-secondary apply-style-preset" data-preset="cartoon">Cartoon</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render effects tab</summary>
     */
    renderEffectsTab(panel) {
        const effects = panel.effects || [];

        return `
            <div class="panel-effects-editor">
                <!-- Effects List -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6>Visual Effects & Overlays</h6>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-plus"></i> Add Effect
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item add-effect" data-effect-type="motion-lines">Motion Lines</a></li>
                            <li><a class="dropdown-item add-effect" data-effect-type="impact">Impact Effect</a></li>
                            <li><a class="dropdown-item add-effect" data-effect-type="energy">Energy Aura</a></li>
                            <li><a class="dropdown-item add-effect" data-effect-type="particles">Particles</a></li>
                            <li><a class="dropdown-item add-effect" data-effect-type="weather">Weather</a></li>
                            <li><a class="dropdown-item add-effect" data-effect-type="lighting">Lighting</a></li>
                            <li><a class="dropdown-item add-effect" data-effect-type="text-sfx">Text SFX</a></li>
                        </ul>
                    </div>
                </div>

                <div id="cbg-effects-list">
                    ${effects.length === 0 ? `
                        <div class="empty-effects text-center p-3 text-muted">
                            <i class="fas fa-magic fa-2x mb-2"></i>
                            <p class="small mb-0">No effects added yet</p>
                        </div>
                    ` : effects.map((effect, index) => this.renderEffectCard(effect, index)).join('')}
                </div>

                <!-- Effect Library -->
                <div class="effect-library mt-4">
                    <h6>Effect Library</h6>
                    <div class="effect-presets">
                        <div class="row">
                            <div class="col-6">
                                <button class="btn btn-sm btn-outline-secondary w-100 mb-1" data-preset="explosion">💥 Explosion</button>
                                <button class="btn btn-sm btn-outline-secondary w-100 mb-1" data-preset="speed-lines">⚡ Speed Lines</button>
                                <button class="btn btn-sm btn-outline-secondary w-100 mb-1" data-preset="magic-sparkles">✨ Magic</button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-sm btn-outline-secondary w-100 mb-1" data-preset="smoke">💨 Smoke</button>
                                <button class="btn btn-sm btn-outline-secondary w-100 mb-1" data-preset="rain">🌧️ Rain</button>
                                <button class="btn btn-sm btn-outline-secondary w-100 mb-1" data-preset="fire">🔥 Fire</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render effect card</summary>
     */
    renderEffectCard(effect, index) {
        return `
            <div class="effect-card mb-2" data-effect-index="${index}">
                <div class="card">
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <strong class="small">${effect.name || effect.type}</strong>
                                <div class="text-muted" style="font-size: 11px;">${effect.description || 'No description'}</div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger remove-effect" data-effect-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        
                        <div class="effect-controls">
                            <div class="row">
                                <div class="col-6">
                                    <label class="form-label small">X Position:</label>
                                    <input type="range" class="form-range" min="0" max="100" 
                                           value="${effect.x || 50}" data-property="x" data-effect-index="${index}">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small">Y Position:</label>
                                    <input type="range" class="form-range" min="0" max="100" 
                                           value="${effect.y || 50}" data-property="y" data-effect-index="${index}">
                                </div>
                            </div>
                            <div class="row mt-1">
                                <div class="col-6">
                                    <label class="form-label small">Intensity:</label>
                                    <input type="range" class="form-range" min="1" max="10" 
                                           value="${effect.intensity || 5}" data-property="intensity" data-effect-index="${index}">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small">Opacity:</label>
                                    <input type="range" class="form-range" min="0" max="100" 
                                           value="${effect.opacity || 100}" data-property="opacity" data-effect-index="${index}">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render generated images</summary>
     */
    renderGeneratedImages(images) {
        if (!images || images.length === 0) {
            return '<p class="text-muted small">No generated images yet</p>';
        }

        return `
            <div class="generated-images-grid">
                ${images.map((image, index) => `
                    <div class="generated-image-card" data-image-index="${index}">
                        <img src="${image.url}" alt="Generated scene" style="width: 100%; height: auto; border-radius: 4px;">
                        <div class="image-actions mt-1">
                            <button class="btn btn-sm btn-outline-primary use-generated-image" data-image-index="${index}">
                                <i class="fas fa-check"></i> Use This
                            </button>
                            <button class="btn btn-sm btn-outline-secondary refine-generated-image" data-image-index="${index}">
                                <i class="fas fa-sync-alt"></i> Refine
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Mouse event handlers for canvas interaction

    /**
     * <summary>Handle mouse down on canvas</summary>
     */
    handleMouseDown(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / (this.canvasZoom / 100);
        const y = (event.clientY - rect.top) / (this.canvasZoom / 100);

        // Check if clicking on resize handle
        const resizeHandle = event.target.closest('.panel-resize-handle');
        if (resizeHandle) {
            this.isResizing = true;
            this.resizeHandle = resizeHandle.className.split(' ').find(c => ['nw', 'ne', 'sw', 'se'].includes(c));
            this.dragStart = { x, y };
            event.preventDefault();
            return;
        }

        // Check if clicking on panel
        const panel = event.target.closest('.comic-panel');
        if (panel) {
            const panelId = panel.dataset.panelId;
            const currentPage = this.getCurrentPage();
            const panelData = currentPage.panels.find(p => p.id === panelId);

            if (panelData) {
                this.selectPanel(panelData);
                this.isDragging = true;
                this.dragStart = { x: x - panelData.x, y: y - panelData.y };
            }
            event.preventDefault();
            return;
        }

        // Clicking on empty canvas - deselect panel
        this.selectPanel(null);
    }

    /**
     * <summary>Handle mouse move on canvas</summary>
     */
    handleMouseMove(event) {
        if (!this.isDragging && !this.isResizing) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / (this.canvasZoom / 100);
        const y = (event.clientY - rect.top) / (this.canvasZoom / 100);

        if (this.isResizing && this.selectedPanel) {
            this.handlePanelResize(x, y);
        } else if (this.isDragging && this.selectedPanel) {
            this.handlePanelDrag(x, y);
        }

        event.preventDefault();
    }

    /**
     * <summary>Handle mouse up on canvas</summary>
     */
    handleMouseUp(event) {
        if (this.isDragging || this.isResizing) {
            this.saveState(); // Save for undo
            this.renderCanvas(); // Re-render to update
        }

        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    /**
     * <summary>Handle double click on canvas</summary>
     */
    handleDoubleClick(event) {
        const panel = event.target.closest('.comic-panel');
        if (panel) {
            // Open panel editor modal or focus on inspector
            const inspector = document.getElementById('cbg-panel-inspector-content');
            if (inspector) {
                inspector.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Double-click on empty space - add new panel
            this.addPanelAtPosition(event);
        }
    }

    /**
     * <summary>Handle right click context menu</summary>
     */
    handleRightClick(event) {
        event.preventDefault();

        const panel = event.target.closest('.comic-panel');
        if (panel) {
            this.showPanelContextMenu(event, panel);
        } else {
            this.showCanvasContextMenu(event);
        }
    }

    /**
     * <summary>Handle wheel zoom</summary>
     */
    handleWheel(event) {
        if (event.ctrlKey) {
            event.preventDefault();

            const delta = event.deltaY > 0 ? -10 : 10;
            this.setCanvasZoom(this.canvasZoom + delta);
        }
    }

    // Panel manipulation methods

    /**
     * <summary>Handle panel drag</summary>
     */
    handlePanelDrag(x, y) {
        const newX = x - this.dragStart.x;
        const newY = y - this.dragStart.y;

        // Snap to grid if enabled
        const snappedX = this.snapToGrid ? Math.round(newX / this.gridSize) * this.gridSize : newX;
        const snappedY = this.snapToGrid ? Math.round(newY / this.gridSize) * this.gridSize : newY;

        // Constrain to canvas bounds
        const currentPage = this.getCurrentPage();
        const constrainedX = Math.max(0, Math.min(currentPage.width - this.selectedPanel.width, snappedX));
        const constrainedY = Math.max(0, Math.min(currentPage.height - this.selectedPanel.height, snappedY));

        // Update panel position
        this.selectedPanel.x = constrainedX;
        this.selectedPanel.y = constrainedY;

        // Update visual position immediately
        const panelElement = document.querySelector(`[data-panel-id="${this.selectedPanel.id}"]`);
        if (panelElement) {
            panelElement.style.left = `${constrainedX}px`;
            panelElement.style.top = `${constrainedY}px`;
        }
    }

    /**
     * <summary>Handle panel resize</summary>
     */
    handlePanelResize(x, y) {
        const deltaX = x - this.dragStart.x;
        const deltaY = y - this.dragStart.y;
        const currentPage = this.getCurrentPage();

        let newX = this.selectedPanel.x;
        let newY = this.selectedPanel.y;
        let newWidth = this.selectedPanel.width;
        let newHeight = this.selectedPanel.height;

        // Apply resize based on handle
        switch (this.resizeHandle) {
            case 'nw':
                newX += deltaX;
                newY += deltaY;
                newWidth -= deltaX;
                newHeight -= deltaY;
                break;
            case 'ne':
                newY += deltaY;
                newWidth += deltaX;
                newHeight -= deltaY;
                break;
            case 'sw':
                newX += deltaX;
                newWidth -= deltaX;
                newHeight += deltaY;
                break;
            case 'se':
                newWidth += deltaX;
                newHeight += deltaY;
                break;
        }

        // Apply minimum size constraints
        const minSize = 50;
        if (newWidth >= minSize && newHeight >= minSize) {
            // Constrain to canvas bounds
            newX = Math.max(0, Math.min(currentPage.width - newWidth, newX));
            newY = Math.max(0, Math.min(currentPage.height - newHeight, newY));

            // Snap to grid if enabled
            if (this.snapToGrid) {
                newX = Math.round(newX / this.gridSize) * this.gridSize;
                newY = Math.round(newY / this.gridSize) * this.gridSize;
                newWidth = Math.round(newWidth / this.gridSize) * this.gridSize;
                newHeight = Math.round(newHeight / this.gridSize) * this.gridSize;
            }

            // Update panel properties
            this.selectedPanel.x = newX;
            this.selectedPanel.y = newY;
            this.selectedPanel.width = newWidth;
            this.selectedPanel.height = newHeight;

            // Update visual immediately
            const panelElement = document.querySelector(`[data-panel-id="${this.selectedPanel.id}"]`);
            if (panelElement) {
                panelElement.style.left = `${newX}px`;
                panelElement.style.top = `${newY}px`;
                panelElement.style.width = `${newWidth}px`;
                panelElement.style.height = `${newHeight}px`;
            }
        }
    }

    /**
     * <summary>Select panel</summary>
     */
    selectPanel(panel) {
        this.selectedPanel = panel;
        this.renderCanvas();
        this.renderPanelInspector();

        if (panel) {
            this.log(`Selected panel: ${panel.id}`);
        }
    }

    /**
     * <summary>Add new panel</summary>
     */
    addPanel() {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        const newPanel = this.createPanelData();

        // Position new panel in a free space
        const position = this.findFreeSpace(currentPage);
        newPanel.x = position.x;
        newPanel.y = position.y;

        currentPage.panels.push(newPanel);
        this.selectPanel(newPanel);
        this.saveState();

        this.log('Added new panel:', newPanel.id);
    }

    /**
     * <summary>Add panel at specific position</summary>
     */
    addPanelAtPosition(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / (this.canvasZoom / 100);
        const y = (event.clientY - rect.top) / (this.canvasZoom / 100);

        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        const newPanel = this.createPanelData();

        // Snap to grid and constrain to bounds
        newPanel.x = this.snapToGrid ? Math.round(x / this.gridSize) * this.gridSize : x;
        newPanel.y = this.snapToGrid ? Math.round(y / this.gridSize) * this.gridSize : y;

        // Ensure panel fits in canvas
        newPanel.x = Math.max(0, Math.min(currentPage.width - newPanel.width, newPanel.x));
        newPanel.y = Math.max(0, Math.min(currentPage.height - newPanel.height, newPanel.y));

        currentPage.panels.push(newPanel);
        this.selectPanel(newPanel);
        this.saveState();
    }

    /**
     * <summary>Create new panel data</summary>
     */
    createPanelData() {
        const template = this.panelTemplates.get('standard_rect');

        return {
            id: `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            x: 50,
            y: 50,
            width: 200,
            height: 150,
            shape: template.shape,
            borderWidth: template.borderWidth,
            borderStyle: template.borderStyle,
            borderColor: template.borderColor,
            backgroundColor: '#ffffff',
            borderRadius: 0,

            // Content
            sceneSummary: '',
            sceneDescription: '',
            sceneImage: null,
            shotType: 'Medium Shot',
            timeOfDay: 'Midday',
            mood: '',
            previousContext: '',
            nextContext: '',

            // Characters
            characters: [],

            // Dialogue
            dialogues: [],

            // Effects
            effects: [],

            // Generation
            generatedImages: [],

            // Metadata
            createdDate: Date.now(),
            lastModified: Date.now()
        };
    }

    /**
     * <summary>Find free space for new panel</summary>
     */
    findFreeSpace(page) {
        const defaultPosition = { x: 50, y: 50 };
        const panelWidth = 200;
        const panelHeight = 150;
        const margin = 20;

        // Simple algorithm: try positions in a grid pattern
        for (let y = 50; y < page.height - panelHeight; y += panelHeight + margin) {
            for (let x = 50; x < page.width - panelWidth; x += panelWidth + margin) {
                const overlaps = page.panels.some(panel =>
                    x < panel.x + panel.width + margin &&
                    x + panelWidth + margin > panel.x &&
                    y < panel.y + panel.height + margin &&
                    y + panelHeight + margin > panel.y
                );

                if (!overlaps) {
                    return { x, y };
                }
            }
        }

        return defaultPosition;
    }

    /**
     * <summary>Duplicate panel</summary>
     */
    duplicatePanel(panelId) {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        const originalPanel = currentPage.panels.find(p => p.id === panelId);
        if (!originalPanel) return;

        const duplicatePanel = JSON.parse(JSON.stringify(originalPanel));
        duplicatePanel.id = `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        duplicatePanel.x += 20;
        duplicatePanel.y += 20;
        duplicatePanel.createdDate = Date.now();
        duplicatePanel.lastModified = Date.now();

        currentPage.panels.push(duplicatePanel);
        this.selectPanel(duplicatePanel);
        this.saveState();

        this.log('Duplicated panel:', duplicatePanel.id);
    }

    /**
     * <summary>Delete panel</summary>
     */
    deletePanel(panelId) {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        const panelIndex = currentPage.panels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) return;

        if (confirm('Are you sure you want to delete this panel?')) {
            currentPage.panels.splice(panelIndex, 1);

            // Clear selection if deleted panel was selected
            if (this.selectedPanel && this.selectedPanel.id === panelId) {
                this.selectedPanel = null;
            }

            this.saveState();
            this.render();

            this.log('Deleted panel:', panelId);
        }
    }

    // Panel inspector event handlers setup continues in next part...

    /**
     * <summary>Setup panel inspector handlers</summary>
     */
    setupPanelInspectorHandlers() {
        const inspector = document.getElementById('cbg-panel-inspector-content');
        if (!inspector) return;

        // Tab switching
        inspector.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                const tabId = e.target.dataset.tab;
                this.switchInspectorTab(tabId);
            }
        });

        // Panel action buttons
        const duplicateBtn = document.getElementById('cbg-duplicate-panel');
        const deleteBtn = document.getElementById('cbg-delete-panel');

        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', () => {
                if (this.selectedPanel) {
                    this.duplicatePanel(this.selectedPanel.id);
                }
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.selectedPanel) {
                    this.deletePanel(this.selectedPanel.id);
                }
            });
        }

        // Scene tab handlers
        this.setupSceneTabHandlers();

        // Dialogue tab handlers
        this.setupDialogueTabHandlers();

        // Style tab handlers
        this.setupStyleTabHandlers();

        // Effects tab handlers
        this.setupEffectsTabHandlers();
    }

    /**
     * <summary>Setup scene tab handlers</summary>
     */
    setupSceneTabHandlers() {
        // Form field updates
        const sceneFields = [
            'cbg-panel-scene-summary',
            'cbg-panel-shot-type',
            'cbg-panel-time-of-day',
            'cbg-panel-mood',
            'cbg-previous-context',
            'cbg-next-context'
        ];

        sceneFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.updatePanelFromForm();
                });
            }
        });

        // Character management
        const addCharacterBtn = document.getElementById('cbg-add-character-to-scene');
        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => this.showCharacterSelector());
        }

        // Character scene updates
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('character-position') ||
                e.target.classList.contains('character-expression')) {
                this.updateCharacterInScene(e.target.dataset.characterId, e.target);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('character-action')) {
                this.debounce(() => {
                    this.updateCharacterInScene(e.target.dataset.characterId, e.target);
                }, 500);
            }
        });

        // Remove character buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-scene-character')) {
                const characterId = e.target.dataset.characterId;
                this.removeCharacterFromScene(characterId);
            }
        });

        // AI generation buttons
        const generateSceneBtn = document.getElementById('cbg-generate-scene');
        const generateBackgroundBtn = document.getElementById('cbg-generate-background');
        const generateVariationsBtn = document.getElementById('cbg-generate-variations');
        const refineSceneBtn = document.getElementById('cbg-refine-scene');

        if (generateSceneBtn) {
            generateSceneBtn.addEventListener('click', () => this.generateScene());
        }

        if (generateBackgroundBtn) {
            generateBackgroundBtn.addEventListener('click', () => this.generateBackground());
        }

        if (generateVariationsBtn) {
            generateVariationsBtn.addEventListener('click', () => this.generateVariations());
        }

        if (refineSceneBtn) {
            refineSceneBtn.addEventListener('click', () => this.refineScene());
        }

        // Image upload
        const sceneImageUpload = document.getElementById('cbg-scene-image-upload');
        if (sceneImageUpload) {
            sceneImageUpload.addEventListener('change', (e) => {
                this.handleSceneImageUpload(e);
            });
        }

        // Remove scene image
        const removeSceneImageBtn = document.getElementById('cbg-remove-scene-image');
        if (removeSceneImageBtn) {
            removeSceneImageBtn.addEventListener('click', () => {
                this.selectedPanel.sceneImage = null;
                this.updatePanel();
            });
        }
    }

    /**
     * <summary>Setup dialogue tab handlers</summary>
     */
    setupDialogueTabHandlers() {
        // Add dialogue button
        const addDialogueBtn = document.getElementById('cbg-add-dialogue');
        if (addDialogueBtn) {
            addDialogueBtn.addEventListener('click', () => this.addDialogue());
        }

        // Remove dialogue buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-dialogue')) {
                const index = parseInt(e.target.dataset.dialogueIndex);
                this.removeDialogue(index);
            }
        });

        // Dialogue field updates
        document.addEventListener('input', (e) => {
            if (e.target.id && e.target.id.startsWith('cbg-dialogue-')) {
                this.debounce(() => this.updateDialogueFromForm(), 300);
            }
        });

        // AI dialogue tools
        const suggestDialogueBtn = document.getElementById('cbg-suggest-dialogue');
        const improveDialogueBtn = document.getElementById('cbg-improve-dialogue');
        const checkVoiceBtn = document.getElementById('cbg-check-voice-consistency');

        if (suggestDialogueBtn) {
            suggestDialogueBtn.addEventListener('click', () => this.suggestDialogue());
        }

        if (improveDialogueBtn) {
            improveDialogueBtn.addEventListener('click', () => this.improveDialogue());
        }

        if (checkVoiceBtn) {
            checkVoiceBtn.addEventListener('click', () => this.checkVoiceConsistency());
        }
    }

    /**
     * <summary>Setup style tab handlers</summary>
     */
    setupStyleTabHandlers() {
        // Style property updates
        const styleFields = [
            'cbg-panel-border-width',
            'cbg-panel-border-color',
            'cbg-panel-border-style',
            'cbg-panel-bg-color',
            'cbg-panel-border-radius'
        ];

        styleFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.updatePanelStyleFromForm();
                });
            }
        });

        // Shape selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'panelShape') {
                this.selectedPanel.shape = e.target.value;
                this.updatePanel();
                this.renderPanelInspector(); // Re-render to show/hide border radius
            }
        });

        // Effect checkboxes
        const effectCheckboxes = [
            'cbg-panel-shadow',
            'cbg-panel-glow',
            'cbg-panel-vintage'
        ];

        effectCheckboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updatePanelEffectsFromForm();
                });
            }
        });

        // Style presets
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('apply-style-preset')) {
                const preset = e.target.dataset.preset;
                this.applyStylePreset(preset);
            }
        });
    }

    /**
     * <summary>Setup effects tab handlers</summary>
     */
    setupEffectsTabHandlers() {
        // Add effect buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-effect')) {
                const effectType = e.target.dataset.effectType;
                this.addEffect(effectType);
            }
        });

        // Remove effect buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-effect')) {
                const index = parseInt(e.target.dataset.effectIndex);
                this.removeEffect(index);
            }
        });

        // Effect property updates
        document.addEventListener('input', (e) => {
            if (e.target.dataset.effectIndex !== undefined) {
                this.updateEffectProperty(
                    parseInt(e.target.dataset.effectIndex),
                    e.target.dataset.property,
                    e.target.value
                );
            }
        });
    }
    /**
     * <summary>Save all layout data</summary>
     */
    async saveData() {
        try {
            this.log('Saving all layout data...');

            const layoutData = {
                pages: this.pages,
                currentPage: this.currentPage
            };

            // Update project data
            this.main.updateProjectData({ layout: layoutData });

            this.log(`Saved ${this.pages.length} pages`);

        } catch (error) {
            this.handleError('Failed to save layout data', error);
        }
    }

    /**
     * <summary>Load layout data</summary>
     * @param {Object} layoutData - Layout data to load
     */
    loadData(layoutData = {}) {
        try {
            this.log('Loading layout data...');

            if (layoutData.pages && layoutData.pages.length > 0) {
                this.pages = layoutData.pages;
                this.currentPage = layoutData.currentPage || 0;
            } else {
                // Create default page if no data
                this.createDefaultPage();
            }

            // Clear selection
            this.selectedPanel = null;

            this.log(`Loaded ${this.pages.length} pages`);

        } catch (error) {
            this.handleError('Failed to load layout data', error);
            this.createDefaultPage(); // Fallback
        }
    }

    /**
     * <summary>Get all pages</summary>
     * @returns {Array} Array of page data
     */
    getAllPages() {
        return this.pages;
    }

    /**
     * <summary>Apply template to current page</summary>
     * @param {string} templateId - Template ID to apply
     */
    applyTemplate(templateId) {
        this.applyLayoutTemplate(templateId);
    }

    /**
     * <summary>Debounce helper function</summary>
     */
    debounce(func, delay) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(func, delay);
    }

    /**
     * <summary>Debug logging helper</summary>
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:Layout ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     */
    handleError(message, error) {
        console.error(`[CBG:Layout ERROR] ${message}:`, error);

        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        }
    }

    /**
     * <summary>Cleanup resources</summary>
     */
    destroy() {
        this.log('Destroying Layout Manager...');

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        if (this.generationInterval) {
            clearInterval(this.generationInterval);
        }

        // Remove any modal elements
        document.getElementById('characterSelectorModal')?.remove();

        this.panelTemplates.clear();
        this.layoutTemplates.clear();
        this.pages = [];
        this.selectedPanel = null;
        this.undoStack = [];
        this.redoStack = [];
        this.isInitialized = false;

        this.log('Layout Manager destroyed');
    }
}

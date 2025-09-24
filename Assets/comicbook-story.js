/**
 * <summary>Comic Book Generator - Enhanced Story Management Module</summary>
 * Handles comprehensive story development, plot structure, and script writing with character integration
 */

class StoryManager extends BaseManager {
    constructor(main) {
        super(main, 'Story');
        this.main = main;
        this.debug = true;
        this.storyData = null;
        this.activeTab = 'info';
        this.currentPlotPoint = null;
        this.scriptCursorPosition = 0;
        this.storyTemplates = new Map();
        this.plotStructures = new Map();
        this.characterCache = new Map(); // Cache for character data
        this.isInitialized = false;
        this.autoSaveTimer = null;

        this.log('StoryManager constructor called');
    }

    /**
     * <summary>Initialize the story manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Story Manager...');

            this.initializeStoryData();
            this.initializeTemplates();
            this.initializePlotStructures();
            this.setupEventHandlers();
            this.setupAutoSave();
            this.isInitialized = true;

            this.log('Story Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Story Manager', error);
        }
    }

    /**
     * <summary>Initialize default story data structure</summary>
     */
    initializeStoryData() {
        this.storyData = {
            // Story Information
            title: '',
            subtitle: '',
            genre: '',
            subGenres: [],
            targetAudience: '',
            ageRating: 'All Ages',
            themes: [],
            mood: '',
            tone: '',
            estimatedPages: 22,
            publicationFormat: 'Single Issue',
            logline: '',
            synopsis: '',

            // Plot Structure
            plotStructure: 'Three Act',
            plotPoints: [],
            storyBeats: [],
            conflicts: [],
            themes: [],

            // World Building
            setting: {
                timeframe: '',
                locations: [],
                worldRules: '',
                socialSystem: '',
                technology: '',
                culture: '',
                history: ''
            },

            // Script
            script: '',
            scriptFormat: 'Comic Script',
            pages: [],

            // Character Integration
            characterArcs: new Map(),
            characterRelationships: [],
            characterScreenTime: new Map(),

            // Metadata
            createdDate: Date.now(),
            lastModified: Date.now(),
            version: '1.0',
            wordCount: 0,
            pageCount: 0
        };
    }

    /**
     * <summary>Initialize story templates</summary>
     */
    initializeTemplates() {
        const templates = [
            {
                id: 'superhero_origin',
                name: 'Superhero Origin Story',
                genre: 'Superhero',
                description: 'Classic hero\'s journey with powers and responsibility',
                plotPoints: [
                    { act: 1, beat: 'Ordinary World', description: 'Hero in normal life before powers' },
                    { act: 1, beat: 'Inciting Incident', description: 'Event that grants powers or calls to action' },
                    { act: 1, beat: 'Refusal of Call', description: 'Hero hesitates to embrace responsibility' },
                    { act: 2, beat: 'Crossing Threshold', description: 'First use of powers in public' },
                    { act: 2, beat: 'Tests & Allies', description: 'Learning to use powers, meeting supporting characters' },
                    { act: 2, beat: 'Midpoint Crisis', description: 'Major failure or loss due to inexperience' },
                    { act: 2, beat: 'Dark Night', description: 'Hero questions if they\'re worthy of powers' },
                    { act: 3, beat: 'Final Battle', description: 'Confrontation with main villain' },
                    { act: 3, beat: 'Resolution', description: 'Hero accepts role and responsibility' }
                ],
                themes: ['Responsibility', 'Power Corruption', 'Identity', 'Sacrifice'],
                characterRoles: ['Hero', 'Mentor', 'Villain', 'Love Interest', 'Ally']
            },
            {
                id: 'mystery_detective',
                name: 'Mystery/Detective Story',
                genre: 'Mystery',
                description: 'Investigation-driven plot with clues and red herrings',
                plotPoints: [
                    { act: 1, beat: 'Crime/Mystery', description: 'Initial crime or mysterious event' },
                    { act: 1, beat: 'Detective Called', description: 'Protagonist takes the case' },
                    { act: 1, beat: 'Initial Investigation', description: 'First clues and evidence gathering' },
                    { act: 2, beat: 'First Suspect', description: 'Initial theory and suspect identified' },
                    { act: 2, beat: 'Red Herring', description: 'False lead or misdirection' },
                    { act: 2, beat: 'New Evidence', description: 'Discovery that changes everything' },
                    { act: 2, beat: 'Second Victim', description: 'Stakes raised, pattern emerges' },
                    { act: 3, beat: 'Final Clue', description: 'Last piece of puzzle falls into place' },
                    { act: 3, beat: 'Confrontation', description: 'Detective confronts real culprit' }
                ],
                themes: ['Justice', 'Truth', 'Corruption', 'Obsession'],
                characterRoles: ['Detective', 'Suspect', 'Victim', 'Witness', 'Accomplice']
            },
            {
                id: 'romance_love_story',
                name: 'Romance Story',
                genre: 'Romance',
                description: 'Character-driven love story with emotional beats',
                plotPoints: [
                    { act: 1, beat: 'Meet Cute', description: 'Initial meeting between love interests' },
                    { act: 1, beat: 'Attraction', description: 'Mutual interest develops' },
                    { act: 1, beat: 'Obstacle Introduced', description: 'Reason they can\'t be together revealed' },
                    { act: 2, beat: 'Growing Closer', description: 'Relationship develops despite obstacles' },
                    { act: 2, beat: 'First Kiss', description: 'Physical/emotional intimacy increases' },
                    { act: 2, beat: 'Major Conflict', description: 'Big fight or misunderstanding' },
                    { act: 2, beat: 'Separation', description: 'Lovers apart, each grows individually' },
                    { act: 3, beat: 'Grand Gesture', description: 'One makes sacrifice or big romantic gesture' },
                    { act: 3, beat: 'Happy Ending', description: 'Lovers reunited, obstacles overcome' }
                ],
                themes: ['Love Conquers All', 'Personal Growth', 'Sacrifice', 'Communication'],
                characterRoles: ['Love Interest A', 'Love Interest B', 'Rival', 'Best Friend', 'Parent/Authority']
            }
        ];

        templates.forEach(template => {
            this.storyTemplates.set(template.id, template);
        });

        this.log(`Initialized ${templates.length} story templates`);
    }

    /**
     * <summary>Initialize plot structure systems</summary>
     */
    initializePlotStructures() {
        const structures = [
            {
                id: 'three_act',
                name: 'Three Act Structure',
                acts: [
                    { name: 'Act I - Setup', percentage: 25, description: 'Establish world, characters, inciting incident' },
                    { name: 'Act II - Confrontation', percentage: 50, description: 'Rising action, obstacles, character development' },
                    { name: 'Act III - Resolution', percentage: 25, description: 'Climax, resolution, denouement' }
                ]
            },
            {
                id: 'heros_journey',
                name: 'Hero\'s Journey',
                acts: [
                    { name: 'Ordinary World', percentage: 10, description: 'Hero\'s normal life' },
                    { name: 'Call to Adventure', percentage: 15, description: 'Hero called to quest' },
                    { name: 'Crossing Threshold', percentage: 25, description: 'Entering special world' },
                    { name: 'Tests & Trials', percentage: 25, description: 'Facing challenges' },
                    { name: 'Ordeal', percentage: 15, description: 'Greatest fear/most difficult challenge' },
                    { name: 'Return', percentage: 10, description: 'Hero returns transformed' }
                ]
            },
            {
                id: 'save_the_cat',
                name: 'Save the Cat Beat Sheet',
                acts: [
                    { name: 'Opening Image', percentage: 1, description: 'Visual that represents whole story' },
                    { name: 'Setup', percentage: 9, description: 'Introduce hero and world' },
                    { name: 'Theme Stated', percentage: 5, description: 'What story is about' },
                    { name: 'Catalyst', percentage: 12, description: 'Inciting incident' },
                    { name: 'Debate', percentage: 13, description: 'Should hero go?' },
                    { name: 'Break into Two', percentage: 20, description: 'Hero commits to journey' },
                    { name: 'Fun and Games', percentage: 30, description: 'Promise of premise delivered' },
                    { name: 'Midpoint', percentage: 50, description: 'False victory or defeat' },
                    { name: 'All Is Lost', percentage: 75, description: 'Lowest point' },
                    { name: 'Finale', percentage: 90, description: 'Climax and resolution' }
                ]
            }
        ];

        structures.forEach(structure => {
            this.plotStructures.set(structure.id, structure);
        });

        this.log(`Initialized ${structures.length} plot structures`);
    }

    /**
     * <summary>Setup event handlers</summary>
     */
    setupEventHandlers() {
        this.log('Setting up story event handlers...');

        // Save buttons
        this.main.eventManager.on('cbg-script-save', 'click', () => this.saveScript());
        this.main.eventManager.on('cbg-story-draft-llm', 'click', () => this.draftStoryWithAI());
    }

    /**
     * <summary>Setup auto-save functionality</summary>
     */
    setupAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.saveData();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    /**
     * <summary>Render the story management interface</summary>
     */
    async render() {
        try {
            this.log('Rendering story interface...');

            await this.refreshCharacterCache();
            await this.renderStoryTabs();

        } catch (error) {
            this.handleError('Failed to render story interface', error);
        }
    }

    /**
     * <summary>Refresh character data cache</summary>
     */
    async refreshCharacterCache() {
        const characterManager = this.main.getManager('characters');
        if (characterManager) {
            const characters = characterManager.getAllCharacters();
            this.characterCache.clear();

            characters.forEach(char => {
                this.characterCache.set(char.id, char);
            });

            this.log(`Cached ${characters.length} characters for story integration`);
        }
    }

    /**
     * <summary>Render the tabbed story interface</summary>
     */
    async renderStoryTabs() {
        const container = getRequiredElementById('cbg-story-settings-content');

        const html = `
            <div class="story-settings">
                <div class="tab-nav" style="border-bottom: 2px solid var(--border-color); margin-bottom: 1.5rem;">
                    <div class="nav nav-tabs" style="border: none;">
                        <button class="nav-link ${this.activeTab === 'info' ? 'active' : ''}" data-tab="info">
                            <i class="fas fa-info-circle"></i> Story Info
                        </button>
                        <button class="nav-link ${this.activeTab === 'structure' ? 'active' : ''}" data-tab="structure">
                            <i class="fas fa-sitemap"></i> Plot Structure
                        </button>
                        <button class="nav-link ${this.activeTab === 'world' ? 'active' : ''}" data-tab="world">
                            <i class="fas fa-globe"></i> World Building
                        </button>
                        <button class="nav-link ${this.activeTab === 'characters' ? 'active' : ''}" data-tab="characters">
                            <i class="fas fa-users"></i> Character Arcs
                        </button>
                        <button class="nav-link ${this.activeTab === 'analysis' ? 'active' : ''}" data-tab="analysis">
                            <i class="fas fa-chart-line"></i> Story Analysis
                        </button>
                    </div>
                </div>

                <!-- Tab Content -->
                <div class="tab-content">
                    ${await this.renderTabContent(this.activeTab)}
                </div>

                <!-- Global AI Actions -->
                <div class="story-ai-actions" style="margin-top: 2rem; padding: 1rem; background: var(--background-color-soft); border-radius: 0.5rem; border: 1px solid var(--border-color);">
                    <h5 style="margin-bottom: 1rem; color: var(--text-color);">
                        <i class="fas fa-robot"></i> AI Story Development
                    </h5>
                    <div class="d-flex flex-wrap gap-2">
                        <button id="cbg-generate-entire-story" class="btn btn-success">
                            <i class="fas fa-magic"></i> Generate Complete Story
                        </button>
                        <button id="cbg-refine-story-structure" class="btn btn-info">
                            <i class="fas fa-sync-alt"></i> Refine Structure
                        </button>
                        <button id="cbg-sync-character-arcs" class="btn btn-warning">
                            <i class="fas fa-link"></i> Sync Character Arcs
                        </button>
                        <button id="cbg-analyze-story-pacing" class="btn btn-secondary">
                            <i class="fas fa-tachometer-alt"></i> Analyze Pacing
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Setup handlers
        this.setupTabHandlers();
        this.setupGlobalAIHandlers();
    }

    /**
     * <summary>Render content for specific tab</summary>
     * @param {string} tabId - Active tab identifier
     * @returns {string} HTML content for the tab
     */
    async renderTabContent(tabId) {
        switch (tabId) {
            case 'info':
                return this.renderStoryInfoTab();
            case 'structure':
                return this.renderPlotStructureTab();
            case 'world':
                return this.renderWorldBuildingTab();
            case 'characters':
                return this.renderCharacterArcsTab();
            case 'analysis':
                return this.renderStoryAnalysisTab();
            default:
                return '<div>Unknown tab</div>';
        }
    }

    /**
     * <summary>Render Story Info tab</summary>
     */
    renderStoryInfoTab() {
        const story = this.storyData;

        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Basic Story Information</h5>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-ai-generate-story-info">
                        <i class="fas fa-robot"></i> Generate with AI
                    </button>
                </div>
                
                <div class="row">
                    <div class="col-md-8">
                        ${makeTextInput(null, 'cbg-story-title', 'story_title', 'Story Title',
            'Main title of your comic', story.title || '', 'normal', 'Enter your comic title')}
                    </div>
                    <div class="col-md-4">
                        ${makeDropdownInput(null, 'cbg-age-rating', 'age_rating', 'Age Rating',
                'Target age rating',
                ['All Ages', 'Teen', 'Teen+', 'Mature', 'Mature 17+'],
                story.ageRating || 'All Ages')}
                    </div>
                </div>

                ${makeTextInput(null, 'cbg-story-subtitle', 'story_subtitle', 'Subtitle/Tagline',
                    'Subtitle or compelling tagline', story.subtitle || '', 'normal', 'An epic tale of...')}

                <div class="row">
                    <div class="col-md-6">
                        ${makeDropdownInput(null, 'cbg-story-genre', 'story_genre', 'Primary Genre',
                        'Main genre classification',
                        ['Action/Adventure', 'Superhero', 'Fantasy', 'Science Fiction', 'Mystery', 'Horror',
                            'Romance', 'Drama', 'Comedy', 'Slice of Life', 'Historical', 'Western', 'War', 'Crime'],
                        story.genre || 'Action/Adventure')}
                    </div>
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-story-subgenres', 'story_subgenres', 'Sub-genres',
                            'Additional genre elements', (story.subGenres || []).join(', '), 'normal',
                            'Space opera, urban fantasy, noir...')}
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        ${makeDropdownInput(null, 'cbg-target-audience', 'target_audience', 'Target Audience',
                                'Primary audience demographic',
                                ['Children (6-9)', 'Middle Grade (10-13)', 'Young Adult (14-17)',
                                    'New Adult (18-25)', 'Adult (25+)', 'All Ages'],
                                story.targetAudience || 'Young Adult (14-17)')}
                    </div>
                    <div class="col-md-4">
                        ${makeNumberInput(null, 'cbg-estimated-pages', 'estimated_pages', 'Estimated Pages',
                                    'Expected total page count', story.estimatedPages || 22, 1, 1000, 1)}
                    </div>
                    <div class="col-md-4">
                        ${makeDropdownInput(null, 'cbg-publication-format', 'publication_format', 'Format',
                                        'Publication format',
                                        ['Single Issue', 'Mini-Series', 'Ongoing Series', 'Graphic Novel', 'Webcomic', 'Digital First'],
                                        story.publicationFormat || 'Single Issue')}
                    </div>
                </div>

                ${makeTextInput(null, 'cbg-story-logline', 'story_logline', 'Logline',
                                            'One sentence description of your story', story.logline || '', 'big',
                                            'When [character] must [goal], they [obstacle] in order to [stakes]...')}

                ${makeTextInput(null, 'cbg-story-synopsis', 'story_synopsis', 'Synopsis',
                                                'Detailed story summary (2-3 paragraphs)', story.synopsis || '', 'big',
                                                'Provide a detailed summary of your story, including main characters, plot, and resolution...')}

                <div class="row">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-story-themes', 'story_themes', 'Major Themes',
                                                    'Central themes and messages', (story.themes || []).join(', '), 'normal',
                                                    'Good vs evil, coming of age, redemption...')}
                    </div>
                    <div class="col-md-6">
                        ${makeDropdownInput(null, 'cbg-story-tone', 'story_tone', 'Story Tone',
                                                        'Overall emotional tone',
                                                        ['Light/Humorous', 'Adventurous', 'Dramatic', 'Dark/Serious', 'Mysterious',
                                                            'Romantic', 'Satirical', 'Philosophical', 'Gritty', 'Whimsical'],
                                                        story.tone || 'Adventurous')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render Plot Structure tab</summary>
     */
    renderPlotStructureTab() {
        const story = this.storyData;

        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Plot Structure & Story Beats</h5>
                    <div class="d-flex gap-2">
                        <select id="cbg-structure-template" class="form-select form-select-sm" style="width: 200px;">
                            <option value="">Choose Template...</option>
                            ${Array.from(this.storyTemplates.values()).map(template =>
            `<option value="${template.id}">${template.name}</option>`
        ).join('')}
                        </select>
                        <button class="btn btn-sm btn-outline-primary" id="cbg-apply-template">Apply Template</button>
                        <button class="btn btn-sm btn-outline-success" id="cbg-ai-generate-plot">
                            <i class="fas fa-robot"></i> Generate Plot
                        </button>
                    </div>
                </div>

                <!-- Plot Structure Selection -->
                <div class="structure-selection mb-4">
                    <label class="form-label">Plot Structure Framework:</label>
                    <div class="d-flex gap-2 mb-3">
                        ${Array.from(this.plotStructures.values()).map(structure => `
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="plotStructure" 
                                       id="structure_${structure.id}" value="${structure.id}" 
                                       ${story.plotStructure === structure.name ? 'checked' : ''}>
                                <label class="form-check-label" for="structure_${structure.id}">
                                    ${structure.name}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Plot Points Management -->
                <div class="plot-points-section">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6>Plot Points & Story Beats</h6>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary" id="cbg-add-plot-point">
                                <i class="fas fa-plus"></i> Add Plot Point
                            </button>
                            <button class="btn btn-sm btn-outline-info" id="cbg-reorder-plot-points">
                                <i class="fas fa-sort"></i> Reorder
                            </button>
                        </div>
                    </div>
                    
                    <div id="cbg-plot-points-list" class="plot-points-list">
                        ${this.renderPlotPointsList()}
                    </div>
                </div>

                <!-- Conflicts & Tension -->
                <div class="conflicts-section mt-4">
                    <h6>Central Conflicts</h6>
                    <div class="row">
                        <div class="col-md-6">
                            ${makeTextInput(null, 'cbg-external-conflict', 'external_conflict', 'External Conflict',
            'Person vs person, person vs society, etc.', story.externalConflict || '', 'big',
            'Hero must stop villain from destroying the city...')}
                        </div>
                        <div class="col-md-6">
                            ${makeTextInput(null, 'cbg-internal-conflict', 'internal_conflict', 'Internal Conflict',
                'Personal struggles and character growth', story.internalConflict || '', 'big',
                'Hero struggles with self-doubt and fear of failure...')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render plot points list</summary>
     */
    renderPlotPointsList() {
        const plotPoints = this.storyData.plotPoints || [];

        if (plotPoints.length === 0) {
            return `
                <div class="empty-plot-points text-center p-4 text-muted">
                    <i class="fas fa-list-alt fa-2x mb-2"></i>
                    <p>No plot points created yet</p>
                    <p class="small">Add plot points to structure your story</p>
                </div>
            `;
        }

        return plotPoints.map((point, index) => `
            <div class="plot-point-card mb-3" data-point-index="${index}">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="plot-point-header">
                                <h6 class="card-title mb-1">
                                    <span class="plot-point-number badge bg-primary me-2">${index + 1}</span>
                                    ${point.title || 'Untitled Plot Point'}
                                    ${point.act ? `<span class="badge bg-secondary ms-2">Act ${point.act}</span>` : ''}
                                </div>
                                <div class="plot-point-actions">
                                    <button class="btn btn-sm btn-outline-primary edit-plot-point" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-success ai-enhance-point" title="AI Enhance">
                                        <i class="fas fa-robot"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-plot-point" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <p class="card-text">${point.description || 'No description yet...'}</p>
                        
                        ${point.charactersInvolved && point.charactersInvolved.length > 0 ? `
                            <div class="characters-involved mt-2">
                                <small class="text-muted">Characters: </small>
                                ${point.charactersInvolved.map(charId => {
            const char = this.characterCache.get(charId);
            return char ? `
                                        <span class="badge bg-info me-1" title="${char.role}">
                                            ${char.name}
                                        </span>
                                    ` : `<span class="badge bg-secondary me-1">Unknown Character</span>`;
        }).join('')}
                            </div>
                        ` : ''}
                        
                        ${point.pageEstimate ? `
                            <div class="mt-2">
                                <small class="text-muted">Estimated pages: <strong>${point.pageEstimate}</strong></small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * <summary>Render World Building tab</summary>
     */
    renderWorldBuildingTab() {
        const setting = this.storyData.setting || {};

        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>World Building & Setting</h5>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-ai-generate-world">
                        <i class="fas fa-robot"></i> Generate World Details
                    </button>
                </div>

                <!-- Time & Place -->
                <div class="row mb-3">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-timeframe', 'timeframe', 'Time Period',
            'When does your story take place?', setting.timeframe || '', 'normal',
            'Present day, Medieval, Far future, 1920s...')}
                    </div>
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-primary-location', 'primary_location', 'Primary Setting',
                'Main location where story takes place', setting.primaryLocation || '', 'normal',
                'New York City, Fantasy realm, Space station...')}
                    </div>
                </div>

                <!-- World Rules & Physics -->
                ${makeTextInput(null, 'cbg-world-rules', 'world_rules', 'World Rules & Physics',
                    'How does your world work? Magic systems, technology, natural laws', setting.worldRules || '', 'big',
                    'Magic exists but requires sacrifice, Technology has evolved beyond recognition, Gravity works differently...')}

                <!-- Locations -->
                <div class="locations-section mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6>Important Locations</h6>
                        <button class="btn btn-sm btn-outline-primary" id="cbg-add-location">
                            <i class="fas fa-plus"></i> Add Location
                        </button>
                    </div>
                    
                    <div id="cbg-locations-list">
                        ${this.renderLocationsList()}
                    </div>
                </div>

                <!-- Society & Culture -->
                <div class="row">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-social-system', 'social_system', 'Social System',
                        'Government, class structure, social norms', setting.socialSystem || '', 'big',
                        'Democratic republic, Feudal kingdom, Corporate oligarchy...')}
                    </div>
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-culture', 'culture', 'Culture & Customs',
                            'Beliefs, traditions, daily life', setting.culture || '', 'big',
                            'Honor-based society, Tech-worship culture, Artist communes...')}
                    </div>
                </div>

                ${makeTextInput(null, 'cbg-technology-level', 'technology_level', 'Technology Level',
                                'Available technology and its impact on society', setting.technology || '', 'big',
                                'Steam-powered machinery, Advanced AI, Magic-tech hybrid...')}

                ${makeTextInput(null, 'cbg-world-history', 'world_history', 'Relevant History',
                                    'Important historical events that shape the current world', setting.history || '', 'big',
                                    'The Great War changed everything, Ancient civilization left ruins, Recent discovery of magic...')}
            </div>
        `;
    }

    /**
     * <summary>Render locations list</summary>
     */
    renderLocationsList() {
        const locations = this.storyData.setting?.locations || [];

        if (locations.length === 0) {
            return `
                <div class="empty-locations text-center p-3 text-muted">
                    <i class="fas fa-map-marker-alt fa-2x mb-2"></i>
                    <p>No locations added yet</p>
                </div>
            `;
        }

        return locations.map((location, index) => `
            <div class="location-card mb-2" data-location-index="${index}">
                <div class="card card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${location.name || 'Unnamed Location'}</h6>
                            <p class="text-muted small mb-0">${location.description || 'No description'}</p>
                            ${location.significance ? `<p class="small mb-0"><strong>Significance:</strong> ${location.significance}</p>` : ''}
                        </div>
                        <div class="location-actions">
                            <button class="btn btn-sm btn-outline-primary edit-location">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-location">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * <summary>Render Character Arcs tab</summary>
     */
    renderCharacterArcsTab() {
        const characters = Array.from(this.characterCache.values());

        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Character Arc Integration</h5>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-success" id="cbg-sync-all-character-arcs">
                            <i class="fas fa-sync-alt"></i> Sync All Character Arcs
                        </button>
                        <button class="btn btn-sm btn-outline-info" id="cbg-analyze-character-screen-time">
                            <i class="fas fa-chart-pie"></i> Analyze Screen Time
                        </button>
                    </div>
                </div>

                ${characters.length === 0 ? `
                    <div class="empty-characters text-center p-4 text-muted">
                        <i class="fas fa-users fa-3x mb-3"></i>
                        <h6>No Characters Created</h6>
                        <p>Create characters in Character Mode first, then return here to integrate them into your story.</p>
                        <button class="btn btn-primary" onclick="document.getElementById('characters_mode').click()">
                            Go to Character Mode
                        </button>
                    </div>
                ` : `
                    <!-- Character Arc Cards -->
                    <div class="character-arcs-grid">
                        ${characters.map(character => this.renderCharacterArcCard(character)).join('')}
                    </div>

                    <!-- Character Relationships Mapping -->
                    <div class="relationships-section mt-4">
                        <h6>Character Relationships</h6>
                        <div class="relationship-matrix">
                            ${this.renderRelationshipMatrix(characters)}
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    /**
     * <summary>Render character arc card</summary>
     */
    renderCharacterArcCard(character) {
        const arcData = this.storyData.characterArcs?.get?.(character.id) || {};
        const screenTime = this.storyData.characterScreenTime?.get?.(character.id) || 0;

        return `
            <div class="character-arc-card mb-3" data-character-id="${character.id}">
                <div class="card">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <div class="character-avatar me-2" style="width: 32px; height: 32px; border-radius: 50%; background: ${this.getRoleColor(character.role)}20; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${this.getRoleColor(character.role)};">
                                ${character.name ? character.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <h6 class="mb-0">${character.name || 'Unnamed Character'}</h6>
                                <small class="text-muted">${character.role || 'Unknown Role'}</small>
                            </div>
                        </div>
                        <div class="character-controls">
                            <span class="badge bg-info me-2" title="Screen Time">${screenTime}% screen time</span>
                            <button class="btn btn-sm btn-outline-primary" title="View Character Details" onclick="this.viewCharacterDetails('${character.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- Character Goals in This Story -->
                        <div class="mb-3">
                            <label class="form-label small">Story Goals:</label>
                            <textarea class="form-control form-control-sm character-story-goals" 
                                      data-character-id="${character.id}"
                                      placeholder="What does this character want to achieve in this story?"
                                      rows="2">${arcData.storyGoals || character.goals || ''}</textarea>
                        </div>

                        <!-- Character Arc Progression -->
                        <div class="mb-3">
                            <label class="form-label small">Arc Progression:</label>
                            <div class="arc-stages">
                                ${['Beginning', 'Middle', 'End'].map(stage => `
                                    <div class="arc-stage mb-2">
                                        <div class="d-flex align-items-center mb-1">
                                            <span class="badge bg-secondary me-2">${stage}</span>
                                            <small class="text-muted">Character state</small>
                                        </div>
                                        <input type="text" class="form-control form-control-sm arc-stage-input" 
                                               data-character-id="${character.id}" data-stage="${stage.toLowerCase()}"
                                               placeholder="How is the character at this point?"
                                               value="${arcData[stage.toLowerCase() + 'State'] || ''}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Key Character Moments -->
                        <div class="mb-3">
                            <label class="form-label small">Key Story Moments:</label>
                            <textarea class="form-control form-control-sm character-key-moments"
                                      data-character-id="${character.id}"
                                      placeholder="Important scenes/moments for this character"
                                      rows="2">${arcData.keyMoments || ''}</textarea>
                        </div>

                        <!-- Character Conflicts -->
                        <div class="row">
                            <div class="col-6">
                                <label class="form-label small">Internal Conflict:</label>
                                <input type="text" class="form-control form-control-sm character-internal-conflict"
                                       data-character-id="${character.id}"
                                       placeholder="Personal struggle"
                                       value="${arcData.internalConflict || character.conflicts || ''}">
                            </div>
                            <div class="col-6">
                                <label class="form-label small">External Conflict:</label>
                                <input type="text" class="form-control form-control-sm character-external-conflict"
                                       data-character-id="${character.id}"
                                       placeholder="Outside obstacles"
                                       value="${arcData.externalConflict || ''}">
                            </div>
                        </div>

                        <!-- Quick Character Reference -->
                        <div class="character-quick-ref mt-3 p-2 bg-light rounded">
                            <small class="text-muted d-block mb-1">Quick Reference:</small>
                            <small><strong>Personality:</strong> ${character.personality ? character.personality.substring(0, 100) + (character.personality.length > 100 ? '...' : '') : 'Not defined'}</small><br>
                            <small><strong>Motivations:</strong> ${character.motivations || 'Not defined'}</small><br>
                            <small><strong>Flaws:</strong> ${character.flaws || 'Not defined'}</small>
                        </div>

                        <!-- AI Actions for Character -->
                        <div class="character-ai-actions mt-3">
                            <div class="d-flex gap-1 flex-wrap">
                                <button class="btn btn-sm btn-outline-success ai-develop-arc" data-character-id="${character.id}">
                                    <i class="fas fa-robot"></i> Develop Arc
                                </button>
                                <button class="btn btn-sm btn-outline-info ai-suggest-moments" data-character-id="${character.id}">
                                    <i class="fas fa-lightbulb"></i> Suggest Moments
                                </button>
                                <button class="btn btn-sm btn-outline-warning ai-check-consistency" data-character-id="${character.id}">
                                    <i class="fas fa-check-circle"></i> Check Consistency
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render relationship matrix</summary>
     */
    renderRelationshipMatrix(characters) {
        if (characters.length < 2) {
            return '<p class="text-muted">Need at least 2 characters to show relationships</p>';
        }

        let html = '<div class="relationship-grid" style="display: grid; gap: 0.5rem; grid-template-columns: auto repeat(' + characters.length + ', 1fr);">';

        // Header row
        html += '<div></div>'; // Empty corner
        characters.forEach(char => {
            html += `<div class="text-center small" style="writing-mode: vertical-lr; text-orientation: mixed;">
                        ${(char.name || 'Unknown').substring(0, 10)}
                     </div>`;
        });

        // Data rows
        characters.forEach((char1, i) => {
            // Row header
            html += `<div class="small text-end pe-2">${(char1.name || 'Unknown').substring(0, 10)}</div>`;

            // Relationship cells
            characters.forEach((char2, j) => {
                if (i === j) {
                    html += '<div class="bg-secondary" style="height: 30px;"></div>';
                } else {
                    const relationship = this.getCharacterRelationship(char1.id, char2.id);
                    const color = this.getRelationshipColor(relationship);
                    html += `<div class="relationship-cell" 
                                  style="height: 30px; background: ${color}; cursor: pointer; border: 1px solid #ddd;"
                                  data-char1="${char1.id}" data-char2="${char2.id}"
                                  title="${char1.name} → ${char2.name}: ${relationship || 'Undefined'}"
                                  onclick="this.editRelationship('${char1.id}', '${char2.id}')">
                             </div>`;
                }
            });
        });

        html += '</div>';

        // Legend
        html += `
            <div class="relationship-legend mt-2">
                <small class="text-muted">
                    <span class="badge me-1" style="background: #dc3545;">Enemy</span>
                    <span class="badge me-1" style="background: #fd7e14;">Rival</span>
                    <span class="badge me-1" style="background: #6c757d;">Neutral</span>
                    <span class="badge me-1" style="background: #198754;">Ally</span>
                    <span class="badge me-1" style="background: #e83e8c;">Romance</span>
                </small>
            </div>
        `;

        return html;
    }

    /**
     * <summary>Render Story Analysis tab</summary>
     */
    renderStoryAnalysisTab() {
        const stats = this.calculateStoryStats();

        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Story Analysis & Statistics</h5>
                    <button class="btn btn-sm btn-outline-info" id="cbg-refresh-analysis">
                        <i class="fas fa-sync-alt"></i> Refresh Analysis
                    </button>
                </div>

                <!-- Story Overview Stats -->
                <div class="stats-overview row mb-4">
                    <div class="col-md-3">
                        <div class="stat-card text-center p-3 border rounded">
                            <h3 class="text-primary">${stats.plotPoints}</h3>
                            <small class="text-muted">Plot Points</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card text-center p-3 border rounded">
                            <h3 class="text-info">${stats.characters}</h3>
                            <small class="text-muted">Characters</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card text-center p-3 border rounded">
                            <h3 class="text-success">${stats.wordCount}</h3>
                            <small class="text-muted">Words</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card text-center p-3 border rounded">
                            <h3 class="text-warning">${stats.estimatedPages}</h3>
                            <small class="text-muted">Est. Pages</small>
                        </div>
                    </div>
                </div>

                <!-- Story Structure Analysis -->
                <div class="structure-analysis mb-4">
                    <h6>Plot Structure Analysis</h6>
                    <div class="structure-visual p-3 border rounded">
                        ${this.renderStructureVisualization()}
                    </div>
                </div>

                <!-- Character Screen Time -->
                <div class="screen-time-analysis mb-4">
                    <h6>Character Screen Time Distribution</h6>
                    <div class="screen-time-chart">
                        ${this.renderScreenTimeChart()}
                    </div>
                </div>

                <!-- Pacing Analysis -->
                <div class="pacing-analysis mb-4">
                    <h6>Story Pacing Analysis</h6>
                    <div class="pacing-chart p-3 border rounded">
                        ${this.renderPacingAnalysis()}
                    </div>
                </div>

                <!-- Story Health Check -->
                <div class="story-health-check">
                    <h6>Story Health Check</h6>
                    <div class="health-checks">
                        ${this.renderHealthChecks()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render script editor interface</summary>
     */
    async renderScriptEditor() {
        const container = document.getElementById('cbg-story-script-content');
        if (!container) {
            throw new Error('Script editor container not found');
        }

        const script = this.storyData.script || '';
        const wordCount = this.countWords(script);
        const pageEstimate = Math.ceil(wordCount / 250); // Rough estimate

        let html = `
            <div class="script-editor-wrapper">
                <!-- Script Toolbar -->
                <div class="script-toolbar mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="script-stats">
                            <span class="text-muted">Words: <strong>${wordCount}</strong></span>
                            <span class="text-muted ms-3">Estimated Pages: <strong>${pageEstimate}</strong></span>
                            <span class="text-muted ms-3">Format: <strong>${this.storyData.scriptFormat || 'Comic Script'}</strong></span>
                        </div>
                        <div class="script-tools">
                            <div class="btn-group btn-group-sm me-2">
                                <button class="btn btn-outline-secondary" id="cbg-format-panel" title="Insert Panel">
                                    Panel
                                </button>
                                <button class="btn btn-outline-secondary" id="cbg-format-dialogue" title="Insert Dialogue">
                                    Dialogue
                                </button>
                                <button class="btn btn-outline-secondary" id="cbg-format-caption" title="Insert Caption">
                                    Caption
                                </button>
                                <button class="btn btn-outline-secondary" id="cbg-format-sfx" title="Insert SFX">
                                    SFX
                                </button>
                            </div>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-info" id="cbg-auto-format" title="Auto Format Script">
                                    <i class="fas fa-magic"></i> Format
                                </button>
                                <button class="btn btn-outline-success" id="cbg-ai-enhance-script" title="AI Enhance Script">
                                    <i class="fas fa-robot"></i> Enhance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Character Quick Reference -->
                <div class="character-reference mb-3">
                    <div class="d-flex align-items-center mb-2">
                        <h6 class="mb-0 me-3">Character Quick Reference:</h6>
                        <button class="btn btn-sm btn-outline-secondary" id="cbg-toggle-char-ref">
                            <i class="fas fa-users"></i> Show/Hide Characters
                        </button>
                    </div>
                    <div id="cbg-character-reference-panel" class="character-ref-panel" style="display: none;">
                        ${this.renderCharacterReference()}
                    </div>
                </div>

                <!-- Script Editor -->
                <div class="script-editor-container">
                    <textarea id="cbg-script-editor" class="script-textarea form-control" 
                              placeholder="Write your comic script here...

Example format:
PAGE 1

PANEL 1 - WIDE SHOT
DESCRIPTION: Superman hovers above the city skyline at sunset.
SUPERMAN: Another day saved, but the work is never done.

PANEL 2 - CLOSE-UP  
DESCRIPTION: Close-up of Superman's determined expression.
CAPTION: But deep down, Clark knows something darker is coming.

PANEL 3 - ESTABLISHING SHOT
DESCRIPTION: The Daily Planet building bustling with activity.
SFX: RING RING
LOIS: Clark! Where have you been?"
                              style="height: 500px; font-family: 'Courier New', monospace; line-height: 1.5;">${script}</textarea>
                </div>

                <!-- Script Actions -->
                <div class="script-actions mt-3">
                    <div class="d-flex justify-content-between">
                        <div class="script-export">
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-secondary" id="cbg-export-pdf">
                                    <i class="fas fa-file-pdf"></i> Export PDF
                                </button>
                                <button class="btn btn-outline-secondary" id="cbg-export-word">
                                    <i class="fas fa-file-word"></i> Export Word
                                </button>
                                <button class="btn btn-outline-secondary" id="cbg-import-script">
                                    <i class="fas fa-file-import"></i> Import Script
                                </button>
                            </div>
                        </div>
                        <div class="script-ai-tools">
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-success" id="cbg-ai-continue-script">
                                    <i class="fas fa-forward"></i> AI Continue
                                </button>
                                <button class="btn btn-outline-info" id="cbg-ai-improve-dialogue">
                                    <i class="fas fa-comments"></i> Improve Dialogue
                                </button>
                                <button class="btn btn-outline-warning" id="cbg-ai-add-descriptions">
                                    <i class="fas fa-eye"></i> Add Descriptions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Setup script editor handlers
        this.setupScriptEditorHandlers();
    }

    /**
     * <summary>Render character reference panel</summary>
     */
    renderCharacterReference() {
        const characters = Array.from(this.characterCache.values());

        if (characters.length === 0) {
            return '<p class="text-muted small">No characters created yet</p>';
        }

        return `
            <div class="character-ref-cards d-flex flex-wrap gap-2">
                ${characters.map(char => `
                    <div class="character-ref-card border rounded p-2" style="min-width: 200px; max-width: 250px;">
                        <div class="d-flex align-items-center mb-1">
                            <strong>${char.name || 'Unnamed'}</strong>
                            <span class="badge bg-secondary ms-2">${char.role || 'Unknown'}</span>
                        </div>
                        <div class="small text-muted">
                            ${char.personality ? `<div><strong>Voice:</strong> ${char.personality.substring(0, 50)}${char.personality.length > 50 ? '...' : ''}</div>` : ''}
                            ${char.catchphrases ? `<div><strong>Catchphrase:</strong> "${char.catchphrases.split(',')[0].trim()}"</div>` : ''}
                            ${char.speechPattern ? `<div><strong>Speech:</strong> ${char.speechPattern.substring(0, 50)}${char.speechPattern.length > 50 ? '...' : ''}</div>` : ''}
                        </div>
                        <button class="btn btn-sm btn-outline-primary mt-1 insert-character-name" 
                                data-character-name="${char.name}" 
                                title="Insert character name in script">
                            <i class="fas fa-plus"></i> Insert
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Helper methods for rendering analysis components

    /**
     * <summary>Calculate story statistics</summary>
     */
    calculateStoryStats() {
        const plotPoints = this.storyData.plotPoints?.length || 0;
        const characters = this.characterCache.size;
        const wordCount = this.countWords(this.storyData.script || '');
        const estimatedPages = this.storyData.estimatedPages || Math.ceil(wordCount / 250);

        return {
            plotPoints,
            characters,
            wordCount,
            estimatedPages
        };
    }

    /**
     * <summary>Count words in text</summary>
     */
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * <summary>Get character relationship</summary>
     */
    getCharacterRelationship(char1Id, char2Id) {
        // This would lookup stored relationship data
        return 'Neutral'; // Placeholder
    }

    /**
     * <summary>Get relationship color for visualization</summary>
     */
    getRelationshipColor(relationship) {
        const colors = {
            'Enemy': '#dc3545',
            'Rival': '#fd7e14',
            'Neutral': '#6c757d',
            'Ally': '#198754',
            'Romance': '#e83e8c'
        };
        return colors[relationship] || '#6c757d';
    }

    /**
     * <summary>Get role color</summary>
     */
    getRoleColor(role) {
        const colors = {
            'Protagonist': '#28a745',
            'Antagonist': '#dc3545',
            'Supporting': '#007bff',
            'Background': '#6c757d'
        };
        return colors[role] || '#6c757d';
    }

    /**
     * <summary>Render structure visualization</summary>
     */
    renderStructureVisualization() {
        // Placeholder for structure visualization
        return '<p class="text-muted">Structure visualization chart would go here</p>';
    }

    /**
     * <summary>Render screen time chart</summary>
     */
    renderScreenTimeChart() {
        // Placeholder for screen time chart
        return '<p class="text-muted">Character screen time chart would go here</p>';
    }

    /**
     * <summary>Render pacing analysis</summary>
     */
    renderPacingAnalysis() {
        // Placeholder for pacing analysis
        return '<p class="text-muted">Pacing analysis chart would go here</p>';
    }

    /**
     * <summary>Render health checks</summary>
     */
    renderHealthChecks() {
        const checks = [
            { name: 'Clear protagonist', status: this.hasProtagonist() },
            { name: 'Central conflict defined', status: this.hasCentralConflict() },
            { name: 'Character arcs present', status: this.hasCharacterArcs() },
            { name: 'Adequate plot points', status: this.hasAdequatePlotPoints() }
        ];

        return checks.map(check => `
            <div class="health-check-item d-flex align-items-center mb-2">
                <i class="fas fa-${check.status ? 'check-circle text-success' : 'times-circle text-danger'} me-2"></i>
                <span class="${check.status ? 'text-success' : 'text-danger'}">${check.name}</span>
            </div>
        `).join('');
    }

    // Health check helper methods
    hasProtagonist() {
        return Array.from(this.characterCache.values()).some(char => char.role === 'Protagonist');
    }

    hasCentralConflict() {
        return this.storyData.externalConflict || this.storyData.internalConflict;
    }

    hasCharacterArcs() {
        return this.storyData.characterArcs && this.storyData.characterArcs.size > 0;
    }

    hasAdequatePlotPoints() {
        return this.storyData.plotPoints && this.storyData.plotPoints.length >= 5;
    }

    /**
     * <summary>Setup tab handlers</summary>
     */
    setupTabHandlers() {
        const tabNav = document.querySelector('.tab-nav');
        if (!tabNav) return;

        tabNav.addEventListener('click', async (e) => {
            const tabBtn = e.target.closest('.nav-link');
            if (!tabBtn) return;

            const newTab = tabBtn.dataset.tab;
            if (newTab === this.activeTab) return;

            // Save current tab data
            this.saveCurrentTabData();

            // Update active tab
            document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
            tabBtn.classList.add('active');

            this.activeTab = newTab;

            // Render new tab content
            const tabContent = document.querySelector('.tab-content');
            if (tabContent) {
                tabContent.innerHTML = await this.renderTabContent(newTab);

                // Enable SwarmUI enhancements
                if (typeof enableSlidersIn === 'function') {
                    enableSlidersIn(tabContent);
                }

                // Setup form handlers
                this.setupFormFieldHandlers();
                this.setupTabSpecificHandlers(newTab);
            }
        });
    }

    /**
     * <summary>Setup global AI handlers</summary>
     */
    setupGlobalAIHandlers() {
        const generateBtn = document.getElementById('cbg-generate-entire-story');
        const refineBtn = document.getElementById('cbg-refine-story-structure');
        const syncBtn = document.getElementById('cbg-sync-character-arcs');
        const analyzeBtn = document.getElementById('cbg-analyze-story-pacing');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateEntireStory());
        }

        if (refineBtn) {
            refineBtn.addEventListener('click', () => this.refineStoryStructure());
        }

        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncCharacterArcs());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeStoryPacing());
        }
    }

    /**
     * <summary>Setup form field handlers</summary>
     */
    setupFormFieldHandlers() {
        const tabContent = document.querySelector('.tab-content');
        if (!tabContent) return;

        // Auto-save on form changes
        const inputs = tabContent.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateStoryFromForm();
            });

            // Real-time updates for text fields
            if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    this.debounce('story_form_update', () => this.updateStoryFromForm(), 500);
                });
            }
        });
    }

    /**
     * <summary>Save script</summary>
     */
    async saveScript() {
        try {
            this.log('Saving script...');

            const scriptEditor = document.getElementById('cbg-script-editor');
            if (scriptEditor) {
                this.storyData.script = scriptEditor.value;
            }

            await this.saveData();

            // Update UI feedback
            const saveBtn = document.getElementById('cbg-script-save');
            if (saveBtn) {
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                saveBtn.classList.add('btn-success');
                saveBtn.classList.remove('btn-primary');

                setTimeout(() => {
                    saveBtn.innerHTML = originalText;
                    saveBtn.classList.add('btn-primary');
                    saveBtn.classList.remove('btn-success');
                }, 1500);
            }

        } catch (error) {
            this.handleError('Failed to save script', error);
        }
    }

    /**
     * <summary>Save all story data</summary>
     */
    async saveData() {
        try {
            this.log('Saving all story data...');

            this.saveCurrentTabData();

            // Update project data
            this.main.updateProjectData({ story: this.storyData });

            this.log('Story data saved successfully');

        } catch (error) {
            this.handleError('Failed to save story data', error);
        }
    }

    /**
     * <summary>Load story data</summary>
     * @param {Object} storyData - Story data to load
     */
    loadData(storyData = {}) {
        try {
            this.log('Loading story data...');

            if (Object.keys(storyData).length > 0) {
                this.storyData = { ...this.storyData, ...storyData };
            } else {
                this.initializeStoryData();
            }

            this.activeTab = 'info';

            this.log('Story data loaded successfully');

        } catch (error) {
            this.handleError('Failed to load story data', error);
        }
    }

    /**
     * <summary>Get story data</summary>
     */
    getStoryData() {
        return this.storyData;
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
            console.log(`[CBG:Story ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     */
    handleError(message, error) {
        console.error(`[CBG:Story ERROR] ${message}:`, error);

        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        }
    }

    /**
     * <summary>Cleanup resources</summary>
     */
    destroy() {
        this.log('Destroying Story Manager...');

        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.storyTemplates.clear();
        this.plotStructures.clear();
        this.characterCache.clear();
        this.storyData = null;
        this.isInitialized = false;

        this.log('Story Manager destroyed');
    }
}

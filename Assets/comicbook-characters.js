/**
 * <summary>Comic Book Generator - Enhanced Character Management Module</summary>
 * Handles comprehensive character creation, editing, and management
 */

class CharacterManager extends BaseManager {
    constructor(main) {
        super(main, 'Characters');
        this.main = main;
        this.debug = true;
        this.characters = new Map();
        this.selectedCharacter = null;
        this.activeTab = 'basic';
        this.searchTerm = '';
        this.roleFilter = 'all';
        this.isInitialized = false;
        this.characterTemplates = new Map();

        this.log('CharacterManager constructor called');
    }

    /**
     * <summary>Initialize the character manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Character Manager...');

            this.initializeCharacterTemplates();
            this.setupEventHandlers();
            this.isInitialized = true;

            this.log('Character Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Character Manager', error);
        }
    }

    /**
     * <summary>Initialize character templates/archetypes</summary>
     */
    initializeCharacterTemplates() {
        const templates = [
            {
                id: 'hero_template',
                name: 'Classic Hero',
                role: 'Protagonist',
                description: 'Traditional heroic character with noble goals',
                data: {
                    personality: 'Brave, determined, compassionate, with a strong moral compass',
                    motivations: 'Protect others, fight injustice, prove themselves worthy',
                    strengths: 'Courage, leadership, resilience, empathy',
                    flaws: 'Sometimes too trusting, can be self-sacrificing to a fault',
                    characterArc: 'Learns to balance personal desires with greater responsibility'
                }
            },
            {
                id: 'antihero_template',
                name: 'Antihero',
                role: 'Protagonist',
                description: 'Morally complex protagonist with questionable methods',
                data: {
                    personality: 'Cynical, pragmatic, haunted by past mistakes',
                    motivations: 'Redemption, survival, protecting loved ones',
                    strengths: 'Street smart, resourceful, experienced',
                    flaws: 'Trust issues, prone to violence, guilt-ridden',
                    characterArc: 'Finds redemption through helping others'
                }
            },
            {
                id: 'villain_template',
                name: 'Classic Villain',
                role: 'Antagonist',
                description: 'Compelling antagonist with understandable motives',
                data: {
                    personality: 'Charismatic, intelligent, believes ends justify means',
                    motivations: 'Power, revenge, twisted sense of justice',
                    strengths: 'Intelligence, charisma, resources, planning',
                    flaws: 'Arrogance, obsession, inability to compromise',
                    characterArc: 'Escalates conflict until ultimate confrontation'
                }
            },
            {
                id: 'mentor_template',
                name: 'Wise Mentor',
                role: 'Supporting',
                description: 'Guide who helps the protagonist grow',
                data: {
                    personality: 'Wise, patient, experienced, sometimes mysterious',
                    motivations: 'Pass on knowledge, see student succeed',
                    strengths: 'Wisdom, experience, magical/special abilities',
                    flaws: 'Sometimes cryptic, may have dark past',
                    characterArc: 'Guides hero then steps back or makes sacrifice'
                }
            }
        ];

        templates.forEach(template => {
            this.characterTemplates.set(template.id, template);
        });

        this.log(`Initialized ${templates.length} character templates`);
    }

    /**
     * <summary>Setup event handlers for character management</summary>
     */
    setupEventHandlers() {
        this.log('Setting up character event handlers...');

        // Add character button
        this.main.eventManager.on('cbg-add-character', 'click', () => this.showCharacterCreationModal());

        // Save character button
        this.main.eventManager.on('cbg-save-character', 'click', () => this.saveCurrentCharacter());

        // Search and filter handlers will be set up after rendering
    }

    /**
     * <summary>Render the character management interface</summary>
     */
    async render() {
        try {
            this.log('Rendering character interface...');

            await this.renderCharacterLibrary();
            await this.renderCharacterEditor();

        } catch (error) {
            this.handleError('Failed to render character interface', error);
        }
    }

    /**
     * <summary>Render the enhanced character library</summary>
     */
    async renderCharacterLibrary() {
        const container = getRequiredElementById('cbg-character-cards');
        // Update the library section to include search and filters
        const librarySection = container.closest('.character-library-area');
        if (librarySection) {
            // Add search and filter controls
            let controlsHtml = `
                <div class="character-library-controls" style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <div class="flex-grow-1" style="min-width: 200px;">
                            <input type="text" id="cbg-character-search" class="form-control form-control-sm" 
                                   placeholder="Search characters..." value="${this.searchTerm}">
                        </div>
                        <select id="cbg-role-filter" class="form-select form-select-sm" style="width: auto;">
                            <option value="all">All Roles</option>
                            <option value="Protagonist" ${this.roleFilter === 'Protagonist' ? 'selected' : ''}>Protagonists</option>
                            <option value="Antagonist" ${this.roleFilter === 'Antagonist' ? 'selected' : ''}>Antagonists</option>
                            <option value="Supporting" ${this.roleFilter === 'Supporting' ? 'selected' : ''}>Supporting</option>
                            <option value="Background" ${this.roleFilter === 'Background' ? 'selected' : ''}>Background</option>
                        </select>
                        <button id="cbg-character-import" class="btn btn-outline-secondary btn-sm">Import</button>
                        <button id="cbg-character-export" class="btn btn-outline-secondary btn-sm">Export</button>
                    </div>
                    <div class="character-stats" style="font-size: 0.85rem; color: var(--text-color-soft);">
                        ${this.getFilteredCharacters().length} of ${this.characters.size} characters
                        ${this.characters.size > 0 ? `• ${this.getCharacterRoleStats()}` : ''}
                    </div>
                </div>
            `;

            // Check if controls already exist
            let controlsContainer = librarySection.querySelector('.character-library-controls');
            if (!controlsContainer) {
                librarySection.insertAdjacentHTML('afterbegin', controlsHtml);
                this.setupLibraryControlHandlers();
            } else {
                // Update existing controls
                controlsContainer.outerHTML = controlsHtml;
                this.setupLibraryControlHandlers();
            }
        }

        this.log(`Rendering ${this.characters.size} characters in library`);

        const filteredCharacters = this.getFilteredCharacters();
        let html = '';

        // Render existing characters
        for (const character of filteredCharacters) {
            const isSelected = this.selectedCharacter?.id === character.id;
            html += this.renderCharacterCard(character, isSelected);
        }

        // Add "New Character" card
        html += `
            <div id="cbg-character-card-add" class="cbg-char-card-add">
                <div class="add-character-content">
                    <div class="add-icon">+</div>
                    <div class="add-text">New Character</div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Add event listeners to character cards (delegated)
        this.setupCharacterCardHandlers();
    }

    /**
     * <summary>Render individual character card with enhanced info</summary>
     * @param {Object} character - Character data
     * @param {boolean} isSelected - Whether character is selected
     * @returns {string} HTML string for character card
     */
    renderCharacterCard(character, isSelected = false) {
        const profileImage = character.profileImage || '';
        const roleColor = this.getRoleColor(character.role);
        const age = character.age ? ` (${character.age})` : '';

        return `
            <div class="cbg-char-card ${isSelected ? 'selected' : ''}" data-character-id="${character.id}">
                <div class="character-profile-preview" style="position: relative;">
                    ${profileImage ?
                `<img src="${profileImage}" alt="${escapeHtml(character.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.4rem;">` :
                `<div class="placeholder-avatar" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-color-soft); font-size: 2rem; background: ${roleColor}20;">
                            ${this.getCharacterInitials(character.name)}
                        </div>`
            }
                    <div class="character-role-badge" style="position: absolute; top: 4px; right: 4px; background: ${roleColor}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; font-weight: 500;">
                        ${character.role || 'Unknown'}
                    </div>
                </div>
                <div class="character-info">
                    <div class="character-name" style="font-weight: 600; margin-bottom: 2px;">
                        ${escapeHtml((character.name || 'Unnamed Character') + age)}
                    </div>
                    <div class="character-subtitle" style="font-size: 0.8rem; color: var(--text-color-soft); margin-bottom: 4px;">
                        ${escapeHtml(character.occupation || character.species || 'Character')}
                    </div>
                    ${character.personality ? `
                        <div class="character-trait" style="font-size: 0.7rem; color: var(--text-color-soft); font-style: italic;">
                            "${escapeHtml(character.personality.substring(0, 40))}${character.personality.length > 40 ? '...' : ''}"
                        </div>
                    ` : ''}
                </div>
                <div class="character-actions">
                    <button class="btn btn-sm btn-outline-primary character-edit-btn" title="Edit Character">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary character-duplicate-btn" title="Duplicate Character">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger character-delete-btn" title="Delete Character">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ${character.relationships && character.relationships.length > 0 ? `
                    <div class="character-relationships" style="position: absolute; bottom: 4px; left: 4px;">
                        <small class="text-muted">🔗 ${character.relationships.length}</small>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * <summary>Render the enhanced tabbed character editor</summary>
     */
    async renderCharacterEditor() {
        const container = getRequiredElementById('cbg-character-editor-content');
        if (!this.selectedCharacter) {
            container.innerHTML = `
                <div class="character-editor-placeholder">
                    <div style="text-align: center; color: var(--text-color-soft); padding: 3rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                        <h3 style="margin-bottom: 1rem;">No Character Selected</h3>
                        <p style="margin-bottom: 2rem;">Select a character from the library or create a new one to begin editing.</p>
                        <button class="btn btn-primary" onclick="document.getElementById('cbg-character-card-add').click()">
                            Create New Character
                        </button>
                    </div>
                </div>
            `;

            // Disable save button
            const saveButton = document.getElementById('cbg-save-character');
            if (saveButton) {
                saveButton.disabled = true;
            }
            return;
        }

        // Enable save button
        const saveButton = document.getElementById('cbg-save-character');
        if (saveButton) {
            saveButton.disabled = false;
        }

        // Update status
        const statusElement = document.getElementById('cbg-character-status');
        if (statusElement) {
            statusElement.textContent = `Editing: ${this.selectedCharacter.name || 'Unnamed Character'}`;
        }

        this.log(`Rendering tabbed editor for character: ${this.selectedCharacter.name}`);

        // Render tabbed interface
        let html = `
            <div class="character-editor-tabs">
                <!-- Tab Navigation -->
                <div class="tab-nav" style="border-bottom: 2px solid var(--border-color); margin-bottom: 1.5rem;">
                    <div class="nav nav-tabs" style="border: none;">
                        <button class="nav-link ${this.activeTab === 'basic' ? 'active' : ''}" data-tab="basic">
                            <i class="fas fa-user"></i> Basic Info
                        </button>
                        <button class="nav-link ${this.activeTab === 'appearance' ? 'active' : ''}" data-tab="appearance">
                            <i class="fas fa-palette"></i> Appearance
                        </button>
                        <button class="nav-link ${this.activeTab === 'psychology' ? 'active' : ''}" data-tab="psychology">
                            <i class="fas fa-brain"></i> Psychology
                        </button>
                        <button class="nav-link ${this.activeTab === 'backstory' ? 'active' : ''}" data-tab="backstory">
                            <i class="fas fa-history"></i> Backstory
                        </button>
                        <button class="nav-link ${this.activeTab === 'story' ? 'active' : ''}" data-tab="story">
                            <i class="fas fa-book"></i> Story Role
                        </button>
                        <button class="nav-link ${this.activeTab === 'skills' ? 'active' : ''}" data-tab="skills">
                            <i class="fas fa-star"></i> Skills & Abilities
                        </button>
                        <button class="nav-link ${this.activeTab === 'media' ? 'active' : ''}" data-tab="media">
                            <i class="fas fa-images"></i> Images & Media
                        </button>
                    </div>
                </div>

                <!-- Tab Content -->
                <div class="tab-content">
                    ${await this.renderTabContent(this.activeTab)}
                </div>

                <!-- Global AI Actions -->
                <div class="character-ai-actions" style="margin-top: 2rem; padding: 1rem; background: var(--background-color-soft); border-radius: 0.5rem; border: 1px solid var(--border-color);">
                    <h5 style="margin-bottom: 1rem; color: var(--text-color);">
                        <i class="fas fa-robot"></i> AI Character Generation
                    </h5>
                    <div class="d-flex flex-wrap gap-2">
                        <button id="cbg-generate-entire-character" class="btn btn-success">
                            <i class="fas fa-magic"></i> Generate Entire Character
                        </button>
                        <button id="cbg-refine-character" class="btn btn-info">
                            <i class="fas fa-sync-alt"></i> Refine Character
                        </button>
                        <button id="cbg-generate-relationships" class="btn btn-warning">
                            <i class="fas fa-users"></i> Generate Relationships
                        </button>
                        <button id="cbg-character-voice-sample" class="btn btn-secondary">
                            <i class="fas fa-microphone"></i> Create Voice Sample
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Setup tab and form handlers
        this.setupTabHandlers();
        this.setupGlobalAIHandlers();
    }

    /**
     * <summary>Render content for specific tab</summary>
     * @param {string} tabId - Active tab identifier
     * @returns {string} HTML content for the tab
     */
    async renderTabContent(tabId) {
        const character = this.selectedCharacter;

        switch (tabId) {
            case 'basic':
                return this.renderBasicInfoTab(character);
            case 'appearance':
                return this.renderAppearanceTab(character);
            case 'psychology':
                return this.renderPsychologyTab(character);
            case 'backstory':
                return this.renderBackstoryTab(character);
            case 'story':
                return this.renderStoryTab(character);
            case 'skills':
                return this.renderSkillsTab(character);
            case 'media':
                return this.renderMediaTab(character);
            default:
                return '<div>Unknown tab</div>';
        }
    }

    /**
     * <summary>Render Basic Info tab content</summary>
     */
    renderBasicInfoTab(character) {
        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Character Identity</h5>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-ai-generate-basic">
                        <i class="fas fa-robot"></i> Generate with AI
                    </button>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-name', 'character_name', 'Full Name',
            'Character\'s full name', character.name || '', 'normal', 'Enter full name')}
                    </div>
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-nickname', 'character_nickname', 'Nickname/Alias',
                'Nickname, alias, or title', character.nickname || '', 'normal', 'What others call them')}
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        ${makeNumberInput(null, 'cbg-char-age', 'character_age', 'Age',
                    'Character\'s age in years', character.age || 25, 1, 200, 1)}
                    </div>
                    <div class="col-md-4">
                        ${makeDropdownInput(null, 'cbg-char-gender', 'character_gender', 'Gender',
                        'Character\'s gender identity',
                        ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'],
                        character.gender || 'Male')}
                    </div>
                    <div class="col-md-4">
                        ${makeTextInput(null, 'cbg-char-species', 'character_species', 'Species/Race',
                            'Character\'s species or race', character.species || 'Human', 'normal', 'Human, Elf, etc.')}
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-occupation', 'character_occupation', 'Occupation',
                                'Character\'s job or profession', character.occupation || '', 'normal', 'What do they do for work?')}
                    </div>
                    <div class="col-md-6">
                        ${makeDropdownInput(null, 'cbg-char-role', 'character_role', 'Story Role',
                                    'Character\'s role in the story',
                                    ['Protagonist', 'Antagonist', 'Supporting', 'Background', 'Narrator', 'Love Interest', 'Mentor', 'Comic Relief'],
                                    character.role || 'Supporting')}
                    </div>
                </div>

                ${makeTextInput(null, 'cbg-char-tags', 'character_tags', 'Character Tags',
                                        'Keywords that describe this character', character.tags || '', 'normal',
                                        'brave, intelligent, mysterious, hot-tempered')}

                ${makeTextInput(null, 'cbg-char-summary', 'character_summary', 'Character Summary',
                                            'One sentence description of this character', character.summary || '', 'big',
                                            'A brief, compelling description that captures their essence...')}
            </div>
        `;
    }

    /**
     * <summary>Render Appearance tab content</summary>
     */
    renderAppearanceTab(character) {
        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Physical Appearance</h5>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-ai-generate-appearance">
                        <i class="fas fa-robot"></i> Generate with AI
                    </button>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        ${makeTextInput(null, 'cbg-char-height', 'character_height', 'Height',
            'Character\'s height', character.height || '', 'normal', '5\'8", 175cm, etc.')}
                    </div>
                    <div class="col-md-4">
                        ${makeDropdownInput(null, 'cbg-char-build', 'character_build', 'Build',
                'Character\'s body type',
                ['Slim', 'Athletic', 'Average', 'Stocky', 'Muscular', 'Heavy', 'Petite', 'Tall'],
                character.build || 'Average')}
                    </div>
                    <div class="col-md-4">
                        ${makeTextInput(null, 'cbg-char-skin', 'character_skin', 'Skin Tone',
                    'Character\'s skin color/tone', character.skinTone || '', 'normal', 'Pale, olive, dark, etc.')}
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-hair-color', 'character_hair_color', 'Hair Color',
                        'Character\'s hair color', character.hairColor || '', 'normal', 'Brown, blonde, black, etc.')}
                    </div>
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-hair-style', 'character_hair_style', 'Hair Style',
                            'Character\'s hairstyle', character.hairStyle || '', 'normal', 'Long, short, curly, etc.')}
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-eye-color', 'character_eye_color', 'Eye Color',
                                'Character\'s eye color', character.eyeColor || '', 'normal', 'Brown, blue, green, etc.')}
                    </div>
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-eye-shape', 'character_eye_shape', 'Eye Shape',
                                    'Character\'s eye shape', character.eyeShape || '', 'normal', 'Round, almond, etc.')}
                    </div>
                </div>

                ${makeTextInput(null, 'cbg-char-facial', 'character_facial', 'Facial Features',
                                        'Distinctive facial features', character.facialFeatures || '', 'big',
                                        'Sharp cheekbones, kind eyes, strong jaw, freckles, scars...')}

                ${makeTextInput(null, 'cbg-char-clothing', 'character_clothing', 'Clothing Style',
                                            'Character\'s typical clothing and fashion', character.clothing || '', 'big',
                                            'Casual jeans and t-shirt, formal business attire, medieval armor...')}

                ${makeTextInput(null, 'cbg-char-distinctive', 'character_distinctive', 'Distinctive Marks',
                                                'Scars, tattoos, birthmarks, etc.', character.distinctiveMarks || '', 'big',
                                                'Scar over left eye, dragon tattoo on arm, birthmark on cheek...')}

                ${makeTextInput(null, 'cbg-char-accessories', 'character_accessories', 'Accessories',
                                                    'Jewelry, glasses, weapons, etc.', character.accessories || '', 'normal',
                                                    'Silver necklace, glasses, sword, etc.')}

                ${makeTextInput(null, 'cbg-char-appearance-full', 'character_appearance', 'Full Appearance Description',
                                                        'Complete physical description for AI generation', character.appearance || '', 'big',
                                                        'Detailed description combining all physical attributes for consistent AI image generation...')}
            </div>
        `;
    }

    /**
     * <summary>Render Psychology tab content</summary>
     */
    renderPsychologyTab(character) {
        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Personality & Psychology</h5>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-ai-generate-psychology">
                        <i class="fas fa-robot"></i> Generate with AI
                    </button>
                </div>

                ${makeTextInput(null, 'cbg-char-personality', 'character_personality', 'Core Personality',
            'Character\'s fundamental personality traits', character.personality || '', 'big',
            'Describe their core personality, temperament, and how they typically behave...')}

                ${makeTextInput(null, 'cbg-char-temperament', 'character_temperament', 'Temperament',
                'Character\'s emotional disposition', character.temperament || '', 'normal',
                'Hot-tempered, calm, melancholic, cheerful, etc.')}

                <div class="row">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-strengths', 'character_strengths', 'Strengths',
                    'Character\'s positive traits and abilities', character.strengths || '', 'big',
                    'Leadership, empathy, courage, intelligence...')}
                    </div>
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-flaws', 'character_flaws', 'Flaws & Weaknesses',
                        'Character\'s negative traits and limitations', character.flaws || '', 'big',
                        'Pride, impatience, fear of heights, trust issues...')}
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-fears', 'character_fears', 'Fears & Phobias',
                            'What scares this character', character.fears || '', 'big',
                            'Fear of death, spiders, failure, being alone...')}
                    </div>
                    <div class="col-md-6">
                        ${makeTextInput(null, 'cbg-char-motivations', 'character_motivations', 'Motivations',
                                'What drives this character', character.motivations || '', 'big',
                                'Revenge, love, power, redemption, survival...')}
                    </div>
                </div>

                ${makeTextInput(null, 'cbg-char-dreams', 'character_dreams', 'Dreams & Aspirations',
                                    'Character\'s hopes and goals for the future', character.dreams || '', 'big',
                                    'What do they hope to achieve? What is their ideal future?')}

                ${makeTextInput(null, 'cbg-char-secrets', 'character_secrets', 'Secrets & Hidden Depths',
                                        'Things others don\'t know about this character', character.secrets || '', 'big',
                                        'Hidden talents, shameful past, secret identity, unrevealed connections...')}

                ${makeTextInput(null, 'cbg-char-quirks', 'character_quirks', 'Quirks & Mannerisms',
                                            'Character\'s unique habits and behaviors', character.quirks || '', 'big',
                                            'Always taps fingers when nervous, speaks in riddles, collects coins...')}

                ${makeTextInput(null, 'cbg-char-speech', 'character_speech', 'Speech Pattern',
                                                'How this character talks and communicates', character.speechPattern || '', 'big',
                                                'Formal speech, uses slang, stutters when nervous, speaks multiple languages...')}

                ${makeTextInput(null, 'cbg-char-catchphrases', 'character_catchphrases', 'Catchphrases',
                                                    'Memorable phrases this character often says', character.catchphrases || '', 'normal',
                                                    '"By my honor!", "That\'s not how this works", etc.')}
            </div>
        `;
    }

    /**
     * <summary>Render Backstory tab content</summary>
     */
    renderBackstoryTab(character) {
        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>History & Background</h5>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-ai-generate-backstory">
                        <i class="fas fa-robot"></i> Generate with AI
                    </button>
                </div>

                ${makeTextInput(null, 'cbg-char-birthplace', 'character_birthplace', 'Birthplace',
            'Where was this character born?', character.birthplace || '', 'normal',
            'City, country, realm, planet, etc.')}

                ${makeTextInput(null, 'cbg-char-family', 'character_family', 'Family & Relatives',
                'Character\'s family background', character.family || '', 'big',
                'Parents, siblings, spouse, children, extended family...')}

                ${makeTextInput(null, 'cbg-char-education', 'character_education', 'Education & Training',
                    'Character\'s educational background', character.education || '', 'big',
                    'Schools attended, mentors, specialized training, self-taught skills...')}

                ${makeTextInput(null, 'cbg-char-social-class', 'character_social_class', 'Social Class',
                        'Character\'s socioeconomic background', character.socialClass || '', 'normal',
                        'Noble, merchant, peasant, middle class, etc.')}

                ${makeTextInput(null, 'cbg-char-past-events', 'character_past_events', 'Key Past Events',
                            'Important events that shaped this character', character.pastEvents || '', 'big',
                            'Major events, turning points, tragedies, victories that defined them...')}

                ${makeTextInput(null, 'cbg-char-formative', 'character_formative', 'Formative Experiences',
                                'Experiences that made them who they are', character.formativeExperiences || '', 'big',
                                'Childhood trauma, mentor relationships, first love, loss of innocence...')}

                ${makeTextInput(null, 'cbg-char-achievements', 'character_achievements', 'Achievements',
                                    'Character\'s notable accomplishments', character.achievements || '', 'big',
                                    'Awards, victories, milestones, recognition they\'ve received...')}

                ${makeTextInput(null, 'cbg-char-failures', 'character_failures', 'Failures & Regrets',
                                        'Character\'s mistakes and regrets', character.failures || '', 'big',
                                        'Times they failed, decisions they regret, people they let down...')}

                ${makeTextInput(null, 'cbg-char-trauma', 'character_trauma', 'Trauma & Scars',
                                            'Emotional wounds and how they cope', character.trauma || '', 'big',
                                            'Psychological trauma, coping mechanisms, how it affects current behavior...')}

                ${makeTextInput(null, 'cbg-char-backstory-full', 'character_backstory', 'Complete Backstory',
                                                'Character\'s full life story and background', character.backstory || '', 'big',
                                                'Comprehensive background story from birth to current events...')}
            </div>
        `;
    }

    /**
     * <summary>Render Story Role tab content</summary>
     */
    renderStoryTab(character) {
        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Role in This Story</h5>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-ai-generate-story-role">
                        <i class="fas fa-robot"></i> Generate with AI
                    </button>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        ${makeDropdownInput(null, 'cbg-char-story-role', 'character_story_role', 'Primary Role',
            'Character\'s main function in the story',
            ['Main Protagonist', 'Secondary Protagonist', 'Primary Antagonist', 'Secondary Antagonist',
                'Love Interest', 'Mentor Figure', 'Comic Relief', 'Sidekick', 'Foil Character',
                'Catalyst', 'Supporting Character', 'Background Character'],
            character.storyRole || 'Supporting Character')}
                    </div>
                    <div class="col-md-6">
                        ${makeDropdownInput(null, 'cbg-char-importance', 'character_importance', 'Story Importance',
                'How important is this character',
                ['Critical', 'Very Important', 'Important', 'Moderate', 'Minor', 'Background'],
                character.importance || 'Moderate')}
                    </div>
                </div>

                ${makeTextInput(null, 'cbg-char-goals', 'character_goals', 'Character Goals',
                    'What does this character want to achieve in this story?', character.goals || '', 'big',
                    'Short-term and long-term goals, both conscious and unconscious desires...')}

                ${makeTextInput(null, 'cbg-char-conflicts', 'character_conflicts', 'Character Conflicts',
                        'Internal and external conflicts this character faces', character.conflicts || '', 'big',
                        'Person vs person, person vs self, person vs society, person vs nature...')}

                ${makeTextInput(null, 'cbg-char-obstacles', 'character_obstacles', 'Obstacles',
                            'What stands in the way of their goals?', character.obstacles || '', 'big',
                            'People, situations, personal limitations, societal barriers...')}

                ${makeTextInput(null, 'cbg-char-arc', 'character_arc', 'Character Arc',
                                'How will this character grow and change?', character.arc || '', 'big',
                                'Character development, transformation, lessons learned, how they change...')}

                ${makeTextInput(null, 'cbg-char-relationships', 'character_relationships', 'Key Relationships',
                                    'Important relationships with other characters', character.relationships || '', 'big',
                                    'Family, friends, enemies, romantic interests, mentors, rivals...')}

                ${makeTextInput(null, 'cbg-char-influence', 'character_influence', 'Influence on Story',
                                        'How does this character affect the plot?', character.influence || '', 'big',
                                        'How they drive the story forward, decisions that impact others...')}

                <div class="row">
                    <div class="col-md-6">
                        ${makeDropdownInput(null, 'cbg-char-screen-time', 'character_screen_time', 'Screen Time',
                                            'How much focus does this character get?',
                                            ['Very High', 'High', 'Medium', 'Low', 'Very Low'],
                                            character.screenTime || 'Medium')}
                    </div>
                    <div class="col-md-6">
                        ${makeDropdownInput(null, 'cbg-char-first-appearance', 'character_first_appearance', 'First Appearance',
                                                'When do they first appear in the story?',
                                                ['Page 1', 'Early', 'Middle', 'Late', 'Flashback Only'],
                                                character.firstAppearance || 'Early')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render Skills & Abilities tab content</summary>
     */
    renderSkillsTab(character) {
        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Skills, Abilities & Resources</h5>
                    <button class="btn btn-sm btn-outline-primary" id="cbg-ai-generate-skills">
                        <i class="fas fa-robot"></i> Generate with AI
                    </button>
                </div>

                ${makeTextInput(null, 'cbg-char-talents', 'character_talents', 'Natural Talents',
            'Character\'s innate abilities and gifts', character.talents || '', 'big',
            'Photographic memory, natural charisma, perfect pitch, artistic talent...')}

                ${makeTextInput(null, 'cbg-char-skills', 'character_skills', 'Learned Skills',
                'Skills acquired through training and practice', character.skills || '', 'big',
                'Combat training, languages, crafting, technology, magic, etc...')}

                ${makeTextInput(null, 'cbg-char-powers', 'character_powers', 'Special Powers',
                    'Supernatural or extraordinary abilities', character.powers || '', 'big',
                    'Magic spells, superpowers, psychic abilities, divine blessings...')}

                ${makeTextInput(null, 'cbg-char-limitations', 'character_limitations', 'Limitations',
                        'Restrictions on their abilities', character.limitations || '', 'big',
                        'Physical disabilities, power limitations, moral constraints, curses...')}

                ${makeTextInput(null, 'cbg-char-equipment', 'character_equipment', 'Equipment & Gear',
                            'Tools, weapons, and items they typically carry', character.equipment || '', 'big',
                            'Weapons, armor, magical items, technology, tools of their trade...')}

                ${makeTextInput(null, 'cbg-char-resources', 'character_resources', 'Resources',
                                'Money, connections, properties, and other resources', character.resources || '', 'big',
                                'Wealth, property, allies, information networks, political connections...')}

                <div class="character-stats" style="margin: 1rem 0; padding: 1rem; background: var(--background-color-soft); border-radius: 0.5rem;">
                    <h6>Character Stats (Optional RPG-style ratings 1-10)</h6>
                    <div class="row">
                        <div class="col-md-6">
                            ${makeRangeInput(null, 'cbg-char-strength', 'character_strength', 'Strength',
                                    'Physical power', character.strength || 5, 1, 10, 1)}
                            ${makeRangeInput(null, 'cbg-char-dexterity', 'character_dexterity', 'Dexterity',
                                        'Agility and reflexes', character.dexterity || 5, 1, 10, 1)}
                            ${makeRangeInput(null, 'cbg-char-intelligence', 'character_intelligence', 'Intelligence',
                                            'Mental acuity', character.intelligence || 5, 1, 10, 1)}
                        </div>
                        <div class="col-md-6">
                            ${makeRangeInput(null, 'cbg-char-charisma', 'character_charisma', 'Charisma',
                                                'Social influence', character.charisma || 5, 1, 10, 1)}
                            ${makeRangeInput(null, 'cbg-char-wisdom', 'character_wisdom', 'Wisdom',
                                                    'Experience and insight', character.wisdom || 5, 1, 10, 1)}
                            ${makeRangeInput(null, 'cbg-char-willpower', 'character_willpower', 'Willpower',
                                                        'Mental fortitude', character.willpower || 5, 1, 10, 1)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render Media tab content</summary>
     */
    renderMediaTab(character) {
        const character_obj = character || {};

        return `
            <div class="tab-pane-content">
                <div class="section-header">
                    <h5>Images & Media Assets</h5>
                    <button class="btn btn-sm btn-outline-success" id="cbg-ai-generate-all-images">
                        <i class="fas fa-magic"></i> Generate All Images
                    </button>
                </div>

                <!-- Profile Image Section -->
                <div class="media-section" style="margin-bottom: 2rem;">
                    <h6>Profile Image</h6>
                    <div class="d-flex align-items-start gap-3">
                        <div id="cbg-profile-preview-large" class="profile-preview" 
                             style="width:200px; height:250px; border:1px solid var(--border-color); border-radius:0.5rem; background-color: var(--background-color-soft); display:flex; align-items:center; justify-content:center; color: var(--text-color-soft); position: relative; overflow: hidden;">
                            ${character_obj.profileImage ?
                `<img src="${character_obj.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
                                 <button class="btn-close position-absolute top-0 end-0 m-1" title="Remove image"></button>` :
                'Profile Image Preview'
            }
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex flex-column gap-2">
                                <input id="cbg-profile-file" type="file" accept="image/*" class="d-none">
                                <button class="btn btn-outline-primary" onclick="document.getElementById('cbg-profile-file').click()">
                                    <i class="fas fa-upload"></i> Upload Profile Image
                                </button>
                                <button class="btn btn-outline-success" id="cbg-generate-profile-image">
                                    <i class="fas fa-robot"></i> Generate Profile Image
                                </button>
                                <button class="btn btn-outline-info" id="cbg-refine-profile-image">
                                    <i class="fas fa-sync-alt"></i> Refine Profile Image
                                </button>
                            </div>
                            <div class="mt-2">
                                <small class="text-muted">Recommended: 400x500px portrait orientation</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- T-Pose Images Section -->
                <div class="media-section" style="margin-bottom: 2rem;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6>T-Pose Reference Images</h6>
                        <button class="btn btn-sm btn-outline-success" id="cbg-generate-all-tpose">
                            <i class="fas fa-robot"></i> Generate All T-Poses
                        </button>
                    </div>
                    <div class="tpose-images-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        ${this.renderTPoseSlot('front', 'Front View', character_obj.tposeImages?.front)}
                        ${this.renderTPoseSlot('back', 'Back View', character_obj.tposeImages?.back)}
                        ${this.renderTPoseSlot('left', 'Left Side', character_obj.tposeImages?.left)}
                        ${this.renderTPoseSlot('right', 'Right Side', character_obj.tposeImages?.right)}
                    </div>
                </div>

                <!-- Expression Images Section -->
                <div class="media-section" style="margin-bottom: 2rem;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6>Expression Reference Images</h6>
                        <button class="btn btn-sm btn-outline-success" id="cbg-generate-expressions">
                            <i class="fas fa-robot"></i> Generate Expressions
                        </button>
                    </div>
                    <div class="expression-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                        ${['happy', 'sad', 'angry', 'surprised', 'worried', 'determined'].map(emotion =>
                this.renderExpressionSlot(emotion, character_obj.expressions?.[emotion])
            ).join('')}
                    </div>
                </div>

                <!-- Voice & Audio Section -->
                <div class="media-section">
                    <h6>Voice & Audio</h6>
                    <div class="voice-section p-3" style="background: var(--background-color-soft); border-radius: 0.5rem;">
                        ${makeTextInput(null, 'cbg-char-voice-description', 'character_voice_description', 'Voice Description',
                'How does this character sound when they speak?', character_obj.voiceDescription || '', 'big',
                'Deep and gravelly, high-pitched and energetic, smooth and confident...')}
                        
                        <div class="d-flex gap-2 mt-2">
                            <button class="btn btn-outline-success" id="cbg-generate-voice-sample">
                                <i class="fas fa-microphone"></i> Generate Voice Sample
                            </button>
                            <button class="btn btn-outline-primary" id="cbg-upload-voice-sample">
                                <i class="fas fa-upload"></i> Upload Voice Sample
                            </button>
                        </div>
                        
                        ${character_obj.voiceSample ? `
                            <div class="mt-2">
                                <audio controls style="width: 100%;">
                                    <source src="${character_obj.voiceSample}" type="audio/mp3">
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- LoRA Model Section -->
                <div class="media-section mt-3">
                    <h6>AI Model Settings</h6>
                    <div class="p-3" style="background: var(--background-color-soft); border-radius: 0.5rem;">
                        ${makeDropdownInput(null, 'cbg-char-lora', 'character_lora', 'LoRA Model',
                    'Character LoRA for consistency', ['None', 'Custom LoRA 1', 'Custom LoRA 2'], character_obj.loraModel || 'None')}
                        
                        <div class="d-flex gap-2 mt-2">
                            <button class="btn btn-outline-warning" id="cbg-train-character-lora">
                                <i class="fas fa-graduation-cap"></i> Train Character LoRA
                            </button>
                            <button class="btn btn-outline-info" id="cbg-test-character-generation">
                                <i class="fas fa-flask"></i> Test Image Generation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render a T-pose image slot</summary>
     */
    renderTPoseSlot(position, label, imageData) {
        return `
            <div class="tpose-image-slot" data-position="${position}" 
                 style="aspect-ratio: 3/4; border: 1px dashed var(--border-color); border-radius: 0.5rem; background-color: var(--background-color-soft); position: relative; overflow: hidden; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                ${imageData ?
                `<img src="${imageData}" alt="${label}" style="width: 100%; height: 100%; object-fit: cover;">
                     <button class="btn-close position-absolute top-0 end-0 m-1" title="Remove image"></button>` :
                `<div class="text-center text-muted">
                        <i class="fas fa-plus fa-2x mb-2"></i>
                        <div style="font-size: 0.8rem;">${label}</div>
                     </div>`
            }
                <div class="position-absolute bottom-0 start-0 end-0 p-1 text-center" 
                     style="background: rgba(0,0,0,0.7); color: white; font-size: 0.7rem;">
                    ${label}
                </div>
                <input type="file" accept="image/*" class="position-absolute inset-0 opacity-0" 
                       style="cursor: pointer;" data-position="${position}">
            </div>
        `;
    }

    /**
     * <summary>Render expression image slot</summary>
     */
    renderExpressionSlot(emotion, imageData) {
        return `
            <div class="expression-slot" data-emotion="${emotion}" 
                 style="aspect-ratio: 1; border: 1px dashed var(--border-color); border-radius: 0.5rem; background-color: var(--background-color-soft); position: relative; overflow: hidden; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                ${imageData ?
                `<img src="${imageData}" alt="${emotion}" style="width: 100%; height: 100%; object-fit: cover;">
                     <button class="btn-close position-absolute top-0 end-0 m-1" title="Remove image"></button>` :
                `<div class="text-center text-muted">
                        <div style="font-size: 1.5rem; margin-bottom: 4px;">${this.getEmotionEmoji(emotion)}</div>
                        <div style="font-size: 0.7rem; text-transform: capitalize;">${emotion}</div>
                     </div>`
            }
            </div>
        `;
    }

    /**
     * <summary>Get emoji for emotion</summary>
     */
    getEmotionEmoji(emotion) {
        const emojis = {
            happy: '😊', sad: '😢', angry: '😠',
            surprised: '😲', worried: '😟', determined: '😤'
        };
        return emojis[emotion] || '😐';
    }

    // ... (continuing with the rest of the methods)

    /**
     * <summary>Show character creation modal with templates</summary>
     */
    showCharacterCreationModal() {
        // Create modal HTML
        let modalHtml = `
            <div class="modal fade" id="characterCreationModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Create New Character</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Start with a template:</label>
                                <div class="template-selection">
                                    <div class="row">
        `;

        // Add template options
        for (const [id, template] of this.characterTemplates) {
            modalHtml += `
                <div class="col-md-6 mb-3">
                    <div class="card template-card" data-template-id="${id}" style="cursor: pointer;">
                        <div class="card-body">
                            <h6 class="card-title">${template.name}</h6>
                            <p class="card-text small text-muted">${template.description}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        modalHtml += `
                        <div class="col-md-6 mb-3">
                            <div class="card template-card" data-template-id="blank" style="cursor: pointer;">
                                <div class="card-body">
                                    <h6 class="card-title">Blank Character</h6>
                                    <p class="card-text small text-muted">Start from scratch with no template</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="createCharacterBtn" disabled>Create Character</button>
        </div>
    </div>
</div>
</div>
        `;

        // Remove existing modal if present
        document.getElementById('characterCreationModal')?.remove();

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Setup modal event handlers
        const modal = document.getElementById('characterCreationModal');
        let selectedTemplate = null;

        // Template selection
        modal.addEventListener('click', (e) => {
            const templateCard = e.target.closest('.template-card');
            if (templateCard) {
                // Remove previous selection
                modal.querySelectorAll('.template-card').forEach(card => {
                    card.classList.remove('border-primary');
                });

                // Select new template
                templateCard.classList.add('border-primary');
                selectedTemplate = templateCard.dataset.templateId;
                document.getElementById('createCharacterBtn').disabled = false;
            }
        });

        // Create button
        document.getElementById('createCharacterBtn').addEventListener('click', () => {
            this.createCharacterFromTemplate(selectedTemplate);
            // Hide modal using Bootstrap 5 syntax
            const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
            bsModal.hide();
        });

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    /**
     * <summary>Create character from template</summary>
     */
    createCharacterFromTemplate(templateId) {
        this.log(`Creating character from template: ${templateId}`);

        let newCharacter = this.createCharacterData();

        if (templateId && templateId !== 'blank') {
            const template = this.characterTemplates.get(templateId);
            if (template) {
                // Apply template data
                Object.assign(newCharacter, template.data);
                newCharacter.role = template.role;
                newCharacter.name = `New ${template.name}`;
            }
        }

        this.characters.set(newCharacter.id, newCharacter);
        this.selectCharacter(newCharacter.id);

        // Update displays
        this.renderCharacterLibrary();
        this.renderCharacterEditor();

        this.log('Character created from template:', newCharacter.id);
    }

    /**
     * <summary>Create comprehensive character data structure</summary>
     */
    createCharacterData() {
        const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            // Basic Info
            id: id,
            name: '',
            nickname: '',
            age: 25,
            gender: 'Male',
            species: 'Human',
            occupation: '',
            role: 'Supporting',
            tags: '',
            summary: '',

            // Physical Appearance  
            height: '',
            build: 'Average',
            skinTone: '',
            hairColor: '',
            hairStyle: '',
            eyeColor: '',
            eyeShape: '',
            facialFeatures: '',
            clothing: '',
            distinctiveMarks: '',
            accessories: '',
            appearance: '',

            // Personality & Psychology
            personality: '',
            temperament: '',
            strengths: '',
            flaws: '',
            fears: '',
            motivations: '',
            dreams: '',
            secrets: '',
            quirks: '',
            speechPattern: '',
            catchphrases: '',

            // Background & History
            birthplace: '',
            family: '',
            education: '',
            socialClass: '',
            pastEvents: '',
            formativeExperiences: '',
            achievements: '',
            failures: '',
            trauma: '',
            backstory: '',

            // Story Integration
            storyRole: 'Supporting Character',
            importance: 'Moderate',
            goals: '',
            conflicts: '',
            obstacles: '',
            arc: '',
            relationships: '',
            influence: '',
            screenTime: 'Medium',
            firstAppearance: 'Early',

            // Skills & Abilities
            talents: '',
            skills: '',
            powers: '',
            limitations: '',
            equipment: '',
            resources: '',
            strength: 5,
            dexterity: 5,
            intelligence: 5,
            charisma: 5,
            wisdom: 5,
            willpower: 5,

            // Media & Assets
            profileImage: null,
            tposeImages: {
                front: null,
                back: null,
                left: null,
                right: null
            },
            expressions: {
                happy: null,
                sad: null,
                angry: null,
                surprised: null,
                worried: null,
                determined: null
            },
            voiceDescription: '',
            voiceSample: null,
            loraModel: 'None',

            // Metadata
            createdDate: Date.now(),
            lastModified: Date.now()
        };
    }

    /**
     * <summary>Get filtered characters based on search and role filter</summary>
     */
    getFilteredCharacters() {
        let filtered = Array.from(this.characters.values());

        // Apply search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(char =>
                (char.name || '').toLowerCase().includes(term) ||
                (char.occupation || '').toLowerCase().includes(term) ||
                (char.tags || '').toLowerCase().includes(term) ||
                (char.personality || '').toLowerCase().includes(term)
            );
        }

        // Apply role filter
        if (this.roleFilter && this.roleFilter !== 'all') {
            filtered = filtered.filter(char => char.role === this.roleFilter);
        }

        return filtered;
    }

    /**
     * <summary>Get character role statistics</summary>
     */
    getCharacterRoleStats() {
        const counts = {};
        for (const char of this.characters.values()) {
            const role = char.role || 'Unknown';
            counts[role] = (counts[role] || 0) + 1;
        }

        return Object.entries(counts)
            .map(([role, count]) => `${count} ${role}${count !== 1 ? 's' : ''}`)
            .join(', ');
    }

    /**
     * <summary>Get character initials for placeholder avatar</summary>
     */
    getCharacterInitials(name) {
        if (!name) return '?';
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    /**
     * <summary>Get role color for UI elements</summary>
     */
    getRoleColor(role) {
        const colors = {
            'Protagonist': '#28a745',
            'Antagonist': '#dc3545',
            'Supporting': '#007bff',
            'Background': '#6c757d',
            'Love Interest': '#e83e8c',
            'Mentor': '#6f42c1',
            'Comic Relief': '#fd7e14'
        };
        return colors[role] || '#6c757d';
    }

    /**
     * <summary>Setup library control handlers</summary>
     */
    setupLibraryControlHandlers() {
        // Search input
        this.main.eventManager.on('cbg-character-search', 'input', (e) => {
            this.searchTerm = e.target.value;
            this.debounce('characters_search', () => this.renderCharacterLibrary(), 300);
        });

        // Role filter
        this.main.eventManager.on('cbg-role-filter', 'change', (e) => {
            this.roleFilter = e.target.value;
            this.renderCharacterLibrary();
        });

        // Import/Export buttons
        this.main.eventManager.on('cbg-character-import', 'click', () => this.importCharacters());
        this.main.eventManager.on('cbg-character-export', 'click', () => this.exportCharacters());
    }

    /**
     * <summary>Setup character card handlers</summary>
     */
    setupCharacterCardHandlers() {
        // Delegated: add new character
        this.main.eventManager.delegate('cbg-character-cards', '#cbg-character-card-add', 'click', () => {
            this.showCharacterCreationModal();
        });

        // Delegated: select card when clicking outside actions
        this.main.eventManager.delegate('cbg-character-cards', '.cbg-char-card', 'click', (e, card) => {
            if (e.target.closest('.character-actions')) {
                return;
            }
            const characterId = card.dataset.characterId;
            if (characterId) {
                this.selectCharacter(characterId);
            }
        });

        // Delegated: action buttons
        this.main.eventManager.delegate('cbg-character-cards', '.character-edit-btn', 'click', (e, btn) => {
            const characterId = btn.closest('.cbg-char-card')?.dataset.characterId;
            if (characterId) this.selectCharacter(characterId);
        });
        this.main.eventManager.delegate('cbg-character-cards', '.character-duplicate-btn', 'click', (e, btn) => {
            const characterId = btn.closest('.cbg-char-card')?.dataset.characterId;
            if (characterId) this.duplicateCharacter(characterId);
        });
        this.main.eventManager.delegate('cbg-character-cards', '.character-delete-btn', 'click', (e, btn) => {
            const characterId = btn.closest('.cbg-char-card')?.dataset.characterId;
            if (characterId) this.deleteCharacter(characterId);
        });
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
            if (this.selectedCharacter) {
                this.updateCharacterFromForm();
            }

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
     * <summary>Setup tab-specific event handlers</summary>
     */
    setupTabSpecificHandlers(tabId) {
        switch (tabId) {
            case 'basic':
                this.setupAIButton('cbg-ai-generate-basic', 'basic');
                break;
            case 'appearance':
                this.setupAIButton('cbg-ai-generate-appearance', 'appearance');
                break;
            case 'psychology':
                this.setupAIButton('cbg-ai-generate-psychology', 'psychology');
                break;
            case 'backstory':
                this.setupAIButton('cbg-ai-generate-backstory', 'backstory');
                break;
            case 'story':
                this.setupAIButton('cbg-ai-generate-story-role', 'story-role');
                break;
            case 'skills':
                this.setupAIButton('cbg-ai-generate-skills', 'skills');
                break;
            case 'media':
                this.setupMediaHandlers();
                break;
        }
    }

    /**
     * <summary>Setup AI generation button</summary>
     */
    setupAIButton(buttonId, section) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.addEventListener('click', () => this.generateCharacterSection(section));
        }
    }

    /**
     * <summary>Setup media tab handlers</summary>
     */
    setupMediaHandlers() {
        // Profile image handlers
        this.setupImageHandlers();

        // AI generation buttons
        const buttons = [
            'cbg-ai-generate-all-images',
            'cbg-generate-profile-image',
            'cbg-refine-profile-image',
            'cbg-generate-all-tpose',
            'cbg-generate-expressions',
            'cbg-generate-voice-sample',
            'cbg-train-character-lora',
            'cbg-test-character-generation'
        ];

        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.handleMediaAIGeneration(id));
            }
        });
    }

    /**
     * <summary>Setup image upload handlers</summary>
     */
    setupImageHandlers() {
        // Profile image handler  
        this.main.eventManager.on('cbg-profile-file', 'change', (e) => this.handleImageUpload(e, 'profile'));
        // Profile image remove
        this.main.eventManager.delegate('cbg-character-editor-content', '#cbg-profile-preview-large .btn-close', 'click', () => this.removeImage('profile'));
        // T-pose image handlers
        this.main.eventManager.delegate('cbg-character-editor-content', '.tpose-image-slot input[type="file"]', 'change', (e, input) => {
            const position = input.dataset.position;
            this.handleImageUpload(e, 'tpose', position);
        });
        // Expression image handlers (similar setup)
        this.main.eventManager.delegate('cbg-character-editor-content', '.expression-slot', 'click', (e, slot) => {
            const emotion = slot.dataset.emotion;
            this.generateExpressionImage(emotion);
        });
    }

    /**
     * <summary>Setup global AI handlers</summary>
     */
    setupGlobalAIHandlers() {
        const generateBtn = document.getElementById('cbg-generate-entire-character');
        const refineBtn = document.getElementById('cbg-refine-character');
        const relationshipsBtn = document.getElementById('cbg-generate-relationships');
        const voiceBtn = document.getElementById('cbg-character-voice-sample');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateEntireCharacter());
        }

        if (refineBtn) {
            refineBtn.addEventListener('click', () => this.refineEntireCharacter());
        }

        if (relationshipsBtn) {
            relationshipsBtn.addEventListener('click', () => this.generateCharacterRelationships());
        }

        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.generateVoiceSample());
        }
    }

    /**
     * <summary>Setup form field event handlers</summary>
     */
    setupFormFieldHandlers() {
        const tabContent = document.querySelector('.tab-content');
        if (!tabContent) return;

        // Auto-save on form changes
        const inputs = tabContent.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateCharacterFromForm();
            });

            // Real-time updates for text fields
            if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    this.debounce('characters_form_update', () => this.updateCharacterFromForm(), 500);
                });
            }
        });
    }

    /**
     * <summary>Handle image upload</summary>
     */
    handleImageUpload(event, type, position = null) {
        const file = event.target.files[0];
        if (!file) return;

        this.log(`Uploading ${type} image${position ? ` (${position})` : ''}:`, file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;

            if (type === 'profile') {
                this.selectedCharacter.profileImage = imageData;
                this.updateProfileImagePreview(imageData);
            } else if (type === 'tpose' && position) {
                if (!this.selectedCharacter.tposeImages) {
                    this.selectedCharacter.tposeImages = {};
                }
                this.selectedCharacter.tposeImages[position] = imageData;
                this.updateTPoseImagePreview(position, imageData);
            }

            // Update character data
            this.characters.set(this.selectedCharacter.id, this.selectedCharacter);
            this.renderCharacterLibrary();
        };

        reader.onerror = () => {
            this.handleError('Failed to read image file', reader.error);
        };

        reader.readAsDataURL(file);
    }

    /**
     * <summary>Remove image from character</summary>
     */
    removeImage(type, position = null) {
        if (!this.selectedCharacter) return;

        if (type === 'profile') {
            this.selectedCharacter.profileImage = null;
            this.updateProfileImagePreview(null);
        } else if (type === 'tpose' && position) {
            if (this.selectedCharacter.tposeImages) {
                this.selectedCharacter.tposeImages[position] = null;
                this.updateTPoseImagePreview(position, null);
            }
        }

        this.characters.set(this.selectedCharacter.id, this.selectedCharacter);
        this.renderCharacterLibrary();
    }

    /**
     * <summary>Update profile image preview</summary>
     */
    updateProfileImagePreview(imageData) {
        const preview = document.getElementById('cbg-profile-preview-large');
        if (!preview) return;

        if (imageData) {
            preview.innerHTML = `
                <img src="${imageData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
                <button class="btn-close position-absolute top-0 end-0 m-1" title="Remove image"></button>
            `;
        } else {
            preview.innerHTML = 'Profile Image Preview';
        }
    }

    /**
     * <summary>Update T-pose image preview</summary>
     */
    updateTPoseImagePreview(position, imageData) {
        const slot = document.querySelector(`.tpose-image-slot[data-position="${position}"]`);
        if (!slot) return;

        const labels = { front: 'Front View', back: 'Back View', left: 'Left Side', right: 'Right Side' };
        const label = labels[position] || position;

        if (imageData) {
            slot.innerHTML = `
                <img src="${imageData}" alt="${label}" style="width: 100%; height: 100%; object-fit: cover;">
                <button class="btn-close position-absolute top-0 end-0 m-1" title="Remove image"></button>
                <div class="position-absolute bottom-0 start-0 end-0 p-1 text-center" 
                     style="background: rgba(0,0,0,0.7); color: white; font-size: 0.7rem;">
                    ${label}
                </div>
                <input type="file" accept="image/*" class="position-absolute inset-0 opacity-0" 
                       style="cursor: pointer;" data-position="${position}">
            `;
        } else {
            slot.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-plus fa-2x mb-2"></i>
                    <div style="font-size: 0.8rem;">${label}</div>
                </div>
                <div class="position-absolute bottom-0 start-0 end-0 p-1 text-center" 
                     style="background: rgba(0,0,0,0.7); color: white; font-size: 0.7rem;">
                    ${label}
                </div>
                <input type="file" accept="image/*" class="position-absolute inset-0 opacity-0" 
                       style="cursor: pointer;" data-position="${position}">
            `;
        }

        // Re-setup event handlers
        const newInput = slot.querySelector('input[type="file"]');
        if (newInput) {
            newInput.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'tpose', position);
            });
        }
    }

    /**
     * <summary>Select character for editing</summary>
     */
    selectCharacter(characterId) {
        this.log(`Selecting character: ${characterId}`);

        const character = this.characters.get(characterId);
        if (!character) {
            this.handleError(`Character not found: ${characterId}`, new Error('Character not found'));
            return;
        }

        this.selectedCharacter = character;
        this.activeTab = 'basic'; // Reset to basic tab

        // Update UI
        this.renderCharacterLibrary();
        this.renderCharacterEditor();
    }

    /**
     * <summary>Update character from current form data</summary>
     */
    updateCharacterFromForm() {
        if (!this.selectedCharacter) return;

        try {
            const formFields = {
                // Basic Info
                'cbg-char-name': 'name',
                'cbg-char-nickname': 'nickname',
                'cbg-char-age': 'age',
                'cbg-char-gender': 'gender',
                'cbg-char-species': 'species',
                'cbg-char-occupation': 'occupation',
                'cbg-char-role': 'role',
                'cbg-char-tags': 'tags',
                'cbg-char-summary': 'summary',

                // Appearance
                'cbg-char-height': 'height',
                'cbg-char-build': 'build',
                'cbg-char-skin': 'skinTone',
                'cbg-char-hair-color': 'hairColor',
                'cbg-char-hair-style': 'hairStyle',
                'cbg-char-eye-color': 'eyeColor',
                'cbg-char-eye-shape': 'eyeShape',
                'cbg-char-facial': 'facialFeatures',
                'cbg-char-clothing': 'clothing',
                'cbg-char-distinctive': 'distinctiveMarks',
                'cbg-char-accessories': 'accessories',
                'cbg-char-appearance-full': 'appearance',

                // Psychology
                'cbg-char-personality': 'personality',
                'cbg-char-temperament': 'temperament',
                'cbg-char-strengths': 'strengths',
                'cbg-char-flaws': 'flaws',
                'cbg-char-fears': 'fears',
                'cbg-char-motivations': 'motivations',
                'cbg-char-dreams': 'dreams',
                'cbg-char-secrets': 'secrets',
                'cbg-char-quirks': 'quirks',
                'cbg-char-speech': 'speechPattern',
                'cbg-char-catchphrases': 'catchphrases',

                // Backstory
                'cbg-char-birthplace': 'birthplace',
                'cbg-char-family': 'family',
                'cbg-char-education': 'education',
                'cbg-char-social-class': 'socialClass',
                'cbg-char-past-events': 'pastEvents',
                'cbg-char-formative': 'formativeExperiences',
                'cbg-char-achievements': 'achievements',
                'cbg-char-failures': 'failures',
                'cbg-char-trauma': 'trauma',
                'cbg-char-backstory-full': 'backstory',

                // Story Integration
                'cbg-char-story-role': 'storyRole',
                'cbg-char-importance': 'importance',
                'cbg-char-goals': 'goals',
                'cbg-char-conflicts': 'conflicts',
                'cbg-char-obstacles': 'obstacles',
                'cbg-char-arc': 'arc',
                'cbg-char-relationships': 'relationships',
                'cbg-char-influence': 'influence',
                'cbg-char-screen-time': 'screenTime',
                'cbg-char-first-appearance': 'firstAppearance',

                // Skills
                'cbg-char-talents': 'talents',
                'cbg-char-skills': 'skills',
                'cbg-char-powers': 'powers',
                'cbg-char-limitations': 'limitations',
                'cbg-char-equipment': 'equipment',
                'cbg-char-resources': 'resources',
                'cbg-char-strength': 'strength',
                'cbg-char-dexterity': 'dexterity',
                'cbg-char-intelligence': 'intelligence',
                'cbg-char-charisma': 'charisma',
                'cbg-char-wisdom': 'wisdom',
                'cbg-char-willpower': 'willpower',

                // Media
                'cbg-char-voice-description': 'voiceDescription',
                'cbg-char-lora': 'loraModel'
            };

            // Update all fields
            for (const [elementId, fieldName] of Object.entries(formFields)) {
                const value = this.getFormValue(elementId);
                if (value !== null && value !== undefined) {
                    this.selectedCharacter[fieldName] = value;
                }
            }

            this.selectedCharacter.lastModified = Date.now();

            // Update in characters map
            this.characters.set(this.selectedCharacter.id, this.selectedCharacter);

            // Update library display (name/role might have changed)
            this.renderCharacterLibrary();

        } catch (error) {
            this.handleError('Failed to update character from form', error);
        }
    }

    /**
     * <summary>Duplicate character</summary>
     */
    duplicateCharacter(characterId) {
        const character = this.characters.get(characterId);
        if (!character) return;

        const duplicate = { ...character };
        duplicate.id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        duplicate.name = `${character.name || 'Character'} (Copy)`;
        duplicate.createdDate = Date.now();
        duplicate.lastModified = Date.now();

        this.characters.set(duplicate.id, duplicate);
        this.selectCharacter(duplicate.id);

        this.renderCharacterLibrary();
        this.renderCharacterEditor();

        this.log(`Character duplicated: ${duplicate.id}`);
    }

    /**
     * <summary>Delete character</summary>
     */
    deleteCharacter(characterId) {
        const character = this.characters.get(characterId);
        if (!character) {
            this.log(`Character not found for deletion: ${characterId}`);
            return;
        }

        if (confirm(`Are you sure you want to delete "${character.name || 'Unnamed Character'}"?\n\nThis action cannot be undone.`)) {
            this.characters.delete(characterId);

            // Clear selection if deleted character was selected
            if (this.selectedCharacter?.id === characterId) {
                this.selectedCharacter = null;
            }

            // Update displays
            this.renderCharacterLibrary();
            this.renderCharacterEditor();

            this.log(`Character deleted: ${characterId}`);
        }
    }

    /**
     * <summary>Generate entire character with AI</summary>
     */
    async generateEntireCharacter() {
        if (!this.selectedCharacter) return;

        const generateBtn = document.getElementById('cbg-generate-entire-character');
        try {
            this.log('Generating entire character with AI...');
            if (generateBtn) {
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
                generateBtn.disabled = true;
            }

            // TODO (C# backend): Implement 'GenerateEntireCharacter' endpoint and call via genericRequest.
            // const result = await genericRequest('GenerateEntireCharacter', {
            //     characterId: this.selectedCharacter.id,
            //     characterData: this.selectedCharacter
            // }, data => data);
            // Object.assign(this.selectedCharacter, result.character);
            // await this.renderCharacterEditor();

        } catch (error) {
            this.handleError('Failed to generate character with AI', error);
        } finally {
            // No local generation. Backend must perform heavy-lift. Reset UI.
            if (generateBtn) {
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Entire Character';
                generateBtn.disabled = false;
            }
        }
    }

/**
 * <summary>Refine profile image</summary>
 */
async refineProfileImage() {
    if (!this.selectedCharacter) return;

    try {
        this.log('Refining profile image...');

        // TODO (C# backend): Implement 'RefineProfileImage' endpoint and call via genericRequest.
        // const response = await genericRequest('RefineProfileImage', {
        //     characterId: this.selectedCharacter.id,
        //     currentImage: this.selectedCharacter.profileImage,
        //     characterData: this.selectedCharacter
        // }, data => {
        //     this.selectedCharacter.profileImage = data.imageData;
        //     this.updateProfileImagePreview(data.imageData);
        // });

        // No local refinement. Backend must perform heavy-lift.

    } catch (error) {
        this.handleError('Failed to refine profile image', error);
    }
}

    /**
     * <summary>Central handler for media AI generation buttons</summary>
     */
    async handleMediaAIGeneration(buttonId) {
        switch (buttonId) {
            case 'cbg-ai-generate-all-images':
                return this.generateAllImages();
            case 'cbg-generate-profile-image':
                return this.generateProfileImage();
            case 'cbg-refine-profile-image':
                return this.refineProfileImage();
            case 'cbg-generate-all-tpose':
                return this.generateAllTPose();
            case 'cbg-generate-expressions':
                return this.generateExpressions();
            case 'cbg-generate-voice-sample':
                return this.generateVoiceSample();
            case 'cbg-train-character-lora':
                return this.trainCharacterLora();
            case 'cbg-test-character-generation':
                return this.testCharacterGeneration();
            default:
                this.log('Unknown media AI action', { buttonId });
        }
    }

    /**
     * <summary>Generate profile image (delegated to C#)</summary>
     */
    async generateProfileImage() {
        if (!this.selectedCharacter) return;
        try {
            this.log('Generating profile image (backend)...');
            // TODO (C# backend): Implement 'GenerateProfileImage' endpoint and call via genericRequest.
            // const response = await genericRequest('GenerateProfileImage', {
            //     characterId: this.selectedCharacter.id,
            //     characterData: this.selectedCharacter
            // }, data => {
            //     this.selectedCharacter.profileImage = data.imageData;
            //     this.updateProfileImagePreview(data.imageData);
            // });
        } catch (error) {
            this.handleError('Failed to generate profile image', error);
        }
    }

    /**
     * <summary>Generate all character images (profile, T-pose, expressions) via C#</summary>
     */
    async generateAllImages() {
        if (!this.selectedCharacter) return;
        try {
            this.log('Generating all images (backend)...');
            // TODO (C# backend): Implement 'GenerateAllCharacterImages' endpoint and call via genericRequest.
            // const response = await genericRequest('GenerateAllCharacterImages', {
            //     characterId: this.selectedCharacter.id,
            //     characterData: this.selectedCharacter
            // }, data => {
            //     // Expect data to include profileImage, tposeImages, expressions
            //     Object.assign(this.selectedCharacter, {
            //         profileImage: data.profileImage,
            //         tposeImages: data.tposeImages,
            //         expressions: data.expressions
            //     });
            //     this.renderCharacterEditor();
            // });
        } catch (error) {
            this.handleError('Failed to generate all images', error);
        }
    }

    /**
     * <summary>Generate all T-pose images (delegated to C#)</summary>
     */
    async generateAllTPose() {
        if (!this.selectedCharacter) return;
        try {
            this.log('Generating all T-pose images (backend)...');
            // TODO (C# backend): Implement 'GenerateTPoseImages' endpoint and call via genericRequest.
            // const response = await genericRequest('GenerateTPoseImages', {
            //     characterId: this.selectedCharacter.id,
            //     characterData: this.selectedCharacter
            // }, data => {
            //     this.selectedCharacter.tposeImages = data.tposeImages;
            //     // Update previews
            //     ['front','back','left','right'].forEach(pos => this.updateTPoseImagePreview(pos, data.tposeImages?.[pos] || null));
            // });
        } catch (error) {
            this.handleError('Failed to generate T-pose images', error);
        }
    }

    /**
     * <summary>Generate all expression images (delegated to C#)</summary>
     */
    async generateExpressions() {
        if (!this.selectedCharacter) return;
        try {
            this.log('Generating expression images (backend)...');
            // TODO (C# backend): Implement 'GenerateExpressions' endpoint and call via genericRequest.
            // const response = await genericRequest('GenerateExpressions', {
            //     characterId: this.selectedCharacter.id,
            //     characterData: this.selectedCharacter,
            //     emotions: ['happy','sad','angry','surprised','worried','determined']
            // }, data => {
            //     this.selectedCharacter.expressions = { ...this.selectedCharacter.expressions, ...data.expressions };
            //     // Update UI slots if needed
            //     this.renderCharacterEditor();
            // });
        } catch (error) {
            this.handleError('Failed to generate expressions', error);
        }
    }

    /**
     * <summary>Generate a specific expression image (delegated to C#)</summary>
     * @param {string} emotion - e.g., 'happy', 'sad'
     */
    async generateExpressionImage(emotion) {
        if (!this.selectedCharacter) return;
        try {
            this.log('Generating expression image (backend)...', { emotion });
            // TODO (C# backend): Implement 'GenerateExpressionImage' endpoint and call via genericRequest.
            // const response = await genericRequest('GenerateExpressionImage', {
            //     characterId: this.selectedCharacter.id,
            //     emotion,
            //     characterData: this.selectedCharacter
            // }, data => {
            //     if (!this.selectedCharacter.expressions) this.selectedCharacter.expressions = {};
            //     this.selectedCharacter.expressions[emotion] = data.imageData;
            //     this.renderCharacterEditor();
            // });
        } catch (error) {
            this.handleError('Failed to generate expression image', error);
        }
    }

    /**
     * <summary>Train LoRA for character (delegated to C#)</summary>
     */
    async trainCharacterLora() {
        if (!this.selectedCharacter) return;
        try {
            this.log('Training character LoRA (backend)...');
            // TODO (C# backend): Implement 'TrainCharacterLoRA' endpoint and call via genericRequest.
            // const response = await genericRequest('TrainCharacterLoRA', {
            //     characterId: this.selectedCharacter.id,
            //     characterData: this.selectedCharacter
            // }, data => {
            //     this.selectedCharacter.loraModel = data.modelName;
            //     this.renderCharacterEditor();
            // });
        } catch (error) {
            this.handleError('Failed to train character LoRA', error);
        }
    }

/**
 * <summary>Refine entire character</summary>
 */
async refineEntireCharacter() {
    if (!this.selectedCharacter) return;

    try {
        this.log('Refining entire character...');

        const btn = document.getElementById('cbg-refine-character');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refining...';
            btn.disabled = true;
        }

        // TODO (C# backend): Implement 'RefineCharacter' endpoint and call via genericRequest.
        // const response = await genericRequest('RefineCharacter', {
        //     characterId: this.selectedCharacter.id,
        //     characterData: this.selectedCharacter,
        //     storyContext: this.main.getManager('story')?.getStoryData()
        // }, data => {
        //     Object.assign(this.selectedCharacter, data.refinements);
        //     this.renderCharacterEditor();
        // });

        // No local refinement. Backend must perform heavy-lift. Reset UI for now.
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refine Character';
            btn.disabled = false;
        }

    } catch (error) {
        this.handleError('Failed to refine character', error);
    }
}

/**
 * <summary>Generate character relationships</summary>
 */
async generateCharacterRelationships() {
    if (!this.selectedCharacter) return;

    try {
        this.log('Generating character relationships...');

        const btn = document.getElementById('cbg-generate-relationships');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            btn.disabled = true;
        }

        // Get all other characters for relationship context
        const otherCharacters = Array.from(this.characters.values())
            .filter(char => char.id !== this.selectedCharacter.id);

        // TODO (C# backend): Implement 'GenerateCharacterRelationships' endpoint and call via genericRequest.
        // const response = await genericRequest('GenerateCharacterRelationships', {
        //     characterId: this.selectedCharacter.id,
        //     characterData: this.selectedCharacter,
        //     otherCharacters: otherCharacters,
        //     storyContext: this.main.getManager('story')?.getStoryData()
        // }, data => {
        //     this.selectedCharacter.relationships = data.relationships;
        //     this.renderCharacterEditor();
        // });

        // No local generation. Reset UI for now.
        if (btn) {
            btn.innerHTML = '<i class="fas fa-users"></i> Generate Relationships';
            btn.disabled = false;
        }

    } catch (error) {
        this.handleError('Failed to generate relationships', error);
    }
}

/**
 * <summary>Generate voice sample</summary>
 */
async generateVoiceSample() {
    if (!this.selectedCharacter) return;

    try {
        this.log('Generating voice sample...');

        // TODO (C# backend): Implement 'GenerateVoiceSample' endpoint and call via genericRequest.
        // const response = await genericRequest('GenerateVoiceSample', {
        //     characterId: this.selectedCharacter.id,
        //     voiceDescription: this.selectedCharacter.voiceDescription,
        //     characterData: this.selectedCharacter
        // }, data => {
        //     this.selectedCharacter.voiceSample = data.audioData;
        //     this.renderCharacterEditor();
        // });

        // No local voice generation.

    } catch (error) {
        this.handleError('Failed to generate voice sample', error);
    }
}

/**
 * <summary>Test character generation</summary>
 */
async testCharacterGeneration() {
    if (!this.selectedCharacter) return;

    try {
        this.log('Testing character generation...');

        // TODO (C# backend): Implement 'TestCharacterGeneration' endpoint and call via genericRequest.
        // const response = await genericRequest('TestCharacterGeneration', {
        //     characterId: this.selectedCharacter.id,
        //     characterData: this.selectedCharacter,
        //     testPrompts: ['portrait', 'full body', 'action pose']
        // }, data => {
        //     // Show test results in a modal or preview
        //     this.showTestResults(data.testImages);
        // });

        // No local generation test.

    } catch (error) {
        this.handleError('Failed to test character generation', error);
    }
}

    /**
     * <summary>Save current character</summary>
     */
    async saveCurrentCharacter() {
        if (!this.selectedCharacter) return;

        try {
            this.log('Saving current character...');

            // Update from form first
            this.updateCharacterFromForm();

            // TODO: Save character to C# backend
            // await genericRequest('SaveCharacter', { 
            //     character: this.selectedCharacter 
            // }, data => {
            //     this.log('Character saved to backend:', data);
            // });

            // Update UI
            const saveBtn = document.getElementById('cbg-save-character');
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

            this.log('Character saved successfully');

        } catch (error) {
            this.handleError('Failed to save character', error);
        }
    }

    /**
     * <summary>Save all character data</summary>
     */
    async saveData() {
        try {
            this.log('Saving all character data...');

            if (this.selectedCharacter) {
                this.updateCharacterFromForm();
            }

            const charactersData = Array.from(this.characters.values());

            // Update project data
            this.main.updateProjectData({ characters: charactersData });

            this.log(`Saved ${charactersData.length} characters`);

        } catch (error) {
            this.handleError('Failed to save character data', error);
        }
    }

    /**
     * <summary>Load character data</summary>
     * @param {Array} charactersData - Character data array
     */
    loadData(charactersData = []) {
        try {
            this.log(`Loading ${charactersData.length} characters...`);

            this.characters.clear();
            charactersData.forEach(character => {
                this.characters.set(character.id, character);
            });

            // Clear selection
            this.selectedCharacter = null;
            this.activeTab = 'basic';
            this.searchTerm = '';
            this.roleFilter = 'all';

            this.log('Character data loaded successfully');

        } catch (error) {
            this.handleError('Failed to load character data', error);
        }
    }

    /**
     * <summary>Get all characters</summary>
     * @returns {Array} Array of character data
     */
    getAllCharacters() {
        return Array.from(this.characters.values());
    }

    /**
     * <summary>Get character by ID</summary>
     * @param {string} characterId - Character ID
     * @returns {Object} Character data
     */
    getCharacter(characterId) {
        return this.characters.get(characterId);
    }

    /**
     * <summary>Get characters by role</summary>
     * @param {string} role - Character role
     * @returns {Array} Filtered characters
     */
    getCharactersByRole(role) {
        return Array.from(this.characters.values()).filter(char => char.role === role);
    }

    /**
     * <summary>Get main characters (protagonist/antagonist)</summary>
     * @returns {Array} Main characters
     */
    getMainCharacters() {
        return Array.from(this.characters.values()).filter(char =>
            char.role === 'Protagonist' || char.role === 'Antagonist'
        );
    }

    /**
     * <summary>Validate character data</summary>
     * @param {Object} character - Character to validate
     * @returns {Object} Validation result
     */
    validateCharacter(character) {
        const errors = [];
        const warnings = [];

        // Required fields
        if (!character.name || character.name.trim() === '') {
            errors.push('Character name is required');
        }

        if (!character.role) {
            warnings.push('Character role should be specified');
        }

        // Recommendations
        if (!character.personality) {
            warnings.push('Character personality helps with consistency');
        }

        if (!character.appearance && !character.profileImage) {
            warnings.push('Character appearance or image helps with visual consistency');
        }

        if (!character.goals) {
            warnings.push('Character goals help drive the story');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * <summary>Get character statistics</summary>
     * @returns {Object} Character statistics
     */
    getCharacterStats() {
        const stats = {
            total: this.characters.size,
            roles: {},
            withImages: 0,
            complete: 0
        };

        for (const char of this.characters.values()) {
            // Role stats
            const role = char.role || 'Unknown';
            stats.roles[role] = (stats.roles[role] || 0) + 1;

            // Image stats
            if (char.profileImage) {
                stats.withImages++;
            }

            // Completeness (has basic required fields)
            const validation = this.validateCharacter(char);
            if (validation.isValid && validation.warnings.length < 3) {
                stats.complete++;
            }
        }

        return stats;
    }

    /**
     * <summary>Search characters</summary>
     * @param {string} query - Search query
     * @returns {Array} Matching characters
     */
    searchCharacters(query) {
        if (!query || query.trim() === '') {
            return Array.from(this.characters.values());
        }

        const term = query.toLowerCase().trim();
        return Array.from(this.characters.values()).filter(char => {
            return (char.name || '').toLowerCase().includes(term) ||
                (char.occupation || '').toLowerCase().includes(term) ||
                (char.tags || '').toLowerCase().includes(term) ||
                (char.personality || '').toLowerCase().includes(term) ||
                (char.role || '').toLowerCase().includes(term);
        });
    }

    /**
     * <summary>Debug logging helper</summary>
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:Characters ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Cleanup resources</summary>
     */
    destroy() {
        this.log('Destroying Character Manager...');

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Remove any modal elements
        document.getElementById('characterCreationModal')?.remove();

        this.characters.clear();
        this.characterTemplates.clear();
        this.selectedCharacter = null;
        this.isInitialized = false;

        this.log('Character Manager destroyed');
    }
}

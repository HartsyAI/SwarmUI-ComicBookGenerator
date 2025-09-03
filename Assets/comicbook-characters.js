/**
 * <summary>Comic Book Generator - Character Management Module</summary>
 * Handles character creation, editing, and T-pose image management
 */

export class CharacterManager {
    constructor(main) {
        this.main = main;
        this.debug = true;
        this.characters = new Map();
        this.selectedCharacter = null;
        this.isInitialized = false;

        this.log('CharacterManager constructor called');
    }

    /**
     * <summary>Initialize the character manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Character Manager...');

            this.setupEventHandlers();
            this.isInitialized = true;

            this.log('Character Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Character Manager', error);
        }
    }

    /**
     * <summary>Setup event handlers for character management</summary>
     */
    setupEventHandlers() {
        this.log('Setting up character event handlers...');

        // Add character button
        const addButton = document.getElementById('cbg-add-character');
        if (addButton) {
            addButton.addEventListener('click', () => this.createNewCharacter());
        }

        // Save character button
        const saveButton = document.getElementById('cbg-save-character');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveCurrentCharacter());
        }
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
     * <summary>Render the character library grid</summary>
     */
    async renderCharacterLibrary() {
        const container = document.getElementById('cbg-character-cards');
        if (!container) {
            throw new Error('Character cards container not found');
        }

        this.log(`Rendering ${this.characters.size} characters in library`);

        let html = '';

        // Render existing characters
        for (const [id, character] of this.characters) {
            const isSelected = this.selectedCharacter?.id === id;
            const profileImage = character.profileImage || '';

            html += `
                <div class="cbg-char-card ${isSelected ? 'selected' : ''}" data-character-id="${id}">
                    <div class="character-profile-preview">
                        ${profileImage ?
                    `<img src="${profileImage}" alt="${escapeHtml(character.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.4rem;">` :
                    `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-soft); font-size: 0.8rem;">No Image</div>`
                }
                    </div>
                    <div class="character-info">
                        <div class="character-name">${escapeHtml(character.name || 'Unnamed Character')}</div>
                        <div class="character-role">${escapeHtml(character.role || 'No Role')}</div>
                    </div>
                    <div class="character-actions">
                        <button class="basic-button small-button character-edit-btn" title="Edit Character">✎</button>
                        <button class="basic-button small-button character-delete-btn" title="Delete Character">🗑</button>
                    </div>
                </div>
            `;
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

        // Add event listeners to character cards
        this.setupCharacterCardHandlers();
    }

    /**
     * <summary>Setup event handlers for character cards</summary>
     */
    setupCharacterCardHandlers() {
        const container = document.getElementById('cbg-character-cards');
        if (!container) return;

        // Character card selection
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.cbg-char-card');
            const addCard = e.target.closest('#cbg-character-card-add');

            if (addCard) {
                this.createNewCharacter();
                return;
            }

            if (card) {
                const characterId = card.dataset.characterId;
                if (characterId) {
                    this.selectCharacter(characterId);
                }
            }
        });

        // Edit and delete buttons
        container.addEventListener('click', (e) => {
            e.stopPropagation();

            if (e.target.classList.contains('character-edit-btn')) {
                const card = e.target.closest('.cbg-char-card');
                if (card) {
                    this.selectCharacter(card.dataset.characterId);
                }
            } else if (e.target.classList.contains('character-delete-btn')) {
                const card = e.target.closest('.cbg-char-card');
                if (card) {
                    this.deleteCharacter(card.dataset.characterId);
                }
            }
        });
    }

    /**
     * <summary>Render the character editor interface</summary>
     */
    async renderCharacterEditor() {
        const container = document.getElementById('cbg-character-editor-content');
        if (!container) {
            throw new Error('Character editor container not found');
        }

        if (!this.selectedCharacter) {
            container.innerHTML = `
                <div class="character-editor-placeholder">
                    <div style="text-align: center; color: var(--text-soft); padding: 2rem;">
                        <h3>No Character Selected</h3>
                        <p>Select a character from the library or create a new one to begin editing.</p>
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

        this.log(`Rendering editor for character: ${this.selectedCharacter.name}`);

        const character = this.selectedCharacter;

        let html = `
            <div class="character-editor-form">
                <div class="character-images-section">
                    <h4>Character Images</h4>
                    
                    <!-- Profile Image -->
                    <div class="profile-image-section" style="margin-bottom: 1.5rem;">
                        <label class="form-label">Profile Image</label>
                        <div class="profile-preview-large">
                            <div id="cbg-profile-preview-large" style="width:220px; height:280px; border:1px solid var(--shadow); border-radius:0.5rem; background-color: var(--background-soft); display:flex; align-items:center; justify-content:center; color: var(--text-soft); margin-bottom: 1rem; position: relative; overflow: hidden;">
                                ${character.profileImage ?
                `<img src="${character.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` :
                'Profile Image Preview'
            }
                                ${character.profileImage ? '<button class="interrupt-button auto-input-image-remove-button" title="Remove image" style="position: absolute; top: 5px; right: 5px;">&times;</button>' : ''}
                            </div>
                            <div class="auto-file-label">
                                <input id="cbg-profile-file" type="file" accept="image/*" class="auto-file" style="display: none;">
                                <button class="basic-button small-button" onclick="document.getElementById('cbg-profile-file').click()">Upload Profile Image</button>
                                <div class="auto-file-input-filename" id="cbg-profile-filename"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- T-Pose Images -->
                    <div class="tpose-images-section">
                        <label class="form-label">T-Pose Reference Images</label>
                        <div class="tpose-images-grid">
                            ${this.renderTPoseSlot('front', 'Front View', character.tposeImages?.front)}
                            ${this.renderTPoseSlot('back', 'Back View', character.tposeImages?.back)}
                            ${this.renderTPoseSlot('left', 'Left Side', character.tposeImages?.left)}
                            ${this.renderTPoseSlot('right', 'Right Side', character.tposeImages?.right)}
                        </div>
                    </div>
                </div>
                
                <div class="character-details-section">
                    <div id="cbg-character-form-fields">
                        <!-- Form fields will be populated by generateFormFields() -->
                    </div>
                    
                    <div class="character-ai-section" style="margin-top: 1.5rem;">
                        <div class="d-flex flex-column" style="gap:0.5rem;">
                            <button id="cbg-generate-profile-llm" class="basic-button small-button">Generate Character with AI</button>
                            <button id="cbg-refine-profile-llm" class="basic-button small-button">Refine Character with AI</button>
                            <button id="cbg-generate-tpose-llm" class="basic-button small-button">Generate T-Pose Images</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Generate form fields using SwarmUI functions
        await this.generateFormFields();

        // Setup image upload handlers
        this.setupImageHandlers();

        // Setup AI button handlers
        this.setupAIHandlers();
    }

    /**
     * <summary>Render a T-pose image slot</summary>
     * @param {string} position - Position (front, back, left, right)
     * @param {string} label - Display label
     * @param {string} imageData - Base64 image data
     * @returns {string} HTML string
     */
    renderTPoseSlot(position, label, imageData) {
        return `
            <div class="tpose-image-slot" data-position="${position}">
                ${imageData ?
                `<img src="${imageData}" alt="${label}">
                     <button class="interrupt-button auto-input-image-remove-button" title="Remove image" style="position: absolute; top: 2px; right: 2px; font-size: 0.8rem; width: 20px; height: 20px;">&times;</button>` :
                `<div class="upload-hint">Click to upload<br>${label}</div>`
            }
                <div class="image-label">${label}</div>
                <input type="file" accept="image/*" class="tpose-file-input" data-position="${position}" style="position: absolute; inset: 0; opacity: 0; cursor: pointer;">
            </div>
        `;
    }

    /**
     * <summary>Generate form fields using SwarmUI functions</summary>
     */
    async generateFormFields() {
        const container = document.getElementById('cbg-character-form-fields');
        if (!container) return;

        const character = this.selectedCharacter;

        try {
            let html = '';

            // Character basic info
            html += makeTextInput(null, 'cbg-char-name', 'character_name', 'Character Name',
                'The name of this character', character.name || '', 'normal', 'Enter character name');

            html += '<div class="d-flex" style="gap:1rem; margin-bottom:1rem;">';

            html += '<div style="flex: 1;">';
            html += makeDropdownInput(null, 'cbg-char-role', 'character_role', 'Role',
                'Character role in the story',
                ['Protagonist', 'Antagonist', 'Supporting', 'Background', 'Narrator', 'Other'],
                character.role || 'Supporting');
            html += '</div>';

            html += '<div style="flex: 1;">';
            html += makeTextInput(null, 'cbg-char-tags', 'character_tags', 'Tags',
                'Character tags/keywords', character.tags || '', 'normal', 'brave, witty, mysterious');
            html += '</div>';

            html += '</div>';

            // Physical description for AI generation
            html += makeTextInput(null, 'cbg-char-appearance', 'character_appearance', 'Physical Description',
                'Detailed physical appearance for AI generation', character.appearance || '', 'big',
                'Tall, athletic build, brown hair, green eyes, wearing medieval armor...');

            // Character details
            html += makeTextInput(null, 'cbg-char-backstory', 'character_backstory', 'Backstory',
                'Character background and origin story', character.backstory || '', 'big',
                'Character\'s background, origin story, and key life events...');

            html += makeTextInput(null, 'cbg-char-personality', 'character_personality', 'Personality & Traits',
                'Personality traits, quirks, and mannerisms', character.personality || '', 'big',
                'Personality traits, quirks, speech patterns, mannerisms...');

            html += makeTextInput(null, 'cbg-char-arc', 'character_arc', 'Character Arc',
                'How this character grows throughout the story', character.arc || '', 'big',
                'How should this character grow and change throughout the story?');

            // LoRA selection
            html += makeDropdownInput(null, 'cbg-char-lora', 'character_lora', 'LoRA Model',
                'Character LoRA for consistency', ['None'], character.loraModel || 'None');

            container.innerHTML = html;

            // Enable sliders and other SwarmUI enhancements
            if (typeof enableSlidersIn === 'function') {
                enableSlidersIn(container);
            }

            // Setup form field event handlers
            this.setupFormFieldHandlers();

        } catch (error) {
            this.handleError('Failed to generate form fields', error);
            container.innerHTML = '<div class="cbg-error">Failed to load form fields</div>';
        }
    }

    /**
     * <summary>Setup form field event handlers</summary>
     */
    setupFormFieldHandlers() {
        const container = document.getElementById('cbg-character-form-fields');
        if (!container) return;

        // Auto-save on form changes
        const inputs = container.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateCharacterFromForm();
            });

            // Also listen for input events on text fields for real-time updates
            if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    this.debounce(() => this.updateCharacterFromForm(), 500);
                });
            }
        });
    }

    /**
     * <summary>Setup image upload handlers</summary>
     */
    setupImageHandlers() {
        // Profile image handler
        const profileInput = document.getElementById('cbg-profile-file');
        if (profileInput) {
            profileInput.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'profile');
            });
        }

        // Profile image remove button
        const removeButton = document.querySelector('#cbg-profile-preview-large .auto-input-image-remove-button');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                this.removeImage('profile');
            });
        }

        // T-pose image handlers
        const tposeInputs = document.querySelectorAll('.tpose-file-input');
        tposeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'tpose', input.dataset.position);
            });
        });

        // T-pose image remove buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('auto-input-image-remove-button')) {
                const slot = e.target.closest('.tpose-image-slot');
                if (slot) {
                    this.removeImage('tpose', slot.dataset.position);
                }
            }
        });
    }

    /**
     * <summary>Setup AI generation handlers</summary>
     */
    setupAIHandlers() {
        const generateBtn = document.getElementById('cbg-generate-profile-llm');
        const refineBtn = document.getElementById('cbg-refine-profile-llm');
        const tposeBtn = document.getElementById('cbg-generate-tpose-llm');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateCharacterWithAI());
        }

        if (refineBtn) {
            refineBtn.addEventListener('click', () => this.refineCharacterWithAI());
        }

        if (tposeBtn) {
            tposeBtn.addEventListener('click', () => this.generateTPoseImages());
        }
    }

    /**
     * <summary>Handle image upload for profile or T-pose images</summary>
     * @param {Event} event - File input change event
     * @param {string} type - 'profile' or 'tpose'
     * @param {string} position - T-pose position (front, back, left, right)
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

            // Update library display
            this.renderCharacterLibrary();
        };

        reader.onerror = () => {
            this.handleError('Failed to read image file', reader.error);
        };

        reader.readAsDataURL(file);
    }

    /**
     * <summary>Remove an image from character</summary>
     * @param {string} type - 'profile' or 'tpose'
     * @param {string} position - T-pose position if applicable
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

        // Update character data
        this.characters.set(this.selectedCharacter.id, this.selectedCharacter);

        // Update library display
        this.renderCharacterLibrary();
    }

    /**
     * <summary>Update profile image preview</summary>
     * @param {string} imageData - Base64 image data or null
     */
    updateProfileImagePreview(imageData) {
        const preview = document.getElementById('cbg-profile-preview-large');
        if (!preview) return;

        if (imageData) {
            preview.innerHTML = `
                <img src="${imageData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
                <button class="interrupt-button auto-input-image-remove-button" title="Remove image" style="position: absolute; top: 5px; right: 5px;">&times;</button>
            `;
        } else {
            preview.innerHTML = 'Profile Image Preview';
        }
    }

    /**
     * <summary>Update T-pose image preview</summary>
     * @param {string} position - T-pose position
     * @param {string} imageData - Base64 image data or null
     */
    updateTPoseImagePreview(position, imageData) {
        const slot = document.querySelector(`.tpose-image-slot[data-position="${position}"]`);
        if (!slot) return;

        const labels = { front: 'Front View', back: 'Back View', left: 'Left Side', right: 'Right Side' };
        const label = labels[position] || position;

        if (imageData) {
            slot.innerHTML = `
                <img src="${imageData}" alt="${label}">
                <button class="interrupt-button auto-input-image-remove-button" title="Remove image" style="position: absolute; top: 2px; right: 2px; font-size: 0.8rem; width: 20px; height: 20px;">&times;</button>
                <div class="image-label">${label}</div>
                <input type="file" accept="image/*" class="tpose-file-input" data-position="${position}" style="position: absolute; inset: 0; opacity: 0; cursor: pointer;">
            `;
        } else {
            slot.innerHTML = `
                <div class="upload-hint">Click to upload<br>${label}</div>
                <div class="image-label">${label}</div>
                <input type="file" accept="image/*" class="tpose-file-input" data-position="${position}" style="position: absolute; inset: 0; opacity: 0; cursor: pointer;">
            `;
        }

        // Re-setup event handlers for the new input
        const newInput = slot.querySelector('.tpose-file-input');
        if (newInput) {
            newInput.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'tpose', position);
            });
        }
    }

    /**
     * <summary>Create a new character</summary>
     */
    createNewCharacter() {
        this.log('Creating new character...');

        const newCharacter = this.createCharacterData();
        this.characters.set(newCharacter.id, newCharacter);
        this.selectCharacter(newCharacter.id);

        // Update displays
        this.renderCharacterLibrary();
        this.renderCharacterEditor();

        this.log('New character created:', newCharacter.id);
    }

    /**
     * <summary>Create new character data structure</summary>
     * @returns {Object} New character data
     */
    createCharacterData() {
        const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: id,
            name: '',
            role: 'Supporting',
            appearance: '',
            personality: '',
            backstory: '',
            arc: '',
            tags: '',
            profileImage: null,
            tposeImages: {
                front: null,
                back: null,
                left: null,
                right: null
            },
            loraModel: 'None',
            createdDate: Date.now(),
            lastModified: Date.now()
        };
    }

    /**
     * <summary>Select a character for editing</summary>
     * @param {string} characterId - Character ID to select
     */
    selectCharacter(characterId) {
        this.log(`Selecting character: ${characterId}`);

        const character = this.characters.get(characterId);
        if (!character) {
            this.handleError(`Character not found: ${characterId}`, new Error('Character not found'));
            return;
        }

        this.selectedCharacter = character;

        // Update UI
        this.renderCharacterLibrary();
        this.renderCharacterEditor();
    }

    /**
     * <summary>Delete a character</summary>
     * @param {string} characterId - Character ID to delete
     */
    deleteCharacter(characterId) {
        this.log(`Deleting character: ${characterId}`);

        const character = this.characters.get(characterId);
        if (!character) {
            this.log(`Character not found for deletion: ${characterId}`);
            return;
        }

        if (confirm(`Are you sure you want to delete "${character.name || 'Unnamed Character'}"?`)) {
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
     * <summary>Update character from form data</summary>
     */
    updateCharacterFromForm() {
        if (!this.selectedCharacter) return;

        try {
            // Get form values using SwarmUI's getInputVal function
            this.selectedCharacter.name = this.getFormValue('cbg-char-name');
            this.selectedCharacter.role = this.getFormValue('cbg-char-role');
            this.selectedCharacter.tags = this.getFormValue('cbg-char-tags');
            this.selectedCharacter.appearance = this.getFormValue('cbg-char-appearance');
            this.selectedCharacter.backstory = this.getFormValue('cbg-char-backstory');
            this.selectedCharacter.personality = this.getFormValue('cbg-char-personality');
            this.selectedCharacter.arc = this.getFormValue('cbg-char-arc');
            this.selectedCharacter.loraModel = this.getFormValue('cbg-char-lora');

            this.selectedCharacter.lastModified = Date.now();

            // Update in characters map
            this.characters.set(this.selectedCharacter.id, this.selectedCharacter);

            // Update library display (character name/role might have changed)
            this.renderCharacterLibrary();

        } catch (error) {
            this.handleError('Failed to update character from form', error);
        }
    }

    /**
     * <summary>Get form field value safely</summary>
     * @param {string} elementId - Element ID
     * @returns {string} Field value
     */
    getFormValue(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return '';

        if (typeof getInputVal === 'function') {
            return getInputVal(element) || '';
        }
        return element.value || '';
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
            // await genericRequest('SaveCharacter', { character: this.selectedCharacter }, data => {
            //     this.log('Character saved to backend:', data);
            // });

            this.log('Character saved locally');

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

            this.log('Character data loaded successfully');

        } catch (error) {
            this.handleError('Failed to load character data', error);
        }
    }

    /**
     * <summary>Generate character with AI</summary>
     */
    async generateCharacterWithAI() {
        if (!this.selectedCharacter) return;

        try {
            this.log('Generating character with AI...');

            const generateBtn = document.getElementById('cbg-generate-profile-llm');
            if (generateBtn) {
                generateBtn.innerHTML = '<span class="cbg-spinner"></span>Generating...';
                generateBtn.disabled = true;
            }

            // TODO: Call C# backend method for AI character generation
            // const response = await genericRequest('GenerateCharacter', {
            //     characterId: this.selectedCharacter.id,
            //     existingData: this.selectedCharacter
            // }, data => {
            //     // Update character with AI-generated data
            //     Object.assign(this.selectedCharacter, data.character);
            //     this.renderCharacterEditor();
            // });

            // Placeholder for demonstration
            setTimeout(() => {
                this.log('AI character generation completed (placeholder)');
                if (generateBtn) {
                    generateBtn.innerHTML = 'Generate Character with AI';
                    generateBtn.disabled = false;
                }
            }, 2000);

        } catch (error) {
            this.handleError('Failed to generate character with AI', error);

            const generateBtn = document.getElementById('cbg-generate-profile-llm');
            if (generateBtn) {
                generateBtn.innerHTML = 'Generate Character with AI';
                generateBtn.disabled = false;
            }
        }
    }

    /**
     * <summary>Refine character with AI</summary>
     */
    async refineCharacterWithAI() {
        if (!this.selectedCharacter) return;

        try {
            this.log('Refining character with AI...');

            // TODO: Call C# backend method for AI character refinement
            this.log('AI character refinement completed (placeholder)');

        } catch (error) {
            this.handleError('Failed to refine character with AI', error);
        }
    }

    /**
     * <summary>Generate T-pose images with AI</summary>
     */
    async generateTPoseImages() {
        if (!this.selectedCharacter) return;

        try {
            this.log('Generating T-pose images with AI...');

            // TODO: Call C# backend method for T-pose image generation
            this.log('T-pose image generation completed (placeholder)');

        } catch (error) {
            this.handleError('Failed to generate T-pose images with AI', error);
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
     * <summary>Debounce helper function</summary>
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     */
    debounce(func, delay) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(func, delay);
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
     * <summary>Error handling helper</summary>
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    handleError(message, error) {
        console.error(`[CBG:Characters ERROR] ${message}:`, error);

        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
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

        this.characters.clear();
        this.selectedCharacter = null;
        this.isInitialized = false;

        this.log('Character Manager destroyed');
    }
}

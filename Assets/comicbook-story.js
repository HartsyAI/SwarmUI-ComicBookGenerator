/**
 * <summary>Comic Book Generator - Story Management Module</summary>
 * Handles story development, plot creation, and script writing
 */

export class StoryManager {
    constructor(main) {
        this.main = main;
        this.debug = true;
        this.storyData = null;
        this.plotPoints = [];
        this.script = '';
        this.isInitialized = false;
        this.scriptEditor = null;

        this.log('StoryManager constructor called');
    }

    /**
     * <summary>Initialize the story manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Story Manager...');

            this.initializeStoryData();
            this.setupEventHandlers();
            this.isInitialized = true;

            this.log('Story Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Story Manager', error);
        }
    }

    /**
     * <summary>Initialize default story data</summary>
     */
    initializeStoryData() {
        this.storyData = {
            title: '',
            genre: 'Fantasy',
            theme: '',
            tone: 'Heroic',
            totalPages: 8,
            panelsPerPage: 4,
            targetAudience: 'All Ages',
            setting: '',
            timeframe: '',
            mainConflict: '',
            createdDate: Date.now(),
            lastModified: Date.now()
        };

        this.plotPoints = [];
        this.script = '';
    }

    /**
     * <summary>Setup event handlers for story management</summary>
     */
    setupEventHandlers() {
        this.log('Setting up story event handlers...');

        // AI generation buttons (will be set up when rendered)
        // Save script button
        const saveButton = document.getElementById('cbg-script-save');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveScript());
        }
    }

    /**
     * <summary>Render the story management interface</summary>
     */
    async render() {
        try {
            this.log('Rendering story interface...');

            await this.renderStorySettings();
            await this.renderScriptEditor();

        } catch (error) {
            this.handleError('Failed to render story interface', error);
        }
    }

    /**
     * <summary>Render the story settings and plot development section</summary>
     */
    async renderStorySettings() {
        const container = document.getElementById('cbg-story-settings-content');
        if (!container) {
            throw new Error('Story settings container not found');
        }

        this.log('Rendering story settings...');

        try {
            let html = '';

            // Story Basics Section
            html += '<div class="story-section" style="margin-bottom: 2rem;">';
            html += '<h4>Story Basics</h4>';

            html += makeTextInput(null, 'cbg-story-title', 'story_title', 'Story Title',
                'The title of your comic book', this.storyData.title, 'normal', 'Enter story title');

            html += '<div class="d-flex" style="gap: 0.75rem; margin-bottom: 0.75rem;">';
            html += '<div style="flex: 1;">';
            html += makeDropdownInput(null, 'cbg-story-genre', 'story_genre', 'Genre',
                'Story genre',
                ['Fantasy', 'Sci-Fi', 'Horror', 'Romance', 'Comedy', 'Drama', 'Action', 'Mystery', 'Superhero', 'Slice of Life'],
                this.storyData.genre);
            html += '</div>';
            html += '<div style="flex: 1;">';
            html += makeDropdownInput(null, 'cbg-story-tone', 'story_tone', 'Tone',
                'Overall tone/mood',
                ['Heroic', 'Dark', 'Light-hearted', 'Epic', 'Gritty', 'Whimsical', 'Dramatic', 'Comedic'],
                this.storyData.tone);
            html += '</div>';
            html += '</div>';

            html += makeTextInput(null, 'cbg-story-theme', 'story_theme', 'Theme',
                'Central theme or message', this.storyData.theme, 'normal', 'Good vs evil, coming of age, redemption...');

            html += '<div class="d-flex" style="gap: 0.75rem; margin-bottom: 0.75rem;">';
            html += '<div style="flex: 1;">';
            html += makeNumberInput(null, 'cbg-story-pages', 'story_pages', 'Total Pages',
                'Number of comic pages', this.storyData.totalPages, 1, 100, 1);
            html += '</div>';
            html += '<div style="flex: 1;">';
            html += makeNumberInput(null, 'cbg-story-panels', 'story_panels_per_page', 'Panels per Page',
                'Average panels per page', this.storyData.panelsPerPage, 1, 12, 1);
            html += '</div>';
            html += '</div>';

            html += makeDropdownInput(null, 'cbg-story-audience', 'story_audience', 'Target Audience',
                'Intended audience',
                ['All Ages', 'Kids (6-12)', 'Teen (13-17)', 'Young Adult (18-25)', 'Adult (25+)', 'Mature (18+)'],
                this.storyData.targetAudience);

            html += '</div>';

            // World Building Section
            html += '<div class="story-section" style="margin-bottom: 2rem;">';
            html += '<h4>World & Setting</h4>';

            html += makeTextInput(null, 'cbg-story-setting', 'story_setting', 'Setting',
                'Where and when the story takes place', this.storyData.setting, 'big',
                'Medieval fantasy kingdom, modern city, space station, etc...');

            html += makeTextInput(null, 'cbg-story-timeframe', 'story_timeframe', 'Timeframe',
                'How much time the story covers', this.storyData.timeframe, 'normal',
                'One day, several weeks, a lifetime...');

            html += makeTextInput(null, 'cbg-story-conflict', 'story_conflict', 'Main Conflict',
                'The central conflict or problem', this.storyData.mainConflict, 'big',
                'What is the main problem the characters must overcome?');

            html += '</div>';

            // Plot Development Section
            html += '<div class="story-section" style="margin-bottom: 2rem;">';
            html += '<div class="d-flex align-items-center justify-content-between" style="margin-bottom: 1rem;">';
            html += '<h4 style="margin: 0;">Plot Development</h4>';
            html += '<div>';
            html += '<button class="basic-button small-button me-2" id="cbg-add-plot-point">+ Add Point</button>';
            html += '<button class="basic-button small-button" id="cbg-story-structure-help">Structure Help</button>';
            html += '</div>';
            html += '</div>';

            html += '<div id="cbg-plot-points-container">';
            html += this.renderPlotPoints();
            html += '</div>';

            html += '</div>';

            // AI Assistance Section
            html += '<div class="story-section">';
            html += '<h4>AI Assistance</h4>';
            html += '<div class="d-flex flex-column" style="gap: 0.5rem;">';
            html += '<button class="basic-button small-button" id="cbg-story-generate-llm">Generate Plot Outline</button>';
            html += '<button class="basic-button small-button" id="cbg-story-refine-llm">Refine Story Elements</button>';
            html += '<button class="basic-button small-button" id="cbg-story-analyze-llm">Analyze Pacing</button>';
            html += '</div>';
            html += '</div>';

            container.innerHTML = html;

            // Enable sliders and other SwarmUI enhancements
            if (typeof enableSlidersIn === 'function') {
                enableSlidersIn(container);
            }

            // Setup event handlers for the rendered elements
            this.setupStorySettingsHandlers();

        } catch (error) {
            this.handleError('Failed to generate story settings', error);
            container.innerHTML = '<div class="cbg-error">Failed to load story settings</div>';
        }
    }

    /**
     * <summary>Render plot points list</summary>
     * @returns {string} HTML string for plot points
     */
    renderPlotPoints() {
        let html = '';

        if (this.plotPoints.length === 0) {
            // Add default structure if no points exist
            this.plotPoints = [
                { id: 1, text: 'Opening - Introduce protagonist and world', act: 1 },
                { id: 2, text: 'Inciting incident - The problem begins', act: 1 },
                { id: 3, text: 'Rising action - Complications arise', act: 2 },
                { id: 4, text: 'Midpoint - Major revelation or setback', act: 2 },
                { id: 5, text: 'Climax - Final confrontation', act: 3 },
                { id: 6, text: 'Resolution - Conclusion and aftermath', act: 3 }
            ];
        }

        html += '<div class="plot-points-list">';

        this.plotPoints.forEach((point, index) => {
            const actClass = `act-${point.act || 1}`;
            html += `
                <div class="plot-point-item ${actClass}" data-point-id="${point.id}" style="margin-bottom: 0.75rem; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--background-soft);">
                    <div class="plot-point-header" style="display: flex; align-items: center; justify-content: between; margin-bottom: 0.5rem;">
                        <div class="plot-point-number" style="font-weight: bold; color: var(--primary); margin-right: 0.5rem;">
                            ${index + 1}.
                        </div>
                        <div class="plot-point-act" style="font-size: 0.8rem; color: var(--text-soft); margin-left: auto; margin-right: 0.5rem;">
                            Act ${point.act || 1}
                        </div>
                        <button class="basic-button small-button plot-point-delete" title="Delete plot point" style="padding: 0.25rem 0.5rem;">×</button>
                    </div>
                    <textarea class="plot-point-text auto-text" style="width: 100%; min-height: 3rem; resize: vertical;" placeholder="Describe this plot point...">${escapeHtml(point.text)}</textarea>
                </div>
            `;
        });

        html += '</div>';

        return html;
    }

    /**
     * <summary>Setup event handlers for story settings</summary>
     */
    setupStorySettingsHandlers() {
        const container = document.getElementById('cbg-story-settings-content');
        if (!container) return;

        // Form field change handlers
        const inputs = container.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateStoryDataFromForm();
            });
        });

        // Plot point handlers
        const addPlotButton = container.querySelector('#cbg-add-plot-point');
        if (addPlotButton) {
            addPlotButton.addEventListener('click', () => this.addPlotPoint());
        }

        const structureButton = container.querySelector('#cbg-story-structure-help');
        if (structureButton) {
            structureButton.addEventListener('click', () => this.showStructureHelp());
        }

        // Plot point text changes
        container.addEventListener('input', (e) => {
            if (e.target.classList.contains('plot-point-text')) {
                this.debounce(() => this.updatePlotPointsFromForm(), 1000);
            }
        });

        // Plot point deletion
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('plot-point-delete')) {
                const item = e.target.closest('.plot-point-item');
                const pointId = parseInt(item.dataset.pointId);
                this.deletePlotPoint(pointId);
            }
        });

        // AI assistance buttons
        const generateButton = container.querySelector('#cbg-story-generate-llm');
        const refineButton = container.querySelector('#cbg-story-refine-llm');
        const analyzeButton = container.querySelector('#cbg-story-analyze-llm');

        if (generateButton) {
            generateButton.addEventListener('click', () => this.generatePlotWithAI());
        }

        if (refineButton) {
            refineButton.addEventListener('click', () => this.refineStoryWithAI());
        }

        if (analyzeButton) {
            analyzeButton.addEventListener('click', () => this.analyzePacingWithAI());
        }
    }

    /**
     * <summary>Render the script editor section</summary>
     */
    async renderScriptEditor() {
        const container = document.getElementById('cbg-story-script-content');
        if (!container) {
            throw new Error('Script editor container not found');
        }

        this.log('Rendering script editor...');

        try {
            let html = '';

            html += `
                <div class="script-editor-wrapper" style="height: 100%; display: flex; flex-direction: column;">
                    <div class="script-toolbar" style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="script-info">
                                <span class="script-stats" id="cbg-script-stats">0 pages, 0 panels</span>
                            </div>
                            <div class="script-tools">
                                <button class="basic-button small-button me-2" id="cbg-script-format-help">Format Help</button>
                                <button class="basic-button small-button me-2" id="cbg-script-import">Import Script</button>
                                <button class="basic-button small-button" id="cbg-script-export">Export Script</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="script-editor-area" style="flex-grow: 1; position: relative;">
                        <textarea id="cbg-story-script" class="script-textarea" 
                            style="width: 100%; height: 100%; min-height: 400px; resize: none; font-family: 'Courier New', monospace; font-size: 0.9rem; line-height: 1.4; padding: 1rem; border: 1px solid var(--border); border-radius: 0.5rem;" 
                            placeholder="${this.getScriptPlaceholder()}">${escapeHtml(this.script)}</textarea>
                        
                        <div class="script-overlay" id="cbg-script-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 1; opacity: 0;">
                            <!-- Syntax highlighting overlay -->
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Setup script editor
            this.setupScriptEditor();

        } catch (error) {
            this.handleError('Failed to render script editor', error);
            container.innerHTML = '<div class="cbg-error">Failed to load script editor</div>';
        }
    }

    /**
     * <summary>Get script placeholder text</summary>
     * @returns {string} Placeholder text for script editor
     */
    getScriptPlaceholder() {
        return `COMIC SCRIPT FORMAT:

PAGE 1

PANEL 1:
[WIDE SHOT: Medieval village at dawn, mist rolling through cobblestone streets]
CAPTION: In the kingdom of Aethermoor, darkness stirs...

PANEL 2: 
[CLOSE-UP: ELENA's determined face, hand on sword hilt]
ELENA: Today we end this curse, once and for all.
MARCUS (OFF): Are you certain about this?

PANEL 3:
[MEDIUM SHOT: Elena and Marcus in village square, preparing for journey]
ELENA: We've trained for this moment our entire lives.
MARCUS: Then let's finish what our ancestors started.

PANEL 4:
[WIDE SHOT: The two heroes walking toward dark forest in distance]
CAPTION: And so begins their final quest...

---

Continue writing your script here. Use this format:
- PAGE numbers for page breaks
- PANEL numbers for each panel
- [DESCRIPTIONS] for scene/shot descriptions
- CHARACTER: dialogue
- CAPTION: for narrator text
- SFX: for sound effects`;
    }

    /**
     * <summary>Setup script editor functionality</summary>
     */
    setupScriptEditor() {
        const scriptTextarea = document.getElementById('cbg-story-script');
        if (!scriptTextarea) return;

        // Auto-save script changes
        scriptTextarea.addEventListener('input', () => {
            this.script = scriptTextarea.value;
            this.debounce(() => this.updateScriptStats(), 500);
        });

        // Add script formatting helpers
        if (typeof textPromptAddKeydownHandler === 'function') {
            textPromptAddKeydownHandler(scriptTextarea);
        }

        // Setup toolbar buttons
        const formatHelpBtn = document.getElementById('cbg-script-format-help');
        const importBtn = document.getElementById('cbg-script-import');
        const exportBtn = document.getElementById('cbg-script-export');

        if (formatHelpBtn) {
            formatHelpBtn.addEventListener('click', () => this.showScriptFormatHelp());
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => this.importScript());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportScript());
        }

        // Update initial stats
        this.updateScriptStats();
    }

    /**
     * <summary>Update story data from form inputs</summary>
     */
    updateStoryDataFromForm() {
        try {
            this.storyData.title = this.getFormValue('cbg-story-title');
            this.storyData.genre = this.getFormValue('cbg-story-genre');
            this.storyData.tone = this.getFormValue('cbg-story-tone');
            this.storyData.theme = this.getFormValue('cbg-story-theme');
            this.storyData.totalPages = parseInt(this.getFormValue('cbg-story-pages')) || 8;
            this.storyData.panelsPerPage = parseInt(this.getFormValue('cbg-story-panels')) || 4;
            this.storyData.targetAudience = this.getFormValue('cbg-story-audience');
            this.storyData.setting = this.getFormValue('cbg-story-setting');
            this.storyData.timeframe = this.getFormValue('cbg-story-timeframe');
            this.storyData.mainConflict = this.getFormValue('cbg-story-conflict');

            this.storyData.lastModified = Date.now();

            this.log('Story data updated from form');

        } catch (error) {
            this.handleError('Failed to update story data from form', error);
        }
    }

    /**
     * <summary>Update plot points from form inputs</summary>
     */
    updatePlotPointsFromForm() {
        try {
            const plotItems = document.querySelectorAll('.plot-point-item');

            plotItems.forEach((item, index) => {
                const pointId = parseInt(item.dataset.pointId);
                const textarea = item.querySelector('.plot-point-text');

                if (textarea) {
                    const point = this.plotPoints.find(p => p.id === pointId);
                    if (point) {
                        point.text = textarea.value;
                    }
                }
            });

            this.log('Plot points updated from form');

        } catch (error) {
            this.handleError('Failed to update plot points from form', error);
        }
    }

    /**
     * <summary>Add a new plot point</summary>
     */
    addPlotPoint() {
        const newId = Math.max(0, ...this.plotPoints.map(p => p.id)) + 1;
        const newPoint = {
            id: newId,
            text: '',
            act: this.plotPoints.length < 2 ? 1 : (this.plotPoints.length < 4 ? 2 : 3)
        };

        this.plotPoints.push(newPoint);

        // Re-render plot points
        const container = document.getElementById('cbg-plot-points-container');
        if (container) {
            container.innerHTML = this.renderPlotPoints();
            this.setupStorySettingsHandlers();
        }

        this.log('Added new plot point:', newId);
    }

    /**
     * <summary>Delete a plot point</summary>
     * @param {number} pointId - Plot point ID to delete
     */
    deletePlotPoint(pointId) {
        const index = this.plotPoints.findIndex(p => p.id === pointId);
        if (index >= 0) {
            this.plotPoints.splice(index, 1);

            // Re-render plot points
            const container = document.getElementById('cbg-plot-points-container');
            if (container) {
                container.innerHTML = this.renderPlotPoints();
                this.setupStorySettingsHandlers();
            }

            this.log('Deleted plot point:', pointId);
        }
    }

    /**
     * <summary>Update script statistics</summary>
     */
    updateScriptStats() {
        try {
            const statsElement = document.getElementById('cbg-script-stats');
            if (!statsElement) return;

            const script = this.script || '';
            const pageMatches = script.match(/^PAGE\s+\d+/gim) || [];
            const panelMatches = script.match(/^PANEL\s+\d+:/gim) || [];

            const pageCount = pageMatches.length;
            const panelCount = panelMatches.length;

            statsElement.textContent = `${pageCount} pages, ${panelCount} panels`;

        } catch (error) {
            this.handleError('Failed to update script stats', error);
        }
    }

    /**
     * <summary>Show script format help</summary>
     */
    showScriptFormatHelp() {
        const helpContent = `
<div class="script-help">
    <h4>Comic Script Format Guide</h4>
    <div style="text-align: left;">
        <p><strong>PAGE [number]</strong> - Starts a new page</p>
        <p><strong>PANEL [number]:</strong> - Starts a new panel</p>
        <p><strong>[DESCRIPTION]</strong> - Scene/shot description in brackets</p>
        <p><strong>CHARACTER:</strong> - Character name followed by dialogue</p>
        <p><strong>CHARACTER (OFF):</strong> - Off-panel dialogue</p>
        <p><strong>CAPTION:</strong> - Narrator caption box</p>
        <p><strong>SFX:</strong> - Sound effects</p>
        <br>
        <p><strong>Shot Types:</strong> WIDE SHOT, MEDIUM SHOT, CLOSE-UP, EXTREME CLOSE-UP</p>
        <p><strong>Camera Angles:</strong> HIGH ANGLE, LOW ANGLE, BIRD'S EYE, WORM'S EYE</p>
    </div>
</div>
        `;

        // Use SwarmUI's modal system if available
        if (typeof showError === 'function') {
            // Create a temporary modal-like display
            const helpModal = document.createElement('div');
            helpModal.className = 'cbg-help-modal';
            helpModal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                    <div style="background: var(--background); border: 1px solid var(--border); border-radius: 0.5rem; padding: 2rem; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                        ${helpContent}
                        <div style="text-align: center; margin-top: 1rem;">
                            <button class="basic-button btn-primary" onclick="this.closest('.cbg-help-modal').remove()">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(helpModal);
        }
    }

    /**
     * <summary>Show story structure help</summary>
     */
    showStructureHelp() {
        const helpContent = `
<div class="structure-help">
    <h4>Three-Act Story Structure</h4>
    <div style="text-align: left;">
        <h5>Act 1 - Setup (25%)</h5>
        <ul>
            <li>Introduce protagonist and world</li>
            <li>Establish normal life</li>
            <li>Present inciting incident</li>
        </ul>
        
        <h5>Act 2 - Confrontation (50%)</h5>
        <ul>
            <li>Rising action and complications</li>
            <li>Character development</li>
            <li>Midpoint twist or revelation</li>
            <li>Crisis point</li>
        </ul>
        
        <h5>Act 3 - Resolution (25%)</h5>
        <ul>
            <li>Final confrontation/climax</li>
            <li>Resolution of conflict</li>
            <li>New normal established</li>
        </ul>
    </div>
</div>
        `;

        // Similar modal approach as format help
        const helpModal = document.createElement('div');
        helpModal.className = 'cbg-help-modal';
        helpModal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div style="background: var(--background); border: 1px solid var(--border); border-radius: 0.5rem; padding: 2rem; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                    ${helpContent}
                    <div style="text-align: center; margin-top: 1rem;">
                        <button class="basic-button btn-primary" onclick="this.closest('.cbg-help-modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(helpModal);
    }

    /**
     * <summary>Generate plot outline with AI</summary>
     */
    async generatePlotWithAI() {
        try {
            this.log('Generating plot with AI...');

            const generateBtn = document.getElementById('cbg-story-generate-llm');
            if (generateBtn) {
                generateBtn.innerHTML = '<span class="cbg-spinner"></span>Generating...';
                generateBtn.disabled = true;
            }

            // Update story data from form first
            this.updateStoryDataFromForm();

            // TODO: Call C# backend method for AI plot generation
            // const response = await genericRequest('GenerateStoryPlot', {
            //     storyData: this.storyData,
            //     characters: this.main.getManager('characters').getAllCharacters(),
            //     existingPlot: this.plotPoints
            // }, data => {
            //     this.plotPoints = data.plotPoints;
            //     this.renderStorySettings();
            // });

            // Placeholder demonstration
            setTimeout(() => {
                this.log('AI plot generation completed (placeholder)');
                if (generateBtn) {
                    generateBtn.innerHTML = 'Generate Plot Outline';
                    generateBtn.disabled = false;
                }
            }, 3000);

        } catch (error) {
            this.handleError('Failed to generate plot with AI', error);

            const generateBtn = document.getElementById('cbg-story-generate-llm');
            if (generateBtn) {
                generateBtn.innerHTML = 'Generate Plot Outline';
                generateBtn.disabled = false;
            }
        }
    }

    /**
     * <summary>Refine story elements with AI</summary>
     */
    async refineStoryWithAI() {
        try {
            this.log('Refining story with AI...');

            // TODO: Call C# backend method for story refinement
            this.log('AI story refinement completed (placeholder)');

        } catch (error) {
            this.handleError('Failed to refine story with AI', error);
        }
    }

    /**
     * <summary>Analyze pacing with AI</summary>
     */
    async analyzePacingWithAI() {
        try {
            this.log('Analyzing pacing with AI...');

            // TODO: Call C# backend method for pacing analysis
            this.log('AI pacing analysis completed (placeholder)');

        } catch (error) {
            this.handleError('Failed to analyze pacing with AI', error);
        }
    }

    /**
     * <summary>Import script from file</summary>
     */
    importScript() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.fountain,.fdx';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.script = e.target.result;
                const scriptTextarea = document.getElementById('cbg-story-script');
                if (scriptTextarea) {
                    scriptTextarea.value = this.script;
                    this.updateScriptStats();
                }
                this.log('Script imported from file:', file.name);
            };
            reader.readAsText(file);
        });

        input.click();
    }

    /**
     * <summary>Export script to file</summary>
     */
    exportScript() {
        const scriptContent = this.script || this.getScriptPlaceholder();
        const filename = `${this.storyData.title || 'Comic Script'}.txt`;

        if (typeof downloadPlainText === 'function') {
            downloadPlainText(filename, scriptContent);
            this.log('Script exported to:', filename);
        } else {
            // Fallback download method
            const blob = new Blob([scriptContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * <summary>Save script</summary>
     */
    async saveScript() {
        try {
            this.log('Saving script...');

            const scriptTextarea = document.getElementById('cbg-story-script');
            if (scriptTextarea) {
                this.script = scriptTextarea.value;
            }

            // TODO: Save script to C# backend
            this.log('Script saved successfully');

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

            this.updateStoryDataFromForm();
            this.updatePlotPointsFromForm();

            const scriptTextarea = document.getElementById('cbg-story-script');
            if (scriptTextarea) {
                this.script = scriptTextarea.value;
            }

            const storyData = {
                storyInfo: this.storyData,
                plotPoints: this.plotPoints,
                script: this.script
            };

            // Update project data
            this.main.updateProjectData({ story: storyData });

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

            if (storyData.storyInfo) {
                this.storyData = { ...this.storyData, ...storyData.storyInfo };
            }

            if (storyData.plotPoints) {
                this.plotPoints = storyData.plotPoints;
            }

            if (storyData.script) {
                this.script = storyData.script;
            }

            this.log('Story data loaded successfully');

        } catch (error) {
            this.handleError('Failed to load story data', error);
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
     * <summary>Get story data</summary>
     * @returns {Object} Current story data
     */
    getStoryData() {
        return {
            storyInfo: this.storyData,
            plotPoints: this.plotPoints,
            script: this.script
        };
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
            console.log(`[CBG:Story ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     * @param {string} message - Error message
     * @param {Error} error - Error object
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

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.isInitialized = false;
        this.log('Story Manager destroyed');
    }
}

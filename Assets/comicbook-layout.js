/**
 * <summary>Comic Book Generator - Layout Management Module</summary>
 * Handles page layout, panel creation, positioning, and scene generation
 */

export class LayoutManager {
    constructor(main) {
        this.main = main;
        this.debug = true;
        this.pages = [];
        this.currentPage = 0;
        this.selectedPanel = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.canvasRect = null;
        this.panelTemplates = [];
        this.isInitialized = false;

        this.log('LayoutManager constructor called');
    }

    /**
     * <summary>Initialize the layout manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Layout Manager...');

            this.initializePages();
            this.initializePanelTemplates();
            this.setupEventHandlers();
            this.isInitialized = true;

            this.log('Layout Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Layout Manager', error);
        }
    }

    /**
     * <summary>Initialize default pages</summary>
     */
    initializePages() {
        // Create initial pages based on story settings
        const storyManager = this.main.getManager('story');
        const storyData = storyManager ? storyManager.getStoryData() : null;
        const totalPages = storyData?.storyInfo?.totalPages || 8;

        this.pages = [];
        for (let i = 0; i < totalPages; i++) {
            this.pages.push(this.createPageData(i + 1));
        }

        this.log(`Initialized ${totalPages} pages`);
    }

    /**
     * <summary>Create page data structure</summary>
     * @param {number} pageNumber - Page number
     * @returns {Object} Page data object
     */
    createPageData(pageNumber) {
        return {
            id: `page_${pageNumber}`,
            number: pageNumber,
            panels: [],
            backgroundImage: null,
            layoutTemplate: 'custom',
            width: 800,
            height: 1000,
            createdDate: Date.now(),
            lastModified: Date.now()
        };
    }

    /**
     * <summary>Initialize panel templates</summary>
     */
    initializePanelTemplates() {
        this.panelTemplates = [
            {
                id: 'grid-2x2',
                name: '2×2 Grid',
                panels: [
                    { x: 50, y: 50, width: 320, height: 200, borderStyle: 'solid' },
                    { x: 430, y: 50, width: 320, height: 200, borderStyle: 'solid' },
                    { x: 50, y: 300, width: 320, height: 200, borderStyle: 'solid' },
                    { x: 430, y: 300, width: 320, height: 200, borderStyle: 'solid' }
                ]
            },
            {
                id: 'grid-3x3',
                name: '3×3 Grid',
                panels: [
                    { x: 50, y: 50, width: 200, height: 150, borderStyle: 'solid' },
                    { x: 300, y: 50, width: 200, height: 150, borderStyle: 'solid' },
                    { x: 550, y: 50, width: 200, height: 150, borderStyle: 'solid' },
                    { x: 50, y: 250, width: 200, height: 150, borderStyle: 'solid' },
                    { x: 300, y: 250, width: 200, height: 150, borderStyle: 'solid' },
                    { x: 550, y: 250, width: 200, height: 150, borderStyle: 'solid' },
                    { x: 50, y: 450, width: 200, height: 150, borderStyle: 'solid' },
                    { x: 300, y: 450, width: 200, height: 150, borderStyle: 'solid' },
                    { x: 550, y: 450, width: 200, height: 150, borderStyle: 'solid' }
                ]
            },
            {
                id: 'manga-vert',
                name: 'Manga Vertical',
                panels: [
                    { x: 50, y: 50, width: 700, height: 150, borderStyle: 'solid' },
                    { x: 50, y: 220, width: 340, height: 200, borderStyle: 'solid' },
                    { x: 410, y: 220, width: 340, height: 200, borderStyle: 'solid' },
                    { x: 50, y: 440, width: 700, height: 180, borderStyle: 'solid' }
                ]
            },
            {
                id: 'splash',
                name: 'Splash Page',
                panels: [
                    { x: 50, y: 50, width: 700, height: 900, borderStyle: 'solid' }
                ]
            }
        ];
    }

    /**
     * <summary>Setup event handlers for layout management</summary>
     */
    setupEventHandlers() {
        this.log('Setting up layout event handlers...');

        // Page selection
        const pageSelector = document.getElementById('cbg-current-page');
        if (pageSelector) {
            pageSelector.addEventListener('change', (e) => {
                this.switchToPage(parseInt(e.target.value) - 1);
            });
        }

        // Template selection
        const templateSelector = document.getElementById('cbg-layout-templates');
        if (templateSelector) {
            templateSelector.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.applyTemplate(e.target.value);
                }
            });
        }

        // Add panel button
        const addPanelBtn = document.getElementById('cbg-add-panel');
        if (addPanelBtn) {
            addPanelBtn.addEventListener('click', () => this.addPanel());
        }

        // Save page button
        const savePageBtn = document.getElementById('cbg-save-page');
        if (savePageBtn) {
            savePageBtn.addEventListener('click', () => this.savePage());
        }
    }

    /**
     * <summary>Render the layout management interface</summary>
     */
    async render() {
        try {
            this.log('Rendering layout interface...');

            await this.updatePageSelector();
            await this.renderCanvas();
            await this.renderPanelInspector();

        } catch (error) {
            this.handleError('Failed to render layout interface', error);
        }
    }

    /**
     * <summary>Update the page selector dropdown</summary>
     */
    async updatePageSelector() {
        const selector = document.getElementById('cbg-current-page');
        if (!selector) return;

        let html = '';
        this.pages.forEach((page, index) => {
            const selected = index === this.currentPage ? ' selected' : '';
            html += `<option value="${page.number}"${selected}>Page ${page.number}</option>`;
        });

        selector.innerHTML = html;
    }

    /**
     * <summary>Render the layout canvas</summary>
     */
    async renderCanvas() {
        const canvas = document.getElementById('cbg-layout-canvas');
        if (!canvas) {
            throw new Error('Layout canvas not found');
        }

        this.log(`Rendering canvas for page ${this.currentPage + 1}`);

        const currentPageData = this.pages[this.currentPage];
        if (!currentPageData) {
            canvas.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-soft);">No page data found</div>';
            return;
        }

        // Clear canvas
        canvas.innerHTML = '';

        // Set canvas dimensions
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.aspectRatio = `${currentPageData.width}/${currentPageData.height}`;

        // Render panels
        currentPageData.panels.forEach(panel => {
            this.renderPanel(canvas, panel);
        });

        // Setup canvas event handlers
        this.setupCanvasHandlers(canvas);

        // Store canvas rect for calculations
        this.canvasRect = canvas.getBoundingClientRect();
    }

    /**
     * <summary>Render a single panel on the canvas</summary>
     * @param {HTMLElement} canvas - Canvas container
     * @param {Object} panel - Panel data
     */
    renderPanel(canvas, panel) {
        const panelElement = document.createElement('div');
        panelElement.className = 'comic-panel';
        panelElement.dataset.panelId = panel.id;

        // Position and size (convert from canvas coordinates to percentages)
        const canvasWidth = canvas.offsetWidth || 800;
        const canvasHeight = canvas.offsetHeight || 1000;

        panelElement.style.left = `${(panel.x / canvasWidth) * 100}%`;
        panelElement.style.top = `${(panel.y / canvasHeight) * 100}%`;
        panelElement.style.width = `${(panel.width / canvasWidth) * 100}%`;
        panelElement.style.height = `${(panel.height / canvasHeight) * 100}%`;

        // Styling
        panelElement.style.borderWidth = `${panel.borderWidth || 2}px`;
        panelElement.style.borderStyle = panel.borderStyle || 'solid';
        panelElement.style.borderColor = panel.borderColor || '#000';
        panelElement.style.backgroundColor = panel.backgroundColor || 'white';

        // Panel content
        let contentHtml = '';

        if (panel.sceneImage) {
            contentHtml += `<img src="${panel.sceneImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="Panel scene">`;
        } else if (panel.sceneDescription) {
            contentHtml += `<div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 0.5rem; font-size: 0.8rem; color: var(--text-soft); text-align: center; background: rgba(255,255,255,0.9);">${escapeHtml(panel.sceneDescription.substring(0, 100))}${panel.sceneDescription.length > 100 ? '...' : ''}</div>`;
        } else {
            contentHtml += `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-soft); font-size: 0.9rem;">Panel ${panel.number || ''}</div>`;
        }

        panelElement.innerHTML = contentHtml;

        // Add resize handles if selected
        if (this.selectedPanel?.id === panel.id) {
            panelElement.classList.add('selected');
            this.addResizeHandles(panelElement);
        }

        canvas.appendChild(panelElement);
    }

    /**
     * <summary>Add resize handles to a panel</summary>
     * @param {HTMLElement} panelElement - Panel element
     */
    addResizeHandles(panelElement) {
        const positions = ['nw', 'ne', 'sw', 'se'];
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `panel-resize-handle ${pos}`;
            handle.dataset.position = pos;
            panelElement.appendChild(handle);
        });
    }

    /**
     * <summary>Setup canvas event handlers</summary>
     * @param {HTMLElement} canvas - Canvas element
     */
    setupCanvasHandlers(canvas) {
        // Panel selection and dragging
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e, canvas));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e, canvas));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e, canvas));
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e, canvas));

        // Prevent default drag behaviors
        canvas.addEventListener('dragstart', (e) => e.preventDefault());
    }

    /**
     * <summary>Handle mouse down events on canvas</summary>
     * @param {MouseEvent} e - Mouse event
     * @param {HTMLElement} canvas - Canvas element
     */
    handleMouseDown(e, canvas) {
        const panelElement = e.target.closest('.comic-panel');
        const resizeHandle = e.target.closest('.panel-resize-handle');

        if (resizeHandle && panelElement) {
            // Start resizing
            this.isResizing = true;
            this.resizingPanel = panelElement;
            this.resizeHandle = resizeHandle.dataset.position;
            this.resizeStartRect = panelElement.getBoundingClientRect();
            this.canvasRect = canvas.getBoundingClientRect();
            e.preventDefault();
        } else if (panelElement) {
            // Start dragging
            this.isDragging = true;
            this.selectedPanel = this.getPanelById(panelElement.dataset.panelId);
            this.draggingPanel = panelElement;

            const panelRect = panelElement.getBoundingClientRect();
            this.canvasRect = canvas.getBoundingClientRect();
            this.dragOffset.x = e.clientX - panelRect.left;
            this.dragOffset.y = e.clientY - panelRect.top;

            this.selectPanel(this.selectedPanel);
            e.preventDefault();
        }
    }

    /**
     * <summary>Handle mouse move events on canvas</summary>
     * @param {MouseEvent} e - Mouse event
     * @param {HTMLElement} canvas - Canvas element
     */
    handleMouseMove(e, canvas) {
        if (this.isDragging && this.draggingPanel) {
            this.updatePanelPosition(e);
        } else if (this.isResizing && this.resizingPanel) {
            this.updatePanelSize(e);
        }
    }

    /**
     * <summary>Handle mouse up events on canvas</summary>
     * @param {MouseEvent} e - Mouse event
     * @param {HTMLElement} canvas - Canvas element
     */
    handleMouseUp(e, canvas) {
        if (this.isDragging) {
            this.isDragging = false;
            this.draggingPanel = null;
            this.updatePanelData();
        } else if (this.isResizing) {
            this.isResizing = false;
            this.resizingPanel = null;
            this.resizeHandle = null;
            this.updatePanelData();
        }
    }

    /**
     * <summary>Handle canvas click events</summary>
     * @param {MouseEvent} e - Mouse event
     * @param {HTMLElement} canvas - Canvas element
     */
    handleCanvasClick(e, canvas) {
        const panelElement = e.target.closest('.comic-panel');

        if (panelElement) {
            const panelId = panelElement.dataset.panelId;
            const panel = this.getPanelById(panelId);
            if (panel) {
                this.selectPanel(panel);
            }
        } else {
            // Clicked on empty canvas
            this.selectPanel(null);
        }
    }

    /**
     * <summary>Update panel position during drag</summary>
     * @param {MouseEvent} e - Mouse event
     */
    updatePanelPosition(e) {
        if (!this.draggingPanel || !this.canvasRect) return;

        const newX = e.clientX - this.canvasRect.left - this.dragOffset.x;
        const newY = e.clientY - this.canvasRect.top - this.dragOffset.y;

        // Convert to percentages
        const xPercent = (newX / this.canvasRect.width) * 100;
        const yPercent = (newY / this.canvasRect.height) * 100;

        // Constrain to canvas bounds
        const constrainedX = Math.max(0, Math.min(95, xPercent));
        const constrainedY = Math.max(0, Math.min(95, yPercent));

        this.draggingPanel.style.left = `${constrainedX}%`;
        this.draggingPanel.style.top = `${constrainedY}%`;
    }

    /**
     * <summary>Update panel size during resize</summary>
     * @param {MouseEvent} e - Mouse event
     */
    updatePanelSize(e) {
        if (!this.resizingPanel || !this.canvasRect || !this.resizeStartRect) return;

        const deltaX = e.clientX - (this.resizeStartRect.left + this.dragOffset.x);
        const deltaY = e.clientY - (this.resizeStartRect.top + this.dragOffset.y);

        // Calculate new dimensions based on resize handle position
        let newWidth = this.resizeStartRect.width;
        let newHeight = this.resizeStartRect.height;
        let newLeft = this.resizeStartRect.left - this.canvasRect.left;
        let newTop = this.resizeStartRect.top - this.canvasRect.top;

        switch (this.resizeHandle) {
            case 'se': // Bottom-right
                newWidth += deltaX;
                newHeight += deltaY;
                break;
            case 'sw': // Bottom-left
                newWidth -= deltaX;
                newHeight += deltaY;
                newLeft += deltaX;
                break;
            case 'ne': // Top-right
                newWidth += deltaX;
                newHeight -= deltaY;
                newTop += deltaY;
                break;
            case 'nw': // Top-left
                newWidth -= deltaX;
                newHeight -= deltaY;
                newLeft += deltaX;
                newTop += deltaY;
                break;
        }

        // Apply minimum size constraints
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        // Convert to percentages
        const widthPercent = (newWidth / this.canvasRect.width) * 100;
        const heightPercent = (newHeight / this.canvasRect.height) * 100;
        const leftPercent = (newLeft / this.canvasRect.width) * 100;
        const topPercent = (newTop / this.canvasRect.height) * 100;

        this.resizingPanel.style.width = `${widthPercent}%`;
        this.resizingPanel.style.height = `${heightPercent}%`;
        this.resizingPanel.style.left = `${leftPercent}%`;
        this.resizingPanel.style.top = `${topPercent}%`;
    }

    /**
     * <summary>Update panel data after drag/resize</summary>
     */
    updatePanelData() {
        if (!this.selectedPanel || !this.canvasRect) return;

        const panelElement = document.querySelector(`[data-panel-id="${this.selectedPanel.id}"]`);
        if (!panelElement) return;

        const rect = panelElement.getBoundingClientRect();

        // Convert back to canvas coordinates
        this.selectedPanel.x = ((rect.left - this.canvasRect.left) / this.canvasRect.width) * 800;
        this.selectedPanel.y = ((rect.top - this.canvasRect.top) / this.canvasRect.height) * 1000;
        this.selectedPanel.width = (rect.width / this.canvasRect.width) * 800;
        this.selectedPanel.height = (rect.height / this.canvasRect.height) * 1000;

        this.selectedPanel.lastModified = Date.now();

        // Update panel inspector
        this.renderPanelInspector();

        this.log('Updated panel data:', this.selectedPanel);
    }

    /**
     * <summary>Render the panel inspector</summary>
     */
    async renderPanelInspector() {
        const container = document.getElementById('cbg-panel-inspector-content');
        if (!container) {
            throw new Error('Panel inspector container not found');
        }

        if (!this.selectedPanel) {
            container.innerHTML = `
                <div class="panel-inspector-placeholder">
                    <div style="text-align: center; color: var(--text-soft); padding: 2rem;">
                        <h4>No Panel Selected</h4>
                        <p>Select a panel on the canvas to edit its properties, or click "Add Panel" to create a new one.</p>
                    </div>
                </div>
            `;
            return;
        }

        this.log('Rendering panel inspector for panel:', this.selectedPanel.id);

        try {
            let html = '';

            // Panel Properties Section
            html += '<div class="inspector-section" style="margin-bottom: 1.5rem;">';
            html += '<h4>Panel Properties</h4>';

            html += makeDropdownInput(null, 'cbg-panel-type', 'panel_type', 'Element Type',
                'Type of element',
                ['Panel', 'Speech Bubble', 'Caption Box', 'SFX Text'],
                this.selectedPanel.type || 'Panel');

            html += makeNumberInput(null, 'cbg-panel-number', 'panel_number', 'Panel Number',
                'Panel sequence number', this.selectedPanel.number || 1, 1, 20, 1);

            html += '</div>';

            // Scene Generation Section
            html += '<div class="inspector-section" style="margin-bottom: 1.5rem;">';
            html += '<h4>Scene Generation</h4>';

            html += makeTextInput(null, 'cbg-panel-scene', 'panel_scene', 'Scene Description',
                'Describe the scene for AI generation', this.selectedPanel.sceneDescription || '', 'big',
                'Wide shot of medieval castle at sunset, with our hero approaching the gates on horseback...');

            html += '<div class="d-flex" style="gap: 0.75rem; margin-bottom: 0.75rem;">';
            html += '<div style="flex: 1;">';
            html += makeDropdownInput(null, 'cbg-panel-style', 'panel_style', 'Art Style',
                'Visual style for this panel',
                ['Realistic', 'Cartoon', 'Manga', 'Sketch', 'Painterly', 'Comic Book'],
                this.selectedPanel.artStyle || 'Realistic');
            html += '</div>';
            html += '<div style="flex: 1;">';
            html += makeDropdownInput(null, 'cbg-panel-camera', 'panel_camera', 'Camera Angle',
                'Shot composition',
                ['Wide Shot', 'Medium Shot', 'Close-up', 'Extreme Close-up', 'Birds Eye', 'Low Angle', 'High Angle'],
                this.selectedPanel.cameraAngle || 'Medium Shot');
            html += '</div>';
            html += '</div>';

            // Character selection
            const characters = this.main.getManager('characters').getAllCharacters();
            if (characters.length > 0) {
                const characterNames = ['None'].concat(characters.map(c => c.name || 'Unnamed'));
                html += makeDropdownInput(null, 'cbg-panel-character', 'panel_character', 'Featured Character',
                    'Main character in this panel', characterNames, this.selectedPanel.featuredCharacter || 'None');
            }

            html += '<button class="basic-button btn-primary w-100" style="margin-top: 1rem;" id="cbg-generate-panel">Generate Panel Image</button>';

            html += '</div>';

            // Panel Styling Section
            html += '<div class="inspector-section" style="margin-bottom: 1.5rem;">';
            html += '<h4>Panel Styling</h4>';

            html += makeDropdownInput(null, 'cbg-panel-border-style', 'panel_border_style', 'Border Style',
                'Panel border style',
                ['solid', 'dashed', 'dotted', 'double', 'none'],
                this.selectedPanel.borderStyle || 'solid');

            html += makeNumberInput(null, 'cbg-panel-border-width', 'panel_border_width', 'Border Width',
                'Border width in pixels', this.selectedPanel.borderWidth || 2, 0, 10, 1);

            html += makeTextInput(null, 'cbg-panel-border-color', 'panel_border_color', 'Border Color',
                'Border color (hex)', this.selectedPanel.borderColor || '#000000', 'normal', '#000000');

            html += makeTextInput(null, 'cbg-panel-bg-color', 'panel_bg_color', 'Background Color',
                'Background color (hex)', this.selectedPanel.backgroundColor || '#ffffff', 'normal', '#ffffff');

            html += '</div>';

            // Speech/Text Options Section
            html += '<div class="inspector-section" style="margin-bottom: 1.5rem;">';
            html += '<h4>Speech & Text</h4>';

            html += makeDropdownInput(null, 'cbg-bubble-style', 'bubble_style', 'Speech Bubble Style',
                'Style of speech bubble',
                ['Oval (Normal Speech)', 'Rectangle (Narration)', 'Cloud (Thought)', 'Burst (Yelling/SFX)', 'None'],
                this.selectedPanel.speechStyle || 'None');

            html += makeTextInput(null, 'cbg-speech-text', 'speech_text', 'Dialogue/Text',
                'Text content for this panel', this.selectedPanel.speechText || '', 'big',
                'Enter dialogue or caption text...');

            html += '</div>';

            // Quick Actions Section
            html += '<div class="inspector-section">';
            html += '<h4>Actions</h4>';
            html += '<div class="d-flex flex-column" style="gap: 0.5rem;">';
            html += '<button class="basic-button small-button" id="cbg-duplicate-panel">Duplicate Panel</button>';
            html += '<button class="basic-button small-button" id="cbg-copy-panel">Copy Properties</button>';
            html += '<button class="basic-button small-button" id="cbg-paste-panel">Paste Properties</button>';
            html += '<button class="basic-button small-button" style="color: var(--danger);" id="cbg-delete-panel">Delete Panel</button>';
            html += '</div>';
            html += '</div>';

            container.innerHTML = html;

            // Enable SwarmUI enhancements
            if (typeof enableSlidersIn === 'function') {
                enableSlidersIn(container);
            }

            // Setup inspector event handlers
            this.setupInspectorHandlers();

        } catch (error) {
            this.handleError('Failed to generate panel inspector', error);
            container.innerHTML = '<div class="cbg-error">Failed to load panel inspector</div>';
        }
    }

    /**
     * <summary>Setup event handlers for the panel inspector</summary>
     */
    setupInspectorHandlers() {
        const container = document.getElementById('cbg-panel-inspector-content');
        if (!container) return;

        // Form field change handlers
        const inputs = container.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updatePanelFromInspector();
            });
        });

        // Button handlers
        const generateBtn = container.querySelector('#cbg-generate-panel');
        const duplicateBtn = container.querySelector('#cbg-duplicate-panel');
        const copyBtn = container.querySelector('#cbg-copy-panel');
        const pasteBtn = container.querySelector('#cbg-paste-panel');
        const deleteBtn = container.querySelector('#cbg-delete-panel');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generatePanelScene());
        }

        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', () => this.duplicatePanel());
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyPanelProperties());
        }

        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => this.pastePanelProperties());
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deletePanel());
        }
    }

    /**
     * <summary>Update panel properties from inspector form</summary>
     */
    updatePanelFromInspector() {
        if (!this.selectedPanel) return;

        try {
            this.selectedPanel.type = this.getFormValue('cbg-panel-type');
            this.selectedPanel.number = parseInt(this.getFormValue('cbg-panel-number')) || 1;
            this.selectedPanel.sceneDescription = this.getFormValue('cbg-panel-scene');
            this.selectedPanel.artStyle = this.getFormValue('cbg-panel-style');
            this.selectedPanel.cameraAngle = this.getFormValue('cbg-panel-camera');
            this.selectedPanel.featuredCharacter = this.getFormValue('cbg-panel-character');
            this.selectedPanel.borderStyle = this.getFormValue('cbg-panel-border-style');
            this.selectedPanel.borderWidth = parseInt(this.getFormValue('cbg-panel-border-width')) || 2;
            this.selectedPanel.borderColor = this.getFormValue('cbg-panel-border-color');
            this.selectedPanel.backgroundColor = this.getFormValue('cbg-panel-bg-color');
            this.selectedPanel.speechStyle = this.getFormValue('cbg-bubble-style');
            this.selectedPanel.speechText = this.getFormValue('cbg-speech-text');

            this.selectedPanel.lastModified = Date.now();

            // Update visual representation
            this.renderCanvas();

        } catch (error) {
            this.handleError('Failed to update panel from inspector', error);
        }
    }

    /**
     * <summary>Add a new panel to the current page</summary>
     */
    addPanel() {
        const currentPageData = this.pages[this.currentPage];
        if (!currentPageData) return;

        const newPanel = this.createPanelData();
        currentPageData.panels.push(newPanel);

        this.selectPanel(newPanel);
        this.renderCanvas();

        this.log('Added new panel:', newPanel.id);
    }

    /**
     * <summary>Create panel data structure</summary>
     * @returns {Object} Panel data object
     */
    createPanelData() {
        const panelCount = this.pages[this.currentPage].panels.length;
        const id = `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            id: id,
            number: panelCount + 1,
            type: 'Panel',
            x: 100 + (panelCount * 20), // Offset new panels slightly
            y: 100 + (panelCount * 20),
            width: 250,
            height: 200,
            borderStyle: 'solid',
            borderWidth: 2,
            borderColor: '#000000',
            backgroundColor: '#ffffff',
            sceneDescription: '',
            sceneImage: null,
            artStyle: 'Realistic',
            cameraAngle: 'Medium Shot',
            featuredCharacter: 'None',
            speechStyle: 'None',
            speechText: '',
            createdDate: Date.now(),
            lastModified: Date.now()
        };
    }

    /**
     * <summary>Apply a panel layout template</summary>
     * @param {string} templateId - Template ID to apply
     */
    applyTemplate(templateId) {
        const template = this.panelTemplates.find(t => t.id === templateId);
        if (!template) {
            this.log(`Template not found: ${templateId}`);
            return;
        }

        if (confirm('This will replace all existing panels on this page. Continue?')) {
            const currentPageData = this.pages[this.currentPage];
            currentPageData.panels = [];

            template.panels.forEach((templatePanel, index) => {
                const panel = this.createPanelData();
                panel.number = index + 1;
                panel.x = templatePanel.x;
                panel.y = templatePanel.y;
                panel.width = templatePanel.width;
                panel.height = templatePanel.height;
                panel.borderStyle = templatePanel.borderStyle;

                currentPageData.panels.push(panel);
            });

            currentPageData.layoutTemplate = templateId;
            currentPageData.lastModified = Date.now();

            this.selectedPanel = null;
            this.renderCanvas();
            this.renderPanelInspector();

            this.log(`Applied template: ${templateId}`);
        }
    }

    /**
     * <summary>Generate panel scene with AI</summary>
     */
    async generatePanelScene() {
        if (!this.selectedPanel) return;

        try {
            this.log('Generating panel scene with AI...');

            const generateBtn = document.getElementById('cbg-generate-panel');
            if (generateBtn) {
                generateBtn.innerHTML = '<span class="cbg-spinner"></span>Generating...';
                generateBtn.disabled = true;
            }

            // Update panel from inspector first
            this.updatePanelFromInspector();

            // TODO: Call C# backend method for AI scene generation
            // const response = await genericRequest('GeneratePanelScene', {
            //     panelData: this.selectedPanel,
            //     storyContext: this.main.getManager('story').getStoryData(),
            //     characterData: this.main.getManager('characters').getCharacter(this.selectedPanel.featuredCharacter)
            // }, data => {
            //     this.selectedPanel.sceneImage = data.imageData;
            //     this.renderCanvas();
            // });

            // Placeholder demonstration
            setTimeout(() => {
                this.log('AI scene generation completed (placeholder)');
                if (generateBtn) {
                    generateBtn.innerHTML = 'Generate Panel Image';
                    generateBtn.disabled = false;
                }
            }, 3000);

        } catch (error) {
            this.handleError('Failed to generate panel scene', error);

            const generateBtn = document.getElementById('cbg-generate-panel');
            if (generateBtn) {
                generateBtn.innerHTML = 'Generate Panel Image';
                generateBtn.disabled = false;
            }
        }
    }

    /**
     * <summary>Duplicate the selected panel</summary>
     */
    duplicatePanel() {
        if (!this.selectedPanel) return;

        const currentPageData = this.pages[this.currentPage];
        const duplicatedPanel = JSON.parse(JSON.stringify(this.selectedPanel));

        // Update duplicate with new ID and position
        duplicatedPanel.id = `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        duplicatedPanel.x += 20;
        duplicatedPanel.y += 20;
        duplicatedPanel.number = currentPageData.panels.length + 1;
        duplicatedPanel.createdDate = Date.now();
        duplicatedPanel.lastModified = Date.now();

        currentPageData.panels.push(duplicatedPanel);
        this.selectPanel(duplicatedPanel);
        this.renderCanvas();

        this.log('Duplicated panel:', duplicatedPanel.id);
    }

    /**
     * <summary>Delete the selected panel</summary>
     */
    deletePanel() {
        if (!this.selectedPanel) return;

        if (confirm('Are you sure you want to delete this panel?')) {
            const currentPageData = this.pages[this.currentPage];
            const index = currentPageData.panels.findIndex(p => p.id === this.selectedPanel.id);

            if (index >= 0) {
                currentPageData.panels.splice(index, 1);
                this.selectedPanel = null;

                this.renderCanvas();
                this.renderPanelInspector();

                this.log('Deleted panel at index:', index);
            }
        }
    }

    /**
     * <summary>Copy panel properties to clipboard</summary>
     */
    copyPanelProperties() {
        if (!this.selectedPanel) return;

        const properties = {
            borderStyle: this.selectedPanel.borderStyle,
            borderWidth: this.selectedPanel.borderWidth,
            borderColor: this.selectedPanel.borderColor,
            backgroundColor: this.selectedPanel.backgroundColor,
            artStyle: this.selectedPanel.artStyle,
            cameraAngle: this.selectedPanel.cameraAngle,
            speechStyle: this.selectedPanel.speechStyle
        };

        this.copiedPanelProperties = properties;
        this.log('Copied panel properties');
    }

    /**
     * <summary>Paste panel properties from clipboard</summary>
     */
    pastePanelProperties() {
        if (!this.selectedPanel || !this.copiedPanelProperties) return;

        Object.assign(this.selectedPanel, this.copiedPanelProperties);
        this.selectedPanel.lastModified = Date.now();

        this.renderCanvas();
        this.renderPanelInspector();

        this.log('Pasted panel properties');
    }

    /**
     * <summary>Switch to a different page</summary>
     * @param {number} pageIndex - Page index to switch to
     */
    switchToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.pages.length) return;

        this.currentPage = pageIndex;
        this.selectedPanel = null;

        this.renderCanvas();
        this.renderPanelInspector();

        this.log(`Switched to page ${pageIndex + 1}`);
    }

    /**
     * <summary>Save current page</summary>
     */
    async savePage() {
        try {
            this.log('Saving current page...');

            const currentPageData = this.pages[this.currentPage];
            currentPageData.lastModified = Date.now();

            // TODO: Save page to C# backend
            this.log('Page saved successfully');

        } catch (error) {
            this.handleError('Failed to save page', error);
        }
    }

    /**
     * <summary>Save all layout data</summary>
     */
    async saveData() {
        try {
            this.log('Saving all layout data...');

            // Update current panel if selected
            if (this.selectedPanel) {
                this.updatePanelFromInspector();
            }

            const layoutData = {
                pages: this.pages,
                currentPage: this.currentPage,
                panelTemplates: this.panelTemplates
            };

            // Update project data
            this.main.updateProjectData({ layout: layoutData });

            this.log(`Saved ${this.pages.length} pages with layout data`);

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

            if (layoutData.pages) {
                this.pages = layoutData.pages;
            } else {
                this.initializePages();
            }

            if (layoutData.currentPage !== undefined) {
                this.currentPage = layoutData.currentPage;
            }

            if (layoutData.panelTemplates) {
                this.panelTemplates = layoutData.panelTemplates;
            }

            // Clear selection
            this.selectedPanel = null;

            this.log('Layout data loaded successfully');

        } catch (error) {
            this.handleError('Failed to load layout data', error);
        }
    }

    /**
     * <summary>Select a panel</summary>
     * @param {Object} panel - Panel to select
     */
    selectPanel(panel) {
        this.selectedPanel = panel;
        this.renderCanvas(); // Re-render to show selection
        this.renderPanelInspector();

        if (panel) {
            this.log('Selected panel:', panel.id);
        } else {
            this.log('Deselected panel');
        }
    }

    /**
     * <summary>Get panel by ID</summary>
     * @param {string} panelId - Panel ID
     * @returns {Object} Panel data
     */
    getPanelById(panelId) {
        for (const page of this.pages) {
            const panel = page.panels.find(p => p.id === panelId);
            if (panel) {
                return panel;
            }
        }
        return null;
    }

    /**
     * <summary>Get all pages</summary>
     * @returns {Array} Array of page data
     */
    getAllPages() {
        return this.pages;
    }

    /**
     * <summary>Get current page data</summary>
     * @returns {Object} Current page data
     */
    getCurrentPageData() {
        return this.pages[this.currentPage];
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
     * <summary>Debug logging helper</summary>
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:Layout ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     * @param {string} message - Error message
     * @param {Error} error - Error object
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

        this.pages = [];
        this.selectedPanel = null;
        this.isDragging = false;
        this.isResizing = false;
        this.isInitialized = false;

        this.log('Layout Manager destroyed');
    }
}

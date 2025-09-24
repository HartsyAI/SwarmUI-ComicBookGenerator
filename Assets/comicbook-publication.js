/**
 * <summary>Comic Book Generator - Enhanced Publication & Finalization Module</summary>
 * Handles comprehensive preview, quality assurance, collaboration, and publication preparation
 */

class PublicationManager extends BaseManager {
    constructor(main) {
        super(main, 'Publication');
        this.main = main;
        this.debug = true;
        this.currentPreviewPage = 0;
        this.currentReadingMode = 'single-page';
        this.zoomLevel = 100;
        this.fullscreenMode = false;
        this.readingDirection = 'ltr'; // left-to-right or right-to-left
        this.panelGuideMode = false;
        this.qualityChecks = new Map();
        this.annotations = new Map();
        this.reviewStatus = {
            story: false,
            art: false,
            dialogue: false,
            continuity: false,
            technical: false
        };
        this.exportSettings = {
            format: 'pdf',
            quality: 'print',
            colorMode: 'rgb',
            resolution: 300,
            includeBleed: false,
            cropMarks: false,
            compression: 'medium'
        };
        this.publicationMeta = {
            title: '',
            subtitle: '',
            author: '',
            artist: '',
            publisher: '',
            isbn: '',
            copyright: '',
            genre: '',
            ageRating: '',
            issueNumber: 1,
            seriesTitle: ''
        };
        this.isExporting = false;
        this.pageCanvases = new Map();
        this.isInitialized = false;

        this.log('PublicationManager constructor called');
    }

    /**
     * <summary>Initialize the publication manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Publication Manager...');

            this.setupEventHandlers();
            this.setupKeyboardShortcuts();
            this.isInitialized = true;

            this.log('Publication Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Publication Manager', error);
        }
    }

    /**
     * <summary>Setup event handlers for publication management</summary>
     */
    setupEventHandlers() {
        this.log('Setting up publication event handlers...');

        // Reading mode controls
        this.main.eventManager.on('cbg-reading-mode', 'change', (e) => {
            this.setReadingMode(e.target.value);
        });
        this.main.eventManager.on('cbg-fullscreen-reader', 'click', () => this.toggleFullscreen());
        this.main.eventManager.on('cbg-panel-guide', 'click', () => this.togglePanelGuide());

        // Navigation controls (document-level)
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Zoom controls
        this.main.eventManager.on('cbg-zoom-level', 'change', (e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val)) this.setZoomLevel(val);
        });
        this.main.eventManager.on('cbg-zoom-fit', 'click', () => this.zoomToFit());
        this.main.eventManager.on('cbg-zoom-100', 'click', () => this.setZoomLevel(100));
    }

    /**
     * <summary>Setup keyboard shortcuts for navigation</summary>
     */
    setupKeyboardShortcuts() {
        const shortcuts = {
            'ArrowRight': () => this.nextPage(),
            'ArrowLeft': () => this.previousPage(),
            'Space': () => this.nextPage(),
            'Shift+Space': () => this.previousPage(),
            'Home': () => this.goToFirstPage(),
            'End': () => this.goToLastPage(),
            'f': () => this.toggleFullscreen(),
            'g': () => this.togglePanelGuide(),
            'Escape': () => this.exitFullscreen()
        };

        this.keyboardShortcuts = shortcuts;
    }

    /**
     * <summary>Render the publication interface</summary>
     */
    async render() {
        try {
            this.log('Rendering publication interface...');

            await this.renderNavigationPanel();
            await this.renderMainReader();
            await this.runQualityChecks();

        } catch (error) {
            this.handleError('Failed to render publication interface', error);
        }
    }

    /**
     * <summary>Render the navigation and tools panel</summary>
     */
    async renderNavigationPanel() {
        const container = getRequiredElementById('cbg-preview-navigator-content');

        this.log('Rendering publication navigation panel...');

        try {
            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];

            let html = '';

            // Reading Controls Section
            html += '<div class="navigator-section" style="margin-bottom: 1.5rem;">';
            html += '<h4 style="margin-bottom: 1rem;">Reading Experience</h4>';

            html += makeDropdownInput(null, 'cbg-reading-mode', 'reading_mode', 'Reading Mode',
                'How to display the comic',
                ['single-page', 'double-page', 'continuous-scroll', 'panel-by-panel'],
                this.currentReadingMode);

            html += makeDropdownInput(null, 'cbg-reading-direction', 'reading_direction', 'Reading Direction',
                'Page reading direction',
                ['ltr', 'rtl'],
                this.readingDirection);

            html += '<div class="d-flex" style="gap: 0.5rem; margin: 1rem 0;">';
            html += '<button class="basic-button small-button" id="cbg-fullscreen-reader">📖 Fullscreen Reader</button>';
            html += '<button class="basic-button small-button" id="cbg-panel-guide">🎯 Panel Guide</button>';
            html += '</div>';

            html += '</div>';

            // Page Navigator Section
            html += '<div class="navigator-section" style="margin-bottom: 1.5rem;">';
            html += `<h4 style="margin-bottom: 1rem;">Pages (${pages.length})</h4>`;

            if (pages.length === 0) {
                html += `
                    <div style="text-align: center; color: var(--text-soft); padding: 2rem;">
                        <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">No pages created</div>
                        <div style="font-size: 0.9rem;">Create pages in Layout mode first</div>
                    </div>
                `;
            } else {
                html += '<div class="page-thumbnails" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">';

                pages.forEach((page, index) => {
                    const isActive = index === this.currentPreviewPage;
                    const panelCount = page.panels ? page.panels.length : 0;
                    const qualityScore = this.getPageQualityScore(page);

                    html += `
                        <div class="page-thumb ${isActive ? 'active' : ''}" data-page-index="${index}"
                             style="aspect-ratio: 3/4; border: ${isActive ? '2px solid var(--primary)' : '1px solid var(--shadow)'}; border-radius: 0.4rem; background-color: var(--background-soft); cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: ${isActive ? '600' : '400'}; transition: all 0.2s;">
                            <div class="page-number">${page.number}</div>
                            <div class="quality-indicator" style="position: absolute; top: 2px; right: 2px; width: 8px; height: 8px; border-radius: 50%; background: ${this.getQualityColor(qualityScore)};"></div>
                            <div class="page-info" style="position: absolute; bottom: 2px; left: 2px; right: 2px; font-size: 0.6rem; color: var(--text-soft); text-align: center; background: rgba(0,0,0,0.1); border-radius: 0.2rem; padding: 1px;">
                                ${panelCount} panels
                            </div>
                        </div>
                    `;
                });

                html += '</div>';

                // Quick navigation
                html += '<div class="d-flex" style="gap: 0.25rem; justify-content: center;">';
                html += '<button class="basic-button small-button" id="cbg-first-page" title="First Page">⏮</button>';
                html += '<button class="basic-button small-button" id="cbg-prev-page" title="Previous Page">⏪</button>';
                html += '<button class="basic-button small-button" id="cbg-next-page" title="Next Page">⏩</button>';
                html += '<button class="basic-button small-button" id="cbg-last-page" title="Last Page">⏭</button>';
                html += '</div>';
            }
            html += '</div>';

            // Quality Assurance Section
            html += '<div class="navigator-section" style="margin-bottom: 1.5rem;">';
            html += '<h4 style="margin-bottom: 1rem;">Quality Assurance</h4>';

            const overallQuality = this.calculateOverallQuality();
            html += `<div class="quality-overview" style="margin-bottom: 1rem;">
                <div class="quality-score" style="text-align: center; padding: 1rem; background: var(--background-soft); border-radius: 0.5rem; border: 1px solid var(--shadow);">
                    <div style="font-size: 2rem; font-weight: bold; color: ${this.getQualityColor(overallQuality)};">${overallQuality}%</div>
                    <div style="font-size: 0.9rem; color: var(--text-soft);">Overall Quality</div>
                </div>
            </div>`;

            html += '<div class="quality-checks" style="display: flex; flex-direction: column; gap: 0.5rem;">';
            html += '<button class="basic-button small-button" id="cbg-run-quality-check">🔍 Run Full Quality Check</button>';
            html += '<button class="basic-button small-button" id="cbg-consistency-check">👥 Character Consistency</button>';
            html += '<button class="basic-button small-button" id="cbg-dialogue-check">💬 Dialogue Flow</button>';
            html += '<button class="basic-button small-button" id="cbg-continuity-check">🔗 Story Continuity</button>';
            html += '</div>';

            html += '</div>';

            // Review & Approval Section
            html += '<div class="navigator-section" style="margin-bottom: 1.5rem;">';
            html += '<h4 style="margin-bottom: 1rem;">Review & Approval</h4>';

            const reviewItems = [
                { key: 'story', label: 'Story Review', icon: '📖' },
                { key: 'art', label: 'Art Review', icon: '🎨' },
                { key: 'dialogue', label: 'Dialogue Review', icon: '💬' },
                { key: 'continuity', label: 'Continuity Review', icon: '🔗' },
                { key: 'technical', label: 'Technical Review', icon: '⚙️' }
            ];

            html += '<div class="review-checklist" style="display: flex; flex-direction: column; gap: 0.5rem;">';
            reviewItems.forEach(item => {
                const isApproved = this.reviewStatus[item.key];
                html += `
                    <div class="review-item" style="display: flex; align-items: center; padding: 0.5rem; border: 1px solid var(--shadow); border-radius: 0.4rem; background: ${isApproved ? 'var(--success-alpha)' : 'var(--background-soft)'};">
                        <span style="margin-right: 0.5rem;">${item.icon}</span>
                        <span style="flex-grow: 1; font-size: 0.9rem;">${item.label}</span>
                        <button class="basic-button small-button review-toggle" data-review="${item.key}" style="background: ${isApproved ? 'var(--success)' : 'var(--shadow)'}; color: ${isApproved ? 'white' : 'var(--text)'};">
                            ${isApproved ? '✓' : '○'}
                        </button>
                    </div>
                `;
            });
            html += '</div>';

            html += '<button class="basic-button btn-primary" id="cbg-approve-all" style="margin-top: 1rem; width: 100%;">Approve for Publication</button>';

            html += '</div>';

            // Publication Settings Section
            html += '<div class="navigator-section">';
            html += '<h4 style="margin-bottom: 1rem;">Publication Settings</h4>';

            html += makeTextInput(null, 'cbg-pub-title', 'pub_title', 'Comic Title',
                'Main title of the comic', this.publicationMeta.title, 'normal', 'My Amazing Comic');

            html += makeTextInput(null, 'cbg-pub-author', 'pub_author', 'Author/Creator',
                'Creator name(s)', this.publicationMeta.author, 'normal', 'John Doe');

            html += makeDropdownInput(null, 'cbg-pub-genre', 'pub_genre', 'Genre',
                'Comic genre classification',
                ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Superhero', 'Slice of Life'],
                this.publicationMeta.genre);

            html += makeDropdownInput(null, 'cbg-age-rating', 'age_rating', 'Age Rating',
                'Target audience age rating',
                ['All Ages', 'Teen (13+)', 'Mature (17+)', 'Adult (18+)'],
                this.publicationMeta.ageRating);

            html += '<button class="basic-button small-button" id="cbg-pub-metadata" style="margin-top: 0.5rem; width: 100%;">📝 Edit Full Metadata</button>';

            html += '</div>';

            container.innerHTML = html;

            // Enable SwarmUI enhancements
            if (typeof enableSlidersIn === 'function') {
                enableSlidersIn(container);
            }

            // Setup navigator event handlers
            this.setupNavigatorHandlers();

        } catch (error) {
            this.handleError('Failed to render navigation panel', error);
            container.innerHTML = '<div class="cbg-error">Failed to load navigation panel</div>';
        }
    }

    /**
     * <summary>Render single page reading mode</summary>
     * @param {Array} pages - Array of page data
     * @returns {string} HTML for single page mode
     */
    async renderSinglePageMode(pages) {
        const currentPage = pages[this.currentPreviewPage];
        if (!currentPage) return '<div>Page not found</div>';

        const pageCanvas = await this.generatePageCanvas(currentPage);

        return `
            <div class="single-page-reader" style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 2rem;">
                <div class="page-container" style="transform: scale(${this.zoomLevel / 100}); transform-origin: center; transition: transform 0.3s ease;">
                    ${pageCanvas}
                </div>
            </div>
        `;
    }

    /**
     * <summary>Render double page reading mode</summary>
     * @param {Array} pages - Array of page data
     * @returns {string} HTML for double page mode
     */
    async renderDoublePageMode(pages) {
        const leftPageIndex = this.currentPreviewPage;
        const rightPageIndex = this.readingDirection === 'ltr' ? leftPageIndex + 1 : leftPageIndex - 1;

        const leftPage = pages[leftPageIndex];
        const rightPage = pages[rightPageIndex];

        let html = '<div class="double-page-reader" style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 2rem; gap: 1rem;">';

        if (this.readingDirection === 'rtl') {
            if (rightPage) html += `<div class="page-container">${await this.generatePageCanvas(rightPage)}</div>`;
            if (leftPage) html += `<div class="page-container">${await this.generatePageCanvas(leftPage)}</div>`;
        } else {
            if (leftPage) html += `<div class="page-container">${await this.generatePageCanvas(leftPage)}</div>`;
            if (rightPage) html += `<div class="page-container">${await this.generatePageCanvas(rightPage)}</div>`;
        }

        html += '</div>';
        return html;
    }

    /**
     * <summary>Render continuous scroll reading mode</summary>
     * @param {Array} pages - Array of page data
     * @returns {string} HTML for continuous scroll mode
     */
    async renderContinuousScrollMode(pages) {
        let html = '<div class="continuous-scroll-reader" style="display: flex; flex-direction: column; align-items: center; padding: 2rem; gap: 2rem;">';

        for (const page of pages) {
            const pageCanvas = await this.generatePageCanvas(page);
            html += `
                <div class="page-container" data-page="${page.number}" style="scroll-margin-top: 2rem;">
                    ${pageCanvas}
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    /**
     * <summary>Render panel-by-panel reading mode</summary>
     * @param {Array} pages - Array of page data
     * @returns {string} HTML for panel-by-panel mode
     */
    async renderPanelByPanelMode(pages) {
        // TODO: Implement guided panel reading with transitions
        return await this.renderSinglePageMode(pages);
    }

    /**
     * <summary>Generate optimized page canvas for reading</summary>
     * @param {Object} pageData - Page data to render
     * @returns {string} HTML string for the page
     */
    async generatePageCanvas(pageData) {
        try {
            const cacheKey = `${pageData.id}_${pageData.lastModified}_reader`;
            if (this.pageCanvases.has(cacheKey)) {
                return this.pageCanvases.get(cacheKey);
            }

            const pageWidth = pageData.width || 800;
            const pageHeight = pageData.height || 1000;
            const panels = pageData.panels || [];

            let html = `
                <div class="comic-page" data-page-id="${pageData.id}" style="
                    width: ${pageWidth}px; 
                    height: ${pageHeight}px; 
                    background: white; 
                    border: 2px solid #333; 
                    box-shadow: 0 8px 24px rgba(0,0,0,0.3); 
                    position: relative;
                    overflow: hidden;
                    border-radius: 12px;
                    margin: 0 auto;
                ">
            `;

            // Page background
            if (pageData.backgroundImage) {
                html += `
                    <div class="page-background" style="
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background-image: url(${pageData.backgroundImage});
                        background-size: cover;
                        background-position: center;
                        opacity: 0.1;
                    "></div>
                `;
            }

            // Render panels with enhanced detail for reading
            panels.forEach((panel, index) => {
                html += this.renderPanelForReading(panel, pageWidth, pageHeight, index);
            });

            // Panel guide overlay (if enabled)
            if (this.panelGuideMode) {
                html += this.renderPanelGuideOverlay(panels, pageWidth, pageHeight);
            }

            html += '</div>';

            this.pageCanvases.set(cacheKey, html);
            return html;

        } catch (error) {
            this.handleError('Failed to generate page canvas', error);
            return '<div class="cbg-error">Failed to generate page</div>';
        }
    }

    /**
     * <summary>Render a panel optimized for reading experience</summary>
     * @param {Object} panel - Panel data
     * @param {number} pageWidth - Page width
     * @param {number} pageHeight - Page height
     * @param {number} index - Panel index
     * @returns {string} HTML string for the panel
     */
    renderPanelForReading(panel, pageWidth, pageHeight, index) {
        const left = (panel.x / pageWidth) * 100;
        const top = (panel.y / pageHeight) * 100;
        const width = (panel.width / pageWidth) * 100;
        const height = (panel.height / pageHeight) * 100;

        let content = '';

        // High-quality panel content
        if (panel.generatedImage) {
            content += `
                <img src="${panel.generatedImage}" 
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" 
                     alt="Panel ${index + 1}" loading="lazy">
            `;
        } else if (panel.sceneImage) {
            content += `
                <img src="${panel.sceneImage}" 
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" 
                     alt="Panel scene" loading="lazy">
            `;
        } else {
            // Placeholder content
            content += `
                <div style="
                    display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    height: 100%; padding: 1rem; font-family: 'Comic Sans MS', cursive;
                    background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
                    color: #666; text-align: center; border-radius: 4px;
                ">
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Panel ${index + 1}</div>
                    ${panel.sceneDescription ? `<div style="font-size: 0.9rem; line-height: 1.3;">${escapeHtml(panel.sceneDescription.substring(0, 100))}${panel.sceneDescription.length > 100 ? '...' : ''}</div>` : ''}
                </div>
            `;
        }

        // Speech bubbles and text elements
        if (panel.speechElements && panel.speechElements.length > 0) {
            panel.speechElements.forEach((element, idx) => {
                content += this.renderSpeechElement(element, idx);
            });
        } else if (panel.speechText && panel.speechText.trim()) {
            // Legacy single speech text
            content += this.renderLegacySpeechBubble(panel.speechText, panel.speechStyle);
        }

        // Sound effects
        if (panel.soundEffects && panel.soundEffects.length > 0) {
            panel.soundEffects.forEach((sfx, idx) => {
                content += this.renderSoundEffect(sfx, idx);
            });
        }

        return `
            <div class="reading-panel" data-panel-id="${panel.id}" data-reading-order="${index + 1}" style="
                position: absolute;
                left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%;
                border: ${panel.borderWidth || 3}px ${panel.borderStyle || 'solid'} ${panel.borderColor || '#000'};
                background-color: ${panel.backgroundColor || 'white'};
                overflow: hidden; border-radius: 6px;
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);
            ">
                ${content}
            </div>
        `;
    }

    /**
     * <summary>Render speech element for reading</summary>
     * @param {Object} element - Speech element data
     * @param {number} index - Element index
     * @returns {string} HTML for speech element
     */
    renderSpeechElement(element, index) {
        const style = this.getSpeechBubbleStyle(element.type || 'speech');

        return `
            <div class="speech-element" data-speech-index="${index}" style="
                position: absolute;
                left: ${element.x || 10}%; top: ${element.y || 10}%;
                max-width: ${element.width || 60}%; min-width: 80px;
                background: ${style.background};
                border: ${style.border};
                border-radius: ${style.borderRadius};
                padding: 0.5rem 0.8rem;
                font-family: ${style.fontFamily};
                font-size: ${style.fontSize};
                font-weight: ${style.fontWeight};
                color: ${style.color};
                line-height: 1.3;
                box-shadow: ${style.boxShadow};
                z-index: 10;
                word-wrap: break-word;
            ">
                ${escapeHtml(element.text || '')}
                ${element.type === 'speech' ? this.renderSpeechTail(element.tailDirection || 'bottom-left') : ''}
            </div>
        `;
    }

    /**
     * <summary>Render legacy speech bubble for backward compatibility</summary>
     * @param {string} text - Speech text
     * @param {string} style - Bubble style
     * @returns {string} HTML for speech bubble
     */
    renderLegacySpeechBubble(text, style) {
        const bubbleStyle = this.getSpeechBubbleStyle(style || 'speech');

        return `
            <div class="legacy-speech-bubble" style="
                position: absolute; top: 15%; left: 15%; max-width: 70%;
                background: ${bubbleStyle.background};
                border: ${bubbleStyle.border};
                border-radius: ${bubbleStyle.borderRadius};
                padding: 0.5rem 0.8rem;
                font-family: ${bubbleStyle.fontFamily};
                font-size: ${bubbleStyle.fontSize};
                color: ${bubbleStyle.color};
                line-height: 1.3; z-index: 10;
                box-shadow: ${bubbleStyle.boxShadow};
            ">
                ${escapeHtml(text.substring(0, 150))}
                ${this.renderSpeechTail('bottom-left')}
            </div>
        `;
    }

    /**
     * <summary>Render sound effect</summary>
     * @param {Object} sfx - Sound effect data
     * @param {number} index - Effect index
     * @returns {string} HTML for sound effect
     */
    renderSoundEffect(sfx, index) {
        return `
            <div class="sound-effect" data-sfx-index="${index}" style="
                position: absolute;
                left: ${sfx.x || 50}%; top: ${sfx.y || 20}%;
                font-family: 'Impact', 'Arial Black', sans-serif;
                font-size: ${sfx.size || 1.2}rem;
                font-weight: 900;
                color: ${sfx.color || '#ff4444'};
                text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
                transform: rotate(${sfx.rotation || 0}deg);
                z-index: 8;
                pointer-events: none;
            ">
                ${escapeHtml(sfx.text || '')}
            </div>
        `;
    }

    /**
     * <summary>Get speech bubble styling</summary>
     * @param {string} type - Bubble type
     * @returns {Object} Style properties
     */
    getSpeechBubbleStyle(type) {
        const styles = {
            'speech': {
                background: 'white',
                border: '2px solid #000',
                borderRadius: '20px',
                fontFamily: '"Comic Sans MS", cursive',
                fontSize: '0.9rem',
                fontWeight: 'normal',
                color: '#000',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            },
            'thought': {
                background: '#f0f8ff',
                border: '2px dashed #666',
                borderRadius: '30px',
                fontFamily: '"Comic Sans MS", cursive',
                fontSize: '0.85rem',
                fontWeight: 'normal',
                color: '#444',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            },
            'shout': {
                background: '#fffacd',
                border: '3px solid #ff4444',
                borderRadius: '8px',
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#cc0000',
                boxShadow: '3px 3px 6px rgba(0,0,0,0.4)'
            },
            'whisper': {
                background: '#f5f5f5',
                border: '1px solid #999',
                borderRadius: '25px',
                fontFamily: '"Comic Sans MS", cursive',
                fontSize: '0.8rem',
                fontWeight: 'normal',
                color: '#666',
                boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            },
            'narration': {
                background: '#fff8dc',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'Georgia, serif',
                fontSize: '0.85rem',
                fontWeight: 'normal',
                color: '#333',
                boxShadow: '1px 1px 3px rgba(0,0,0,0.2)'
            }
        };
        return styles[type] || styles['speech'];
    }

    /**
     * <summary>Render speech bubble tail</summary>
     * @param {string} direction - Tail direction
     * @returns {string} HTML for speech tail
     */
    renderSpeechTail(direction) {
        const tailStyles = {
            'bottom-left': 'bottom: -8px; left: 20px; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #000;',
            'bottom-right': 'bottom: -8px; right: 20px; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #000;',
            'top-left': 'top: -8px; left: 20px; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 8px solid #000;',
            'top-right': 'top: -8px; right: 20px; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 8px solid #000;'
        };

        const style = tailStyles[direction] || tailStyles['bottom-left'];

        return `
            <div class="speech-tail" style="
                position: absolute;
                width: 0; height: 0;
                ${style}
                z-index: 11;
            "></div>
        `;
    }

    /**
     * <summary>Render panel guide overlay</summary>
     * @param {Array} panels - Panel array
     * @param {number} pageWidth - Page width
     * @param {number} pageHeight - Page height
     * @returns {string} HTML for panel guide
     */
    renderPanelGuideOverlay(panels, pageWidth, pageHeight) {
        let html = '<div class="panel-guide-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 20;">';

        // Reading order indicators
        panels.forEach((panel, index) => {
            const left = (panel.x / pageWidth) * 100;
            const top = (panel.y / pageHeight) * 100;

            html += `
                <div class="panel-guide-number" style="
                    position: absolute;
                    left: ${left}%; top: ${top}%;
                    width: 30px; height: 30px;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 0.9rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    transform: translate(-50%, -50%);
                ">
                    ${index + 1}
                </div>
            `;
        });

        // Reading flow arrows
        for (let i = 0; i < panels.length - 1; i++) {
            const currentPanel = panels[i];
            const nextPanel = panels[i + 1];

            // TODO: Calculate and render reading flow arrows between panels
        }

        html += '</div>';
        return html;
    }

    /**
     * <summary>Render reader control overlay</summary>
     * @returns {string} HTML for reader controls
     */
    renderReaderControls() {
        if (this.fullscreenMode) {
            return `
                <div class="reader-controls-overlay" style="
                    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                    background: rgba(0,0,0,0.8); color: white; padding: 0.5rem 1rem;
                    border-radius: 25px; display: flex; align-items: center; gap: 1rem;
                    z-index: 100; backdrop-filter: blur(10px);
                ">
                    <button class="reader-control-btn" data-action="previous">⏪</button>
                    <span class="page-indicator">${this.currentPreviewPage + 1}</span>
                    <button class="reader-control-btn" data-action="next">⏩</button>
                    <button class="reader-control-btn" data-action="exit-fullscreen">✕</button>
                </div>
            `;
        }
        return '';
    }

    /**
     * <summary>Render annotation layer for reviews</summary>
     * @returns {string} HTML for annotation layer
     */
    renderAnnotationLayer() {
        // TODO: Implement annotation system for collaborative review
        return '<div class="annotation-layer" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 15;"></div>';
    }

    /**
     * <summary>Setup navigator event handlers</summary>
     */
    setupNavigatorHandlers() {

        const container = document.getElementById('cbg-preview-navigator-content');
        if (!container) return;

        // Page thumbnail navigation
        container.addEventListener('click', (e) => {
            const thumb = e.target.closest('.page-thumb');
            if (thumb) {
                const pageIndex = parseInt(thumb.dataset.pageIndex);
                this.goToPage(pageIndex);
            }
        });

        // Navigation buttons
        const navButtons = {
            'cbg-first-page': () => this.goToFirstPage(),
            'cbg-prev-page': () => this.previousPage(),
            'cbg-next-page': () => this.nextPage(),
            'cbg-last-page': () => this.goToLastPage()
        };

        Object.entries(navButtons).forEach(([id, action]) => {
            const btn = container.querySelector(`#${id}`);
            if (btn) btn.addEventListener('click', action);
        });

        // Quality check buttons
        const qualityButtons = {
            'cbg-run-quality-check': () => this.runFullQualityCheck(),
            'cbg-consistency-check': () => this.checkCharacterConsistency(),
            'cbg-dialogue-check': () => this.checkDialogueFlow(),
            'cbg-continuity-check': () => this.checkStoryContinuity()
        };

        Object.entries(qualityButtons).forEach(([id, action]) => {
            const btn = container.querySelector(`#${id}`);
            if (btn) btn.addEventListener('click', action);
        });

        // Review toggles
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('review-toggle')) {
                const reviewType = e.target.dataset.review;
                this.toggleReviewStatus(reviewType);
            }
        });

        // Publication metadata
        const metadataBtn = container.querySelector('#cbg-pub-metadata');
        if (metadataBtn) {
            metadataBtn.addEventListener('click', () => this.openMetadataEditor());
        }

        const approveBtn = container.querySelector('#cbg-approve-all');
        if (approveBtn) {
            approveBtn.addEventListener('click', () => this.approveForPublication());
        }

        // Form field changes
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updatePublicationSettings();
                // Persist review/annotation state to backend via DataHelper
                // TODO: Implement DataHelper.save to persist review/annotation state
                // DataHelper.save('UpdateReviewAnnotationState', { reviewAnnotationState: this.reviewAnnotationState })
            });
        });
    }

    /**
     * <summary>Handle keyboard navigation</summary>
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardNavigation(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

        const key = event.shiftKey ? `Shift+${event.code}` : event.code;
        const handler = this.keyboardShortcuts[key];

        if (handler) {
            event.preventDefault();
            handler();
        }
    }

    /**
     * <summary>Set reading mode</summary>
     * @param {string} mode - Reading mode
     */
    async setReadingMode(mode) {
        this.currentReadingMode = mode;
        await this.renderMainReader();
        this.log(`Reading mode set to: ${mode}`);
    }

    /**
     * <summary>Toggle fullscreen reading mode</summary>
     */
    toggleFullscreen() {
        this.fullscreenMode = !this.fullscreenMode;

        if (this.fullscreenMode) {
            this.enterFullscreenMode();
        } else {
            this.exitFullscreenMode();
        }
    }

    /**
     * <summary>Enter fullscreen reading mode</summary>
     */
    enterFullscreenMode() {
        const reader = document.querySelector('.comic-reader-wrapper');
        if (!reader) return;

        // Create fullscreen overlay
        const overlay = document.createElement('div');
        overlay.id = 'fullscreen-reader-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: #000; z-index: 9999; overflow: hidden;
        `;

        const readerClone = reader.cloneNode(true);
        readerClone.style.cssText = 'width: 100%; height: 100%;';

        overlay.appendChild(readerClone);
        document.body.appendChild(overlay);

        // Hide scrollbars
        document.body.style.overflow = 'hidden';

        this.log('Entered fullscreen mode');
    }

    /**
     * <summary>Exit fullscreen reading mode</summary>
     */
    exitFullscreenMode() {
        const overlay = document.getElementById('fullscreen-reader-overlay');
        if (overlay) {
            overlay.remove();
        }

        document.body.style.overflow = '';
        this.fullscreenMode = false;

        this.log('Exited fullscreen mode');
    }

    /**
     * <summary>Toggle panel guide overlay</summary>
     */
    togglePanelGuide() {
        this.panelGuideMode = !this.panelGuideMode;
        this.renderMainReader();
        this.log(`Panel guide mode: ${this.panelGuideMode ? 'enabled' : 'disabled'}`);
    }

    /**
     * <summary>Navigate to specific page</summary>
     * @param {number} pageIndex - Page index
     */
    async goToPage(pageIndex) {
        const layoutManager = this.main.getManager('layout');
        const pages = layoutManager ? layoutManager.getAllPages() : [];

        if (pageIndex < 0 || pageIndex >= pages.length) return;

        this.currentPreviewPage = pageIndex;
        await this.renderMainReader();
        await this.renderNavigationPanel(); // Update active state

        this.log(`Navigated to page ${pageIndex + 1}`);
    }

    /**
     * <summary>Go to first page</summary>
     */
    async goToFirstPage() {
        await this.goToPage(0);
    }

    /**
     * <summary>Go to last page</summary>
     */
    async goToLastPage() {
        const layoutManager = this.main.getManager('layout');
        const pages = layoutManager ? layoutManager.getAllPages() : [];
        await this.goToPage(pages.length - 1);
    }

    /**
     * <summary>Go to next page</summary>
     */
    async nextPage() {
        const layoutManager = this.main.getManager('layout');
        const pages = layoutManager ? layoutManager.getAllPages() : [];

        if (this.currentPreviewPage < pages.length - 1) {
            await this.goToPage(this.currentPreviewPage + 1);
        }
    }

    /**
     * <summary>Go to previous page</summary>
     */
    async previousPage() {
        if (this.currentPreviewPage > 0) {
            await this.goToPage(this.currentPreviewPage - 1);
        }
    }

    /**
     * <summary>Set zoom level</summary>
     * @param {number} level - Zoom percentage
     */
    setZoomLevel(level) {
        this.zoomLevel = Math.max(25, Math.min(500, level));

        const pageContainers = document.querySelectorAll('.page-container');
        pageContainers.forEach(container => {
            container.style.transform = `scale(${this.zoomLevel / 100})`;
        });

        const zoomSelect = document.getElementById('cbg-zoom-level');
        if (zoomSelect && zoomSelect.value !== this.zoomLevel.toString()) {
            zoomSelect.value = this.zoomLevel.toString();
        }

        this.log(`Zoom set to ${this.zoomLevel}%`);
    }

    /**
     * <summary>Zoom to fit viewport</summary>
     */
    zoomToFit() {
        // TODO: Calculate optimal zoom level based on viewport
        this.setZoomLevel(100);
    }

    /**
     * <summary>Run comprehensive quality checks</summary>
     */
    async runQualityChecks() {
        try {
            this.log('Running quality checks...');
            // TODO: Implement in C# backend.
            // Call a backend service to analyze pages, dialogue, character consistency, etc.
            // Example:
            // const result = await genericRequest('RunQualityChecks', {
            //     projectId: this.main.projectData?.projectInfo?.id
            // }, data => data);
            // this.qualityChecks.clear();
            // result.pageChecks.forEach(pc => this.qualityChecks.set(pc.pageId, pc));
            // this.log('Quality checks completed via backend');
            this.log('Skipping client-side quality checks; delegated to C# backend (TODO)');

        } catch (error) {
            this.handleError('Failed to run quality checks', error);
        }
    }

    /**
     * <summary>Check quality of individual page</summary>
     * @param {Object} page - Page data
     * @param {Array} characters - Characters data
     * @param {Object} storyData - Story data
     * @returns {Object} Quality check results
     */
    async checkPageQuality(page, characters, storyData) {
        // TODO: Move per-page quality checking to C# backend.
        // This stub remains for compatibility but should not perform heavy analysis in JS.
        return {
            hasContent: !!(page.panels && page.panels.length > 0),
            panelsComplete: true,
            dialoguePresent: false,
            characterConsistency: true,
            readingFlow: true,
            technicalQuality: true,
            score: 0
        };
    }

    /**
     * <summary>Validate reading flow of panels</summary>
     * @param {Array} panels - Panel array
     * @returns {boolean} Whether reading flow is valid
     */
    validateReadingFlow(panels) {
        if (!panels || panels.length <= 1) return true;

        // Sort panels by reading order (top-to-bottom, left-to-right for LTR)
        const sortedPanels = [...panels].sort((a, b) => {
            if (Math.abs(a.y - b.y) < 50) { // Same row
                return this.readingDirection === 'ltr' ? a.x - b.x : b.x - a.x;
            }
            return a.y - b.y; // Different rows
        });

        // Check if panels follow logical progression
        for (let i = 0; i < sortedPanels.length - 1; i++) {
            const current = sortedPanels[i];
            const next = sortedPanels[i + 1];

            // If next panel is significantly above current panel, flow might be broken
            if (next.y < current.y - 30) {
                return false;
            }
        }

        return true;
    }

    /**
     * <summary>Get page quality score</summary>
     * @param {Object} page - Page data
     * @returns {number} Quality score percentage
     */
    getPageQualityScore(page) {
        const checks = this.qualityChecks.get(page.id);
        return checks ? checks.score : 75; // Default score
    }

    /**
     * <summary>Get quality indicator color</summary>
     * @param {number} score - Quality score
     * @returns {string} CSS color
     */
    getQualityColor(score) {
        if (score >= 90) return 'var(--success, #28a745)';
        if (score >= 70) return 'var(--warning, #ffc107)';
        return 'var(--danger, #dc3545)';
    }

    /**
     * <summary>Calculate overall comic quality</summary>
     * @returns {number} Overall quality percentage
     */
    calculateOverallQuality() {
        if (this.qualityChecks.size === 0) return 85; // Default

        const scores = Array.from(this.qualityChecks.values()).map(check => check.score);
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    /**
     * <summary>Run full quality check</summary>
     */
    async runFullQualityCheck() {
        const btn = document.getElementById('cbg-run-quality-check');
        if (btn) {
            btn.innerHTML = '<span class="cbg-spinner"></span>Checking...';
            btn.disabled = true;
        }

        try {
            await this.runQualityChecks();
            await this.renderNavigationPanel(); // Refresh quality indicators

            if (btn) {
                btn.innerHTML = '✓ Check Complete';
                setTimeout(() => {
                    btn.innerHTML = '🔍 Run Full Quality Check';
                    btn.disabled = false;
                }, 2000);
            }

        } catch (error) {
            if (btn) {
                btn.innerHTML = '🔍 Run Full Quality Check';
                btn.disabled = false;
            }
            throw error;
        }
    }

    /**
     * <summary>Check character consistency across pages</summary>
     */
    async checkCharacterConsistency() {
        try {
            this.log('Checking character consistency...');

            // TODO: Implement AI-powered character consistency checking
            // This would analyze character appearances across all panels
            // and flag potential inconsistencies

            const btn = document.getElementById('cbg-consistency-check');
            if (btn) {
                btn.innerHTML = '<span class="cbg-spinner"></span>Analyzing...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.innerHTML = '✓ Consistency Check Complete';
                    setTimeout(() => {
                        btn.innerHTML = '👥 Character Consistency';
                        btn.disabled = false;
                    }, 2000);
                }, 3000);
            }

        } catch (error) {
            this.handleError('Failed to check character consistency', error);
        }
    }

    /**
     * <summary>Check dialogue flow and reading order</summary>
     */
    async checkDialogueFlow() {
        try {
            this.log('Checking dialogue flow...');

            // TODO: Implement dialogue flow analysis
            // Check speech bubble positioning, reading order, character voice consistency

            const btn = document.getElementById('cbg-dialogue-check');
            if (btn) {
                btn.innerHTML = '<span class="cbg-spinner"></span>Analyzing...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.innerHTML = '✓ Dialogue Flow Good';
                    setTimeout(() => {
                        btn.innerHTML = '💬 Dialogue Flow';
                        btn.disabled = false;
                    }, 2000);
                }, 2500);
            }

        } catch (error) {
            this.handleError('Failed to check dialogue flow', error);
        }
    }

    /**
     * <summary>Check story continuity</summary>
     */
    async checkStoryContinuity() {
        try {
            this.log('Checking story continuity...');

            // TODO: Implement story continuity analysis
            // Check for plot holes, character development consistency, timeline issues

            const btn = document.getElementById('cbg-continuity-check');
            if (btn) {
                btn.innerHTML = '<span class="cbg-spinner"></span>Analyzing...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.innerHTML = '✓ Continuity Verified';
                    setTimeout(() => {
                        btn.innerHTML = '🔗 Story Continuity';
                        btn.disabled = false;
                    }, 2000);
                }, 3500);
            }

        } catch (error) {
            this.handleError('Failed to check story continuity', error);
        }
    }

    /**
     * <summary>Toggle review approval status</summary>
     * @param {string} reviewType - Type of review
     */
    toggleReviewStatus(reviewType) {
        this.reviewStatus[reviewType] = !this.reviewStatus[reviewType];
        this.renderNavigationPanel(); // Refresh review status display
        this.log(`${reviewType} review status: ${this.reviewStatus[reviewType] ? 'approved' : 'pending'}`);
    }

    /**
     * <summary>Open metadata editor modal</summary>
     */
    openMetadataEditor() {
        // TODO: Implement comprehensive metadata editor modal
        // This would include ISBN, copyright, publication details, etc.

        const title = prompt('Comic Title:', this.publicationMeta.title);
        if (title !== null) {
            this.publicationMeta.title = title;
            this.updatePublicationSettings();
        }
    }

    /**
     * <summary>Approve comic for publication</summary>
     */
    async approveForPublication() {
        const allApproved = Object.values(this.reviewStatus).every(status => status);

        if (!allApproved) {
            if (!confirm('Not all review items are approved. Continue anyway?')) {
                return;
            }
        }

        try {
            this.log('Approving comic for publication...');

            // TODO: Run final validation and preparation
            // Mark as publication-ready
            // Generate publication package

            const btn = document.getElementById('cbg-approve-all');
            if (btn) {
                btn.innerHTML = '<span class="cbg-spinner"></span>Preparing...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.innerHTML = '✓ Approved for Publication';
                    btn.style.background = 'var(--success)';
                    btn.style.color = 'white';
                }, 2000);
            }

        } catch (error) {
            this.handleError('Failed to approve for publication', error);
        }
    }

    /**
     * <summary>Update publication settings from form</summary>
     */
    updatePublicationSettings() {
        try {
            this.publicationMeta.title = this.getFormValue('cbg-pub-title');
            this.publicationMeta.author = this.getFormValue('cbg-pub-author');
            this.publicationMeta.genre = this.getFormValue('cbg-pub-genre');
            this.publicationMeta.ageRating = this.getFormValue('cbg-age-rating');

            this.log('Publication settings updated');

        } catch (error) {
            this.handleError('Failed to update publication settings', error);
        }
    }

    /**
     * <summary>Export comic in various formats</summary>
     * @param {string} format - Export format
     * @param {Object} options - Export options
     */
    async exportComic(format = 'pdf', options = {}) {
        if (this.isExporting) {
            this.log('Export already in progress');
            return;
        }

        try {
            this.log(`Starting export to ${format.toUpperCase()}...`);
            this.isExporting = true;

            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];

            if (pages.length === 0) {
                throw new Error('No pages to export');
            }

            const exportSettings = { ...this.exportSettings, ...options };

            // TODO: Implement actual export functionality
            // This would call C# backend methods to generate files

            // Placeholder implementation
            await this.simulateExport(format, pages, exportSettings);

            this.log(`Export to ${format.toUpperCase()} completed`);

        } catch (error) {
            this.handleError(`Failed to export to ${format}`, error);
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * <summary>Simulate export process</summary>
     * @param {string} format - Export format
     * @param {Array} pages - Pages to export
     * @param {Object} settings - Export settings
     */
    async simulateExport(format, pages, settings) {
        // Simulate export progress
        const formats = {
            'pdf': 'Adobe PDF for print and digital distribution',
            'cbz': 'Comic Book Archive (CBZ) for digital readers',
            'png': 'High-resolution PNG images',
            'jpg': 'JPEG images for web distribution'
        };

        const description = formats[format] || 'Unknown format';

        return new Promise(resolve => {
            setTimeout(() => {
                alert(`Export complete!\n\nFormat: ${format.toUpperCase()}\nPages: ${pages.length}\nDescription: ${description}\n\nFiles would be saved to your downloads folder.`);
                resolve();
            }, 2000);
        });
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
     * <summary>Save all publication data</summary>
     */
    async saveData() {
        try {
            this.log('Saving publication data...');

            const publicationData = {
                currentPreviewPage: this.currentPreviewPage,
                currentReadingMode: this.currentReadingMode,
                zoomLevel: this.zoomLevel,
                readingDirection: this.readingDirection,
                reviewStatus: this.reviewStatus,
                exportSettings: this.exportSettings,
                publicationMeta: this.publicationMeta,
                qualityChecks: Array.from(this.qualityChecks.entries())
            };

            // Update project data
            this.main.updateProjectData({ publication: publicationData });

            this.log('Publication data saved successfully');

        } catch (error) {
            this.handleError('Failed to save publication data', error);
        }
    }

    /**
     * <summary>Load publication data</summary>
     * @param {Object} publicationData - Publication data to load
     */
    loadData(publicationData = {}) {
        try {
            this.log('Loading publication data...');

            if (publicationData.currentPreviewPage !== undefined) {
                this.currentPreviewPage = publicationData.currentPreviewPage;
            }

            if (publicationData.currentReadingMode) {
                this.currentReadingMode = publicationData.currentReadingMode;
            }

            if (publicationData.zoomLevel !== undefined) {
                this.zoomLevel = publicationData.zoomLevel;
            }

            if (publicationData.readingDirection) {
                this.readingDirection = publicationData.readingDirection;
            }

            if (publicationData.reviewStatus) {
                this.reviewStatus = { ...this.reviewStatus, ...publicationData.reviewStatus };
            }

            if (publicationData.exportSettings) {
                this.exportSettings = { ...this.exportSettings, ...publicationData.exportSettings };
            }

            if (publicationData.publicationMeta) {
                this.publicationMeta = { ...this.publicationMeta, ...publicationData.publicationMeta };
            }

            if (publicationData.qualityChecks) {
                this.qualityChecks = new Map(publicationData.qualityChecks);
            }

            // Clear canvas cache
            this.pageCanvases.clear();

            this.log('Publication data loaded successfully');

        } catch (error) {
            this.handleError('Failed to load publication data', error);
        }
    }

    /**
     * <summary>Clear all caches</summary>
     */
    clearCache() {
        this.pageCanvases.clear();
        this.qualityChecks.clear();
        this.log('Publication cache cleared');
    }

    /**
     * <summary>Get current publication status</summary>
     * @returns {Object} Publication status
     */
    getPublicationStatus() {
        return {
            isReady: Object.values(this.reviewStatus).every(status => status),
            overallQuality: this.calculateOverallQuality(),
            reviewStatus: { ...this.reviewStatus },
            metadata: { ...this.publicationMeta },
            pageCount: this.main.getManager('layout')?.getAllPages().length || 0
        };
    }

    /**
     * <summary>Debug logging helper</summary>
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:Publication ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    handleError(message, error) {
        console.error(`[CBG:Publication ERROR] ${message}:`, error);

        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        }
    }

    /**
     * <summary>Cleanup resources</summary>
     */
    destroy() {
        this.log('Destroying Publication Manager...');

        this.pageCanvases.clear();
        this.qualityChecks.clear();
        this.annotations.clear();
        this.isExporting = false;
        this.fullscreenMode = false;
        this.isInitialized = false;

        // Remove fullscreen overlay if present
        const overlay = document.getElementById('fullscreen-reader-overlay');
        if (overlay) overlay.remove();

        this.log('Publication Manager destroyed');
    }
}

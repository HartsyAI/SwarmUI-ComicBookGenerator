/**
 * <summary>Comic Book Generator - Preview & Export Module</summary>
 * Handles final preview, page navigation, and export functionality
 */

export class PreviewManager {
    constructor(main) {
        this.main = main;
        this.debug = true;
        this.currentPreviewPage = 0;
        this.zoomLevel = 100;
        this.exportSettings = {
            format: 'pdf',
            quality: 'high',
            pageSize: 'comic',
            dpi: 300,
            includeBleed: false,
            cropMarks: false
        };
        this.isExporting = false;
        this.pageCanvases = new Map(); // Cache rendered page canvases
        this.isInitialized = false;

        this.log('PreviewManager constructor called');
    }

    /**
     * <summary>Initialize the preview manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Preview Manager...');

            this.setupEventHandlers();
            this.isInitialized = true;

            this.log('Preview Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Preview Manager', error);
        }
    }

    /**
     * <summary>Setup event handlers for preview management</summary>
     */
    setupEventHandlers() {
        this.log('Setting up preview event handlers...');

        // Zoom controls
        const zoomLevel = document.getElementById('cbg-zoom-level');
        const zoomFit = document.getElementById('cbg-zoom-fit');
        const zoom100 = document.getElementById('cbg-zoom-100');

        if (zoomLevel) {
            zoomLevel.addEventListener('change', (e) => {
                this.setZoomLevel(parseInt(e.target.value));
            });
        }

        if (zoomFit) {
            zoomFit.addEventListener('click', () => this.zoomToFit());
        }

        if (zoom100) {
            zoom100.addEventListener('click', () => this.setZoomLevel(100));
        }
    }

    /**
     * <summary>Render the preview interface</summary>
     */
    async render() {
        try {
            this.log('Rendering preview interface...');

            await this.renderPageNavigator();
            await this.renderPreviewCanvas();

        } catch (error) {
            this.handleError('Failed to render preview interface', error);
        }
    }

    /**
     * <summary>Render the page navigator section</summary>
     */
    async renderPageNavigator() {
        const container = document.getElementById('cbg-preview-navigator-content');
        if (!container) {
            throw new Error('Preview navigator container not found');
        }

        this.log('Rendering page navigator...');

        try {
            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];

            let html = '';

            // Page Thumbnails Section
            html += '<div class="navigator-section" style="margin-bottom: 1.5rem;">';
            html += '<div class="d-flex align-items-center justify-content-between" style="margin-bottom: 1rem;">';
            html += `<h4 style="margin: 0;">Pages (${pages.length})</h4>`;
            html += '<div>';
            html += '<button class="basic-button small-button me-2" id="cbg-add-page">+ Add Page</button>';
            html += '<button class="basic-button small-button" id="cbg-delete-page">Delete</button>';
            html += '</div>';
            html += '</div>';

            if (pages.length === 0) {
                html += `
                    <div style="text-align: center; color: var(--text-soft); padding: 2rem;">
                        <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">No pages created</div>
                        <div style="font-size: 0.9rem;">Create some pages in Layout mode first</div>
                    </div>
                `;
            } else {
                html += '<div class="page-thumbnails" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 0.75rem;">';

                pages.forEach((page, index) => {
                    const isActive = index === this.currentPreviewPage;
                    const panelCount = page.panels ? page.panels.length : 0;

                    html += `
                        <div class="page-thumb ${isActive ? 'active' : ''}" data-page-index="${index}"
                             style="aspect-ratio: 3/4; border: ${isActive ? '2px solid var(--primary)' : '1px solid var(--shadow)'}; border-radius: 0.4rem; background-color: var(--background-soft); cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: ${isActive ? '600' : '400'}; transition: all 0.2s;">
                            <div class="page-number">${page.number}</div>
                            <div class="page-info" style="position: absolute; bottom: 2px; left: 2px; right: 2px; font-size: 0.6rem; color: var(--text-soft); text-align: center; background: rgba(0,0,0,0.1); border-radius: 0.2rem; padding: 1px;">
                                ${panelCount} panels
                            </div>
                        </div>
                    `;
                });

                html += '</div>';
            }
            html += '</div>';

            // Export Settings Section
            html += '<div class="navigator-section" style="margin-bottom: 1.5rem;">';
            html += '<h4 style="margin-bottom: 1rem;">Export Settings</h4>';

            html += makeDropdownInput(null, 'cbg-export-format', 'export_format', 'Output Format',
                'Final export format',
                ['pdf', 'png', 'jpg', 'cbr', 'cbz'],
                this.exportSettings.format);

            html += makeDropdownInput(null, 'cbg-export-quality', 'export_quality', 'Quality',
                'Export quality settings',
                ['high', 'medium', 'web'],
                this.exportSettings.quality);

            html += makeDropdownInput(null, 'cbg-page-size', 'page_size', 'Page Size',
                'Physical page dimensions',
                ['comic', 'letter', 'a4', 'custom'],
                this.exportSettings.pageSize);

            html += makeNumberInput(null, 'cbg-export-dpi', 'export_dpi', 'DPI',
                'Dots per inch for print quality', this.exportSettings.dpi, 72, 600, 1);

            html += makeCheckboxInput(null, 'cbg-include-bleed', 'include_bleed', 'Include Bleed',
                'Add bleed area for professional printing', this.exportSettings.includeBleed);

            html += makeCheckboxInput(null, 'cbg-crop-marks', 'crop_marks', 'Crop Marks',
                'Add crop marks for printing', this.exportSettings.cropMarks);

            html += '</div>';

            // Export Actions Section
            html += '<div class="navigator-section">';
            html += '<h4 style="margin-bottom: 1rem;">Export Actions</h4>';
            html += '<div class="d-flex flex-column" style="gap: 0.5rem;">';
            html += '<button class="basic-button btn-primary" id="cbg-export-all">Export All Pages</button>';
            html += '<button class="basic-button small-button" id="cbg-export-current">Export Current Page</button>';
            html += '<button class="basic-button small-button" id="cbg-export-range">Export Page Range</button>';
            html += '<button class="basic-button small-button" id="cbg-preview-print">Print Preview</button>';
            html += '</div>';
            html += '</div>';

            container.innerHTML = html;

            // Enable SwarmUI enhancements
            if (typeof enableSlidersIn === 'function') {
                enableSlidersIn(container);
            }

            // Setup navigator event handlers
            this.setupNavigatorHandlers();

        } catch (error) {
            this.handleError('Failed to render page navigator', error);
            container.innerHTML = '<div class="cbg-error">Failed to load page navigator</div>';
        }
    }

    /**
     * <summary>Render the main preview canvas</summary>
     */
    async renderPreviewCanvas() {
        const container = document.getElementById('cbg-preview-content');
        if (!container) {
            throw new Error('Preview content container not found');
        }

        this.log(`Rendering preview canvas for page ${this.currentPreviewPage + 1}`);

        try {
            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];

            if (pages.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: var(--text-soft); height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📄</div>
                        <div style="font-size: 1.2rem; margin-bottom: 0.5rem; font-weight: 500;">No Pages to Preview</div>
                        <div style="font-size: 0.9rem; margin-bottom: 1rem;">Create some pages in Layout mode to see them here</div>
                        <button class="basic-button btn-primary" onclick="document.getElementById('layout_mode').click()">Go to Layout Mode</button>
                    </div>
                `;
                return;
            }

            const currentPage = pages[this.currentPreviewPage];
            if (!currentPage) {
                container.innerHTML = `
                    <div style="text-align: center; color: var(--text-soft); height: 100%; display: flex; align-items: center; justify-content: center;">
                        <div>Page not found</div>
                    </div>
                `;
                return;
            }

            // Generate or get cached page canvas
            const pageCanvas = await this.generatePageCanvas(currentPage);

            container.innerHTML = `
                <div class="page-preview-wrapper" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 1rem;">
                    <div class="page-preview" id="cbg-page-preview" style="transform: scale(${this.zoomLevel / 100}); transform-origin: center; transition: transform 0.2s;">
                        ${pageCanvas}
                    </div>
                </div>
                <div class="page-info-overlay" style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,0,0,0.7); color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.9rem;">
                    Page ${currentPage.number} of ${pages.length} • ${currentPage.panels?.length || 0} panels
                </div>
            `;

        } catch (error) {
            this.handleError('Failed to render preview canvas', error);
            container.innerHTML = '<div class="cbg-error">Failed to load page preview</div>';
        }
    }

    /**
     * <summary>Generate HTML canvas for a page</summary>
     * @param {Object} pageData - Page data to render
     * @returns {string} HTML string for the page
     */
    async generatePageCanvas(pageData) {
        try {
            // Check cache first
            const cacheKey = `${pageData.id}_${pageData.lastModified}`;
            if (this.pageCanvases.has(cacheKey)) {
                return this.pageCanvases.get(cacheKey);
            }

            const pageWidth = pageData.width || 800;
            const pageHeight = pageData.height || 1000;
            const panels = pageData.panels || [];

            let html = `
                <div class="comic-page" style="
                    width: ${pageWidth}px; 
                    height: ${pageHeight}px; 
                    background: white; 
                    border: 1px solid #ccc; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                    position: relative;
                    overflow: hidden;
                    border-radius: 8px;
                ">
            `;

            // Background image if set
            if (pageData.backgroundImage) {
                html += `
                    <div class="page-background" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-image: url(${pageData.backgroundImage});
                        background-size: cover;
                        background-position: center;
                        opacity: 0.1;
                    "></div>
                `;
            }

            // Render each panel
            panels.forEach((panel, index) => {
                html += this.renderPanelPreview(panel, pageWidth, pageHeight);
            });

            html += '</div>';

            // Cache the result
            this.pageCanvases.set(cacheKey, html);

            return html;

        } catch (error) {
            this.handleError('Failed to generate page canvas', error);
            return '<div class="cbg-error">Failed to generate page preview</div>';
        }
    }

    /**
     * <summary>Render a panel for preview</summary>
     * @param {Object} panel - Panel data
     * @param {number} pageWidth - Page width
     * @param {number} pageHeight - Page height
     * @returns {string} HTML string for the panel
     */
    renderPanelPreview(panel, pageWidth, pageHeight) {
        const left = (panel.x / pageWidth) * 100;
        const top = (panel.y / pageHeight) * 100;
        const width = (panel.width / pageWidth) * 100;
        const height = (panel.height / pageHeight) * 100;

        let content = '';

        // Panel background/scene
        if (panel.sceneImage) {
            content += `
                <img src="${panel.sceneImage}" 
                     style="width: 100%; height: 100%; object-fit: cover;" 
                     alt="Panel scene">
            `;
        } else if (panel.sceneDescription) {
            content += `
                <div style="
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100%; 
                    padding: 0.5rem; 
                    font-size: 0.7rem; 
                    color: #666; 
                    text-align: center; 
                    background: #f8f8f8;
                    font-family: Arial, sans-serif;
                ">${escapeHtml(panel.sceneDescription.substring(0, 50))}${panel.sceneDescription.length > 50 ? '...' : ''}</div>
            `;
        } else {
            content += `
                <div style="
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100%; 
                    color: #aaa; 
                    font-size: 0.8rem;
                    font-family: Arial, sans-serif;
                ">Panel ${panel.number || ''}</div>
            `;
        }

        // Speech bubbles/text
        if (panel.speechText && panel.speechText.trim()) {
            const bubbleStyle = this.getSpeechBubbleStyle(panel.speechStyle || 'oval');
            content += `
                <div style="
                    position: absolute;
                    top: 10%;
                    left: 10%;
                    max-width: 80%;
                    background: white;
                    border: 2px solid black;
                    border-radius: ${bubbleStyle.borderRadius};
                    padding: 0.3rem 0.5rem;
                    font-size: 0.6rem;
                    font-family: Arial, sans-serif;
                    line-height: 1.2;
                    box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                ">${escapeHtml(panel.speechText.substring(0, 100))}</div>
            `;
        }

        return `
            <div class="preview-panel" style="
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                width: ${width}%;
                height: ${height}%;
                border: ${panel.borderWidth || 2}px ${panel.borderStyle || 'solid'} ${panel.borderColor || '#000'};
                background-color: ${panel.backgroundColor || 'white'};
                overflow: hidden;
            ">
                ${content}
            </div>
        `;
    }

    /**
     * <summary>Get speech bubble styling</summary>
     * @param {string} style - Bubble style
     * @returns {Object} Style properties
     */
    getSpeechBubbleStyle(style) {
        const styles = {
            'oval': { borderRadius: '50%' },
            'rectangle': { borderRadius: '4px' },
            'cloud': { borderRadius: '20px' },
            'burst': { borderRadius: '0px' }
        };
        return styles[style] || styles['oval'];
    }

    /**
     * <summary>Setup navigator event handlers</summary>
     */
    setupNavigatorHandlers() {
        const container = document.getElementById('cbg-preview-navigator-content');
        if (!container) return;

        // Page thumbnail clicks
        container.addEventListener('click', (e) => {
            const thumb = e.target.closest('.page-thumb');
            if (thumb) {
                const pageIndex = parseInt(thumb.dataset.pageIndex);
                this.switchToPreviewPage(pageIndex);
            }
        });

        // Form field changes for export settings
        const inputs = container.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateExportSettings();
            });
        });

        // Export buttons
        const exportAllBtn = container.querySelector('#cbg-export-all');
        const exportCurrentBtn = container.querySelector('#cbg-export-current');
        const exportRangeBtn = container.querySelector('#cbg-export-range');
        const printPreviewBtn = container.querySelector('#cbg-preview-print');
        const addPageBtn = container.querySelector('#cbg-add-page');
        const deletePageBtn = container.querySelector('#cbg-delete-page');

        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllPages());
        }

        if (exportCurrentBtn) {
            exportCurrentBtn.addEventListener('click', () => this.exportCurrentPage());
        }

        if (exportRangeBtn) {
            exportRangeBtn.addEventListener('click', () => this.exportPageRange());
        }

        if (printPreviewBtn) {
            printPreviewBtn.addEventListener('click', () => this.showPrintPreview());
        }

        if (addPageBtn) {
            addPageBtn.addEventListener('click', () => this.addPage());
        }

        if (deletePageBtn) {
            deletePageBtn.addEventListener('click', () => this.deletePage());
        }
    }

    /**
     * <summary>Switch to a different preview page</summary>
     * @param {number} pageIndex - Page index to switch to
     */
    async switchToPreviewPage(pageIndex) {
        const layoutManager = this.main.getManager('layout');
        const pages = layoutManager ? layoutManager.getAllPages() : [];

        if (pageIndex < 0 || pageIndex >= pages.length) {
            this.log(`Invalid page index: ${pageIndex}`);
            return;
        }

        this.currentPreviewPage = pageIndex;

        await this.renderPreviewCanvas();
        await this.renderPageNavigator(); // Refresh to update active state

        this.log(`Switched to preview page ${pageIndex + 1}`);
    }

    /**
     * <summary>Set zoom level</summary>
     * @param {number} level - Zoom percentage (25-200)
     */
    setZoomLevel(level) {
        this.zoomLevel = Math.max(25, Math.min(200, level));

        const preview = document.getElementById('cbg-page-preview');
        if (preview) {
            preview.style.transform = `scale(${this.zoomLevel / 100})`;
        }

        const zoomSelect = document.getElementById('cbg-zoom-level');
        if (zoomSelect && zoomSelect.value !== this.zoomLevel.toString()) {
            zoomSelect.value = this.zoomLevel.toString();
        }

        this.log(`Set zoom level to ${this.zoomLevel}%`);
    }

    /**
     * <summary>Zoom to fit the available space</summary>
     */
    zoomToFit() {
        const container = document.querySelector('.page-preview-wrapper');
        const preview = document.getElementById('cbg-page-preview');

        if (!container || !preview) return;

        // Calculate the zoom level needed to fit
        const containerRect = container.getBoundingClientRect();
        const previewRect = preview.getBoundingClientRect();

        const scaleX = (containerRect.width * 0.9) / (previewRect.width / (this.zoomLevel / 100));
        const scaleY = (containerRect.height * 0.9) / (previewRect.height / (this.zoomLevel / 100));
        const scale = Math.min(scaleX, scaleY);

        const newZoom = Math.round(scale * 100);
        this.setZoomLevel(newZoom);
    }

    /**
     * <summary>Update export settings from form</summary>
     */
    updateExportSettings() {
        try {
            this.exportSettings.format = this.getFormValue('cbg-export-format');
            this.exportSettings.quality = this.getFormValue('cbg-export-quality');
            this.exportSettings.pageSize = this.getFormValue('cbg-page-size');
            this.exportSettings.dpi = parseInt(this.getFormValue('cbg-export-dpi')) || 300;
            this.exportSettings.includeBleed = this.getFormValue('cbg-include-bleed') === 'true';
            this.exportSettings.cropMarks = this.getFormValue('cbg-crop-marks') === 'true';

            this.log('Export settings updated:', this.exportSettings);

        } catch (error) {
            this.handleError('Failed to update export settings', error);
        }
    }

    /**
     * <summary>Export all pages</summary>
     */
    async exportAllPages() {
        if (this.isExporting) {
            this.log('Export already in progress');
            return;
        }

        try {
            this.log('Starting export of all pages...');
            this.isExporting = true;

            const exportBtn = document.getElementById('cbg-export-all');
            if (exportBtn) {
                exportBtn.innerHTML = '<span class="cbg-spinner"></span>Exporting...';
                exportBtn.disabled = true;
            }

            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];

            if (pages.length === 0) {
                throw new Error('No pages to export');
            }

            // Update export settings
            this.updateExportSettings();

            // TODO: Call C# backend method for export
            // const response = await genericRequest('ExportComic', {
            //     pages: pages,
            //     exportSettings: this.exportSettings,
            //     projectData: this.main.getProjectData()
            // }, data => {
            //     // Handle export completion
            //     this.handleExportComplete(data);
            // });

            // Placeholder for demonstration
            setTimeout(() => {
                this.log('Export completed (placeholder)');
                this.isExporting = false;

                if (exportBtn) {
                    exportBtn.innerHTML = 'Export All Pages';
                    exportBtn.disabled = false;
                }

                // Simulate download
                alert(`Export complete! ${pages.length} pages exported as ${this.exportSettings.format.toUpperCase()}`);
            }, 3000);

        } catch (error) {
            this.handleError('Failed to export all pages', error);
            this.isExporting = false;

            const exportBtn = document.getElementById('cbg-export-all');
            if (exportBtn) {
                exportBtn.innerHTML = 'Export All Pages';
                exportBtn.disabled = false;
            }
        }
    }

    /**
     * <summary>Export current page only</summary>
     */
    async exportCurrentPage() {
        try {
            this.log('Exporting current page...');

            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];
            const currentPage = pages[this.currentPreviewPage];

            if (!currentPage) {
                throw new Error('No page to export');
            }

            this.updateExportSettings();

            // TODO: Call C# backend method for single page export
            this.log('Current page export completed (placeholder)');

        } catch (error) {
            this.handleError('Failed to export current page', error);
        }
    }

    /**
     * <summary>Export page range</summary>
     */
    async exportPageRange() {
        try {
            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];

            if (pages.length === 0) {
                throw new Error('No pages available for export');
            }

            // Show range selection dialog
            const startPage = prompt(`Enter start page (1-${pages.length}):`);
            const endPage = prompt(`Enter end page (1-${pages.length}):`);

            if (!startPage || !endPage) {
                this.log('Page range export cancelled');
                return;
            }

            const start = parseInt(startPage) - 1;
            const end = parseInt(endPage) - 1;

            if (start < 0 || end >= pages.length || start > end) {
                throw new Error('Invalid page range');
            }

            const rangePags = pages.slice(start, end + 1);

            this.log(`Exporting pages ${start + 1} to ${end + 1} (${rangePags.length} pages)`);

            // TODO: Call C# backend method for range export
            this.log('Page range export completed (placeholder)');

        } catch (error) {
            this.handleError('Failed to export page range', error);
        }
    }

    /**
     * <summary>Show print preview</summary>
     */
    showPrintPreview() {
        try {
            this.log('Opening print preview...');

            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];

            if (pages.length === 0) {
                throw new Error('No pages to preview');
            }

            // Create print preview window
            const printWindow = window.open('', '_blank', 'width=800,height=1000');

            let printHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Comic Book - Print Preview</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        .print-page { 
                            width: 8.5in; 
                            height: 11in; 
                            margin: 0 auto 20px; 
                            border: 1px solid #ccc; 
                            page-break-after: always; 
                        }
                        @media print {
                            body { padding: 0; }
                            .print-page { margin: 0; border: none; }
                        }
                    </style>
                </head>
                <body>
            `;

            // Add each page
            for (const page of pages) {
                const pageCanvas = await this.generatePageCanvas(page);
                printHtml += `<div class="print-page">${pageCanvas}</div>`;
            }

            printHtml += '</body></html>';

            printWindow.document.write(printHtml);
            printWindow.document.close();

            // Focus the print window
            printWindow.focus();

        } catch (error) {
            this.handleError('Failed to show print preview', error);
        }
    }

    /**
     * <summary>Add a new page</summary>
     */
    addPage() {
        try {
            this.log('Adding new page...');

            const layoutManager = this.main.getManager('layout');
            if (!layoutManager) {
                throw new Error('Layout manager not available');
            }

            // Switch to layout mode to add page
            const layoutRadio = document.getElementById('layout_mode');
            if (layoutRadio) {
                layoutRadio.checked = true;
                this.main.setActiveMode('layout_mode');
            }

        } catch (error) {
            this.handleError('Failed to add page', error);
        }
    }

    /**
     * <summary>Delete current page</summary>
     */
    deletePage() {
        try {
            const layoutManager = this.main.getManager('layout');
            const pages = layoutManager ? layoutManager.getAllPages() : [];

            if (pages.length <= 1) {
                throw new Error('Cannot delete the last page');
            }

            const currentPage = pages[this.currentPreviewPage];
            if (!currentPage) {
                throw new Error('No page selected');
            }

            if (confirm(`Delete page ${currentPage.number}? This action cannot be undone.`)) {
                // TODO: Call layout manager to delete page
                this.log(`Deleted page ${currentPage.number} (placeholder)`);

                // Adjust current page if necessary
                if (this.currentPreviewPage >= pages.length - 1) {
                    this.currentPreviewPage = Math.max(0, pages.length - 2);
                }

                this.render();
            }

        } catch (error) {
            this.handleError('Failed to delete page', error);
        }
    }

    /**
     * <summary>Save all preview data</summary>
     */
    async saveData() {
        try {
            this.log('Saving preview data...');

            const previewData = {
                currentPreviewPage: this.currentPreviewPage,
                zoomLevel: this.zoomLevel,
                exportSettings: this.exportSettings
            };

            // Update project data
            this.main.updateProjectData({ preview: previewData });

            this.log('Preview data saved successfully');

        } catch (error) {
            this.handleError('Failed to save preview data', error);
        }
    }

    /**
     * <summary>Load preview data</summary>
     * @param {Object} previewData - Preview data to load
     */
    loadData(previewData = {}) {
        try {
            this.log('Loading preview data...');

            if (previewData.currentPreviewPage !== undefined) {
                this.currentPreviewPage = previewData.currentPreviewPage;
            }

            if (previewData.zoomLevel !== undefined) {
                this.zoomLevel = previewData.zoomLevel;
            }

            if (previewData.exportSettings) {
                this.exportSettings = { ...this.exportSettings, ...previewData.exportSettings };
            }

            // Clear canvas cache
            this.pageCanvases.clear();

            this.log('Preview data loaded successfully');

        } catch (error) {
            this.handleError('Failed to load preview data', error);
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
     * <summary>Clear page canvas cache</summary>
     */
    clearCache() {
        this.pageCanvases.clear();
        this.log('Preview cache cleared');
    }

    /**
     * <summary>Get export settings</summary>
     * @returns {Object} Current export settings
     */
    getExportSettings() {
        return { ...this.exportSettings };
    }

    /**
     * <summary>Debug logging helper</summary>
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:Preview ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    handleError(message, error) {
        console.error(`[CBG:Preview ERROR] ${message}:`, error);

        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        }
    }

    /**
     * <summary>Cleanup resources</summary>
     */
    destroy() {
        this.log('Destroying Preview Manager...');

        this.pageCanvases.clear();
        this.isExporting = false;
        this.isInitialized = false;

        this.log('Preview Manager destroyed');
    }
}

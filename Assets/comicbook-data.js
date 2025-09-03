/**
 * <summary>Comic Book Generator - Data Persistence Module</summary>
 * Handles project data serialization, persistence, and backend communication
 */

export class DataManager {
    constructor(main) {
        this.main = main;
        this.debug = true;
        this.projectSchema = '1.0';
        this.autoSaveEnabled = true;
        this.lastSaveTime = null;
        this.hasUnsavedChanges = false;
        this.saveQueue = [];
        this.isSaving = false;
        this.isInitialized = false;

        this.log('DataManager constructor called');
    }

    /**
     * <summary>Initialize the data manager</summary>
     */
    async initialize() {
        try {
            this.log('Initializing Data Manager...');

            this.setupChangeTracking();
            this.isInitialized = true;

            this.log('Data Manager initialized successfully');

        } catch (error) {
            this.handleError('Failed to initialize Data Manager', error);
        }
    }

    /**
     * <summary>Setup change tracking for unsaved changes detection</summary>
     */
    setupChangeTracking() {
        // Track when project data changes
        const originalUpdateProjectData = this.main.updateProjectData;
        if (originalUpdateProjectData) {
            this.main.updateProjectData = (data) => {
                originalUpdateProjectData.call(this.main, data);
                this.markAsChanged();
            };
        }
    }

    /**
     * <summary>Create a new project data structure</summary>
     * @returns {Object} New project data object
     */
    createNewProject() {
        const projectData = {
            projectInfo: {
                title: 'Untitled Comic',
                author: '',
                description: '',
                version: this.projectSchema,
                created: Date.now(),
                lastModified: Date.now(),
                id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            settings: {
                theme: 'default',
                autoSave: true,
                backupCount: 5,
                exportDefaults: {
                    format: 'pdf',
                    quality: 'high',
                    dpi: 300
                }
            },
            characters: [],
            story: {
                storyInfo: {},
                plotPoints: [],
                script: ''
            },
            layout: {
                pages: [],
                currentPage: 0,
                panelTemplates: []
            },
            assets: {
                assets: [],
                templates: [],
                stylePresets: []
            },
            preview: {
                currentPreviewPage: 0,
                zoomLevel: 100,
                exportSettings: {}
            }
        };

        this.log('Created new project:', projectData.projectInfo.id);
        return projectData;
    }

    /**
     * <summary>Save project to backend</summary>
     * @param {Object} projectData - Project data to save
     * @param {boolean} isAutoSave - Whether this is an auto-save operation
     * @returns {Promise} Save operation promise
     */
    async saveProject(projectData, isAutoSave = false) {
        try {
            this.log(`${isAutoSave ? 'Auto-saving' : 'Saving'} project...`);

            if (this.isSaving) {
                this.log('Save already in progress, queueing...');
                return new Promise((resolve, reject) => {
                    this.saveQueue.push({ projectData, isAutoSave, resolve, reject });
                });
            }

            this.isSaving = true;

            // Validate project data
            const validationResult = this.validateProjectData(projectData);
            if (!validationResult.isValid) {
                throw new Error(`Project validation failed: ${validationResult.errors.join(', ')}`);
            }

            // Prepare data for saving
            const saveData = this.prepareProjectForSave(projectData);

            // TODO: Call C# backend method to save project
            // const response = await genericRequest('SaveComicProject', {
            //     projectData: saveData,
            //     isAutoSave: isAutoSave,
            //     projectId: projectData.projectInfo.id
            // }, data => {
            //     this.handleSaveSuccess(data, isAutoSave);
            // });

            // Placeholder for demonstration
            await this.simulateSave(saveData, isAutoSave);

            this.handleSaveSuccess({ projectId: saveData.projectInfo.id }, isAutoSave);

        } catch (error) {
            this.handleSaveError(error, isAutoSave);
            throw error;
        } finally {
            this.isSaving = false;
            this.processSaveQueue();
        }
    }

    /**
     * <summary>Load project from backend</summary>
     * @param {string} projectId - Project ID to load (optional)
     * @returns {Promise<Object>} Loaded project data
     */
    async loadProject(projectId = null) {
        try {
            this.log(`Loading project${projectId ? ` (${projectId})` : ' (last project)'}...`);

            // TODO: Call C# backend method to load project
            // const response = await genericRequest('LoadComicProject', {
            //     projectId: projectId
            // }, data => {
            //     return this.processLoadedProject(data.projectData);
            // });

            // Placeholder for demonstration
            const loadedData = await this.simulateLoad(projectId);
            return this.processLoadedProject(loadedData);

        } catch (error) {
            this.handleError('Failed to load project', error);
            throw error;
        }
    }

    /**
     * <summary>Load the last opened project</summary>
     * @returns {Promise<Object>} Last project data or null
     */
    async loadLastProject() {
        try {
            this.log('Loading last opened project...');

            // TODO: Call C# backend method to get last project
            // const response = await genericRequest('GetLastProject', {}, data => {
            //     if (data.projectData) {
            //         return this.processLoadedProject(data.projectData);
            //     }
            //     return null;
            // });

            // Placeholder - return null to indicate no last project
            return null;

        } catch (error) {
            this.log('No last project found or failed to load');
            return null;
        }
    }

    /**
     * <summary>Get list of available projects</summary>
     * @returns {Promise<Array>} List of project summaries
     */
    async getProjectList() {
        try {
            this.log('Getting project list...');

            // TODO: Call C# backend method to get project list
            // const response = await genericRequest('GetProjectList', {}, data => {
            //     return data.projects || [];
            // });

            // Placeholder for demonstration
            return [
                {
                    id: 'demo_project_1',
                    title: 'My First Comic',
                    author: 'Demo User',
                    lastModified: Date.now() - 86400000, // 1 day ago
                    pageCount: 8,
                    thumbnail: null
                }
            ];

        } catch (error) {
            this.handleError('Failed to get project list', error);
            return [];
        }
    }

    /**
     * <summary>Delete a project</summary>
     * @param {string} projectId - Project ID to delete
     * @returns {Promise<boolean>} Success status
     */
    async deleteProject(projectId) {
        try {
            this.log(`Deleting project: ${projectId}`);

            // TODO: Call C# backend method to delete project
            // const response = await genericRequest('DeleteProject', {
            //     projectId: projectId
            // }, data => {
            //     return data.success;
            // });

            // Placeholder for demonstration
            await new Promise(resolve => setTimeout(resolve, 500));

            this.log(`Project deleted: ${projectId}`);
            return true;

        } catch (error) {
            this.handleError('Failed to delete project', error);
            return false;
        }
    }

    /**
     * <summary>Export project data to file</summary>
     * @param {Object} projectData - Project data to export
     * @param {string} format - Export format (json, cbp)
     */
    async exportProject(projectData, format = 'json') {
        try {
            this.log(`Exporting project as ${format.toUpperCase()}...`);

            const exportData = this.prepareProjectForExport(projectData, format);

            let filename = `${projectData.projectInfo.title || 'Comic Project'}.${format}`;
            filename = filename.replace(/[^a-z0-9.-]/gi, '_'); // Sanitize filename

            if (format === 'json') {
                const jsonContent = JSON.stringify(exportData, null, 2);

                if (typeof downloadPlainText === 'function') {
                    downloadPlainText(filename, jsonContent);
                } else {
                    // Fallback download
                    const blob = new Blob([jsonContent], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            }

            this.log(`Project exported as ${filename}`);

        } catch (error) {
            this.handleError('Failed to export project', error);
        }
    }

    /**
     * <summary>Import project from file</summary>
     * @param {File} file - File to import
     * @returns {Promise<Object>} Imported project data
     */
    async importProject(file) {
        try {
            this.log(`Importing project from ${file.name}...`);

            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        const processedData = this.processImportedProject(importedData);

                        this.log('Project imported successfully');
                        resolve(processedData);

                    } catch (error) {
                        reject(new Error(`Failed to parse project file: ${error.message}`));
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Failed to read project file'));
                };

                reader.readAsText(file);
            });

        } catch (error) {
            this.handleError('Failed to import project', error);
            throw error;
        }
    }

    /**
     * <summary>Create project backup</summary>
     * @param {Object} projectData - Project data to backup
     * @returns {Promise<string>} Backup ID
     */
    async createBackup(projectData) {
        try {
            this.log('Creating project backup...');

            // TODO: Call C# backend method to create backup
            // const response = await genericRequest('CreateProjectBackup', {
            //     projectData: this.prepareProjectForSave(projectData),
            //     projectId: projectData.projectInfo.id
            // }, data => {
            //     return data.backupId;
            // });

            // Placeholder for demonstration
            const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            this.log(`Backup created: ${backupId}`);
            return backupId;

        } catch (error) {
            this.handleError('Failed to create backup', error);
            throw error;
        }
    }

    /**
     * <summary>Validate project data structure</summary>
     * @param {Object} projectData - Project data to validate
     * @returns {Object} Validation result
     */
    validateProjectData(projectData) {
        const errors = [];

        try {
            // Check required top-level properties
            if (!projectData.projectInfo) {
                errors.push('Missing projectInfo');
            } else {
                if (!projectData.projectInfo.id) {
                    errors.push('Missing project ID');
                }
                if (!projectData.projectInfo.created) {
                    errors.push('Missing project creation date');
                }
            }

            // Validate data types
            if (projectData.characters && !Array.isArray(projectData.characters)) {
                errors.push('Characters data must be an array');
            }

            if (projectData.layout && projectData.layout.pages && !Array.isArray(projectData.layout.pages)) {
                errors.push('Pages data must be an array');
            }

            // Check data integrity
            if (projectData.layout && projectData.layout.pages) {
                projectData.layout.pages.forEach((page, index) => {
                    if (!page.id) {
                        errors.push(`Page ${index + 1} missing ID`);
                    }
                    if (page.panels && !Array.isArray(page.panels)) {
                        errors.push(`Page ${index + 1} panels must be an array`);
                    }
                });
            }

        } catch (error) {
            errors.push(`Validation error: ${error.message}`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * <summary>Prepare project data for saving</summary>
     * @param {Object} projectData - Raw project data
     * @returns {Object} Sanitized project data
     */
    prepareProjectForSave(projectData) {
        try {
            // Deep clone to avoid modifying original
            const saveData = JSON.parse(JSON.stringify(projectData));

            // Update timestamps
            saveData.projectInfo.lastModified = Date.now();
            saveData.projectInfo.version = this.projectSchema;

            // Remove any temporary or UI-only data
            this.cleanProjectData(saveData);

            // Validate before returning
            const validation = this.validateProjectData(saveData);
            if (!validation.isValid) {
                throw new Error(`Save preparation failed: ${validation.errors.join(', ')}`);
            }

            return saveData;

        } catch (error) {
            this.handleError('Failed to prepare project for save', error);
            throw error;
        }
    }

    /**
     * <summary>Process loaded project data</summary>
     * @param {Object} rawData - Raw loaded data
     * @returns {Object} Processed project data
     */
    processLoadedProject(rawData) {
        try {
            if (!rawData) {
                throw new Error('No project data received');
            }

            // Validate loaded data
            const validation = this.validateProjectData(rawData);
            if (!validation.isValid) {
                this.log('Validation warnings for loaded project:', validation.errors);
                // Continue anyway, but log warnings
            }

            // Update schema if needed
            const processedData = this.migrateProjectSchema(rawData);

            // Set loaded timestamp
            processedData.loadedAt = Date.now();

            this.log('Project processed successfully');
            return processedData;

        } catch (error) {
            this.handleError('Failed to process loaded project', error);
            throw error;
        }
    }

    /**
     * <summary>Process imported project data</summary>
     * @param {Object} importedData - Imported project data
     * @returns {Object} Processed project data
     */
    processImportedProject(importedData) {
        try {
            // Generate new project ID for imported project
            const processedData = this.processLoadedProject(importedData);

            processedData.projectInfo.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            processedData.projectInfo.created = Date.now();
            processedData.projectInfo.lastModified = Date.now();

            // Mark as imported
            processedData.projectInfo.imported = true;
            processedData.projectInfo.originalTitle = processedData.projectInfo.title;
            processedData.projectInfo.title = `${processedData.projectInfo.title} (Imported)`;

            return processedData;

        } catch (error) {
            this.handleError('Failed to process imported project', error);
            throw error;
        }
    }

    /**
     * <summary>Prepare project for export</summary>
     * @param {Object} projectData - Project data
     * @param {string} format - Export format
     * @returns {Object} Export-ready data
     */
    prepareProjectForExport(projectData, format) {
        const exportData = this.prepareProjectForSave(projectData);

        // Add export metadata
        exportData.exportInfo = {
            format: format,
            exportedAt: Date.now(),
            exportedBy: 'Comic Book Generator',
            schema: this.projectSchema
        };

        return exportData;
    }

    /**
     * <summary>Migrate project data to current schema</summary>
     * @param {Object} projectData - Project data to migrate
     * @returns {Object} Migrated project data
     */
    migrateProjectSchema(projectData) {
        const currentVersion = projectData.projectInfo?.version || '1.0';

        if (currentVersion === this.projectSchema) {
            return projectData; // No migration needed
        }

        this.log(`Migrating project from schema ${currentVersion} to ${this.projectSchema}`);

        // TODO: Implement schema migration logic as needed
        // For now, just update the version
        projectData.projectInfo.version = this.projectSchema;

        return projectData;
    }

    /**
     * <summary>Clean project data by removing temporary fields</summary>
     * @param {Object} projectData - Project data to clean
     */
    cleanProjectData(projectData) {
        // Remove any fields that shouldn't be saved
        const fieldsToRemove = ['loadedAt', 'isModified', 'tempData'];

        const removeFields = (obj) => {
            if (obj && typeof obj === 'object') {
                fieldsToRemove.forEach(field => {
                    delete obj[field];
                });

                Object.values(obj).forEach(value => {
                    if (Array.isArray(value)) {
                        value.forEach(removeFields);
                    } else if (typeof value === 'object') {
                        removeFields(value);
                    }
                });
            }
        };

        removeFields(projectData);
    }

    /**
     * <summary>Mark project as having unsaved changes</summary>
     */
    markAsChanged() {
        this.hasUnsavedChanges = true;

        // Update UI indicator if available
        const statusElement = document.getElementById('cbg-save-status');
        if (statusElement && statusElement.textContent === 'Ready') {
            statusElement.textContent = 'Modified';
        }

        this.log('Project marked as changed');
    }

    /**
     * <summary>Mark project as saved</summary>
     */
    markAsSaved() {
        this.hasUnsavedChanges = false;
        this.lastSaveTime = Date.now();

        this.log('Project marked as saved');
    }

    /**
     * <summary>Process save queue after current save completes</summary>
     */
    async processSaveQueue() {
        if (this.saveQueue.length === 0 || this.isSaving) {
            return;
        }

        const { projectData, isAutoSave, resolve, reject } = this.saveQueue.shift();

        try {
            await this.saveProject(projectData, isAutoSave);
            resolve();
        } catch (error) {
            reject(error);
        }
    }

    /**
     * <summary>Handle successful save operation</summary>
     * @param {Object} response - Save response data
     * @param {boolean} isAutoSave - Whether this was an auto-save
     */
    handleSaveSuccess(response, isAutoSave) {
        this.markAsSaved();

        const statusElement = document.getElementById('cbg-save-status');
        if (statusElement) {
            statusElement.textContent = isAutoSave ? 'Auto-saved' : 'Saved';

            if (!isAutoSave) {
                setTimeout(() => {
                    if (statusElement.textContent === 'Saved') {
                        statusElement.textContent = 'Ready';
                    }
                }, 2000);
            }
        }

        this.log(`Save completed successfully${isAutoSave ? ' (auto)' : ''}`);
    }

    /**
     * <summary>Handle save operation error</summary>
     * @param {Error} error - Save error
     * @param {boolean} isAutoSave - Whether this was an auto-save
     */
    handleSaveError(error, isAutoSave) {
        const statusElement = document.getElementById('cbg-save-status');
        if (statusElement && !isAutoSave) {
            statusElement.innerHTML = '<span style="color: var(--danger);">Save failed</span>';
            setTimeout(() => {
                statusElement.textContent = this.hasUnsavedChanges ? 'Modified' : 'Ready';
            }, 3000);
        }

        this.log(`Save failed${isAutoSave ? ' (auto)' : ''}: ${error.message}`);
    }

    /**
     * <summary>Simulate save operation for demonstration</summary>
     * @param {Object} saveData - Data to save
     * @param {boolean} isAutoSave - Whether this is an auto-save
     * @returns {Promise} Save promise
     */
    async simulateSave(saveData, isAutoSave) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, isAutoSave ? 500 : 1500));

        // Simulate occasional save failure for testing
        if (Math.random() < 0.05) { // 5% failure rate
            throw new Error('Simulated save failure');
        }

        return { success: true };
    }

    /**
     * <summary>Simulate load operation for demonstration</summary>
     * @param {string} projectId - Project ID to load
     * @returns {Promise<Object>} Loaded data
     */
    async simulateLoad(projectId) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (projectId) {
            // Return demo project data
            return this.createNewProject();
        }

        return null;
    }

    /**
     * <summary>Check if there are unsaved changes</summary>
     * @returns {boolean} True if there are unsaved changes
     */
    hasChanges() {
        return this.hasUnsavedChanges;
    }

    /**
     * <summary>Get last save time</summary>
     * @returns {number} Timestamp of last save
     */
    getLastSaveTime() {
        return this.lastSaveTime;
    }

    /**
     * <summary>Enable or disable auto-save</summary>
     * @param {boolean} enabled - Whether to enable auto-save
     */
    setAutoSave(enabled) {
        this.autoSaveEnabled = enabled;
        this.log(`Auto-save ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * <summary>Debug logging helper</summary>
     * @param {string} message - Log message
     * @param {*} data - Optional data to log
     */
    log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`[CBG:Data ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * <summary>Error handling helper</summary>
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    handleError(message, error) {
        console.error(`[CBG:Data ERROR] ${message}:`, error);

        if (typeof showError === 'function') {
            showError(`${message}: ${error.message}`);
        }
    }

    /**
     * <summary>Cleanup resources</summary>
     */
    destroy() {
        this.log('Destroying Data Manager...');

        this.saveQueue = [];
        this.isSaving = false;
        this.hasUnsavedChanges = false;
        this.isInitialized = false;

        this.log('Data Manager destroyed');
    }
}

/**
 * Comic Book Generator - Data Management Module (Refactored)
 */

// TODO: This needs to be refactored or replaced in favor of C# backend services.

class DataManager extends BaseManager {
    constructor(main) {
        super(main, 'Data');
        this.projectSchema = '1.0';
        this.autoSaveEnabled = true;
        this.lastSaveTime = null;
    }

    async initialize() {
        await super.initialize();

        // Setup auto-save
        setInterval(() => {
            if (this.autoSaveEnabled) {
                this.main.saveProject(true);
            }
        }, 30000); // Auto-save every 30 seconds
    }

    createNewProject() {
        return {
            projectInfo: {
                title: 'New Comic Project',
                author: '',
                description: '',
                version: this.projectSchema,
                created: Date.now(),
                lastModified: Date.now(),
                id: `project_${Date.now()}`
            },
            data: {},
            characters: [],
            story: {},
            layout: {},
            assets: {},
            publication: {}
        };
    }

    async saveProject(projectData, isAutoSave = false) {
        try {
            // TODO (C# backend): Implement 'SaveComicProject' endpoint and wire DataHelper.save to call genericRequest.
            // Example direct usage if bypassing DataHelper:
            // const response = await genericRequest('SaveComicProject', {
            //     projectData,
            //     isAutoSave,
            //     projectId: projectData.projectInfo.id
            // });

            await DataHelper.save('SaveComicProject', {
                projectData,
                isAutoSave,
                projectId: projectData.projectInfo.id
            });

            this.lastSaveTime = Date.now();
            this.log(`Project saved ${isAutoSave ? '(auto)' : ''}`);

            return { success: true };

        } catch (error) {
            this.handleError('Save failed', error);
            throw error;
        }
    }

    async loadProject(projectId = null) {
        try {
            // TODO (C# backend): Implement 'LoadComicProject' endpoint and wire DataHelper.load to call genericRequest.
            // Example direct usage if bypassing DataHelper:
            // const data = await genericRequest('LoadComicProject', { projectId });

            const data = await DataHelper.load('LoadComicProject', { projectId });

            if (data) {
                this.log('Project loaded');
                return this.validateProject(data);
            }

            return null;

        } catch (error) {
            this.handleError('Load failed', error);
            return null;
        }
    }

    validateProject(projectData) {
        // Basic validation
        if (!projectData.projectInfo) {
            projectData.projectInfo = {};
        }

        projectData.projectInfo.lastModified = Date.now();
        projectData.projectInfo.version = this.projectSchema;

        return projectData;
    }

    async exportProject(projectData, format = 'json') {
        // TODO (C# backend): Implement 'ExportComicProject' endpoint and wire DataHelper.save/load to genericRequest.
        // Example direct usage if bypassing DataHelper:
        // const response = await genericRequest('ExportComicProject', { projectId: projectData.projectInfo.id, format });
        // if (response?.downloadUrl) window.open(response.downloadUrl, '_blank');

        // Fallback: local JSON download for dev
        const filename = `${projectData.projectInfo.title || 'Comic'}.${format}`;
        const content = JSON.stringify(projectData, null, 2);
        if (typeof downloadPlainText === 'function') {
            downloadPlainText(filename, content);
        }
        this.log(`Exported as ${filename}`);
    }

    async importProject(file) {
        // Prefer delegating validation and normalization to backend
        try {
            // Read file to text then send to C#
            const text = await new Promise((resolve, reject) => {
                try {
                    readFileText(file, (t) => resolve(t));
                } catch (e) {
                    reject(e);
                }
            });

            // TODO (C# backend): Implement 'ImportComicProject' endpoint and wire DataHelper.save/load to genericRequest.
            // Example direct usage if bypassing DataHelper:
            // const result = await genericRequest('ImportComicProject', { fileName: file.name, content: text });
            // return this.validateProject(result.projectData);

            // Fallback: local parse
            const data = JSON.parse(text);
            return this.validateProject(data);

        } catch (error) {
            this.handleError('Import failed', error);
            throw error;
        }
    }
}

using Newtonsoft.Json.Linq;
using SwarmUI.Accounts;
using SwarmUI.WebAPI;

namespace Hartsy.Extensions.ComicBookGenerator.WebAPI;

[API.APIClass("API routes related to ComicBookGenerator extension")]
public static class ComicBookGeneratorAPI
{
    public static class ComicBookPermissions
    {
        public static readonly PermInfoGroup ComicBookPermGroup = new("ComicBookGen", "Permissions for Comic Book Generator.");
        public static readonly PermInfo PermComicProject = Permissions.Register(new("comicbook_project", "Comic Project Access", "Allows saving and loading comic projects.", PermissionDefault.USER, ComicBookPermGroup));
        public static readonly PermInfo PermLayout = Permissions.Register(new("comicbook_layout", "Comic Layout Access", "Allows updating comic layout state.", PermissionDefault.USER, ComicBookPermGroup));
    }

    /// <summary>
    /// TODO: Register API routes used by the Comic Book Generator front-end
    /// </summary>
    public static void Register()
    {
        // Register minimal stub routes so the extension can load without 404s.
        SwarmUI.Utils.Logs.Info("[ComicBookGeneratorAPI] Registering API routes: GetLastProject, SaveComicProject, UpdateLayout");
        API.RegisterAPICall(GetLastProject, false, ComicBookPermissions.PermComicProject);
        API.RegisterAPICall(SaveComicProject, false, ComicBookPermissions.PermComicProject);
        API.RegisterAPICall(UpdateLayout, false, ComicBookPermissions.PermLayout);
        SwarmUI.Utils.Logs.Info("[ComicBookGeneratorAPI] API route registration completed");
    }

    /// <summary>Stub: Load the most recent comic project for the current user.</summary>
    [API.APIDescription("Returns the most recent comic project for the user (stub).", "{ success: bool, data: object }")]
    public static Task<JObject> GetLastProject()
    {
        // Stubbed empty project shell for UI to bind against
        var project = new JObject
        {
            ["projectInfo"] = new JObject
            {
                ["title"] = "Untitled Comic",
                ["author"] = "",
                ["description"] = "",
                ["version"] = "1.0",
                ["created"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                ["lastModified"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                ["id"] = $"project_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}"
            },
            ["data"] = new JObject(),
            ["characters"] = new JArray(),
            ["story"] = new JObject(),
            ["layout"] = new JObject(),
            ["assets"] = new JObject(),
            ["publication"] = new JObject()
        };

        return Task.FromResult(new JObject
        {
            ["success"] = true,
            ["data"] = project
        });
    }

    /// <summary>Stub: Save the comic project payload.</summary>
    [API.APIDescription("Saves the comic project payload (stub - no persistence).", "{ success: bool }")]
    public static Task<JObject> SaveComicProject(
        [API.APIParameter("Project data object as sent from frontend")] JObject projectData,
        [API.APIParameter("Whether this was an auto-save operation (optional). ")] bool isAutoSave = false)
    {
        // Stub: accept and claim success without persistence for now
        var res = new JObject
        {
            ["success"] = true,
            ["auto"] = isAutoSave
        };
        return Task.FromResult(res);
    }

    /// <summary>Stub: Update layout state (e.g., pages/panels) for the project.</summary>
    [API.APIDescription("Updates layout state for the comic (stub - no persistence).", "{ success: bool }")]
    public static Task<JObject> UpdateLayout(
        [API.APIParameter("Layout payload as sent from frontend")] JObject layout)
    {
        // Stub: accept and claim success without persistence for now
        var res = new JObject
        {
            ["success"] = true
        };
        return Task.FromResult(res);
    }
}

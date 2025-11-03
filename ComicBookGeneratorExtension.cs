using Hartsy.Extensions.ComicBookGenerator.WebAPI;
using SwarmUI.Core;
using SwarmUI.Utils;

namespace Hartsy.Extensions.ComicBookGenerator;

public class ComicBookGeneratorExtension : Extension
{
    public override void OnFirstInit()
    {
        // Register JS/CSS assets
        ScriptFiles.Add("Assets/comicbook-main.js");
        ScriptFiles.Add("Assets/comicbook-data.js");
        ScriptFiles.Add("Assets/comicbook-characters.js");
        ScriptFiles.Add("Assets/comicbook-story.js");
        ScriptFiles.Add("Assets/comicbook-layout.js");
        ScriptFiles.Add("Assets/comicbook-publication.js");
        StyleSheetFiles.Add("Assets/comicbook.css");
        Logs.Info("[ComicBookGeneratorExtension] OnFirstInit: assets registered (scripts + styles)");
    }

    public override void OnInit()
    {
        // Register WebAPI routes/endpoints used by the extension
        Logs.Info("[ComicBookGeneratorExtension] OnInit: registering API routes...");
        ComicBookGeneratorAPI.Register();
        Logs.Info("[ComicBookGeneratorExtension] OnInit: API routes registered.");
    }
}

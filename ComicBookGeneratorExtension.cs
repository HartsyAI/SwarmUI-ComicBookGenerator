using Hartsy.Extensions.ComicBookGenerator.WebAPI;
using SwarmUI.Core;
using SwarmUI.Utils;

namespace Hartsy.Extensions.ComicBookGenerator;

public class ComicBookGeneratorExtension : Extension
{
    public override void OnPreInit()
    {
        ScriptFiles.Add("Assets/comicbook-main.js");
        ScriptFiles.Add("Assets/comicbook-data.js");
        ScriptFiles.Add("Assets/comicbook-characters.js");
        ScriptFiles.Add("Assets/comicbook-story.js");
        ScriptFiles.Add("Assets/comicbook-layout.js");
        ScriptFiles.Add("Assets/comicbook-publication.js");
        StyleSheetFiles.Add("Assets/comicbook.css");
        Logs.Info("ComicBookGeneratorExtension loaded - scripts registered in correct dependency order");
    }

    public override void OnInit()
    {
        // TODO: Register WebAPI routes/endpoints used by the extension
        ComicBookGeneratorAPI.Register();
    }
}

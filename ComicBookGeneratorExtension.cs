using Hartsy.Extensions.ComicBookGenerator.WebAPI;
using SwarmUI.Core;
using SwarmUI.Utils;

namespace Hartsy.Extensions.ComicBookGenerator;

public class ComicBookGeneratorExtension : Extension
{
    public override void OnPreInit()
    {
        // TODO: Initialize assets (JS/CSS) for the Comic Book Generator UI
        // Example (uncomment when files are ready):
        ScriptFiles.Add("Assets/comicbook.js");
        StyleSheetFiles.Add("Assets/comicbook.css");

        Logs.Info("ComicBookGeneratorExtension loaded (skeleton)");
    }

    public override void OnInit()
    {
        // TODO: Register WebAPI routes/endpoints used by the extension
        ComicBookGeneratorAPI.Register();
    }
}

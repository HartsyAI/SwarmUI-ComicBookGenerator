using Hartsy.Extensions.ComicBookGenerator.WebAPI;
using SwarmUI.Core;
using SwarmUI.Utils;

namespace Hartsy.Extensions.ComicBookGenerator;

public class ComicBookGeneratorExtension : Extension
{
    public override void OnPreInit()
    {
        ScriptFiles.Add("Assets/comicbook-main.js");
        StyleSheetFiles.Add("Assets/comicbook.css");

        Logs.Info("ComicBookGeneratorExtension loaded (skeleton)");
    }

    public override void OnInit()
    {
        // TODO: Register WebAPI routes/endpoints used by the extension
        ComicBookGeneratorAPI.Register();
    }
}

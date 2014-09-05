# Software overview of the poster viewer

## Architecture

The poster viewer is just HTML and Javascript (and CSS, and XML definitions of scenes, and tile iamges, etc.) -- there is no software running on the server, just static files delivered by a web server. 

There is an [.htaccess file](../.htaccess) that includes some commands to the web server to control caching headers (for the web browser), and maybe in the future some redirections. This file is in the git repo and should be edited in [git](./github.md)

There is basically one [HTML file base](../viewer.html), which links to our one [local javascript file](../js/viewer.js) and our one [CSS file](../css/viewer.css). The HTML also links to our third-party javascript dependencies (not currently using any tools to aggregate all our JS dependencies into one JS file, as is often considered best practices these days; not sure if it's worth it in this case)

The HTML file also links to font(s) from Google Fonts, that we are using. 

## Javascript Dependencies

### OpenSeadragon

The real hard work of the poster viewer is done by the [OpenSeadragon](https://github.com/openseadragon/openseadragon) JS file. 

We include a [copy of OpenSeadragon locally](../openseadragon-bin-1.1.1) in the git repo and on the web server. At time of writing, that was OpenSeadragon 1.1.1. To upgrade to a newer version of OpenSeadragon, you'd just add the new version to the git repo, and change the link in the viewer.html file to point to the new version -- we intentionally use version numbers in the directory we put OpenSeadragon in, so we can tell browsers to cache it forever, but if we upgrade OpenSeadragon the new version will be at a new URL. 

### Annotorious

[Annotorious](http://annotorious.github.io/) is another Javascript library, that is compatible with OpenSeadragon, for adding annotations to images. 

Currently, we only use Annotorious in our admin interface for defining region boundaries that will be cut and pasted into the narrative XML file. We may use it in the future to support additional features for end users. 

Our viewer.html file links out to annotorious hosted externally. For some reason, when I tried copying annotorious into our local repo/directory, I had trouble getting it to work. Since at the moment it's just an admin interface, i didn't spend any more time on it, and just left it this way. 

### easyModal

We use [easyModal.js](http://flaviusmatis.github.io/easyModal.js/) for displaying the 'link' popup window. We have a [local copy of easyModal.js](../js/jquery.easyModal.min.js) in the repo/web server directory, that viewer.html links to. We ran the easyModal.js through a JS minimizer ourselves to reduce file size. 

## i18n language localization

Most of the language-specific text (English, Spanish, etc) for a given poster is in the narratie XML files. But there are a few parts of the general UI that need textual words. 

We use a fairly simple homegrown system for localizing these depending on the `&lang=` URL parameter. At the top of the viewer.js file, you'll find some JS hash's that include the proper language-specific text for UI elements, and some simple code to put them on the page in the right places. 

Not all of the UI has been properly localized using this system yet, and this area is really still not entirely finished, just a start. 
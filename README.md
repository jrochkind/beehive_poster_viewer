## Beehive Design Collective Online Poster Viewer

In Github at http://github.com/jrochkind/beehive_poster_viewer

Originally by Jonathan Rochkind, beehive people please feel free to contact Jonathan at any time with issues, questions, problems. jonathan@dnil.net

This code is installed on the beehive web server under beehivecollective.org/posterViewer, accessible on the web at [TBD]

The application is simply HTML and Javascript -- just files on the server, there is no special software running on the server.

The hard parts of large image display and UI are done by the open source [OpenSeadragon](https://github.com/openseadragon/openseadragon) project.

For techies, see other notes on [software](./docs/software.md)

## How the posterViewer URL works

The particular poster to be viewed is given in a query parameter in the URL, `poster=`:

    /posterViewer?poster=mr

That will try to load the tile images designated as 'mr', and by default, that will try to load an english language narrative file for 'mr'.  If other language narrative files are available, you can add an additional language parameter with the code for the language (matching the filename for the narrative file):

    /posterViewer?poster=mr&lang=es

## Features of the posterViewer you may miss

Notice the small honeycomb-shaped icons in the upper left corner. 

* If you click on the one that looks like a dotted square with a line through it, you can go into FULL SCREEN mode, where your entire monitor will be taken up with poster -- this is highly recommended for the beehive posters, they really look awesome this way. 

* If you click on the the one that looks like a chain link, you can get a URL that will point to whatever portion of the poster you are looking at _at that moment_ (zoom level and boundaries), so you can send to someone else or bookmark or put in a web page to refer to that particular portion of poster. (I plan to try to make this work better in the future, so you can always just copy and paste the URL from the browser location bar; but not yet)

* If you just want to explore the poster without the narrative, click the up arrow in the top right corner of the narrative box, and it will disappear to give you a full screen of poster. A honeycomb button representing lines of text will appear, which you can click on to restore the narrative box.

## Editing and adding new posters

A poster is defined simply by a set of image tiles in the `tiles` directory, and an XML file that defines the scenes for the narrative tour (as well as the title of the poster and other maybe such metadata) in the `narrative` directory.

To add a new poster, you need to pick a unique short name that will be used in URLs and filenames to refer to that poster. The unique short name should not have any spaces: for instance, `mr`.

Then you will simply add tiles and narrative file in the right places in the posterViewer directory using that name you picked. To change the narrative (scenes, order, text, boundaries on the poster of a scene, etc.,), you simply edit the narrative XML file.

Please note that narratives and HTML/CSS/JS code are controlled by a git repository on github.com, please try to make changes through git if possible. See my [instructions on git and github](docs/github.md)

* [Making tiles](./docs/tiles.md)
* [Creating and Editing Narrative](./docs/narrative.md)

You should also add facebook summary information:
* [Adding facebook OpenGraph tags](./docs/facebook_og.md)
# The Narrative Files

The text and scene boundaries for the 'narrative tour' portion of a poster are stored in XML files. The title of the poster is also in this file, maybe along other information in the future.

These files **are** controlled by the git repository, please see [instructions for editing git and github](github.md) for best way to edit or add these files. 

The files are stored in the `narrative` directory, inside a subdirectory with the short name you've given to the poster, and then in a file named by language. For instance:

    ./narrative/mr/en.xml

Would be the data file for the poster referred to as `mr` in the posterViewer URL, for English (`en`).

This is an XML file -- XML looks kind of like HTML, but technically it's different. It can be created or edited in a standard text editor, or in some kind of editor made for XML specially, or in [github's web interface](github.md)

To create a new one for a new poster (or new language), it might be easiest to start with one of the existing ones and then copy it. 

## header info in XML file

The top of the XML file begins with an opening "<data>" tag, and a <title> and <link> tag which give the name of the poster as it should be displayed in the posterViewer, as well as a URL that clicking on the name will take you to (usually the page for this poster on the website)

~~~xml
<data>
  <title>
      Mesoamérica Resiste (Front) from the Beehive Design Collective
  </title>
  <link>
    http://beehivecollective.org/beehive_poster/mesoamerica-resiste/
  </link>
~~~

## Scene/story list

Next, comes a bunch of `<story>` tags, all wrapped in a single '<stories>' tag.

Each story tag defines a scene: a title for that scene (listed in the scene list), the text for that scene, and the boundaries on the poster that should be focused on for that scene.

~~~xml
<story>
      <label>The Colonizers' view</label>
      <region
        x="0"
        y="0"
        width="1.0"
        height="1.0"
      />
      <html>
        This poster folds to create a square with shutters that open to a larger image inside. With the shutters closed, the outside of the poster resembles an old Spanish conquistador’s map
        of Mesoamerica. The map is a top-down look at the region and
        draws parallels between colonial history and modern-day capitalism. Outsiders who have no connection with the land have drawn this map, with motives of extraction and profit.
      </html>
    </story>
~~~

### Finding the region boundaries

The tricky part is finding the right x/y/height/width for the part of the poster you want to focus on.  There is a feature built into the posterViewer to help you do this. 

Add `&admin=true` to the end of a posterViewer URL for a certain poster. Now you will get a "DEFINE REGION" button in the upper right corner of the poster. 

Zoom and move to somewhere generally containing the area and zoom level of the poster you want to define as a scene region. You may want to hide the narrative box to have a bigger work area.  

Then click the "DEFINE REGION" button, and click and drag to define a rectangular region. You don't need to worry about the exact zoom level you are at, beyond having a zoom level that lets you see and define the region you want -- when displayed, the viewer will zoom to wherever it needs to show all of the exact box you define. 

When you let up the mouse button, you'll get a little box saying "add a comment" with a 'save' button. It actually doesn't matter what you enter as a comment, it will be ignored, but do press the 'save' button -- now move your mouse back inside the region you defined, and you'll see a box pop up with a `<region>` tag in it, that you can copy and paste into the narrative XML definition file, to link to that rectangular region you defined. 

This 'admin' interface is a bit klunky, but it should work to let you define the regions you want. If at first you didn't get quite the right one, just go try again and copy the new `<region>` into the appropriate scene in the narrative xml file again. 

### The narrative text  is HTML

The text between the `<html>` tags is the text of the particular scene in the narrative. 

If it's just one paragraph, you can just stick the text in here without worrying too much about HTML tags. But you can use multiple `<p>` tags if you need multiple paragraphs; you can also use other html tags, such as an `<a>` tag to make a link, or an `<h4>` tag for a sub-heading.

Since it is HTML, you need to be careful to keep the text legal/valid HTML though (and legal/valid HTML too).  

Any < or > or & characters you want to put in the text can't be put in directly, they need to be entered as HTML-escaped character entities:

* for < enter `&lt;`
* for > enter `&gt;`
* for & enter `&amp;`

Additionally any HTML tags you use need closing tags, becuase it's in XML, even though you may not be used to those being required. For instance, if you enter a `<p>`, you need to close it with a `</p>` at the end of the paragraph. 

## Make sure the whole file is valid XML!

If you save the file to disk somewhere on your computer (use a filename ending .xml), you can try opening it up with the Chrome web browser (file/open, navigate to the file on your local computer) -- if you don't see any error messages, great! If you do see an error message from Chrome, it means there are errors in the XML tags, and the posterViewer isn't going to be able to read the file. 

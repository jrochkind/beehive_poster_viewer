If someone shares a link on facebook, we want the link to show up
with a nice thumbnail, title, and description.

Facebook uses special "OpenGraph" tags in the `<head>` of an
HTML document at a given URL, in order to construct it's
summary. See https://developers.facebook.com/docs/sharing/best-practices

One thing that makes this more complicated with the posterViewer, is
that we have _one_ HTML page, viewer.html, that can load many posters.
The poster-specific loading is done in Javascript; we want the facebook
summary info to be specific to the poster; but Facebook won't use
Javascript-loaded info for the summary.

To solve this, we supply just a tiny bit of dynamic content
to viewer.html, using [Apache SSI](http://httpd.apache.org/docs/current/howto/ssi.html)

We have a separate file of facebook opengraph tags for each
poster/language combo, and using Apache SSI we load in the
appropriate one when delivering viewer.html.

## Where to put the file

For a poster called 'mr' in language 'en', add a file at:

    ./opengraph_partials/mr.en.html

This file should just include the opengraph HTML tags for that
poster/language combo.

When including a URL to an image, it does
need to be an *absolute* URL, beginning with "https://" and hostname.
We store our thumbnail images in `./opengraph_partial/img`, but really
it could be anywhere. Facebook says images should ideally be 1200 x 630 pixels, but can be smaller but the same aspect ratio -- down to  600 x 315 minimum.

These files should be [committed to the git repo](./github.md).

## What if the server doesn't support SSI? What else could break?

We had to ask mayfirst to turn on SSI. They did. If SSI gets turned
off in the future, the facebook opengraph inclusions won't work anymore,
but everything else about the posterViewer will work just fine.

If SSI isn't on, you'll see some SSI commands in comments in the delivered
HTML page for a poster, instead of the facebook og tags the commands were
meant to instruct apache to include.

If SSI is turned on, but you haven't created a file at the right
location, you'll see an error reported like this if you view HTML
source:

    <meta name='beehive_og_no_file_found' content='No file found for inclusion at `opengraph_partials/postername.lang.html` />

Again, the posterViewer will work fine, just without the facebook opengraph
tags for nice facebook summaries.

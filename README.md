# `katflix`

`katflix` is a command-line application to search videos from kickasstorrents and watch them instantly thanks to [peerflix](https://github.com/mafintosh/peerflix).

It is similar to [torrentflix](https://github.com/ItzBlitz98/torrentflix).
Main differences are:

* only search torrents from kickasstorrents
* allows to search subtitles in multiples languages at once
* explicitly search for subtitles instead of trying to get the correct one automatically
* choose where to search subtitles: opensubtitles or addic7ed
* omxplayer keyboard shortcuts work with katflix (thanks to forked version of peerflix)


## Installation

`katflix` is a node cli app. After [installing node and npm](https://nodejs.org/), install katflix globally on your system:

```
sudo npm install -g katflix
```

## Usage

Start using katflix with the `katflix` command!

All the help you need is visible with `katflix --help`:

```
Search videos from kickasstorrents, watch them directly thanks to peerflix.

Usage: katflix [QUERY] [OPTIONS] [-- PEERFLIX OPTIONS]

QUERY is your search terms to find the torrents you want.
If no query is given, katflix will ask when starting.

Options:
  -h, --help: show this message
  -v, --version: show katflix's version
  -l, --language: set desired subtitles language to search (defaults to 'eng')
                  you can pass this option multiple times
  -s, --series: activate series mode
                subtitles will be searched on addic7ed instead of opensubtitles

You can pass options to the peerflix binary internally used after --.
Check out the peerflix github page for more details on possible options.

Examples:
  `katflix -- --vlc` # autoplay the video in vlc
  `katflix Drive` # directly list 'Drive' results
  `katflix --language spa` # search spanish subtitles only
  `katflix -l fre -l eng` # search english and french subtitles only
  `katflix "Daredevil S01E01" --series --language fre` # search for Daredevil
    first episode with french subtitles from addic7ed
  `katflix -- --omx -- -o local` # autoplay in omx with local audio

```

### Protips

As katflix allows you to pass all the options you want to peerflix without enforcing any defaults, it can be cumbersome to type the command. [Don't forget about aliases](http://raspberrypi.stackexchange.com/a/4285)!

For example, on my raspberry pi, I have a `play` alias:

```
alias play="katflix --language fre --language eng -- -q --omx"
```

I can then type `play Drive` in order to search for *Drive* torrents, french and english subtitles, and play them directly in omxplayer.

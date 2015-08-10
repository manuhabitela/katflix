# `katflix`

`katflix` is command-line application to search videos from kickasstorrents and watch them instantly thanks to thanks to [peerflix](https://github.com/mafintosh/peerflix).

It is extremelly similar to [torrentflix](https://github.com/ItzBlitz98/torrentflix).
Main differences are:

* only search torrents from kickasstorrents (this means one less step in the user interface, yay)
* try to fetch subtitles with [subliminal](https://github.com/Diaoul/subliminal)
* I just worked on this a few hours so it's certainly a good pile a crap compared to torrentflix

## Installation

`katflix` is a node cli app. After [installing node and npm](https://nodejs.org/), install katflix globally on your system:

```
sudo npm install -g katflix
```

### Want subtitles?

If you want katflix to automatically download matching subtitles, you need to install  [subliminal](https://github.com/Diaoul/subliminal). This is done via pip:

```
sudo pip install subliminal
```

## Usage

Start using katflix with the `katflix` command!

All the help you need is visible with `katflix --help`:

```
Search videos from kickasstorrents, watch them directly thanks to peerflix,
with subtitles downloaded through subliminal.

Usage: katflix [OPTIONS] [QUERY]

QUERY is your search terms to find the torrents you want.
If you don't put it here, katflix will ask you about it when starting.

Options:
  --peerflix: options to pass to the peerflix executable
  --subliminal: options to pass to the subliminal executable

Examples:
  `katflix --peerflix="--vlc" --subliminal="--language fr"`
  `katflix --peerflix="--omx" Drive`

The subliminal/language option is required if you want subtitles.
```

### Examples

```bash
# katflix will play the video in vlc and will try to download french subtitles for the selected video
katflix --peerflix="--vlc" --subliminal="--language fr"

# katflix will directly list the torrents matching 'Drive' and autoplay in omx (a raspberry pi player)
katflix --peerflix="--omx" Drive
```

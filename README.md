# `katflix`

`katflix` is a command-line application to search videos from kickasstorrents and watch them instantly thanks to [peerflix](https://github.com/mafintosh/peerflix).

It is extremelly similar to [torrentflix](https://github.com/ItzBlitz98/torrentflix).
Main differences are:

* only search torrents from kickasstorrents (this means fewer steps in the user interface, yay)
* since it uses a forked version of peerflix, omxplayer keyboard shortcuts work with katflix

But well I just worked on this a few hours so it's certainly still a little pile a crap compared to torrentflix.

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

Usage: katflix [OPTIONS] [QUERY]

QUERY is your search terms to find the torrents you want.
If you don't put it here, katflix will ask you about it when starting.

Options:
  --help: this message
  --version: katflix's version
  --peerflix: options to pass to the peerflix executable

Examples:
  `katflix --peerflix="--vlc"`
  `katflix --peerflix="--omx" Drive`

The subliminal/language option is required if you want subtitles.
```

### Examples

```bash
# katflix will play the video in vlc
katflix --peerflix="--vlc"

# katflix will directly list the torrents matching 'Drive' and autoplay in omx (a raspberry pi player)
katflix --peerflix="--omx" Drive
```


### Protips

As katflix allows you to pass all the options you want to peerflix without enforcing any defaults, it can be cumbersome to type the command. [Don't forget about aliases](http://raspberrypi.stackexchange.com/a/4285)!

For example, on my raspberry pi, I have a `play` alias:

```
alias play="katflix --peerflix=\"-q --omx\"
```

I can then type `play Drive` in order to search for *Drive* torrents and play them directly in omxplayer.

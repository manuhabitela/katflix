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
See all the help you need with `katflix --help`.

There are mostly two options: `--subliminal` and `--peerflix`. Both of these are used to pass options to subliminal and peerflix.

### Examples

```bash
# katflix will play the video in vlc and will try to download french subtitles for the selected video
katflix --peerflix="--vlc" --subliminal="--language fr"

# katflix will directly list the torrents matching 'Drive' and autoplay in omx (a raspberry pi player)
katflix --peerflix="--omx" Drive
```

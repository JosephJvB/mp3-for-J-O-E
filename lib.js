/*
RESOURCES:
===== 
DEPS
. ytdl-core - YT dl util. Seems to do everything I want no?
. fluent-ffmpeg - some video library
. progress-stream - progress tracker (for prog bar)
. some kinda queue system (async)
. https://www.npmjs.com/package/node-lame - for audio encoding??
REPOS
. https://github.com/ytb2mp3/youtube-mp3-downloader
. https://github.com/leerob/youtube-to-mp3
*/

// only using ytdl && node-fs
const YTDL  = require('ytdl-core')
const fs = require('fs')

// top-shelf audio only please
const opts = {
	quality: 'highestaudio',
	format: 'audioonly'
}

module.exports = (url, cmdName) => {
	// check for legitmate url
	const isValidURL = YTDL.validateURL(url)
	if(!isValidURL) return console.log('I DONT LIKE THE LOOK OF THAT YOUTUBE-URL ONE BIT')

	// INIT STREAM
	const stream = YTDL(url, opts)

	// STREAM EVENTS
	// - response(http): confirm request success
	stream.on('response', ({statusCode, statusMessage}) => {
		if(statusCode !== 200) {
			console.log('Whoops, something happened what aint good', statusCode, statusMessage)
		}
	})
	// - progress(chunks): show % download
	stream.on('progress', (chunk, current, tot) => {
		const progPercent = ((current / tot) * 100).toFixed(2)
		console.log(progPercent + '%')
	})
	// info(vid info): get vid-title and pipe stream to fs.writeStream with title
	stream.on('info', (info, format) => {
		// interesting pieces = format. [quality], info. [title, thumbnail_url]
		console.log('Found video:', info.title, '@', format.quality, 'quality')
		// is it bad practice to pipe the stream inside a stream event?
		// I need access to vid info. I could do that in a seperate request above..
		const fileName = (cmdName || info.title || `vid-id=${info.video_id}`)
		console.log('saving file:', fileName + '.mp3')
		stream.pipe(fs.createWriteStream(`./saved-mp3/${fileName}.mp3`))
	})
}
/* ALTERNATIVE:
================
	but then is it bad to do this 'save to temp > rename file with info' pattern?

	stream.on('info', (info, format) => {
		if(fs.existsSync('./temp.mp3')) {
			fs.rename('./temp.mp3', `DL/${info.title}.mp3`, (err) => {
				if(err) return console.log('error renaming file', err)
			})
		}
	})
	
	stream.pipe(fs.createWriteStream('./temp.mp3'))

*/

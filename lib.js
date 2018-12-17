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

// currently using just ytdl && node-fs
// i think I might need ffmpeg things for larger files? Need to test
const YTDL  = require('ytdl-core')
const fs = require('fs')

// top-shelf audio only please
const opts = {
	quality: 'highestaudio',
	format: 'audioonly'
}

module.exports = async (url, cmdName) => {
	// check for legitmate url
	const isValidURL = YTDL.validateURL(url) // is sync btw
	if(!isValidURL) return console.log('I DONT LIKE THE LOOK OF THAT YOUTUBE-URL ONE BIT')

	// get fileName: use name from args, if not given, get vidTitle|OR|vidID as fileName
	// only call getName if no name from args
	const getNameFromInfo = () => YTDL.getBasicInfo(url).then(info => (info.title || info.video_id))
	const fileName = cmdName ? cmdName : await getNameFromInfo()
	
	// INIT STREAM
	// this is where the magic happens ✨
	const stream = YTDL(url, opts)
	stream.pipe(fs.createWriteStream(`./saved-mp3/${fileName}.mp3`)).on('finish', () => {})
	// end magic ✨

	// STREAM EVENTS: only used for logging at the mo
	// - (http): confirm request success
	stream.on('response', (httpResponse) => {
		const {statusCode, statusMessage} = httpResponse
		if(statusCode !== 200) {
			console.log('Whoops, something happened what aint good', statusCode, statusMessage)
		}
	})
	// - (chunks): show % download
	stream.on('progress', (nextChunk, currentLen, totalLen) => {
		const progPercent = ((currentLen / totalLen) * 100).toFixed(2)
		console.log(progPercent + '%')
	})
	// - (vid info): log found video info
	stream.on('info', (info, format) => {
		// interesting pieces = format. [quality], info. [title, thumbnail_url]
		console.log('Found video:', info.title, '@', format.quality, 'quality')
	})
}
/* ALTERNATIVE:
================
	HERES ONE
	but then is it bad to do this 'save to temp > rename file with info' pattern?

	stream.on('info', (info, format) => {
		if(fs.existsSync('./temp.mp3')) {
			fs.rename('./temp.mp3', `DL/${info.title}.mp3`, (err) => {
				if(err) return console.log('error renaming file', err)
			})
		}
	})
	
	stream.pipe(fs.createWriteStream('./temp.mp3'))

	HERES ANOTHER
	stream.on('info', (info, format) => {
		const fileName = (cmdName || info.title)
		stream.pipe(fs.writeFileStream(`${fileName}.mp3`)).on('finish' => {})
	})

	...and then there's my current one. I dunno which is the best. Im just a noobie
*/

const parser = require('minimist')
const downloader = require('./lib')
// const wallDog = 'https://www.youtube.com/watch?v=mZpa3nOLOa8'

const args = parser(process.argv.slice(2))
const {
	url,
	u,
	file,
	f,
} = args

const vidURL = (url || u)
const fileName = (file || f)

if(!vidURL) return console.log('No url, no dice')
if(typeof vidURL !== 'string') return console.log('Url must be a string')
if(fileName && typeof fileName !== 'string') return console.log('Filename must be a string')

downloader(vidURL, fileName)
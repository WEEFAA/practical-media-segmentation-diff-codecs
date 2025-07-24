import express from 'express'
import fs, { createReadStream } from 'fs'
import path, { resolve } from 'path'
import { pipeline } from 'stream/promises'
import { promisify } from 'util'
import mimes from 'mime-types'
import morgan from 'morgan'
const port = 3000
const app = express()
const tiny = morgan('tiny')

const manual_streamed_files = path.join(import.meta.dirname, '/public/stream')

const stat = promisify(fs.stat)
app.get(/^\/stream\/(.*)/, tiny, async (req, res, next) => {
  const input = req.path.replace('/stream', '')
  // retrieve file info
  const targetFile = resolve(manual_streamed_files, path.join('./', input))
  const info = await stat(targetFile)
  // create read stream
  const range = req.headers.range
  const total = info.size
  const mime = mimes.lookup(targetFile) || 'application/octet-stream'
  if (!range) {
    // Full file fallback
    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': mime,
      'Accept-Ranges': 'bytes',
    })

    await pipeline(createReadStream(targetFile), res)
    return
  }

  // Parse range: e.g., "bytes=0-499"
  const match = range.match(/bytes=(\d*)-(\d*)/)
  const start = parseInt(match[1], 10) || 0
  const end = match[2] ? parseInt(match[2], 10) : total - 1

  if (start >= total || end >= total) {
    res
      .status(416)
      .set({
        'Content-Range': `bytes */${total}`,
      })
      .end()
    return
  }

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${total}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': mime,
  })

  await pipeline(createReadStream(filePath, { start, end }), res)
})
app.use(express.static('public', { acceptRanges: true }))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', {
    readme: fs.readFileSync(resolve('README.md'), { encoding: 'utf8' }),
  })
})

app.get('/mode/:mode', (req, res) => {
  res.render(req.params.mode, {})
})

app.use((req, res, next) => {
  res.status(404).end('Not found.')
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).end('Something went wrong.')
})

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})

const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
const { resolve } = require('path')

app.use(express.static('public'))
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
  console.log(`Example app listening on port ${port}`)
})

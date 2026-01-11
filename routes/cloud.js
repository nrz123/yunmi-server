var express = require('express');
var router = express.Router();
require('express-ws')(router)
const { exec } = require('child_process')
const fs = require('fs')
const multer = require("multer")
const { saveData, checkData } = require('../data.js')
const clients = require('../client.js')
const downloaddir = global.appConfig.dest
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, downloaddir)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({
    storage: storage
})
router.post("/upload", upload.single("file"), function (req, res) {
    res.json(req.file ? req.file : {})
})
router.ws('/upws', (ws, req) => {
    let folder = downloaddir
    let paths = req.headers.filename.split('/')
    let filename = paths.pop()
    paths.forEach(dir => {
        folder = folder + '/' + dir
        fs.existsSync(folder) || fs.mkdirSync(folder)
    })
    let fws = fs.createWriteStream(folder + "/" + filename)
    ws.onmessage = event => {
        fws.write(event.data)
    }
    ws.onerror = () => { }
    ws.onclose = () => {
        fws.end()
    }
})
router.post('/upend', (req, res, next) => {
    let { folder, files } = req.body
    folder = downloaddir + '/' + folder
    exec('ffmpeg -i ' + files.map(file => folder + '/' + file + '.m3u8').join(' -i ') + ' -codec copy ' + folder + '/video.mp4', (error, stdout, stderr) => { })
    res.json('success')
})
router.post('/task', async (req, res, next) => {
    res.json(await clients.requestTask(req.body.sliceId, req.body.key))
})
router.post('/end', (req, res, next) => {
    clients.end(req.body.sliceId)
    res.json('success')
})
router.post('/data', (req, res, next) => {
    saveData(req.body.id, req.body.datas)
    res.json('success')
})
router.post('/checkData', async (req, res, next) => {
    res.json(await checkData(req.body.id, req.body.data))
})
router.post('/rHash', async (req, res, next) => {
    let ret = await clients.rHash(req.body.id, req.body.key, req.body.hash)
    res.json(ret)
})
router.post('/cHash', async (req, res, next) => {
    await clients.cHash(req.body.id, req.body.key)
    res.json()
})
router.ws('/ws', (ws, req) => {
    clients.addCloud(ws)
})
module.exports = router;
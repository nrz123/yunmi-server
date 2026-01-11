var express = require('express');
var router = express.Router();
require('express-ws')(router)
const { saveData, loadData, clearData, changecolumn, dataSum } = require('../data.js')
const { saveTask, loadTask, deleteTask, taskList, taskSum, savePage, deletePage } = require('../task.js')
const { saveModel, deleteModel, loadModel, modelList, modelSum } = require('../model.js')
const clients = require('../client.js')
router.post('/login', function (req, res, next) {
    res.json('success')
})
//Task
router.post('/saveTask', (req, res, next) => {
    saveTask(req.body.task).then(ret => res.json(ret))
})
router.post('/deleteTask', (req, res, next) => {
    deleteTask(req.body.id).then(ret => res.json(ret))
})
router.post('/loadTask', async (req, res, next) => {
    res.json(await loadTask(req.body.id))
})
router.post('/taskList', async (req, res, next) => {
    res.json(await taskList(req.body.offset, req.body.rows))
})
router.post('/taskModel', (req, res, next) => {
    res.json(taskModel(req.body.to))
})
router.post('/taskSum', (req, res, next) => {
    taskSum().then(ret => res.json(ret))
})
router.post('/savePage', (req, res, next) => {
    savePage(req.body.page).then(ret => res.json(ret))
})
router.post('/deletePage', (req, res, next) => {
    deletePage(req.body.id).then(ret => res.json(ret))
})
//TaskCloud
router.post('/runTask', (req, res, next) => {
    loadTask(req.body.id).then(task => task && clients.runTask(task))
    res.json('success')
})
router.post('/stopTask', (req, res, next) => {
    clients.stopTask(req.body.id)
    res.json('success')
})
router.post('/tasksState', (req, res, next) => {
    res.json(clients.tasksState(req.body.ids))
})
router.post('/runsum', (req, res, next) => {
    res.json(clients.runsum())
})
router.post('/running', (req, res, next) => {
    res.json(clients.running(req.body.offset, req.body.rows))
})
router.post('/loadRun', (req, res, next) => {
    res.json(clients.loadRun(req.body.sliceId))
})
router.ws('/ws', (ws, req) => {
    clients.addClient(ws)
})
router.post('/dataSum', (req, res, next) => {
    dataSum(req.body.id).then(ret => res.json(ret))
})
router.post('/importData', (req, res, next) => {
    saveData(req.body.id, req.body.datas)
    res.json('success')
})
router.post('/cloudData', (req, res, next) => {
    loadData(req.body.id, req.body.offset, req.body.rows).then(ret => res.json(ret))
})
router.post('/clearData', (req, res, next) => {
    clearData(req.body.id).then(ret => res.json(ret))
})
router.post('/changecolumn', (req, res, next) => {
    changecolumn(req.body.id, req.body.uid, req.body.nid).then(ret => res.json(ret))
})
//Model
router.post('/saveModel', (req, res, next) => {
    saveModel(req.body.model).then(ret => res.json(ret))
})
router.post('/deleteModel', (req, res, next) => {
    deleteModel(req.body.id).then(ret => res.json(ret))
})
router.post('/loadModel', async (req, res, next) => {
    res.json(await loadModel(req.body.id))
})
router.post('/ModelList', async (req, res, next) => {
    res.json(await modelList(req.body.offset, req.body.rows))
})
router.post('/modelSum', (req, res, next) => {
    modelSum().then(ret => res.json(ret))
})
module.exports = router
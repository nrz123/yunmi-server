var express = require('express');
var router = express.Router();
const { pageData, pageDataSum } = require('../data.js')
const { loadPage, pageList, pageSum } = require('../task.js')
router.post('/pageList', async (req, res, next) => {
  res.json(await pageList(req.body.offset, req.body.rows))
})
router.post('/pageSum', (req, res, next) => {
  pageSum().then(ret => res.json(ret))
})
router.post('/loadPage', async (req, res, next) => {
  res.json(await loadPage(req.body.id))
})
router.post('/pageData', (req, res, next) => {
  loadPage(req.body.id).then(page => page ? pageData(req.body.id, req.body.offset, req.body.rows, req.body.search, req.body.distincts).then(ret => res.json(ret)) : res.json([]))
})
router.post('/pageDataSum', (req, res, next) => {
  loadPage(req.body.id).then(page => page ? pageDataSum(req.body.id, -1, -1, req.body.search, req.body.distincts).then(ret => res.json(ret)) : res.json(0))
})
module.exports = router;
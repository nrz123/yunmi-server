exports.saveModel = (model) => new Promise(resolve => {
    if (!model) return resolve('error')
    let sql = 'create table if not exists models (id char(32) primary key unique,name longtext,editTime bigint unsigned,nodeDataArray longtext,linkDataArray longtext)'
    global.connectMysql().then(conn => {
        conn ? conn.query(sql, (err, result) => {
            let { id, name, nodeDataArray, linkDataArray } = model
            let editTime = new Date().getTime()
            let insertSql = 'insert into models(id,name,editTime,nodeDataArray,linkDataArray) values(?,?,?,?,?) ON DUPLICATE KEY UPDATE id=?,name=?,editTime=?,nodeDataArray=?,linkDataArray=?'
            conn.query(insertSql, [id, name, editTime, nodeDataArray, linkDataArray, id, name, editTime, nodeDataArray, linkDataArray], (err, result) => resolve(err ? 'error' : 'success'))
            conn.end()
        }) : resolve('error')
    })
})
exports.loadModel = (id) => new Promise(resolve => {
    let sql = "select * from models where id=?"
    global.connectMysql().then(conn => {
        if (!conn) return resolve()
        conn.query(sql, [id], (err, result) => resolve(err ? null : result[0]))
        conn.end()
    })
})
exports.deleteModel = (id) => new Promise(resolve => {
    let sql = "delete from models where id=?"
    global.connectMysql().then(conn => {
        if (!conn) return resolve('error')
        conn.query(sql, [id], (err, result) => resolve(err ? 'error' : 'success'))
        conn.end()
    })
})
exports.modelList = (offset, rows) => new Promise(resolve => {
    let sql = 'select id,name,editTime from models order by editTime DESC limit ?,?'
    global.connectMysql().then(conn => {
        if (!conn) return resolve([])
        conn.query(sql, [offset, rows], (err, result) => resolve(err ? [] : result))
        conn.end()
    })
})
exports.modelSum = () => new Promise(resolve => {
    let sql = 'select count(*) as sum from models'
    global.connectMysql().then(conn => {
        if (!conn) return resolve(0)
        conn.query(sql, (err, result) => resolve(err ? 0 : result[0].sum))
        conn.end()
    })
})
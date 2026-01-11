exports.saveTask = (task) => new Promise(resolve => {
    if (!task) return resolve('参数错误')
    let sql = 'create table if not exists tasks(id char(32) primary key unique,name longtext,editTime bigint unsigned,step longtext)'
    global.connectMysql().then(conn => {
        conn ? conn.query(sql, (err, result) => {
            let { id, name, step } = task
            let editTime = new Date().getTime()
            let insertSql = 'insert into tasks(id,name,editTime,step) values(?,?,?,?) ON DUPLICATE KEY UPDATE id=?,name=?,editTime=?,step=?'
            conn.query(insertSql, [id, name, editTime, step, id, name, editTime, step], (err, result) => {
                resolve(err ? 'error' : 'success')
            })
            conn.end()
        }) : resolve('无法连接数据库')
    })
})
exports.loadTask = (id) => new Promise(resolve => {
    let sql = "select * from tasks where id=?"
    global.connectMysql().then(conn => {
        if (!conn) return resolve()
        conn.query(sql, [id], (err, result) => {
            resolve(err ? '' : result[0])
        })
        conn.end()
    })
})
exports.deleteTask = (id) => new Promise(resolve => {
    let sql = "delete from tasks where id=?"
    global.connectMysql().then(conn => {
        if (!conn) return resolve('无法连接数据库')
        conn.query(sql, [id], (err, result) => resolve(err ? 'error' : 'success'))
        conn.end()
    })
})
exports.taskList = (offset, rows) => new Promise(resolve => {
    let sql = 'select id,name,editTime from tasks order by editTime DESC limit ?,?'
    global.connectMysql().then(conn => {
        if (!conn) return resolve([])
        conn.query(sql, [offset, rows], (err, result) => {
            resolve(err ? [] : result)
        })
        conn.end()
    })
})
exports.taskSum = () => new Promise(resolve => {
    let sql = 'select count(*) as sum from tasks'
    global.connectMysql().then(conn => {
        if (!conn) return resolve(0)
        conn.query(sql, (err, result) => resolve(err ? 0 : result[0].sum))
        conn.end()
    })
})
exports.pageList = (offset, rows) => new Promise(resolve => {
    let sql = 'select id,name,editTime from pages order by editTime DESC limit ?,?'
    global.connectMysql().then(conn => {
        if (!conn) return resolve([])
        conn.query(sql, [offset, rows], (err, result) => {
            resolve(err ? [] : result)
        })
        conn.end()
    })
})
exports.pageSum = () => new Promise(resolve => {
    let sql = 'select count(*) as sum from pages'
    global.connectMysql().then(conn => {
        if (!conn) return resolve(0)
        conn.query(sql, (err, result) => resolve(err ? 0 : result[0].sum))
        conn.end()
    })
})
exports.savePage = (page) => new Promise(resolve => {
    if (!page) return resolve('参数错误')
    let sql = 'create table if not exists pages(id char(32) primary key unique,number bigint auto_increment unique not null,name longtext,editTime bigint unsigned,directorys longtext,pagehtml longtext,placeholders longtext)'
    global.connectMysql().then(conn => {
        conn ? conn.query(sql, (err, result) => {
            let { id, name, directorys, pagehtml, placeholders } = page
            let editTime = new Date().getTime()
            let insertSql = 'alter table pages AUTO_INCREMENT=1;insert into pages(id,name,editTime,directorys,pagehtml,placeholders) values(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE id=?,name=?,editTime=?,directorys=?,pagehtml=?,placeholders=?'
            conn.query(insertSql, [id, name, editTime, directorys, pagehtml, placeholders, id, name, editTime, directorys, pagehtml, placeholders], (err, result) => {
                resolve(err ? 'error' : 'success')
            })
            conn.end()
        }) : resolve('无法连接数据库')
    })
})
exports.loadPage = (id) => new Promise(resolve => {
    let sql = "select * from pages where id=?"
    global.connectMysql().then(conn => {
        if (!conn) return resolve()
        conn.query(sql, [id], (err, result) => {
            resolve(err || !result[0] ? '' : result[0])
        })
        conn.end()
    })
})
exports.deletePage = (id) => new Promise(resolve => {
    let sql = "delete from pages where id=?"
    global.connectMysql().then(conn => {
        if (!conn) return resolve('无法连接数据库')
        conn.query(sql, [id], (err, result) => resolve(err ? 'error' : 'success'))
        conn.end()
    })
})
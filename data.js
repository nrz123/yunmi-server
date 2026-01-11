let dataStack = []
let saving = false
let save = () => {
    if (dataStack.length == 0) return saving = false
    let { id, datas } = dataStack.shift()
    let uids = datas[0].map((d, index) => d.key ? d.key : index + '')
    let tableName = 'data' + id
    let sql = 'create table if not exists ?? (column6fd9d90906ab18e9513e99dcdd4e3536 bigint auto_increment primary key,' + uids.map(uid => {
        return 'column' + uid + ' longtext,hashcolumn' + uid + '  char(32)'
    }).join() + ',' + uids.map(uid => {
        return 'index index' + uid + '(hashcolumn' + uid + ')'
    }).join() + ',unique(' + uids.map(uid => 'hashcolumn' + uid).join() + ')' + ')'
    global.connectMysql().then(conn => {
        conn ? conn.query(sql, [tableName], (err, result) => {
            let insertSql = 'alter table ?? AUTO_INCREMENT=1;insert into ?? (column6fd9d90906ab18e9513e99dcdd4e3536,' + uids.map(uid => 'column' + uid + ',hashcolumn' + uid).join() + ') values' + datas.map(d => '(null,' + d.map(dd => '?,md5(?)').join() + ')').join()
            let params = [tableName, tableName]
            datas.forEach(data => {
                data.forEach(d => {
                    params.push(d.value)
                    params.push(d.value)
                })
            })
            conn.query(insertSql, params, (err, result) => {
                setTimeout(save)
            })
            conn.end()
        }) : setTimeout(save)
    })
}
exports.saveData = (id, datas) => {
    while (datas.length > 0) dataStack.push({ id: id, datas: datas.splice(0, 10) })
    saving || (saving = true) && setTimeout(save)
}
exports.checkData = (id, data) => new Promise(resolve => {
    let tableName = 'data' + id
    let sqlColumn = 'select column6fd9d90906ab18e9513e99dcdd4e3536 from ?? where ' + data.map(d => '??=md5(?)').join(' and ') + ' limit 1'
    let params = [tableName]
    data.forEach(d => {
        params.push('hashcolumn' + d.key)
        params.push(d.value)
    })
    global.connectMysql().then(conn => {
        if (!conn) return resolve('none')
        conn.query(sqlColumn, params, (err, result) => {
            resolve(result && result[0] ? 'exist' : 'none')
        })
        conn.end()
    })
})
exports.loadData = (id, offset, rows) => new Promise(resolve => {
    let tableName = 'data' + id
    let sqlColumn = 'select * from ?? where column6fd9d90906ab18e9513e99dcdd4e3536>? order by column6fd9d90906ab18e9513e99dcdd4e3536 limit ?'
    global.connectMysql().then(conn => {
        if (!conn) return resolve([])
        conn.query(sqlColumn, [tableName, offset, rows], (err, result) => resolve(err ? [] : result))
        conn.end()
    })
})
exports.dataSum = (id) => new Promise(resolve => {
    let tableName = 'data' + id
    let sql = 'select max(column6fd9d90906ab18e9513e99dcdd4e3536) as sum from ??'
    global.connectMysql().then(conn => {
        if (!conn) return resolve(0)
        conn.query(sql, [tableName], (err, result) => resolve(err ? 0 : result[0].sum - 1))
        conn.end()
    })
})
exports.changecolumn = (id, uid, nid) => new Promise(resolve => {
    let tableName = 'data' + id
    let sql = 'alter table ?? rename column ?? to ??,rename column ?? to ??'
    global.connectMysql().then(conn => {
        if (!conn) return resolve(0)
        conn.query(sql, [tableName, 'column' + uid, 'column' + nid, 'hashcolumn' + uid, 'hashcolumn' + nid], (err, result) => {
            resolve(err ? 'error' : 'success')
        })
        conn.end()
    })
})
exports.clearData = (id) => new Promise(resolve => {
    let tableName = 'data' + id
    let sql = 'drop table ??'
    global.connectMysql().then(conn => {
        if (!conn) return resolve('无法连接数据库')
        conn.query(sql, [tableName], (err, result) => resolve(err ? 'error' : 'success'))
        conn.end()
    })
})
let pageSql = (id, offset, rows, search, distincts) => {
    let tableName = 'data' + id
    let sql = ''
    let params = []
    if (distincts && distincts.length > 0) {
        sql = 'select any_value(column6fd9d90906ab18e9513e99dcdd4e3536) as column6fd9d90906ab18e9513e99dcdd4e3536 from ?? '
    } else {
        sql = 'select column6fd9d90906ab18e9513e99dcdd4e3536 from ?? '
    }
    params.push(tableName)
    if (search) {
        let arr = []
        for (let k in search) {
            arr.push('??=?')
            params.push(k)
            params.push(search[k])
        }
        if (arr.length > 0) {
            sql = sql + 'where ' + arr.join(' and ')
        }
    }
    if (distincts && distincts.length > 0) {
        sql += ' group by '
        sql += distincts.map(d => '??').join()
        params.push(...distincts.map(d => 'hash' + d.column))
    }
    if (rows > -1) {
        sql += ' order by column6fd9d90906ab18e9513e99dcdd4e3536 limit ?,?'
        params.push(offset)
        params.push(rows)
    }
    return { sql: sql, params: params }
}
exports.pageData = (id, offset, rows, search, distincts) => new Promise(resolve => {
    let { sql, params } = pageSql(id, offset, rows, search, distincts)
    sql = 'select * from (' + sql + ') as a'
    if (distincts && distincts.length > 0) {
        sql = 'select column6fd9d90906ab18e9513e99dcdd4e3536,' + distincts.map(d => '??,??').join() + ' from ?? where column6fd9d90906ab18e9513e99dcdd4e3536 in(' + sql + ')'
        let list = []
        distincts.forEach(d => {
            list.push(d.column)
            list.push('hash' + d.column)
        })
        params.unshift('data' + id)
        params = list.concat(params)
    } else {
        sql = 'select * from ?? where column6fd9d90906ab18e9513e99dcdd4e3536 in(' + sql + ')'
        params.unshift('data' + id)
    }
    global.connectMysql().then(conn => {
        if (!conn) return resolve([])
        conn.query(sql, params, (err, result) => {
            resolve(err ? [] : result)
        })
        conn.end()
    })
})
exports.pageDataSum = (id, offset, rows, search, distincts) => new Promise(resolve => {
    let { sql, params } = pageSql(id, offset, rows, search, distincts)
    sql = 'select count(*) as sum from (' + sql + ') as a'
    global.connectMysql().then(conn => {
        if (!conn) return resolve([])
        conn.query(sql, params, (err, result) => {
            resolve(err ? 0 : result[0].sum)
        })
        conn.end()
    })
})
const { slicestepfinal } = require('./sliceStep.js')
const { guid } = require('./uuid.js')
const { saveData } = require('./data.js')
class Clients {
    constructor() {
        this.tasks = { stack: [], runCache: {}, run: {} }
        this.sliceIdMap = {}
        this.cloudCache = {}
        this.clouds = []
        this.clients = new Set()
    }
    addClient = (client) => {
        let interval = setInterval(() => client.ping(), 20000)
        client.onerror = () => { }
        client.onclose = () => {
            clearInterval(interval)
            this.clients.delete(client)
        }
        this.clients.add(client)
    }
    addCloud = cloud => {
        let interval = setInterval(() => cloud.ping(), 20000)
        cloud.onerror = () => { }
        cloud.onclose = () => {
            clearInterval(interval)
            let index = this.clouds.indexOf(cloud)
            index > -1 && this.clouds.splice(index, 1)
            let sliceId = Object.keys(this.cloudCache).find(key => this.cloudCache[key] == cloud)
            if (!sliceId) return
            delete this.cloudCache[sliceId]
            delete this.tasks.runCache[sliceId]
            delete this.tasks.run[sliceId]
            this.tasks.stack.push(sliceId)
            this.runAll()
        }
        this.runCloud(cloud)
    }
    nextCloud = () => {
        let clouds = this.clouds
        let random = Math.floor(Math.random() * clouds.length);
        [clouds[0], clouds[random]] = [clouds[random], clouds[0]];
        return clouds.shift()
    }
    requestTask = (sliceId, key) => {
        if (this.tasks.runCache[sliceId] != key) return ''
        let task = this.sliceIdMap[sliceId]
        if (!task) return ''
        delete this.tasks.runCache[sliceId]
        this.tasks.run[sliceId] = key
        return task
    }
    runAll = () => {
        while (true) {
            let cloud = this.nextCloud()
            if (!cloud || !this.runCloud(cloud)) break
        }
    }
    run = (cloud, sliceId) => {
        let key = guid()
        setTimeout(() => {
            if (!this.tasks.runCache[sliceId]) return
            delete this.tasks.runCache[sliceId]
            this.tasks.stack.push(sliceId)
            if (this.cloudCache[sliceId] == cloud) {
                delete this.cloudCache[sliceId]
                this.clouds.push(cloud)
            }
            this.runAll()
        }, 3000)
        this.cloudCache[sliceId] = cloud
        this.tasks.runCache[sliceId] = key
        try { cloud.send(JSON.stringify({ type: 'run', sliceId: sliceId, key: key })) } catch { }
    }
    runCloud = cloud => {
        let sliceId = this.tasks.stack.shift()
        if (sliceId) {
            this.run(cloud, sliceId)
            return true
        } else {
            this.clouds.push(cloud)
            return false
        }
    }
    runSliceTask = task => {
        let { sliceId } = task
        this.sliceIdMap[sliceId] = task
        this.tasks.stack.push(sliceId)
    }
    runTask = task => {
        let { id, step, name } = task
        step = JSON.parse(step)
        let head = []
        let init = s => {
            s.nodeName == 'ExtractDataAction' && s.List.forEach(extract => head.push({ key: extract.key, value: extract.name }))
            s.steps && s.steps.forEach(s => init(s))
        }
        init(step)
        saveData(id, [head])
        slicestepfinal(step).forEach(step => {
            this.runSliceTask({ id: id, name: name, step: step, sliceId: guid() })
        })
        this.runAll()
        try { this.clients.forEach(client => client.send(JSON.stringify({ type: 'taskState', id: id, state: true }))) } catch { }
    }
    stopTask = (id) => {
        this.tasks.stack = this.tasks.stack.filter(sliceId => {
            if (this.sliceIdMap[sliceId].id != id) return true
            delete this.sliceIdMap[sliceId]
            return false
        })
        for (let sliceId in this.tasks.runCache) {
            if (this.sliceIdMap[sliceId].id != id) continue
            delete this.tasks.runCache[sliceId]
            delete this.cloudCache[sliceId]
            delete this.sliceIdMap[sliceId]
        }
        for (let sliceId in this.tasks.run) {
            if (this.sliceIdMap[sliceId].id != id) continue
            try { this.cloudCache[sliceId].send(JSON.stringify({ type: 'stop' })) } catch { }
        }
        if (this.isTaskExist(id)) return
        try { this.clients.forEach(client => client.send(JSON.stringify({ type: 'taskState', id: id, state: false }))) } catch { }
    }
    end = (sliceId) => {
        if (!this.sliceIdMap[sliceId]) return
        let { id } = this.sliceIdMap[sliceId]
        if (!this.tasks.run[sliceId]) return
        let cloud = this.cloudCache[sliceId]
        delete this.cloudCache[sliceId]
        delete this.tasks.run[sliceId]
        delete this.sliceIdMap[sliceId]
        this.runCloud(cloud)
        if (this.isTaskExist(id)) return
        try { this.clients.forEach(client => client.send(JSON.stringify({ type: 'taskState', id: id, state: false }))) } catch { }
    }
    runsum = () => {
        let { stack, runCache, run } = this.tasks
        return stack.length + Object.keys(runCache).length + Object.keys(run).length
    }
    isTaskExist = id => Object.values(this.sliceIdMap).findIndex(ret => ret.id == id) > -1
    tasksState = (ids) => {
        let result = {}
        let values = Object.values(this.sliceIdMap)
        ids.forEach(id => {
            result[id] = values.findIndex(ret => ret.id == id) > -1
        })
        return result
    }
    running = (offset, rows) => {
        let { stack, runCache, run } = this.tasks
        let runKeys = Object.keys(run)
        let runCacheKeys = Object.keys(runCache)
        return runKeys.concat(runCacheKeys).concat(stack).slice(offset, offset + rows).map(sliceId => {
            let { id, name } = this.sliceIdMap[sliceId]
            return { sliceId: sliceId, id: id, name: name, cloudState: runKeys.indexOf(sliceId) > -1 }
        })
    }
    loadRun = (sliceId) => this.sliceIdMap[sliceId]
}
module.exports = new Clients()
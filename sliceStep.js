let slicestepfinal = step => {
    let steps = []
    let f = step => {
        let slice = slicestep(step)
        if (slice.length == 0) {
            steps.push(step)
        } else {
            slice.forEach(s => f(s))
        }
    }
    f(step)
    return steps
}
let slicestep = step => {
    let steps = []
    let f = step => {
        if (step.nodeName == 'LoopAction' || step.nodeName == 'EnterTextAction' || step.nodeName == 'NavigateAction' || step.nodeName == 'CookieAction') {
            if (step.Slice) {
                let sum = 1
                for (let i = 0; i < step.Slice; i++) {
                    let s = 0
                    for (let j = 0; j < step.List.length; j++) {
                        if (!step.List[j].RecInvalids || step.List[j].RecInvalids.indexOf(i) == -1) s++
                    }
                    sum *= s
                }
                if (sum > 1) return step
            }
        }
        if (step.steps) {
            for (let i in step.steps) {
                let s = f(step.steps[i])
                if (s) return s
            }
        }
    }
    let s = f(step)
    if (s) {
        let List = s.List
        for (let i = 0; i < s.Slice; i++) {
            let sList = []
            for (let j = 0; j < List.length; j++) {
                if (!s.List[j].RecInvalids || s.List[j].RecInvalids.indexOf(i) == -1) sList.push(j)
            }
            if (sList.length <= 1) continue
            sList.forEach(j => {
                s.List = JSON.parse(JSON.stringify(List))
                sList.forEach(k => {
                    if (k == j) return
                    if (!s.List[k].RecInvalids) s.List[k].RecInvalids = []
                    s.List[k].RecInvalids.push(i)
                })
                steps.push(JSON.parse(JSON.stringify(step)))
            })
            break
        }
        s.List = List
    }
    return steps
}
exports.slicestepfinal = slicestepfinal
exports.slicestep = slicestep
import React from 'react'
import './home.css'
import { Pagination, Layout, Menu, Card, List } from 'antd'
import { Outlet, Link, useParams, useLocation } from 'react-router-dom'
let weburl = 'http://127.0.0.1'
weburl = ''
class WebPageC extends React.Component {
    constructor(props) {
        super(props)
        this.pagekey = this.props.params.pagekey
        this.search = new URLSearchParams(this.props.location.search)
        this.searchParams = Object.fromEntries(this.search)
        this.state = {
            datas: [],
            page: 1,
            pageSize: 100,
            total: 0
        }
    }
    updata = (pageIndex, pageSize) => {
        window.fetch(weburl + "/resource/loadPage", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: this.pagekey
            })
        }).then(res => res.json()).then(page => {
            if (!page) return
            this.page = page
            let slast = ''
            this.search.forEach((value, key) => {
                slast = key
            })
            this.distincts = []
            let isdirectory = false
            let directorys = page.directorys ? JSON.parse(page.directorys) : []
            if (directorys.length > 0) {
                let sindex = directorys.findLastIndex(directory => {
                    return directory.findIndex(d => slast.includes(d.column)) > -1
                })
                if (sindex != directorys.length - 1) {
                    this.distincts = directorys[sindex + 1]
                    isdirectory = true
                }
            }
            let dataparams = {
                id: this.pagekey,
                offset: (pageIndex - 1) * pageSize,
                rows: pageSize,
                search: this.searchParams,
                distincts: this.distincts
            }
            window.fetch(weburl + "/resource/pageDataSum", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataparams)
            }).then(res => res.json()).then(sum => {
                this.setState({ total: sum })
            })
            window.fetch(weburl + "/resource/pageData", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataparams)
            }).then(res => res.json()).then(datas => {
                this.setState({
                    datas: datas, page: pageIndex, pageSize: pageSize, isdirectory: isdirectory
                })
            })
        })
    }
    componentDidMount = () => {
        this.updata(this.state.page, this.state.pageSize)
    }
    componentDidUpdate = (prevProps, prevState) => {
        if (!this.isdirectory && this.state.datas && prevState.datas != this.state.datas) {
            this.state.datas.forEach(d => {
                let element = document.getElementById('element' + d.column6fd9d90906ab18e9513e99dcdd4e3536)
                let placeholders = this.page.placeholders ? JSON.parse(this.page.placeholders) : []
                placeholders.forEach(placeholder => {
                    let child = element.querySelector(placeholder.selector)
                    if (!child) return
                    let value = d[placeholder.column]
                    if (placeholder.regs) {
                        placeholder.regs.forEach(reg => {
                            let { source, target } = reg
                            try {
                                value = value.replace(new RegExp(source ? source : '', 'img'), target ? target : '')
                            } catch { }
                        })
                    }
                    child[placeholder.attribute] = value
                })
            })
        }
    }
    render() {
        return (
            <div style={{ width: '100%' }}>
                <div style={{ width: '100%', display: this.state.isdirectory ? '' : 'none' }} >
                    <List>
                        {this.state.isdirectory ? this.state.datas.map(data => {
                            let u = { ...this.searchParams }
                            let name = ''
                            this.distincts.forEach(d => {
                                let key = 'hash' + d.column
                                u[key] = data[key]
                                name = data[d.column]
                            })
                            return <List.Item>
                                <a href={'/webpage/' + this.pagekey + '?' + new URLSearchParams(u).toString()} className='course-link'>{name}</a>
                            </List.Item>
                        }) : null}
                    </List>
                </div>
                <div style={{ width: '100%', display: this.state.isdirectory ? 'none' : '' }} >
                    {this.state.datas.map(d => {
                        return < div id={'element' + d.column6fd9d90906ab18e9513e99dcdd4e3536} style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: this.page.pagehtml }}>

                        </div >
                    })}
                </div>
                <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.pageSize} current={this.state.page} onChange={(page, pageSize) => {
                    this.updata(page, pageSize)
                }} />
            </div>
        )
    }
}
const WebPage = () => {
    const params = useParams()
    const location = useLocation()
    return (
        <WebPageC params={params} location={location} />
    )
}
export default WebPage
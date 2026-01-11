import React from 'react'
import './home.css'
import { Pagination, List } from 'antd'
import { Link } from 'react-router-dom'
let weburl = 'http://127.0.0.1'
weburl = ''
class WebList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            weblist: [],
            page: 1,
            pageSize: 10,
            total: 0
        }
    }
    updata = (pageIndex, pageSize) => {
        window.fetch(weburl + "/resource/pageSum", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: ''
        }).then(res => res.json()).then(sum => {
            this.setState({ total: sum })
        })
        window.fetch(weburl + "/resource/pageList", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: this.pagekey,
                offset: (pageIndex - 1) * pageSize,
                rows: pageSize
            })
        }).then(res => res.json()).then(data => {
            this.setState({
                weblist: data, page: pageIndex, pageSize: pageSize
            })
        })

    }
    componentDidMount = () => {
        this.updata(this.state.page, this.state.pageSize)
    }
    render() {
        return (
            <div style={{ width: '100%' }}>
                <List>
                    {this.state.weblist.map(p => <List.Item>
                        <Link to={'/webpage/' + p.id} className='course-link'>{p.name}</Link>
                    </List.Item>)}
                </List>
                <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.pageSize} current={this.state.page} onChange={(page, pageSize) => {
                    this.updata(page, pageSize)
                }} />
            </div>
        )
    }
}
export default WebList
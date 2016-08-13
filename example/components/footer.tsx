import * as React from 'react'
import Store, { lift, resource } from '../../'
import {ajax} from 'rxjs/observable/dom/ajax'

type state = {
  num: number,
  text: string,
  userInfo: string,
  dispatch: Function
}

/**
 * Footer extends React.Component<state, any>
 */

const fetchData = () => new Promise((resolve, reject) => {
  setTimeout(() => resolve("服务器返回了一段测试数据"), 1000)
})
@resource(fetchData(), "testResponse", (store, err) => console.log(err))
@lift({ num: 0 })
export default class Footer extends React.Component<any, Object> {
  state = Store["Footer"].state
  render() {
    const {num, testResponse, text = "test"} = this.state
    return (
      <div>
        <button onClick = { this.add(num) }>+</button>
        <p>数字: {num}</p>
        <button onClick = { this.reduction(num) }>-</button>
        <button onClick = { this.timeoutHandle }>异步</button>
        <p>{text}</p>
        <p>{JSON.stringify(testResponse) }</p>
      </div>
    )
  }
  add = (num: number) => (e: Event) => {
    this.setState({ num: ++num })
  }
  reduction = (num: number) => (e: Event) => this.setState({ num: --num })
  timeoutHandle = e => new Promise((resolve, reject) => {
    setTimeout(() => resolve("服务器返回了一段测试数据"), 1000)
  }).then(response => {
    this.setState({ text: response })
  })
}
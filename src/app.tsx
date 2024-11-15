import React, { useCallback, useMemo, useState } from 'react'
import * as dottedLine  from './icons/dotteLine';
import * as filled from './icons/fullLine';
import * as original from './icons/original';
import './app.scss'
import { version } from '../package.json'
import CardIncons from './cardIncons'

export default function App() {
  
  const outlinedIconList = useMemo(() => Object.keys(dottedLine), [])
  const filledIconList = useMemo(() => Object.keys(filled), [])
  const rawIconList =  useMemo(() => Object.keys(original), [])
  // 颜色
  const [color, setColor] = useState('#000000')
  // 尺寸
  const [size, setSize] = useState(36)


  return (
    <div className='container'>
      <header className='header'>
        <div className='settings'>
          <a href="/-/web/detail/wsk-icons" rel="nofollow" style={{ fontSize: 0 }}>
            <img
              src={`https://img.shields.io/badge/npm-${version}-brightgreen`}
              alt="NPM version"
            />
             <a target='_blank' href='https://wskang12138.github.io/wsk-icons/'>GitHub</a>
          </a>
          <span>搜索图标可使用<kbd>crtl</kbd>+<kbd>f</kbd>
          </span>
          <span>安装使用: npm install wskicons</span>
        </div>
        <hr />
      </header>
      <main>
        <h4>
          <span>线框风格</span>
          <span className='total'>{outlinedIconList.length}</span>
        </h4>
        <div className='content'>
          {
            outlinedIconList.map((iconName) => {
              const Component = (dottedLine as any)[iconName]
              return (
                  <CardIncons title={iconName} incon={Component}>
                     <Component style={{ fontSize: size }} color={color} />
                     <span className='incon-name'>{iconName}</span>
                  </CardIncons>
              )
            })
          }
        </div>
        <h4>
          <span>实底风格</span>
          <span className='total'>{filledIconList.length}</span>
        </h4>
        <div className='content'>
          {
            filledIconList.map((iconName) => {
              const Component = (filled as any)[iconName]
              return (
                <CardIncons title={iconName} incon={Component}>
                <Component style={{ fontSize: size }} color={color} />
                <span className='incon-name'>{iconName}</span>
             </CardIncons>
              )
            })
          }
        </div>
        <h4>
          <span>原生风格--用于多彩图标的场景，不支持自定义颜色</span>
          <span className='total'>{rawIconList.length}</span>
        </h4>
        <div className='content'>
          {
            rawIconList.map((iconName) => {
              const Component = (original as any)[iconName]
              return (
                <CardIncons title={iconName} incon={Component}>
                <Component style={{ fontSize: size }} color={color} />
                <span className='incon-name'>{iconName}</span>
             </CardIncons>
              )
            })
          }
        </div>
      </main>
    </div>
  )
}
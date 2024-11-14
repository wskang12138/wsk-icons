import React, { useCallback, useMemo, useState } from 'react'
import * as allIcons from './ReactIcons'
import './app.scss'
import { version } from '../package.json'
import CardIncons from './cardIncons'

export default function App() {
  const alliconList = useMemo(() => Object.keys(allIcons), [])

  const iconList = useMemo(() => {
    return alliconList.filter((iconName) => iconName.startsWith('Deprecated') === false)
  }, [])
  const outlinedIconList = useMemo(() => {
    return iconList.filter((iconName) => iconName.includes('Outlined'))
  }, [iconList])
  const filledIconList = useMemo(() => {
    return iconList.filter((iconName) => iconName.includes('Filled'))
  }, [iconList])
  const rawIconList = useMemo(() => {
    return iconList.filter((iconName) => iconName.includes('Raw'))
  }, [iconList])
  // 颜色
  const [color, setColor] = useState('#000000')
  const onChangeColor = useCallback((e) => {
    setColor(e.target.value)
  }, [])
  // 尺寸
  const [size, setSize] = useState(36)
  const onChangeSize = useCallback((e) => {
    setSize(e.target.value)
  }, [])

  return (
    <div className='container'>
      <header className='header'>
        <div className='settings'>
          <a href="/-/web/detail/wsk-icons" rel="nofollow" style={{ fontSize: 0 }}>
            <img
              src={`https://img.shields.io/badge/npm-${version}-brightgreen`}
              alt="NPM version"
            />
          </a>
          <span>搜索图标可使用<kbd>crtl</kbd>+<kbd>f</kbd></span>
        </div>
        <hr />
        <div className='settings'>
          <label>颜色</label>
          <input type='color' value={color} onChange={onChangeColor} />
          <span>{color}</span>
        </div>
        <hr />
        <div className='settings'>
          <label>尺寸</label>
          <input type='range' min={14} value={size} onChange={onChangeSize} />
        </div>
      </header>
      <main>
        <h4>
          <span>线框风格</span>
          <span className='total'>{outlinedIconList.length}</span>
        </h4>
        <div className='content'>
          {
            outlinedIconList.map((iconName) => {
              const Component = (allIcons as any)[iconName]
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
              const Component = (allIcons as any)[iconName]
              return (
                <div key={iconName} className='card'>
                  <Component style={{ fontSize: size }} color={color} />
                  <span>{iconName}</span>
                </div>
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
              const Component = (allIcons as any)[iconName]
              return (
                <div key={iconName} className='card'>
                  <Component style={{ fontSize: size }} />
                  <span>{iconName}</span>
                </div>
              )
            })
          }
        </div>
      </main>
    </div>
  )
}
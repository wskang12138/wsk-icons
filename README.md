# 图标组件

[所有图标]

## 安装
```bash
npm install wsk-icons 
```

## 使用
```ts
import { ** } from 'wsk-icons'
```

## 添加图标流程
1. 将要添加图标的 svg 文件复制到 rawSvg 目录下，并以合适的格式命名
2. 执行`yarn build-svg`，将 svg 文件编译为 react 组件
3. 执行`yarn dev`，测试新图标是否支持颜色和尺寸的控制
4. commit 提交，之后的更新日志会根据 commit 生成
5. 执行`yarn build`，打包成库文件
6. 执行`yarn release`，生成更新日志
7. 执行`npm publish --registry`，发布 npm package
8. 执行`yarn deploy`，生成演示页面，更新到对应的服务器目录下
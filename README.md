# Svg optimization and conversion

## Introduce

```bash

This plugin is mainly used for optimizing SVG, PNG, and JPG images. 
If it is SVG, it can be converted into corresponding components through instructions, 
such as React and Vue components, Base64 encoded data. 

```

## Install
```bash
npm install -g wsksvg
```

## Use
```bash
Usage:
  wsksvg <input> [output] [options]

  Commands:
   <input>         The path to the SVG file or directory containing SVG files.
   [output]        The path to the output directory or file. If not specified, 
                   the output will be in the same directory with a ".copy" suffix.

  Options:
    --vue           Generate Vue components from SVG files.
    --react         Generate React components from SVG files.
    --base          Convert SVG files to Base64 encoded data.
    -h, --help      Display this help message.
  
  Examples:
    wsksvg ./rawSvg
    wsksvg ./rawSvg ./testVue
    wsksvg ./rawSvg ./testVue --vue
    wsksvg ./rawSvg ./testReact --react
    wsksvg ./rawSvg ./base64Output --base
    wsksvg ./rawImages ./optimizedImages

  ./rawSvg Input file path  ./test Output file path
```


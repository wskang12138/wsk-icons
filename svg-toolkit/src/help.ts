// 显示帮助信息
export const displayHelp = () => {
    console.log(`
  Usage:
    wsksvg <input> [output] [options]
  
  Commands:
    <input>         The path to the SVG file or directory containing SVG files.
    [output]        The path to the output directory or file. If not specified, the output will be in the same directory with a ".copy" suffix.
  
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
    `);
  };
  
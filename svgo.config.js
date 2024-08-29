export default {
  js2svg: {
    indent: 2, // string with spaces or number of spaces. 4 by default
    pretty: true, // boolean, false by default
  },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          inlineStyles: {
            onlyMatchedOnce: false,
          },
        },
      },
    },
    'removeXMLNS',
    'convertStyleToAttrs',
    {
      name: 'convertColors',
      params: { currentColor: /^(?!url|none)./ },
    },
    {
      name: 'removeAttrs',
      params: { attrs: ['opacity', 'svg:width', 'svg:height'] }
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [{
          fill: 'currentColor',
          width: '1em',
          height: '1em',
          'aria-hidden': true,
          focusable: 'false',
        }]
      }
    }
  ],
}
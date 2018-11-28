module.exports = {
  'presets': [
    [require('@babel/preset-env'), { 'modules': false }],
  ],
  'plugins': [
    require('@babel/plugin-proposal-class-properties'),
  ],
}

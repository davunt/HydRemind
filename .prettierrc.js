module.exports = {
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  printWidth: 100,
  importOrder: ['^react$', '^expo-', '<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderSortSpecifiers: true,
};

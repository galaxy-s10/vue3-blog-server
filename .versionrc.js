console.log(
  '\x1B[0;37;44m INFO \x1B[0m',
  '\x1B[0;;34m ' +
    `读取了: ${__filename.slice(__dirname.length + 1)}` +
    ' \x1B[0m'
);

module.exports = {
  types: [
    { type: 'feat', section: 'Features', hidden: false },
    { type: 'fix', section: 'Bug Fixes', hidden: false },
    { type: 'docs', section: 'Docs', hidden: false },
    { type: 'style', section: 'Styling', hidden: false },
    { type: 'refactor', section: 'Code Refactoring', hidden: false },
    { type: 'perf', section: 'Performance Improvements', hidden: false },
    { type: 'test', section: 'Tests', hidden: false },
    { type: 'build', section: 'Build System', hidden: false },
    { type: 'ci', section: 'CI', hidden: false },
    { type: 'chore', section: 'Others', hidden: false },
    { type: 'revert', section: 'Reverts', hidden: false },
  ],
};

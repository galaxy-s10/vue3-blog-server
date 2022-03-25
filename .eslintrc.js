const chalk = require('chalk');

console.log(
  `${chalk.bgBlueBright.black(' INFO ')} ${chalk.blueBright(
    `读取了: ${__filename.slice(__dirname.length + 1)}`
  )}`
);

module.exports = {
  /**
   * 默认情况下，ESLint 会在所有父文件夹中查找配置文件，直到根目录。如果您希望所有项目都遵循某种约定，这可能很有用，
   * 但有时会导致意想不到的结果。要将 ESLint 限制为特定项目，请将其放置"root": true在.eslintrc.*文件或文件eslintConfig的字段中
   * ，package.json或者放在.eslintrc.*项目根级别的文件中。
   */
  root: true,
  env: {
    browser: true,
    node: true,
    // es2021: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended', // prettierrc配置文件声明了singleQuote:true,即单引号，printWidth：80，即一行80，且prettier默认一个缩进四个空格
  ],
  parserOptions: {},
  plugins: ['import'],
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // parser: 'vue-eslint-parser',
        // ecmaVersion: 12,
        // parser: '@typescript-eslint/parser',
      },
      plugins: ['@typescript-eslint', 'import'],
      extends: [
        'airbnb-base',
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:prettier/recommended', // prettierrc配置文件声明了singleQuote:true,即单引号，printWidth：80，即一行80，且prettier默认一个缩进四个空格
      ],
      rules: {
        // '@typescript-eslint/no-var-requires': 0, // 关闭这条规则，否则，ts中不能使用类似 var foo = require("foo")的语句，但可以使用类似require("foo")的语句
        camelcase: 0,
        'no-console': 0, // 此规则不允许调用console对象的方法。
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              ['sibling', 'parent'],
              'index',
              'object',
              'type',
            ],
            'newlines-between': 'always', // 强制或禁止导入组之间的新行：
            // 根据导入路径按字母顺序对每个组内的顺序进行排序
            alphabetize: {
              order: 'asc' /* 按升序排序。选项：['ignore', 'asc', 'desc'] */,
              caseInsensitive: true /* 忽略大小写。选项：[true, false] */,
            },
          },
        ],
        'import/no-unresolved': 0, // 确保导入的模块可以解析为本地文件系统上的模块。好像解析不了相对路径？
        'import/extensions': 0, // 省略导入源路径中的文件扩展名
        // 'no-unused-expressions': [2, { allowShortCircuit: true }], // 期望一个赋值或函数调用，却看到了一个表达式，允许&&
        'class-methods-use-this': 0, // 类方法如果不使用this的话会报错
        'import/prefer-default-export': 0, // 当模块只有一个导出时，更喜欢使用默认导出而不是命名导出。
        // 'object-curly-newline': [
        //   // 在打开大括号之后和关闭大括号之前强制执行一致的换行符，这条规则和prettier冲突
        //   'error',
        //   {
        //     multiline: true,
        //     minProperties: 3, // 如果属性的数量至少是给定的整数，则需要换行符
        //     consistent: true,
        //     // ObjectExpression: 'always',
        //     // ObjectPattern: { multiline: true },
        //   },
        // ],
      },
    },
  ],
  // rules优先级最高，会覆盖上面的
  rules: {
    // 0 => off
    // 1 => warn
    // 2 => error
    camelcase: 0,
    'no-console': 0,
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['sibling', 'parent'],
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always', // 强制或禁止导入组之间的新行：
        // 根据导入路径按字母顺序对每个组内的顺序进行排序
        alphabetize: {
          order: 'asc' /* 按升序排序。选项：['ignore', 'asc', 'desc'] */,
          caseInsensitive: true /* 忽略大小写。选项：[true, false] */,
        },
      },
    ],
    // 'no-restricted-syntax': [
    //   // airbnb默认禁用了一些语法
    //   1,
    //   // 'FunctionExpression',
    //   // 'ForInStatement',
    //   { selector: 'ForInStatement', message: '不建议使用for in' },
    // ],
    // 'guard-for-in': 0, // 当for in循环不使用if语句过滤其结果时，它会发出警告
    // 'no-nested-ternary': 0, // 禁止嵌套三元
    // 'no-plusplus': 0,
    // 'arrow-body-style': [1, 'as-needed'], // 在可以省略的地方强制不使用大括号（默认）
    // 'global-require': 1, // 此规则要求所有调用require()都在模块的顶层，类似于 ES6import和export语句，也只能在顶层发生。
    // 'no-shadow': 0,
    // 'no-undef': 0, // https://github.com/typescript-eslint/typescript-eslint/issues/2528#issuecomment-689369395
    // 'no-param-reassign': 0,
    // 'func-names': 0, // 不能是匿名函数
    // 'import/no-extraneous-dependencies': 0, // 开发/生产依赖混乱
    // 'spaced-comment': 2, // 此规则将在注释//或开始后强制执行间距的一致性/*
    // 'no-underscore-dangle': 0, // Unexpected dangling '_' in '_xxx'
    // 'import/extensions': 0, // 省略导入源路径中的文件扩展名
    // 'import/no-unresolved': 0, // 导入资源的时候没有后缀会报这个错，这里关掉他
    // 'vars-on-top': 0, // 要求var声明位于其作用域的顶部
    // 'prefer-rest-params': 0, // 此规则旨在标记arguments变量的使用
    // 'import/newline-after-import': 1, // 强制在最后一个顶级导入语句或 require 调用之后有一个或多个空行
    // 'prefer-const': 1, // xxx is never reassigned. Use 'const' instead，此规则旨在标记使用let关键字声明的变量
    // 'no-unused-vars': 1, // xxx is assigned a value but never used，此规则旨在消除未使用的变量、函数和函数参数
    // 'no-var': 1, // Unexpected var, use let or const instead，该规则旨在阻止使用var或鼓励使用const或let代替。
    // 'no-console': process.env.NODE_ENV !== 'production' ? 0 : 2, // 此规则不允许调用console对象的方法。
    // 'no-redeclare': 2, // 此规则旨在消除在同一范围内具有多个声明的变量。
    // 'array-callback-return': [2, { allowImplicit: false }], // expects a return value from arrow function.期望箭头函数的返回值。
  },
};

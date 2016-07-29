## 新建一个项目
### 配置文件：已知的package.json , gulpfile.js.

#### package.json
- 是什么？ 描述包的文件。管理包。提供下载依赖。
- 是什么？ 其是基于nodejs项目必不可少的配置文件，它是存放在项目根目录的普通json文件
- 是什么？ 用package.json来管理NPM里面的依赖包
- 是什么？ 很久之前：开发前端项目（基于grunt），每新建一个项目，总是先用npminit来初始化一个package.json
            ，然后就是一遍又一遍的npm install grunt-contrib-less --save-dev....
            在进行版本控制的时候，以git为例，为了让项目组成员能拥有正确的开发环境，得git add node_modules,吧里面所有的包都加入版本控制。一提交就是一大tuo,要是添加新的包，或者更新包，其他成员更新的时候也是一坨。

            新的能力Get：如果你有个新的项目，还没有下载过任何的npm包，而需要的npm包跟前一个项目差不多。那么，你可以把这个项目里面的package.json拷贝到当前项目根目录。然后npm install，所有的依赖包就会自动的下载完毕了！

            现在：一个好的开发项目流程可以是这样：有一份好的前端项目开发模板，里面的目录可能是这样。。。
            package.json里面有基本的包依赖
            .gitignore里面添加了node_modules
            每次新建项目就可以拷贝这份模板，然后初始化，加入版本库，提交。项目其他成员，更新到本地后，同样的初始化就可以了
- 什么时候创建？项目初始化时。

### gulpfile.js
- 有什么用？定义gulp任务，实现需要的功能。

### 插件安装。
- 本地安装 npm install name --save-dev
- 全局安装 npm install name -g


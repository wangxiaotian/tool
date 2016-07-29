## 在介绍gulp API之前，我们首先来说一下gulp.js工作方式。在gulp中，使用的是Nodejs中的stream(流)，首先获取到需要的stream，然后可以通过stream的pipe()方法把流导入到你想要的地方，比如gulp的插件中，经过插件处理后的流又可以继续导入到其他插件中，当然也可以把流写入到文件中。所以gulp是以stream为媒介的，它不需要频繁的生成临时文件，这也是我们应用gulp的一个原因。



## gulp.src();
- gulp.src()方法正是用来获取流的，但要注意这个流里的内容不是原始的文件流，而是一个虚拟文件对象流（Vinyl files）,这个虚拟文件对象中存储着原始文件的路径、文件名、内容等信息，这个我们暂时不用去深入理解，只需要简单的理解可以用这个方法来读取你需要操作的文件就行了。
其语法为gulp.src(globs[,options])
        gulp.src(['js/*.js','css/*.css','*.html'])
        gulp.task('fileinclude',function(){
	        gulp.src('src/pages/main/abouts/**.html')
        })

## gulp.task();
- gulp.task方法用来定义任务，内部使用的是Orchestrator,其语法为：
    gulp.task(name[,deps],fn)

    name为任务名
    deps是当前定义的任务需要依赖的其它任务，为一个数组。当前定义的任务会在所有依赖的任务执行完毕后才开始执行。如果没有依赖，则可省略这个参数
    fn 为任务函数，我们把任务要执行的代码都写在里面。该参数也是可选的。

    语法为：
    gulp.task('mytask', ['array', 'of', 'task', 'names'],function() {
        //定义一个有依赖的任务
        // Do something
    });

## gulp.dest();
- gulp.dest()方法是用来写文件的，其语法为：
    gulp.dest(path[,options])
    path为写入文件的路径；
    options为一个可选的参数对象

    gulp.dest()方法则把流中的内容写入到文件中，这里首先需要弄清楚的一点是，我们给gulp.dest()传入的路径参数，只能用来指定要生成的文件的目录，而不能指定生成文件的文件名，它生成文件的文件名使用的是导入到它的文件流自身的文件名，所以生成的文件名是由导入到它的文件流决定的，即使我们给它传入一个带有文件名的路径参数，然后它也会把这个文件名当做是目录名，例如：
    var gulp = require('gulp');
    gulp.src('script/jquery.js')
        .pipe(gulp.dest('dist/foo.js'));
    //最终生成的文件路径为 dist/foo.js/jquery.js,而不是dist/foo.js


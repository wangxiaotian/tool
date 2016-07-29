var gulp = require('gulp');
var fileinclude = require('gulp-file-include');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
// 拼接DOM
gulp.task('fileinclude',function(){
	gulp.src('src/**/**.html')
	.pipe(fileinclude({
		prefix : '@@',
		basepath : '@file'
	}))
	.pipe(gulp.dest('dist'));
})
// js文件压缩
gulp.task('minify-js',function(){
	gulp.src('src/**/**.js')
	.pipe(uglify())
	.pipe(gulp.dest('dist'))
})
// 启动服务   ()
// 
// 创建watch任务去检测html文件，其定义了当html文件改动之后，去调用一个gulp的task
gulp.task('watch',function(){
    gulp.watch(['dist/**/**.html'],['html','fileinclude']);
})
// 使用connect启动一个web服务器
gulp.task('connect',function(){
	connect.server({
		root:'dist/pages/main',
		livereload : true
	});
});
gulp.task('html',function(){
	gulp.src('dist/**/**.html')
	.pipe(connect.reload());
})
gulp.task('server',['connect','watch']);




gulp.task('watch', ['default'], function() {
    gulp.watch(['dist/**/**.html'], ['html'])
})

// 开启预览服务器
gulp.task('server', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: "dist"
        },
        browser: "google chrome"
    });
});

gulp.task("ser", ['html']);
var gulp = require('gulp');
var fileinclude = require('gulp-file-include');
// 拼接DOM
gulp.task('fileinclude',function(){
	gulp.src('src/**/**.html')
	.pipe(fileinclude({
		prefix : '@@',
		basepath : '@file'
	}))
	.pipe(gulp.dest('dist'));
})

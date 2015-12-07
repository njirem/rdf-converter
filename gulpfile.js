const gulp = require('gulp'),
    del = require('del'),
    merge = require('merge2'),
    ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json', {
    noExternalResolve: 'true'
})

const paths = {
    release: 'release/',
    src: ['./src/**/*.ts', './typings/**/*.d.ts', '!./src/**/*.spec.ts']
}

gulp.task('build', gulp.series(
    clean,
    build
    ))

function clean() {
    return del([paths.release + '**']);
}

function build() {
    var tsResult = gulp.src(paths.src)
        .pipe(ts(tsProject))


    return merge([
        tsResult.dts,
        tsResult.js
    ]).pipe(gulp.dest(paths.release))
}
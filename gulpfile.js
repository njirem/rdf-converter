const gulp = require('gulp'),
    del = require('del'),
    merge = require('merge2'),
    ts = require('gulp-typescript'),
    mocha = require('gulp-mocha');

const tsBuildProject = ts.createProject('tsconfig.json', {
    noExternalResolve: true,
    declaration: true,
    sourceMap: false,
})

const tsTestProject = ts.createProject('tsconfig.json', { noExternalResolve: true })

const paths = {
    release: 'release/',
    src: ['src/**/*.ts', 'typings/**/*.d.ts', '!src/**/*.spec.ts'],
    allSrc: ['src/**/*.ts', 'typings/**/*.d.ts'],
    tests: 'src/**/*.spec.js',
}

gulp.task('default', gulp.series(
    clean,
    compileAll,
    test,
    build,
    () => {
        gulp.watch(paths.allSrc, gulp.series(compileAll, test, build))
    }
))

gulp.task('build', gulp.series(
    clean,
    build
    ))

function clean() {
    return del([paths.release + '**']);
}

function build() {
    var tsResult = gulp.src(paths.src)
        .pipe(ts(tsBuildProject))

    return merge([
        tsResult.dts,
        tsResult.js
    ]).pipe(gulp.dest(paths.release))
}

function compileAll() {
    return gulp.src(paths.allSrc)
        .pipe(ts(tsTestProject))
        .pipe(gulp.dest('src/'))
}

function test() {
    return gulp.src(paths.tests)
        .pipe(mocha())
        // .once('error', () => console.log('Error'))
        // .once('end', () => console.log('End'))
}
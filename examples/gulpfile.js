'use strict';

// This file is for testing purposes only

const gulp = require('gulp'),
    rename = require('gulp-rename'),
    del = require('del'),
    rdf = require('./src/gulp');

const paths = {
    dist: 'out'
}, testGraph = 'http://testGraph';

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(
        rdfConvert(rdf.Type.Json),
        rdfConvert(rdf.Type.NQuads),
        rdfConvert(rdf.Type.TriG),
        rdfConvert(rdf.Type.JS)
        )
    ))


function rdfConvert(destType, graphName) {
    return () => gulp.src('data/**/*.+(json|trig|nq)')
        .pipe(rename(path => path.basename += '-' + path.extname.substr(1)))
        .pipe(rdf.Converter(destType, null, graphName))
        .pipe(gulp.dest(paths.dist + '/data/' + rdf.Type[destType].toLowerCase()))
}


function clean() {
    return del([paths.dist + '/**'])
}
'use strict';

// This file is for testing purposes only

const gulp = require('gulp'),
    rename = require('gulp-rename'),
    del = require('del'),
    rdf = require('../release/gulp');

const paths = {
    dist: 'out/'
}, testGraph = 'http://rdf-converter/graphName';

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(
        rdfConvert(rdf.Type.Json, { defaultGraphName: testGraph}),
        rdfConvert(rdf.Type.NQuads),
        rdfConvert(rdf.Type.TriG),
        rdfConvert(rdf.Type.JS, { jsTemplate: 'exports.quads = ${ quadArray };'})
        )
    ))


function rdfConvert(destType, options) {
    return () => gulp.src('data/**/*.+(json|trig|nq)')
        // Set the extension in the name, so it can be identified in the output
        .pipe(rename(path => path.basename += '-' + path.extname.substr(1)))
        // Convert the input to the given Destination Type
        .pipe(rdf.convert(destType, options))
        // Write the output in the folder /data/{Type}
        .pipe(gulp.dest(paths.dist + rdf.Type[destType].toLowerCase()))
}


function clean() {
    return del([paths.dist + '**'])
}
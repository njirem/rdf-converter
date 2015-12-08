'use strict';

// This file is for testing purposes only

const gulp = require('gulp'),
    rename = require('gulp-rename'),
    del = require('del'),
    rdf = require('rdf-converter');

const paths = {
    dist: 'out'
}, testGraph = 'http://testGraph';

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(
        rdfConvert(rdf.Type.Json, { defaultGraphName: 'http://rdf-converter/graphName'}),
        rdfConvert(rdf.Type.NQuads),
        rdfConvert(rdf.Type.TriG),
        rdfConvert(rdf.Type.JS, { jsTemplate: 'exports.quads = ${ quadArray };'})
        )
    ))


function rdfConvert(destType) {
    return () => gulp.src('data/**/*.+(json|trig|nq)')
        // Set the extension in the name, so it can be identified in the output
        .pipe(rename(path => path.basename += '-' + path.extname.substr(1)))
        // Convert the input to the given Destination Type
        .pipe(rdf.convert(destType))
        // Write the output in the folder /data/{Type}
        .pipe(gulp.dest(paths.dist + '/data/' + rdf.Type[destType].toLowerCase()))
}


function clean() {
    return del([paths.dist + '/**'])
}
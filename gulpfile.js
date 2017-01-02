var gulp = require("gulp");
var browserify = require("browserify");
var plugins = require('gulp-load-plugins')();
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require("gulp-clean-css");
var buffer = require('vinyl-buffer');
var paths = {
    pages: ['src/*.html']
    , css: 'src/css/*.css'
};
var gutil = require("gulp-util");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
const tslint = require('gulp-tslint');
//watchify
var watchedBrowserify = watchify(browserify({
    basedir: '.'
    , debug: true
    , entries: ['main.ts']
    , cache: {}
    , packageCache: {}
}).plugin(tsify)).transform('babelify', {
    presets: ['es2015']
    , extensions: ['.ts']
});

gulp.task("copy-html", function () {
    return gulp.src(paths.pages).pipe(gulp.dest("build"));
});

gulp.task("minify-css", function () {
    return gulp.src(paths.css).pipe(cleanCSS()).pipe(gulp.dest('build/assets/css/'));
});

/**
 * Lint all custom TypeScript files.
 */
gulp.task('tslint', function() {
    return gulp.src("src/**/*.ts")
        .pipe(tslint({
            formatter: 'prose'
        }))
        .pipe(tslint.report());
});


/* * Copy all resources that are not TypeScript files into build directory.
 */
gulp.task("resources", function() {
    return gulp.src(["src/**/*", "!**/*.ts"])
        .pipe(gulp.dest("build"));
});

/**
 * Compile TypeScript sources and create sourcemaps in build directory.
 */
gulp.task("compile", ["tslint"], function () {
    var tsResult = gulp.src("src/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write(".", {sourceRoot: '/src'}))
        .pipe(gulp.dest("build"));
});

/**
 * Copy all resources that are not TypeScript files into build directory.
 */
gulp.task("resources", () => {
    return gulp.src(["src/**/*", "!**/*.ts"])
        .pipe(gulp.dest("build"));
});


/**
 * Copy all required libraries into build directory.
 */
gulp.task("libs", function() {
    return gulp.src([
            'core-js/client/shim.min.js',
            'systemjs/dist/system-polyfills.js',
            'systemjs/dist/system.src.js',
            'reflect-metadata/Reflect.js',
            'rxjs/**/*.js',
            'angular-in-memory-web-api/**/bundles/*.js',
            'zone.js/dist/**',
            '@angular/**/bundles/**'
        ], {cwd: "node_modules/**"}) /* Glob required here. */
        .pipe(gulp.dest("build/lib"));
});

/*
 * Build application task add the brwoserify when the setup will be good
 */
gulp.task("default", ["copy-html", 'compile', "minify-css", 'libs', 'resources']);

/*
 * Watch Task
 */
gulp.task("watch", function () {
     gulp.watch(["src/**/*.ts"], ['compile']).on('change', function (e) {
        console.log('TypeScript file ' + e.path + ' has been changed. Compiling.');
    });
    //gulp.start('browserify');
    gulp.watch(paths.css, ["minify-css"]);
    gulp.watch(paths.pages, ["copy-html"]);
});
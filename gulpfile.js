/*jslint node: true*/
'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var transform = require('vinyl-transform');
var browserify = require('browserify');


var browserified = transform(function (filename) {
  var b = browserify(filename);
  return b.bundle();
});

var config = {
  loaders: ['./dist/loader.js'],
  scripts: ['./src/app.js', './src/loader.js'],
  styles: ['./src/styles.styl'],
  templates: ['./src/index.jade'],
  dist: './dist/'
};

gulp.task('styles', function () {
  return gulp.src(config.styles)
    .pipe(plugins.plumber())
    .pipe(plugins.stylus())
    .pipe(plugins.minifyCss())
    .pipe(plugins.size({showFiles: true}))
    .pipe(gulp.dest(config.dist));
});

gulp.task('templates', function () {
  gulp.src(config.templates)
    .pipe(plugins.plumber())
    .pipe(plugins.jade())
    .pipe(plugins.inject(gulp.src(config.loaders), {
      starttag: '// inject:loaders',
      endtag: '// inject:end',
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8');
      }
    }))
    .pipe(plugins.minifyHtml())
    .pipe(plugins.size({showFiles: true}))
    .pipe(gulp.dest(config.dist));
});

gulp.task('scripts', function () {
  gulp.src(config.scripts)
    .pipe(plugins.plumber())
    .pipe(browserified)
    .pipe(plugins.uglify())
    .pipe(plugins.size({showFiles: true}))
    .pipe(gulp.dest(config.dist));
});

gulp.task('build', ['scripts', 'styles', 'templates']);

gulp.task('serve', ['build'], function () {
  plugins.connect.server({
    root: config.dist
  });
});


gulp.task('default', ['serve']);


gulp.task('jslint', function () {
  return gulp.src(['./src/**/*.js', 'gulpfile.js'])
    .pipe(plugins.plumber())
    .pipe(plugins.jslintSimple.run({
      indent: 2
    }))
    .pipe(plugins.jslintSimple.report({
      reporter: require('jshint-stylish').reporter
    }));
});

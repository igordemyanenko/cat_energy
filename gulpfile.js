'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var del = require('del');
var htmlmin = require('gulp-htmlmin');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minify = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var webp = require('gulp-webp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var server = require('browser-sync').create();
var run = require('run-sequence');

gulp.task('clean', function () {
  return del('build');
});

gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/js/lib/**'
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'));
});

gulp.task('htmlmin', function () {
  return gulp.src('source/*.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('build'));
})

gulp.task('style', function () {
  gulp.src('source/less/style.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('sprite', function () {
  return gulp.src('source/img/vector/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('images', function () {
  return gulp.src('source/img/raster/*.{png,jpg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
    ]))
    .pipe(gulp.dest('build/img/raster'));
});

gulp.task('webp', function () {
  return gulp.src('source/img/raster/*.{png,jpg}')
    .pipe(webp({quality: 80}))
    .pipe(gulp.dest('build/img/webp'));
});

gulp.task('script', function () {
  return gulp.src('source/js/*.js')
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('serve', function() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/less/**/*.less', ['style']);
  gulp.watch('source/*.html', ['htmlmin']).on('change', server.reload);
});

gulp.task('build', function () {
  run('clean', 'copy', 'htmlmin', 'style', 'sprite', 'images', 'webp', 'script');
});

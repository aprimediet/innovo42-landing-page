const devBuild = (process.env.NODE_ENV !== 'production'),
      fs = require('fs'),
      src = './src',
      xsrc = './xsrc',
      dist = './dist',
      xdist = './xdist',
      gulp = require('gulp'),
      data = require('gulp-data'),
      noop = require('gulp-noop'),
      newer = require('gulp-newer'),
      imagemin = require('gulp-imagemin'),
      htmlClean = require('gulp-htmlclean'),
      prettyHtml = require('gulp-pretty-html'),
      sourcemaps = devBuild ? require('gulp-sourcemaps') : null,
      pug = require('gulp-pug'),
      sass = require('gulp-sass'),
      postcss = require('gulp-postcss'),
      assets = require('postcss-assets'),
      autoprefixer = require('autoprefixer'),
      mqpacker = require('css-mqpacker'),
      cssnano = require('cssnano')
      browserSync = require('browser-sync').create(),
      del = require('del')

function clean () {
  return del([
    '${dist}/**/*.html',
    '${dist}/**/*.css',
    '${dist/images/*}'
  ])
}

function xClean () {
  return del([
    `${xdist}/**/*.html`,
    `${xdist}/**/*.css`,
    `${xdist}/images/*`
  ])
}

function images () {
  return gulp
    .src(`${src}/images/**/*`)
    .pipe(newer(`${dist}/images/`))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(`${dist}/images/`))
}

function xImages () {
  return gulp
    .src(`${src}/images/**/*`)
    .pipe(newer(`${xdist}/images/`))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(`${xdist}/images/`))
}

function html () {
  return gulp
    .src(`${src}/pages/**/*.pug`)
    .pipe(newer(dist))
    .pipe(data(() => {
      return JSON.parse(fs.readFileSync(`${src}/data/main.json`))
    }))
    .pipe(pug())
    .pipe(devBuild ? prettyHtml() : htmlClean())
    .pipe(gulp.dest(dist))
}

function xHtml () {
  return gulp
    .src(`${xsrc}/pages/**/*.pug`)
    .pipe(newer(xdist))
    .pipe(data(() => {
      return JSON.parse(fs.readFileSync(`${src}/data/main.json`))
    }))
    .pipe(pug())
    .pipe(devBuild ? prettyHtml() : htmlClean())
    .pipe(gulp.dest(xdist))
}

function sharedHtml () {
  return gulp
    .src(`${src}/shared/**/*.pug`)
    .pipe(newer(dist))
    .pipe(data(() => {
      return JSON.parse(fs.readFileSync(`${src}/data/main.json`))
    }))
    .pipe(pug())
    .pipe(prettyHtml())
    .pipe(gulp.dest(`${dist}/shared`))
}

function css () {
  return gulp
    .src(`${src}/scss/main.scss`)
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: '/images/',
      precision: 3,
      errLogToConsole: true
    }))
    .on('error', sass.logError)
    .pipe(postcss([
      assets({ loadPaths: ['images/']}),
      autoprefixer({ overrideBrowserslist: ['last 2 versions', '> 2%']}),
      mqpacker,
      cssnano
    ]))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(gulp.dest(`${dist}`))
}

function xCss () {
  return gulp
    .src(`${xsrc}/scss/main.scss`)
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: '/images/',
      precision: 3,
      errLogToConsole: true
    }))
    .on('error', sass.logError)
    .pipe(postcss([
      assets({ loadPaths: ['images/']}),
      autoprefixer({ overrideBrowserslist: ['last 2 versions', '> 2%']}),
      mqpacker,
      cssnano
    ]))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(gulp.dest(`${xdist}`))
}

function watch (done) {
  gulp.watch(`${src}/data/**/*.json`, gulp.parallel(html, sharedHtml))
  gulp.watch('**/*.pug', gulp.parallel(html, sharedHtml))
  gulp.watch('**/*.scss', css)

  done()
}

function xWatch (done) {
  gulp.watch(`${src}/data/**/*.json`, xHtml)
  gulp.watch(`${xsrc}/**/*.pug`, xHtml)
  gulp.watch(`${xsrc}/**/*.scss`, xCss)

  done()
}

function runBrowser () {
  browserSync.init({
    server: {
      baseDir: dist,
    },
  })

  gulp.watch(`${dist}/**/*`).on('change', browserSync.reload)
}

function xRunBrowser () {
  browserSync.init({
    server: {
      baseDir: xdist,
    },
  })

  gulp.watch(`${xdist}/**/*`).on('change', browserSync.reload)
}

exports.images = images
exports.html = gulp.series(images, html, sharedHtml)
exports.css = gulp.series(images, css)
exports.build = gulp.series(clean, exports.html, exports.css)
exports.watch = watch

exports.xImages = xImages
exports.xHtml = gulp.series(xImages, xHtml)
exports.xCss = gulp.series(xImages, xCss)
exports.xBuild = gulp.series(xClean, exports.xHtml, exports.xCss)
exports.xWatch = xWatch

exports.default = gulp.series(exports.xBuild, exports.xWatch, xRunBrowser)

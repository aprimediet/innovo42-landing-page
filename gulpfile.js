const devBuild = (process.env.NODE_ENV !== 'production'),
      src = './src',
      dist = './dist',
      gulp = require('gulp'),
      noop = require('gulp-noop'),
      newer = require('gulp-newer'),
      imagemin = require('gulp-imagemin'),
      htmlclean = require('gulp-htmlclean'),
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

function images () {
  return gulp
    .src(`${src}/images/**/*`)
    .pipe(newer(`${dist}/images/`))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(`${dist}/images/`))
}

function html () {
  return gulp
    .src(`${src}/pages/**/*.pug`)
    .pipe(newer(dist))
    .pipe(pug())
    .pipe(devBuild ? prettyHtml() : htmlClean())
    .pipe(gulp.dest(dist))
}

function sharedHtml () {
  return gulp
    .src(`${src}/shared/**/*.pug`)
    .pipe(newer(dist))
    .pipe(pug())
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

function watch (done) {
  gulp.watch('**/*.pug', html)
  gulp.watch('**/*.scss', css)

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

exports.images = images
exports.html = gulp.series(images, html, sharedHtml)
exports.css = gulp.series(images, css)
exports.build = gulp.series(clean, exports.html, exports.css)
exports.watch = watch
exports.default = gulp.series(exports.build, runBrowser, exports.watch)

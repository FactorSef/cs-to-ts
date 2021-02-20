const gulp = require('gulp');
const ts = require('gulp-typescript');
const terser = require('gulp-terser');
const clean = require('gulp-clean');

gulp.task('clean', function() {
    return gulp.src('dist', {read: false})
        .pipe(clean())
})

gulp.task('build-lib', function () {
    const tsProject = ts.createProject('tsconfig.json', { module: 'ES2015', moduleResolution: 'node' });

    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist/lib'));
});

gulp.task('build-es', function () {
    const tsProject = ts.createProject('tsconfig.json');

    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist/es'));
});

gulp.task('compress-es', function () {
    return gulp.src('dist/es/**/*.js')
        .pipe(terser())
        .pipe(gulp.dest('dist/es'));
})

gulp.task('build', gulp.series(['clean', gulp.parallel(['build-lib', 'build-es']), 'compress-es']))
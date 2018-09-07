var gulp = require("gulp");
var concat = require("gulp-concat");
var htmlreplace = require("gulp-html-replace");
var closureCompiler = require("google-closure-compiler").gulp();
const zip = require("gulp-zip");

var sourceFiles =
[
    // Game
    "./src/math.js",
    "./src/particle.js",
    "./src/player.js",
    "./src/coin.js",
    "./src/wall.js",
    "./src/level.js",

    // Levels
    "./src/l_01.js",
    "./src/l_02.js",
    "./src/l_03.js",
    "./src/l_04.js",
    "./src/l_05.js",
    "./src/l_06.js",
    "./src/l_07.js",
    "./src/l_08.js",
    "./src/l_09.js",
    "./src/l_10.js",
    "./src/l_11.js",
    "./src/l_12.js",
    "./src/l_13.js",
    "./src/l_14.js",
    "./src/l_15.js",
    "./src/l_16.js",
    "./src/l_17.js",
    "./src/l_18.js",
    "./src/l_19.js",
    "./src/l_20.js",

    // Engine
    "./src/aw.js",

    // Entry point
    "./src/main.js",
];

var outputFiles =
[
    "./build/index.html",
    "./build/concat.min.js"
]

gulp.task("build", ["zip"], () =>
{
});

gulp.task("zip", ["minify_js"], () =>
    gulp.src(outputFiles)
        .pipe(zip("CommsOffline.zip"))
        .pipe(gulp.dest("./build/"))
);

gulp.task("minify_js", ["build_js", "build_html"], () =>
{
    return gulp.src("./build/concat.js")
        .pipe(closureCompiler(
            {
                compilation_level: "ADVANCED",
                warning_level: "QUIET",
                language_in: "ECMASCRIPT6_STRICT",
                language_out: "ECMASCRIPT5_STRICT",
                /*output_wrapper: "(function(){\n%output%\n}).call(this)",*/
                js_output_file: "concat.min.js"
            }))
        .pipe(gulp.dest("./build/"));
});

gulp.task("build_js", () =>
{
	return gulp.src(sourceFiles)
            .pipe(concat("concat.js"))
            .pipe(gulp.dest("./build/"));
});

gulp.task("build_html", () =>
{
    gulp.src("index.html")
        .pipe(htmlreplace({ "js": "concat.min.js" }))
        .pipe(gulp.dest("./build/"));
});
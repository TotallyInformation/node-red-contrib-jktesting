/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable jsdoc/newline-after-description, jsdoc/require-param */

/**
 * https://semaphoreci.com/community/tutorials/getting-started-with-gulp-js
 * https://gulpjs.com/plugins/
 * https://gulpjs.com/docs/en/api/concepts/
 * Plugins
 *  https://www.npmjs.com/package/gulp-include - source file inline replacements
 *  https://www.npmjs.com/package/gulp-uglify  - Minify
 *  https://www.npmjs.com/package/gulp-rename  - Rename source filename on output
 *  https://www.npmjs.com/package/gulp-once    - Only do things if files have changed
 *  https://www.npmjs.com/package/gulp-replace - String replacer
 *  https://www.npmjs.com/package/gulp-debug
 * 
 *  https://www.npmjs.com/package/gulp-concat
 *  https://www.npmjs.com/package/gulp-sourcemaps
 *  https://www.npmjs.com/package/gulp-prompt  - get input from user
 *  https://www.npmjs.com/package/gulp-if-else
 *  https://www.npmjs.com/package/gulp-minify-inline
 *  https://www.npmjs.com/package/gulp-tap - Easily tap into a pipeline. Could replace gulp-replace
 *  https://www.npmjs.com/package/webpack-stream - Use WebPack with gulp
 *  https://www.npmjs.com/package/tinyify - runs various optimizations
 * 
 *  ❌https://www.npmjs.com/package/gulp-changed - Does not work as expected
 */

'use strict'

//const { src, dest, series, watch, /* parallel, */ } = require('gulp')
// const uglify = require('gulp-uglify')
// const rename = require('gulp-rename')
// const include = require('gulp-include')
// const once = require('gulp-once')
//const prompt = require('gulp-prompt')
// const replace = require('gulp-replace')
// const debug = require('gulp-debug')
const execa = require('execa')
const fs = require('fs')
//const { promisify } = require('util')
//const dotenv = require('dotenv')

// const nodeDest = 'nodes'

// print output of commands into the terminal
const stdio = 'inherit'

const { version } = JSON.parse(fs.readFileSync('package.json'))

// What release/version do we want to end up with?
const release = '0.4.0'

console.log(`Current Version: ${version}. Requested Version: ${release}`)

/** 
 * TODO
 *  - Add text replace to ensure 2021 in (c) blocks is current year
 */

/** Combine the parts of uibuilder.html */
// function combineHtml(cb) {
//     src('src/editor/main.html')
//         .pipe(include())
//         .pipe(once())
//         .pipe(rename('uibuilder.html'))
//         .pipe(dest(nodeDest))

//     cb()
// }

/** Watch for changes during development of uibuilderfe & editor */
// function watchme(cb) {
//     // Re-combine uibuilder.html if the source changes
//     watch('src/editor/*', combineHtml)

//     cb()
// }

/** Set uibuilder version in package.json */
async function setPackageVersion() {
    if (version !== release) {
        // bump version without committing and tagging: npm version 4.2.1 --no-git-tag-version --allow-same-version
        await execa('npm', ['version', release, '--no-git-tag-version'], {stdio})
    } else {
        console.log('Requested version is same as current version - nothing will change')
    }
}

/** Create a new GitHub tag for a release (only if release ver # different to last committed tag) */
async function createTag(cb) {
    //Get the last committed tag: git describe --tags --abbrev=0
    const lastTag = (await execa('git', ['describe', '--tags', '--abbrev=0'])).stdout
    console.log(`Last committed tag: ${lastTag}`)

    // If the last committed tag is different to the required release ...
    if ( lastTag.replace('v','') !== release ) {
        //const commitMsg = `chore: release ${release}`
        //await execa('git', ['add', '.'], { stdio })
        //await execa('git', ['commit', '--message', commitMsg], { stdio })
        await execa('git', ['tag', `v${release}`], { stdio })
        await execa('git', ['push', '--follow-tags'], { stdio })
        await execa('git', ['push', 'origin', '--tags'], { stdio })
    } else {
        console.log('Requested release version is same as the latest tag - not creating tag')
    }
    cb()
}


//exports.default     = series( packfe, combineHtml ) // series(runLinter,parallel(generateCSS,generateHTML),runTests)
// exports.watch       = watchme
// exports.combineHtml = combineHtml
exports.createTag   = createTag
exports.setVersion  = setPackageVersion //series( setPackageVersion, setFeVersion, setFeVersionMin )

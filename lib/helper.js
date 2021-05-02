'use strict';

/**
 * @param {String} text Text to specify about the process running.
 * [Default: 'Progress Percentage']
 * @param {Number} percentage Process completed in percentage.
 * [Default: 0]
*/
exports.progressLog = (text = 'Progress Percentage', percentage = 0) => {
    // Will create a new line for the initiation of the bar
    if (percentage === 0) {
        process.stdout.write(`${text}: ${percentage}%`);
        return;
    }

    // Will rewrite on the same line
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${text}: ${percentage}%`);

    // Will end the line on completion
    if (percentage === 100) {
        process.stdout.write('\n');
    }
}
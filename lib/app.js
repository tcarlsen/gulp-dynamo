/*
** Author: Thomas Carlsen @tcarlsen
*/
/*jslint nomen: true*/
/*global require, console, process, theme, __dirname*/

/* 
** Dependencies - we can't live without them!
*/
var prompt = require('prompt'),
    colors = require('colors'),
    async = require('async'),
    fs = require('fs');

/*
** Greeting - lets start by greeting the user
*/
console.log('\n==================================='.cyan);
console.log('\tGulp Dynamo'.bold);
console.log('===================================\n'.cyan);

/* 
** Store  - we need a place to store the dynamic variables and file content
*/
var store = {
    theme: 'default',
    taskNames: ['watch'],
    dependencies: ['gulp'],
    fileContent: {
        tasks: [],
        watch: []
    }
};

/*
** CreateGulpFile - The dinamich content is done, now lets put it all together at save it.
*/
var createGulpFile = function () {
    'use strict';
    
    // Defining this functions variables
    var fileContent,
        shortname,
        index;
    
    // Lets merge the content
    // First we need the theme banner
    fileContent = '/**\n** This file was created, using "gulp-file-generator" by tcarlsen\n';
    fileContent += store.theme.banner;
    fileContent += '\n*/\n';
    
    // Adding globals for the sake of JSLint
    fileContent += '/*global require, console*/\n\n';
    
    // Then the dependencies
    for (index = 0; index < store.dependencies.length; index += 1) {
        // For a more pretty gulpfile we use shortnames.
        shortname = store.dependencies[index].split('-')[1];
        
        // Some dependencies can't be shorted, like "gulp" itself
        if (shortname === undefined) {
            shortname = store.dependencies[index];
        }
        
        // Now write the javascript
        fileContent += 'var ' + shortname + ' = require(\'' + store.dependencies[index] + '\');\n';
    }
    
    // We are adding an extra break for readability.
    fileContent += '\n';
    // Now for all the task content.
    fileContent += store.fileContent.tasks.join('\n\n');
    
    // FINALLY! saving the gulpfile.js!
    fs.writeFile('gulpfile.js', fileContent, function (err) {
        if (err) {
            throw err;
        }
        console.log('Your gulpfile.js has now been created!'.green);
        console.log('\tHAPPY CODING! \\o/\n'.rainbow);
    });
};

/*
** TaskGeneretor - this will generate all the  gulp.js tasks
*/
var taskGeneretor = function () {
    'use strict';
    
    // Defining this functions variables
    var task,
        content,
        themeIndex,
        watchIndex,
        pipeIndex,
        pipeShortname,
        pipeModule;
    
    // Should use livereload?
    if (store.theme.settings.global.livereload === true) {
        // Create the server task and store it for later!
        store.fileContent.tasks.push([
            'var server = lr();',
            '',
            'gulp.task(\'lr-server\', function () {',
            '\t\'use strict\';',
            '\tserver.listen(35729, function (err) {',
            '\t\tif (err) {',
            '\t\t\treturn console.log(err);',
            '\t\t}',
            '\t});',
            '});'
        ].join('\n'));
        
        // Store the new dependencies
        store.dependencies.push('gulp-livereload', 'tiny-lr');
        // Store the new task name
        store.taskNames.push('lr-server');
        // Add it to the watch store
    }
    
    // Now lets loop through the other tasks    
    for (themeIndex in store.theme.settings) {
        if (store.theme.settings.hasOwnProperty(themeIndex) && themeIndex !== 0) {
            task = store.theme.settings[themeIndex];
            
            if (task.make === true) {
                content = [
                    'gulp.task(\'' + task.name + '\', function () {',
                    '\t\'use strict\';',
                    '\tgulp.src([\'' + task.location + '/*' + task.extension + '\'])'
                ];
                
                for (pipeIndex = 0; pipeIndex < task.pipes.length; pipeIndex += 1) {
                    // For a more pretty gulpfile we use shortnames.
                    pipeShortname = task.pipes[pipeIndex].split('-')[1];
                    // Some of the pipe function will have arguments, we need to remove thise before we save to dependencies
                    pipeModule = task.pipes[pipeIndex].replace(/ *\(([\w\W]*)\) */, '');
                    
                    // Push each pipe into content    
                    content.push('\t\t.pipe(' + pipeShortname + ')');
                    
                    // Lets check if the module allready is in the dependencies store, else, add it.
                    if (store.dependencies.indexOf(pipeModule) === -1) {
                        store.dependencies.push(pipeModule);
                    }
                }
                
                // We need to define where to put the output file using gulp.dest.
                content.push('\t\t.pipe(gulp.dest(\'' + store.theme.settings.global.dist + '\'))');
                
                // If we are using livereload we need to add that as a pipe aswell
                if (store.theme.settings.global.livereload === true) {
                    content.push('\t\t.pipe(livereload(server))');
                }
                
                // The last pipe line needs an simicolen at the end and then we finish of the whole task.
                content[content.length - 1] += ';';
                content.push('});');
                
                // Store the new task and it's task name.
                store.fileContent.tasks.push(content.join('\n'));
                store.taskNames.push(task.name);
                
                // Store a watch for the watch task
                store.fileContent.watch.push('\tgulp.watch(\'' + task.location + '\', [\'' + task.name + '\']);');
            }
        }
    }
    
    // We need a watch task, so gulp can redo the tasks then files are changing.
    content = [
        'gulp.task(\'watch\', function () {',
        '\t\'use strict\';'
    ];
    
    // Taking a loop through the watches that was added.
    for (watchIndex = 0; watchIndex < store.fileContent.watch.length; watchIndex += 1) {
        // Add watch to the watch task for each watch. Wow thats not a pretty comment!
        content.push(store.fileContent.watch[watchIndex]);
    }
    
    // Finish of the watch task
    content.push('});');
    
    // Storing the wacth task
    store.fileContent.tasks.push(content.join('\n'));
    
    // Finally we need the default task that gulp is looking for. This will tell gulp wich task to run on startup.
    store.fileContent.tasks.push('gulp.task(\'default\', [\'' + store.taskNames.join('\', \'') + '\']);');
    
    // Handle the rest of the work to createGulpFile
    createGulpFile();
};

/*
** ThemeModyfier - store the user feedback
*/
var themeModyfier = function () {
    'use strict';
    
    // Defining this functions variables
    var promptIndex,
        taskPrompt,
        asyncArray = [],
        asynctArrayCount = 0;
    
    // Starting up the prompt machine.
    prompt.message = "Question".green.bold;
    prompt.start();
    
    // Taking a loop through the prompts
    for (promptIndex in store.theme.prompts) {
        if (store.theme.prompts.hasOwnProperty(promptIndex)) {
            taskPrompt = store.theme.prompts[promptIndex];
            
            // Do the user have the option to jump over the task prompts?
            if (taskPrompt.optional === true) {
                // Adding a make question in front of the prompts so we can ask if the user even want this task
                asyncArray.push({
                    task: promptIndex,
                    prompts: {
                        'name': 'make',
                        'description': 'Do you want me to make a ' + promptIndex + ' task?',
                        'type': 'string',
                        'default': 'yes'
                    }
                });
            }
            
            // Adding the prompts to the prompt array
            asyncArray.push({
                name: promptIndex,
                prompts: taskPrompt.prompts
            });
        }
    }
    
    // Using async to make sure we can handle one question at the time
    async.eachSeries(asyncArray, function (item, callback) {
        asynctArrayCount += 1;
        
        prompt.get(item.prompts, function (err, result) {
            var feedbackKey;
            
            // Was this a make request?
            if (result.make) {
                // Do the user want this task?
                if (result.make === 'yes' || result.make === 'y') {
                    // User wants it! next prompt please...
                    callback();
                } else {
                    // Nope, no like task, lets remove the task related questions then.
                    asyncArray.splice(asynctArrayCount, 1);
                    
                    // We have to store that the user did't want this task
                    store.theme.settings[item.task].make = false;
                    
                    // Next prompt please...
                    callback();
                }
            } else {
                // Save the user feedback to the store
                for (feedbackKey in result) {
                    if (result.hasOwnProperty(feedbackKey)) {
                        store.theme.settings[item.name][feedbackKey] = result[feedbackKey];
                    }
                }
                
                // Im ready for the next prompt now.
                callback();
            }
        });
    }, function () {
        // Run the TaskGeneretor with the updated settings.
        taskGeneretor();
    });
};

/* 
** Arguments  - did the user tell us to do something speciel?
*/
var userArguments = {
    theme: process.argv[2],
    option: process.argv[3]
};

// Using async to be sure that every argument is handled one by one
async.series({
    theme: function (callback) {
        'use strict';
        
        // Did the user make a theme request?
        if (userArguments.theme !== undefined) {
            // Maybe the user just entered an option
            if (userArguments.theme.substring(0, 1) === '-') {
                userArguments.option = process.argv[2];
                
                // Lets tell async that we are ready for the next stage
                callback();
            } else {
                fs.exists(__dirname + '/themes/' + userArguments.theme + '.js', function (exists) {
                    // Does the theme requested even exists?
                    if (!exists) {
                        console.log('ERROR: '.red.bold + 'Where\'s no theme with that name!\n'.red);
                    } else {
                        // Lets tell async that we are ready for the next stage
                        callback();
                    }
                });
            }
        } else {
            // Lets tell async that we are ready for the next stage
            callback();
        }
    },
    option: function (callback) {
        'use strict';
        
        // Getting the theme settings and prompts,
        store.theme = require('./themes/' + store.theme);
        
        // Did the user add a option argument?
        if (userArguments.option !== undefined) {
            // Check if the user whats to modify the selected theme.
            if (userArguments.option === '-m') {
                console.log('INFO: '.blue.bold + 'Lets modify this theme so it macthes you!\n'.blue);
                
                // Run the ThemeModyfier.
                themeModyfier();
            } else {
                console.log('ERROR: '.red.bold + 'Don\'t know what you want from me?!\n'.red);
            }
        } else {
            // Run the TaskGeneretor.
            taskGeneretor();
        }
    }
});

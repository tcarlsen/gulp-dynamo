/*
** themeAuthor: Thomas Carlsen @tcarlsen
** themeName: default
*/
/*jslint es5: true */
/*global module*/


var theme = {
    /*
    ** Banner: This text will be added at the top of the gulp file.
    */
    banner: '** default theme by tcarlsen',
    
    /*
    ** Settings: This themes defaults
    */
    settings: {
        global: {
            name: 'global',
            dist: 'build',
            livereload: true
        },
        css: {
            name: 'css',
            make: true,
            location: 'styles',
            extension: '.css',
            pipes: ['gulp-concat(\'styles.min.css\')', 'gulp-styl()', 'gulp-csso()']
        },
        javascript: {
            name: 'javascript',
            make: true,
            location: 'scripts',
            extension: '.js',
            pipes: ['gulp-concat(\'scripts.min.css\')', 'gulp-uglify()']
        }
    },
    
    /*
    ** Prompts: What shall the user be able to change from the console via prompts?
    */
    prompts: {
        global: {
            optional: false,
            prompts: [
                {
                    name: 'dist',
                    description: 'Where to save the modified files?',
                    type: 'string',
                    default: 'build'
                },
                {
                    name: 'livereload',
                    description: 'Do you want to use livereload?',
                    type: 'string',
                    default: 'yes',
                    before: function (value) {
                        'use strict';
                        
                        if (value === 'yes' || value === 'y') {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            ]
        },
        css: {
            optional: true,
            prompts: [
                {
                    name: 'location',
                    description: 'Where\'s your css located?',
                    type: 'string',
                    default: 'styles'
                },
                {
                    name: 'pipes',
                    description: 'Which task do you like us to run on you css?',
                    type: 'string',
                    default: 'gulp-concat(\'styles.min.css\'), gulp-styl(), gulp-csso()',
                    before: function (value) {
                        'use strict';
                        
                        return value.replace(/ /g, '').split(',');
                    }
                }
            ]
        },
        javascript: {
            optional: true,
            prompts: [
                {
                    name: 'location',
                    description: 'Where\'s your js located?',
                    type: 'string',
                    default: 'scripts'
                },
                {
                    name: 'pipes',
                    description: 'Which task do you like us to run on you javascript?',
                    type: 'string',
                    default: 'gulp-concat(\'scripts.min.css\'), gulp-uglify()',
                    before: function (value) {
                        'use strict';
                        
                        return value.replace(/ /g, '').split(',');
                    }
                }
            ]
        }
    }
};
    
module.exports = theme;
/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        // Banner license
        banner: '/*! <%= pkg.project %> - Build v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n' +
            'Author: <%= pkg.author.name %> (<%= pkg.author.url %>) */\n',

        // Pkg.name as filename
        filename: '<%= pkg.name %>',

        // Karma (test runner)
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: true
            }
        },

        // Task configuration.

        // Copy Bower packages
        bowercopy: {
            // JS
            js: {
                options: {
                    destPrefix: 'application/js/libs'
                },
                files: {
                    'angular.min.js': 'angular/angular.min.js',
                    'angular-animate.min.js': 'angular-animate/angular-animate.min.js',
                    'angular-resource.min.js': 'angular-resource/angular-resource.min.js',
                    'angular-route.min.js': 'angular-route/angular-route.min.js',
                    'angular-strap.min.js': 'angular-strap/dist/angular-strap.min.js',
                    'angular-touch.min.js': 'angular-touch/angular-touch.min.js'
                }
            },
            scss: {
                options: {
                    destPrefix: 'application/scss'
                },
                files: {
                    'bootstrap.css': 'bootstrap/dist/css/bootstrap.css'
//                    'font-awesome.css': 'components-font-awesome/scss/font-awesome.scss'
                }
            },
            folders: {
                files: {
                    'application/fonts': ['components-font-awesome/fonts', 'bootstrap/fonts'],
                    'application/scss/font-awesome': 'components-font-awesome/scss'
                }
            }
        },

        concat: {
          options: {
            banner: '<%= banner %>',
            stripBanners: true,
            separator: ';\n'
          },
          build: {
            src: [
//                '<%= pkg.componentDir %>/jquery/dist/jquery.min.js',
//                '<%= pkg.componentDir %>/dist/js/bootstrap.min.js',
                // TODO: only include these if hotel
//                'application/js/libraries/jquery.sticky.js',
//                'application/js/libraries/jquery.swipebox.js',
//                'application/js/libraries/TweenMax.min.js',

//                'application/js/libraries/angulartics.min.js',
//                'application/js/libraries/angulartics-google-analytics.min.js',
//                'application/js/libraries/ui-bootstrap-custom-0.7.0.js',
//                'application/js/libraries/modernizr.custom.js',
                'application/js/libs/angular.min.js',
                'application/js/libs/angular-*.min.js',
                'application/js/libs/angulardir-*.js',
                'application/js/main.js',
                'application/js/services.js',
                'application/js/controllers/base/*.js',
                'application/js/dependencyproviders.js',
                'application/js/directives/*.js',
                'application/js/filters.js',
                'application/js/configs.js'
            ],
            dest: 'builds/dev/assets/js/<%= filename %>.js'
          }
        },

        // Strip
        strip: {
            main : {
                src : '<%= concat.build.dest %>',
                dest : 'builds/release/assets/js/<%= filename %>.js',
                options: {
                    nodes: ['console.log', 'console.time', 'console.timeEnd']
                }
            }
        },

        // Uglify
        uglify: {
            options: {
                mangle: true,
                compress: true,
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= strip.main.dest %>',
                dest: '<%= strip.main.dest %>'
            }
        },

        // JShint (linter)
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                //unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                devel: true,
                jquery: true,
                es5: true,
                globals: {
                    modernizr: true,
                    angular: true,
                    Base64: true,
                    google: true,
                    ga: true,
                    TweenMax: true,
                    TypeAheadArray: true,
                    SnapEngage: true,
                    OBI: true,
                    // jqLite addons
                    jqLite: true,
                    camelCase: true,
                    isDefined: true
                }
            },
            gruntfile: {src: 'Gruntfile.js'},
            lib_test: {src: ['application/js/*.js', 'application/js/directives/*.js']}
        },

        // HTML template variables
        template: {
            dev: {
                options: {
                    data: {
                        assetPath: 'assets/',
                        pageTitle: 'OpenBook'
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'application/',
                    src: ['*.tpl.html', 'templates/**/*.tpl.html'],
                    dest: 'builds/dev/',
                    ext: '.html'
                }]
            },

            release: {
                options: {
                    data: {
                        assetPath: 'assets/',
                        pageTitle: 'OpenBook'
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'application/',
                    src: ['*.tpl.html', 'templates/**/*.tpl.html'],
                    dest: 'builds/release/',
                    ext: '.html'
                }]
            }
        },

        // Copy assets outside of bower
        copy: {
            dev: {
                files: [
                    {expand: true, cwd: 'application/', src: ['img/**', 'fonts/**'], dest: 'builds/dev/assets/'},
                    {expand: true, cwd: 'application/', src: ['scss/img/**'], dest: 'builds/dev/assets/css/img/', flatten: true},
//                    {expand: true, cwd: 'application/', src: ['scss/fonts/**'], dest: 'builds/dev/assets/css/fonts/', flatten: true},
                    {expand: true, cwd: 'application/', src: ['themes/<%= pkg.channel %>/images/**'], dest: 'builds/dev/assets/css/img/', flatten: true},
                    {expand: true, cwd: 'application/', src: ['ajax_mocks/**'], dest: 'builds/dev/'}
                ]
            },
            release: {
                files: [
                    {expand: true, cwd: 'application/', src: ['img/**', 'fonts/**'], dest: 'builds/release/assets/'},
//                    {expand: true, cwd: 'application/', src: ['img/**'], dest: 'builds/release/assets/'},
                    {expand: true, cwd: 'application/', src: ['scss/img/**'], dest: 'builds/release/assets/css/img/', flatten: true},
//                    {expand: true, cwd: 'application/', src: ['scss/fonts/**'], dest: 'builds/dev/assets/css/fonts/', flatten: true},
                    {expand: true, cwd: 'application/', src: ['ajax_mocks/**'], dest: 'builds/release/'}
                ]
            }
        },

        // Sassy stylesheets
        sass: {
          dev: {
            options: {
              style: 'expanded',
              debugInfo: false
            },
            files: {
              'builds/dev/assets/css/<%= filename %>.css': 'application/scss/manifest.scss',
              'builds/dev/assets/css/<%= filename %>_<%= pkg.channel %>.css': 'application/themes/<%= pkg.channel %>/style.scss'
            }
          },
          release: {
            options: {
              style: 'compressed'
            },
            files: {
              'builds/release/assets/css/<%= filename %>.css': 'application/scss/manifest.scss',
              'builds/release/assets/css/<%= filename %>_<%= pkg.channel %>.css': 'application/themes/<%= pkg.channel %>/style.scss'
            }
          }
        },

        // Watch tasks
        watch: {
          gruntfile: {
            files: '<%= jshint.gruntfile.src %>',
            tasks: ['jshint:gruntfile']
          },
          lib_test: {
            files: '<%= jshint.lib_test.src %>',
            tasks: ['jshint', 'concat']
          },
          sassy_pants: {
            files: 'application/scss/**/*.scss',
            tasks: ['sass:dev']
          },
          markup: {
              files: ['application/*.tpl.html', 'application/templates/**/*.tpl.html'],
              tasks: ['template:dev']
          },
          ajax_mocks: {
              files: ['application/ajax_mocks/*'],
              tasks: ['copy:dev']
          },
          image_assets: {
              files: ['application/img/*'],
              tasks: ['copy:dev']
          }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-bump');

    // Tasks
    grunt.registerTask('default', ['jshint', 'concat', 'sass:dev', 'template:dev', 'copy:dev']);
    grunt.registerTask('release', ['bowercopy','jshint', 'concat', 'strip', 'uglify', 'sass:release', 'template:release', 'copy:release', 'bump']);

};
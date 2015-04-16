module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ["dist/"],
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'js/vendor/*.js',
          'js/global.js',
          'js/widget.js',
          'js/widget.tracking.js',
          'js/widget.search.js',
          'js/widget.layout.js',
          'js/widget.ui.js',
          'js/widget.util.js',
          'js/widget.chart.js',
          'js/widget.format.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    concat_css: {
      options: {
      },
      all: {
        src: [
          'css/normalize.css',
          'css/popup.css',
          'css/nvd3-1.7.1.min.css',
          'css/widget.base.css',
          'css/widget.ui.css',
          'css/widget.chart.css',
          'css/font-awesome.min.css',
          'css/roboto.css',
        ],
        dest: 'dist/css/<%= pkg.name %>.css'
      },
    },
    copy: {
      main: {
        files: [
          { src:'package.json', dest:'dist/' },
          {expand: true, src: ['test.js'], dest: 'dist/', filter: 'isFile' },
          {expand: true, src: ['img/*'], dest: 'dist/', filter: 'isFile' },
          {expand: true, src: ['fonts/*'], dest: 'dist/', filter: 'isFile' }
        ]
      }
    },
    processhtml: {
      options: {
        process: true,
        strip: true
      },
      dist: {
        files: {
          'dist/index.html': ['index.html'],
          'dist/chartDemo.html': ['chartDemo.html'],
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'js/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    compress: {
      main: {
        options: {
          mode: 'tgz',
          archive: 'deploy/<%= pkg.name %>-<%= pkg.version %>.tar.gz'
        },
        expand: true,
        cwd: 'dist/',
        src: ['**/*']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-concat-css');

  grunt.registerTask('default', ['compile']);
  grunt.registerTask('compile', ['clean','jshint', 'concat', 'concat_css', 'copy', 'processhtml']);
  grunt.registerTask('dist', ['compile', 'uglify', 'compress']);
};

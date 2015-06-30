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
          'js/global.js',
          'js/widget.js',
          'js/widget.tracking.js',
          'js/widget.search.js',
          'js/widget.layout.js',
          'js/widget.parser.js',
          'js/widget.ui.js',
          'js/widget.util.js',
          'js/widget.chart.js',
          'js/widget.format.js',
          'js/parser/stack.js',
          'js/parser/inlineFunction.js',
          'js/parser/localize.js',
          'js/charts/bar.js',
          'js/charts/donut.js',
          'js/charts/gauge.js',
          'js/charts/horizontalBar.js',
          'js/charts/interactiveSparkline.js',
          'js/charts/line.js',
          'js/charts/pie.js',
          'js/charts/progressGauge.js',
          'js/charts/readout.js',
          'js/charts/sparkline.js',
          'js/layout/button.js',
          'js/layout/chart.js',
          'js/layout/checkBox.js',
          'js/layout/content.js',
          'js/layout/error.js',
          'js/layout/icon.js',
          'js/layout/iframe.js',
          'js/layout/image.js',
          'js/layout/inputField.js',
          'js/layout/label.js',
          'js/layout/list.js',
          'js/layout/menu.js',
          'js/layout/namedPanel.js',
          'js/layout/renderer.js',
          'js/layout/selector.js',
          'js/layout/tab.js',
          'js/layout/tabGroup.js',
          'js/layout/table.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      },
      all: {
        src: [
          'js/vendor/*.js',
          'dist/<%= pkg.name %>.js'
        ],
        dest: 'dist/<%= pkg.name %>_all.js'
      }
    },
    concat_css: {
      options: {
      },
      dist: {
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
          {expand: true, src: ['test.*'], dest: 'dist/', filter: 'isFile' },
          {expand: true, src: ['img/*'], dest: 'dist/', filter: 'isFile' },
          {expand: true, src: ['fonts/*'], dest: 'dist/', filter: 'isFile' },
          {expand: true, src: ['js/vendor/*'], dest: 'dist/', filter: 'isFile' }
        ]
      }
    },
    processhtml: {
      dist: {
        options: {
          process: true,
          strip: true
        },
        files: {
          'dist/index.html': ['index.html']
        }
      },
      doc: {
        options: {
          process: true,
          strip: true
        },
        files: {
          'dist/documentation.html': ['documentation.html']
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
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
  grunt.registerTask('compile', ['clean','jshint', 'concat', 'concat_css', 'copy', 'processhtml:dist', 'concat:all']);
  grunt.registerTask('dist', ['compile', 'uglify', 'compress']);
};

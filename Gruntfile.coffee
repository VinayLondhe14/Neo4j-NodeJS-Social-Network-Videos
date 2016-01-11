module.exports = (grunt) ->

  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-contrib-coffee")
  grunt.loadNpmTasks("grunt-contrib-sass")
  grunt.loadNpmTasks("grunt-hash");

  # Initialize the configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    sass:
      dist:
        options:
          style: "compressed"
          sourcemap: true
        files: [
          "public/stylesheets/style.css": "public/stylesheets/style.scss"
        ]
    coffee:
      compile:
        expend: true
        flatten: true
        files: {
          "public/javascripts/main.js": "public/javascripts/main.coffee"
        }

    watch:
      coffee:
        files: [
          "public/javascripts/main.coffee"
        ]
        tasks: ["coffee:compile"]
      sass:
        files: [
          "public/stylesheets/style.scss"
        ]
        tasks: ["sass"]
 
  grunt.registerTask "default", ["watch"]
      

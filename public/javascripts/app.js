(function() {
  var app;

  app = angular.module("Jaja", ["ngRoute"]);

  app.directive("newPost", function() {
    return {
      restrict: "A",
      replace: true,
      controller: "PostsController",
      templateUrl: "/templates/posts/post.html"
    };
  });

  app.directive("postsIndex", [
    "Post", function(Post) {
      return {
        restrict: "A",
        replace: true,
        controller: "PostsController",
        templateUrl: "/templates/posts/index.html",
        link: function($scope) {
          $scope.posts = [];
          return Post.userPosts().then(function(data) {
            var d, i, len, ref;
            ref = data.data.postsData;
            for (i = 0, len = ref.length; i < len; i++) {
              d = ref[i];
              $scope.posts.push(d.p.properties);
            }
            if (data.data.postsData.length > 0) {
              return $scope.user = data.data.postsData[0].u.properties;
            }
          });
        }
      };
    }
  ]);

  app.service("Post", [
    "$http", function($http) {
      var create, userPosts;
      create = function(newPost) {
        var promise;
        promise = $http.post("/posts/create.json", {
          post: newPost
        }).success(function(data) {
          return data;
        });
        return promise;
      };
      userPosts = function(newPost) {
        var promise;
        promise = $http.get("/posts/user-posts.json").success(function(data) {
          return data;
        });
        return promise;
      };
      return {
        create: create,
        userPosts: userPosts
      };
    }
  ]);

  app.controller("PostsController", [
    "Post", "$scope", function(Post, $scope) {
      $scope.posts = [];
      $scope.Post = {
        body: ""
      };
      return $scope.create = function(post) {
        return Post.create(post).then(function(data) {
          var body;
          console.log(data.data);
          if (data.data.postedData) {
            body = data.data.postedData[0].p.properties.body;
            console.log(body);
            return $scope.posts.push(body);
          }
        });
      };
    }
  ]);

}).call(this);

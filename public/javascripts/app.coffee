app = angular.module("Jaja", [
  "ngRoute"
])

#
# Directives
#
app.directive("newPost", ->
  
  return {
    restrict: "A"
    replace: true
    controller: "PostsController"
    templateUrl: "/templates/posts/post.html"
  }
)


app.directive("postsIndex", ["Post", (Post) ->
  
  return {
    restrict: "A"
    replace: true
    controller: "PostsController"
    templateUrl: "/templates/posts/index.html"
    link: ($scope) ->
      $scope.posts = []
      Post.userPosts()
        .then((data) ->
          for d in data.data.postsData
            $scope.posts.push d.p.properties

          if data.data.postsData.length > 0
            $scope.user = data.data.postsData[0].u.properties
      )
  }
])


#
# Services
#
app.service("Post", ["$http", ($http) ->
  create = (newPost) ->
    promise = $http.post("/posts/create.json", {post: newPost})
      .success((data) ->
        return data
    )
    return promise

  userPosts = (newPost) ->
    promise = $http.get("/posts/user-posts.json")
      .success((data) ->
        return data
    )
    return promise

  
  return {
    create: create
    userPosts: userPosts
  }  
])

#
# Controllers
#
app.controller("PostsController", ["Post", "$scope", (Post, $scope) ->

  $scope.posts = []
  $scope.Post = {
    body: ""
  }
  
  $scope.create = (post) ->
    Post.create(post)
      .then((data) ->
        console.log data.data
        if data.data.postedData
          body = data.data.postedData[0].p.properties.body
          console.log body
          $scope.posts.push body
    )

])
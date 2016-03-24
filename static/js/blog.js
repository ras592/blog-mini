var blog = (function() {
    var posts = [];

    // cache DOM
    var $container = $('.container');
    var $feed = $('#feed');
    var $blogFormButton = $('#blogForm button');
    var $postTitle = $('#postTitle');
    var $postBody = $('#postBody');
    var $postTitleForm = $('.postTitle');
    var $postBodyForm = $('.postBody');
    var $postTitleError = $('#postTitleError');
    var $postBodyError = $('#postBodyError');
    var template = $feed.find('#postTemplate').html();

    var uploadMsg = [
        '<div class="flash alert alert-dismissible alert-success" role="alert">',
            '<strong>Successfully uploaded!</strong>',
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">',
                '<span aria-hidden="true">&times;</span>',
            '</button>',
        '</div>'
    ].join("");

    var removeMsg = [
        '<div class="flash alert alert-dismissible alert-success" role="alert">',
            '<strong>Successfully removed!</strong>',
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">',
                '<span aria-hidden="true">&times;</span>',
            '</button>',
        '</div>'
    ].join("");

    // bind events
    $blogFormButton.on('click', addToFeed);
    $feed.delegate('.removeIcon', 'click', deleteFromFeed);
    $postTitle.focus(_removePostTitleError);
    $postBody.focus(_removePostBodyError);

    _render();

    function _render() {
        $feed.html(Mustache.render(template, {posts: posts}));
    }

    function _clearInputs() {
        $postTitle.val('');
        $postBody.val('');
    }

    function _removePostTitleError() {
        $postTitleError.hide();
    }

    function _removePostBodyError() {
        $postBodyError.hide();
    }

    function _addToPosts(postId, postTitle, postBody) {
        posts.push({"postId": postId, "postTitle": postTitle, "postBody": postBody});
        _render();
    }

    function init() {
        // make request for JSON
        /*var tempObj1 = {"postId": "1234", "postTitle": "Hello", "postBody": "World!"};
        var tempObj2 = {"postId": "1235", "postTitle": "Another Hello", "postBody": "<i>World!</i>"};
        _addToPosts(tempObj1.postId, tempObj1.postTitle, tempObj1.postBody);
        _addToPosts(tempObj2.postId, tempObj2.postTitle, tempObj2.postBody);*/
        var url = "./post",
            args = {},
            callback = function (resp) {
                console.log(resp);
                resp = $.parseJSON(resp);
                resp = resp.posts;
                resp.forEach( function(post) {
                    _addToPosts(post.postId, post.postTitle, post.postBody);
                });
            };
        $.get(url, args, callback);
    }

    function addToFeed(value) {
        var post;
        var errors = [];
        if(value.hasOwnProperty("postTitle") && value.hasOwnProperty("postBody")) {
                console.log("Executing inside value passed to API");
                post = {"postTitle": value.postTitle, "postBody": value.postBody};
        } else {
            console.log("Executing inside value in form.");
            post = {
                "postTitle": $.trim($postTitle.val()),
                "postBody": $.trim($postBody.val())
            };
        }

        if(post.postTitle.length === 0) {
            // title wasn't given
            $postTitleError.show();
            errors.push('No title');
        }

        if(post.postBody.length === 0) {
            // body wasn't given
            $postBodyError.show();
            errors.push('No body');
        }

        console.log(errors.length);

        if(errors.length === 0) {
            console.log("Cleared errors");
            var url = "./post",
                args = {
                    "postTitle": post.postTitle,
                    "postBody": post.postBody
                },
                callback = function (resp) {
                    console.log(resp);
                    $container.prepend(uploadMsg);
                    resp = $.parseJSON(resp);
                    resp = resp.post;
                    _addToPosts(resp.postId, resp.postTitle, resp.postBody);
                    _clearInputs();
                };
            $.post(url, args, callback);
		} else {
			errors.forEach(function(e) {
				console.log(e);
			});
		}
    }

    function deleteFromFeed(e) {
        // either an index value or an event object
        var i, postId;
        if(typeof e === "number") {
            i = e;
            if(i >= 0 && i < posts.length) {
                postId = posts[i].postId;
            } else {
                return;
            }
        } else {
            var $remove = $(e.target).closest('.post-container');
            postId = $remove.attr('data-post_id');
            i = $feed.find('.post').index($remove);
            console.log($remove);
            console.log(postId);
        }

        var url = "./postDel",
            args = {
                "postId": postId,
            },
            callback = function (resp) {
                console.log(resp);
                $container.prepend(removeMsg);
                posts.splice(i, 1);
                _render();
            };
        $.post(url, args, callback);
    }

    return {
        init: init,
        addToFeed: addToFeed,
        deleteFromFeed: deleteFromFeed
    };
})();

blog.init();

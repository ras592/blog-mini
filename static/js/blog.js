$(document).ready(function() {
	$('#blogForm').submit(function(event) {
		event.preventDefault();
		var title = $.trim($('#postTitle').val());
		var body = $.trim($('#postBody').val());
		var errors = [];
		if(!title.length) {
			// title wasn't given
			if(!$('#postTitleError').length) {
				$('.postTitle').append($(document.createElement('div'))
					.addClass('alert alert-danger').attr('id', 'postTitleError')
					.text("Title wasn't given."));
			}
			errors.push('No title');
		}
		if(!body.length) {
			// body wasn't given
			if(!$('#postBodyError').length) {
				$('.postBody').append($(document.createElement('div'))
					.addClass('alert alert-danger').attr('id', 'postBodyError')
					.text("Body wasn't given."));
			}
			errors.push('No body');
		}

		if(errors.length === 0) {
            var url = "./",
                args = {
                    "postTitle": title,
                    "postBody": body
                },
                callback = function (resp) {
                    console.log(resp);
                    var msg = [
                        '<div class="flash alert alert-dismissible alert-success" role="alert">',
                            '<strong>Successfully uploaded!</strong>',
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">',
                                '<span aria-hidden="true">&times;</span>',
                            '</button>',
                        '</div>'
                    ].join("");
                    $('.container').prepend(msg);
                    resp = $.parseJSON(resp);
                    addToFeed(resp.post_id, resp.title, resp.body);
                };
            $.post(url, args, callback);
		} else {
			errors.forEach(function(e) {
				console.log(e);
			});
		}
	});

	// on focus removal of no title error
	$('input#postTitle').focus(function(event) {
		$('#postTitleError').remove();
	});

	// on focus removal of no body error
	$('textarea#postBody').focus(function(event) {
		$('#postBodyError').remove();
	});

	// on click removal of posts

    $("#feed").on("click", "span.removeIcon", function () {
        var post = $(this).closest(".post-container"),
            post_id = post.attr("data-post_id");

        var url = "./postDel",
            args = {
                "post_id": post_id,
            },
            callback = function (resp) {
                console.log(resp);
                var msg = [
                    '<div class="flash alert alert-dismissible alert-success" role="alert">',
                        '<strong>Successfully removed!</strong>',
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">',
                            '<span aria-hidden="true">&times;</span>',
                        '</button>',
                    '</div>'
                ].join("");
                $('.container').prepend(msg);
                post.remove();
            };
        $.post(url, args, callback);

    });
});

function clearInputs() {
	$('#postTitle').val("");
	$('#postBody').val("");
}

function addToFeed(post_id, title, body) {

    var msg = [
        '<div data-post_id="' + post_id + '" class="post panel panel-default col-xs-12 col-sm-12 col-md-10 col-md-offset-1 post-container">',
            '<div class="panel-heading">',
                '<div class="panel-title post-title">',
                    title,
                    '<span class="removeIcon glyphicon glyphicon-remove pull-right">',
                    '</span>',
                '</div>',
            '</div>',
            '<div class="panel-body post-body">',
                body,
            '</div>',
        '</div>'
    ].join("");

	$('#feed').append(msg);
	clearInputs();
}

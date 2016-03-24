#!venv/bin/python
import web, os, json
from jinja2 import Environment, FileSystemLoader
import pymongo
from bson.objectid import ObjectId

urls = (
    '/', 'index',
    '/post', 'Post',
    '/postDel', 'PostDel'
)

app = web.application(urls, globals())

connection = pymongo.MongoClient('localhost', 27017)
db = connection.test

globals = {}
jinja_env = Environment(
        loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')),
        extensions=[],
        )
jinja_env.globals.update(globals)

def render_template(template_name, **context):
    global jinja_env

    #jinja_env.update_template_context(context)
    return jinja_env.get_template(template_name).render(context)

def validate(post_id, post_title, post_body):
    """Gives back a valid dictionary to be converted into JSON.
    Parameters:
        post_id: ObjectID object
        post_title: String
        post_body: String
    Returns:
        dict: Returns the string value of ObjectID, string postTitle, and string postBody.
    """
    return {
            "postId": str(post_id),
            "postTitle": post_title,
            "postBody": post_body
            }

class index:
    def GET(self):
        """Handles GET method for index route.
        Renders the template index.html.

        Returns:
            render_template: Renders index.html template.
        """
        return render_template('index.html')

class Post:
    def GET(self):
        """Handles GET method for post route.
        Uses the validate helper method to change the format of the dict to match client
        json keys.

        Returns:
            json: Returns JSON object with the keys: success and array of posts dictionary.
        """
        try:
            posts = db.posts.find()
            posts = filter(lambda post:
                not None in (post.get('_id'), post.get('title'), post.get('body')),
                posts)
            posts = map(lambda post:
                validate(post.get('_id'), post.get('title'), post.get('body')),
                posts)
        except Exception as e:
            print e
            posts = []
        return json.dumps({"status": "success", "posts": posts})


    def POST(self):
        """Handles POST method for post route.
        Validates the input from the user.
        Inserts the title and body values into MongoDB and gets the ObjectID
        for the entry.
        Uses the validate helper method to change the format of the dict to match client
        json keys.
        Handles exception for any MongoDB errors silently.

        Returns:
            json: Returns JSON object with the keys: success and valid_post dictionary.
        """
        inp = web.input()
        title, body = inp.get('postTitle'), inp.get('postBody')
        if None in (title, body):
            return json.dumps({'status': 'error'})
        if len(title) == 0 or len(body) == 0:
            return json.dumps({'status': 'error'})
        post = {
            'title': title,
            'body': body
        }

        try:
            post_id = db.posts.insert_one(post).inserted_id
        except Exception as e:
            print e
            return json.dumps({'status': 'error'})
        valid_post = validate(post_id, title, body)
        return json.dumps({'status': 'success', 'post': valid_post})


class PostDel:
    def POST(self):
        """Handles POST method for postDel route.
        Validates the input from the user.
        post_id value is used to remove a document from MongoDB.
        Handles exception for any MongoDB errors silently.

        Returns:
            json: Returns JSON object with the success message.
        """
        inp = web.input()
        post_id = inp.get('postId')

        if post_id is None:
            return json.dumps({'status': 'error'})
        if len(post_id) == 0:
            return json.dumps({'status': 'error'})

        try:
            result = db.posts.delete_one({'_id': ObjectId(post_id)})
            if result.deleted_count != 1:
                raise Exception('One document was not deleted.')
        except Exception as e:
            print e
            return json.dumps({'status': 'error'})
        return json.dumps({'status': 'success'})


if __name__ == "__main__":
    app.run()

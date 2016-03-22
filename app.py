#!venv/bin/python
import web, os, cgi, json
from jinja2 import Environment, FileSystemLoader
import pymongo
from bson.objectid import ObjectId

urls = (
    '/', 'index',
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


class index:
    def GET(self):
        """Handles GET method for index route.
        Query mongodb for posts or handle exceptions and send back an empty list.

        Returns:
            render_template: Renders index.html template and list of posts.
        """
        try:
            posts=db.posts.find()
        except Exception as e:
            print e
            posts=[]
        return render_template('index.html', posts=posts)


    def POST(self):
        """Handles POST method for index route.
        Uses cgi.escape() method to validate the input from the user.
        Inserts the title and body values into MongoDB and gets the ObjectID
        for the entry.
        Handles exception for any MongoDB errors silently.

        Returns:
            json: Returns JSON object with the keys: success and post_id.
        """
        inp=web.input()
        title=cgi.escape(inp['postTitle'])
        body=cgi.escape(inp['postBody'])
        post = {
            'title': title,
            'body': body
        }

        try:
            post_id=db.posts.insert_one(post).inserted_id
        except Exception as e:
            print e
            return json.dumps({'status': 'error'})
        return json.dumps({'status': 'success', 'post_id': str(post_id), 'title': title, 'body': body})


class PostDel:
    def POST(self):
        """Handles POST method for postDel route.
        Uses cgi.escape() method to validate the input from the user.
        post_id value is used to remove a document from MongoDB.
        Handles exception for any MongoDB errors silently.

        Returns:
            json: Returns JSON object with the success message.
        """
        inp=web.input()
        post_id=cgi.escape(inp['post_id'])

        try:

            result=db.posts.delete_one({'_id': ObjectId(post_id)})
            if result.deleted_count != 1:
                raise Exception('One document was not deleted.')
        except Exception as e:
            print e
            return json.dumps({'status': 'error'})
        return json.dumps({'status': 'success'})


if __name__ == "__main__":
    app.run()
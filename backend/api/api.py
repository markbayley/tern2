from flask import jsonify
from flask_restful import Resource, Api

from .models import Favourite as FavouritesModel, to_dict

api = Api()

class Favourite(Resource):
    def get(self):
        return jsonify([to_dict(favourite) for favourite in FavouritesModel.query.all()])

api.add_resource(Favourite, '/')


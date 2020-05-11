from flask import jsonify, request
from flask_restful import Resource, Api, reqparse
import certifi
import json
import os

from elasticsearch import Elasticsearch

from .models import Favourite as FavouritesModel, to_dict, SearchRequest as SearchRequestModel, SearchFilter as SearchFilterModel
#from .search_model import SearchResult as SearchResultModel
from .config import Config

api = Api()
es = Elasticsearch(
    hosts=[os.getenv('ES_URL')],
    http_auth=(os.getenv('ES_USER'), os.getenv('ES_PASSWORD')))


class Favourites(Resource):
    def get(self):
        return jsonify([to_dict(favourite) for favourite in FavouritesModel.query.all()])


api.add_resource(Favourites, '/favourites')


class Favourite(Resource):
    def get(self, id):
        return jsonify(to_dict(FavouritesModel.query.filter_by(favourites_id=id).first()))


api.add_resource(Favourite, '/favourite/<string:id>')


class SearchResult(Resource):
    index_name = "bioimages"

    def get(self):
        args = request.args
        this_filter = SearchFilterModel()
        thumb_size = "/320_"
        if 'supersite_node_code' in args:
            this_filter.supersite_node_code = args['supersite_node_code']
        if 'plot' in args:
            this_filter.plot = args['plot']
        if 'site_visit_id' in args:
            this_filter.site_visit_id = args['site_visit_id']
        if 'spatial_search' in args:
            this_filter.spatial_search = args['spatial_search']
        if 'image_type' in args:
            this_filter.image_type = args['image_type']
        if 'search_string' in args:
            this_filter.search_string = args['search_string']
        if 'date_from' in args:
            this_filter.date_from = args['date_from']
        if 'date_to' in args:
            this_filter.date_to = args['date_to']
        if '_id' in args:
            this_filter.image_id = args['_id']
            if args['_id'] != '':
                thumb_size = "/640_"

        #res = es.get(index="bioimages", id='Shared/tern.data/bioimages/boya_bioimages/lai/core1ha/20180222/DSC00157_N6.JPG')

        # return((this_filter.search()))
        # return "hi"
        search = this_filter.search()
        res = es.search(index=self.index_name, body=(search['_search']))
        #return(res)
        search_result = {'aggregations': {}, 'hits': {}, 'aggregation': search['aggregation']}
        for key, result in res['aggregations'].items():
            if (key == 'top_sites'):
                for entry in result['buckets']:
                    if entry['key'].startswith('.'):
                        continue
                    search_result['hits'][entry['key']] = entry['top_tags_hits']['hits']['hits'][0]['_source']
                    search_result['hits'][entry['key']]['thumbnail_path'] = [s for s in search_result['hits'][entry['key']]['published_paths'] if thumb_size in s][0]
                    search_result['hits'][entry['key']]['doc_count'] = entry['doc_count']
                    search_result['hits'][entry['key']]['name'] = entry['top_tags_hits']['hits']['hits'][0]['_source']['metadata_doc']['supersite_node_code']
            else:
                search_result['aggregations'][key]=(result['buckets'])

        return jsonify(search_result)

    def post(self):
        args = self.reqparse.parse_args()
        task = {
            'id': tasks[-1]['id'] + 1 if len(tasks) > 0 else 1,
            'title': args['title'],
            'description': args['description'],
            'done': False
        }
        tasks.append(task)
        return {'task': marshal(task, task_fields)}, 201

api.add_resource(SearchResult, '/')

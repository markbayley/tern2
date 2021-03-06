import json
import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.declarative import DeclarativeMeta

db = SQLAlchemy()


class Favourite(db.Model):
    __tablename__ = "favourites"
    favourites_id = db.Column(db.Integer, db.Sequence(
        'favourites_id_seq', metadata=db.Model.metadata), primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    search_request_id = db.Column(db.Integer, nullable=False)
    favourite_name = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        return '<Favourite %r>' % self.user_id + ' ' + self.favourites_id


class SearchRequest(db.Model):
    __tablename__ = "search_request"
    search_request_id = db.Column(db.Integer, db.Sequence(
        'search_request_id_seq', metadata=db.Model.metadata), primary_key=True)
    search_filter = db.Column(db.Integer, db.ForeignKey(
        'search_filter.search_filter_id'))
    page_number = db.Column(db.Integer, nullable=True)
    page_size = db.Column(db.Integer, nullable=True)
    sort_column = db.Column(db.String(50), nullable=True)
    search_aggregations = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return '<SearchRequest %r>' % self.user_id + ' ' + self.search_request_id


class SearchFilter(db.Model):
    __tablename__ = "search_filter"
    search_filter_id = db.Column(db.Integer, db.Sequence(
        'search_filter_id_seq', metadata=db.Model.metadata), primary_key=True)
    supersite_node_code = db.Column(db.Integer, nullable=True)
    plot = db.Column(db.Integer, nullable=True)
    site_visit_id = db.Column(db.Integer, nullable=True)
    spatial_search = db.Column(db.String(50), nullable=True)
    image_type = db.Column(db.String(12), nullable=True)
    search_string = db.Column(db.String(100), nullable=True)
    date_from = db.Column(db.DateTime, index=False,
                          unique=False, nullable=True)
    date_to = db.Column(db.DateTime, index=False, unique=False, nullable=True)
    image_id = None
    camera_make = db.Column(db.String(50), nullable=True)
    camera_model = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        return '<SearchFilter %r>' % self.supersite_node_code + ' ' + self.search_filter_id

    def search(self):
        query = []
        this_filter = []
        this_date = []
        query.append({
            "terms": {
                "source_extension":  ['nef', 'cr2', 'jpeg', 'jpg', 'arw'],
            }
        })
        size = 0
        aggregation = "metadata_doc.supersite_node_code.keyword"
        next_filter = 'supersite_node_code'
        if self.supersite_node_code:
            this_filter.append({
                "term": {
                    "metadata_doc.supersite_node_code":  self.supersite_node_code
                }
            })
            aggregation = "metadata_doc.image_type.keyword"
            next_filter = 'image_type'

        if self.image_type:
            this_filter.append({
                "term": {
                    "metadata_doc.image_type":  self.image_type
                }
            })
            aggregation = "metadata_doc.plot.keyword"
            next_filter = 'plot'
            if not self.supersite_node_code:
                aggregation = "metadata_doc.supersite_node_code.keyword"
                next_filter = 'supersite_node_code'

        if self.plot:
            this_filter.append({
                "term": {
                    "metadata_doc.plot": self.plot
                }
            })
            next_filter = '_id'

            #aggregation = "metadata_doc.collection_date.keyword"
            aggregation = "_id"
            if not self.supersite_node_code:
                aggregation = "metadata_doc.supersite_node_code.keyword"
                next_filter = 'supersite_node_code'
            else:
                if not self.image_type:
                    aggregation = "metadata_doc.image_type.keyword"
                    next_filter = 'image_type'

        if self.site_visit_id:
            aggregation = "_id"
            # return query

        if self.search_string:
            query.append({
                "query_string": {
                    "query":  self.search_string
                }
            })

        if self.date_to or self.date_from:
            this_date_to = datetime.datetime.now()
            this_date_from = datetime.datetime.strptime("197001", "%Y%m")
            if self.date_from:
                this_date_from = datetime.datetime.strptime(
                    self.date_from, "%Y%m")

            if self.date_to:
                this_date_to = datetime.datetime.strptime(self.date_to, "%Y%m")

            query.append({
                "range": {
                    "metadata_doc.date_file_created": {
                        "time_zone": "-10:00",
                        "gte": datetime.datetime.strftime(this_date_from, "%Y-%m-%d") + "||/M",
                        "lte": datetime.datetime.strftime(this_date_to, "%Y-%m-%d") + "||/M"
                    }
                }
            })

        if 1 == 2 and self.spatial_search:
            this_filter.append({
                "geo_shape": {
                    "location": {
                        "shape": {
                            "type": "envelope",
                            "coordinates": [
                                    [
                                        143.56358714103,
                                        -40.21165878103
                                    ],
                                [
                                        150.15538401603,
                                        -43.928812500965
                                        ]
                            ]
                        },
                        "relation": "intersects"
                    }
                }
            })
            this_filter.append({
                "geo_shape": {
                    "location": self.spatial_search
                }
            })

        if self.image_id:
            query.append({
                "term": {
                    "_id":  self.image_id
                }
            })

        if aggregation == '_id':
            size = 20

        aggregations = {
            "top_sites": {
                "terms": {
                    "field": aggregation,
                    "order": {"top_hit": "desc"},
                    "size": "20",
                },
                "aggs": {
                    "top_tags_hits": {
                        "top_hits": {
                            "_source": {
                                "includes": [
                                    "published_basename",
                                    "id",
                                    "metadata_doc.supersite_node_code",
                                    "metadata_doc.plot",
                                    "published_paths",
                                    "metadata_doc.image_type",
                                    "location",
                                    "published_root",
                                    "metadata_doc.collection_date"
                                ]
                            },
                            "size": 1
                        }
                    },
                    "top_hit": {
                        "max": {
                            "script": {
                                "source": "_score"
                            }
                        }
                    }
                }
            },
            "supersite_node_code": {
                "terms": {
                    "field": "metadata_doc.supersite_node_code.keyword",
                    "order": {"_key": "asc"},
                    "size": 20
                },
                "aggs": {
                    "image_type": {
                        "terms": {
                            "field": "metadata_doc.image_type.keyword",
                            "min_doc_count": 1,
                            "order": {"_key": "asc"}
                        }
                    }
                }
            },
            "image_type": {
                "terms": {
                    "field": "metadata_doc.image_type.keyword",
                    "min_doc_count": 1,
                    "order": {"_key": "asc"}
                }
            },
            "plot": {
                "terms": {
                    "field": "metadata_doc.plot.keyword",
                    "min_doc_count": 1,
                    "order": {"_key": "asc"},
                    "size": 150
                }
            }

        }

        if 1 == 2 and self.camera_make:
            this_filter.append({
                "term": {
                    "camera_make":  self.camera_make
                }
            })

            aggregations['camera_make'] = {
                "terms": {
                    "field": "camera_make.keyword",
                    "min_doc_count": 1,
                    "order": {"_key": "asc"},
                    "size": 150
                }
            }

        if 1 == 2 and fself.camera_model:
            this_filter.append({
                "term": {
                    "camera_make":  self.camera_make
                }
            })

            aggregations['camera_model'] = {
                "terms": {
                    "field": "camera_model.keyword",
                    "min_doc_count": 1,
                    "order": {"_key": "asc"},
                    "size": 150
                }
            }

        return {"aggregation": next_filter, "_search": {
            "size": size,
            "query": {
                "bool": {"filter": this_filter,
                         "must": query}
            },
            "aggs": aggregations
        }
        }


class DownloadRequest(db.Model):
    __tablename__ = "download_request"
    dowload_request_id = db.Column(db.Integer, db.Sequence(
        'download_request_id_seq', metadata=db.Model.metadata), primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    search_request_id = db.Column(db.Integer, nullable=False)
    selected_images = db.Column(db.String(500), nullable=True)
    dowload_exipiry_date = db.Column(
        db.DateTime, index=False, unique=False, nullable=True)
    package_files = db.Column(db.String(1000), nullable=True)
    filter_url = db.Column(db.String(200), nullable=True)
    package_location = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return '<DowloadRequest %r>' % self.user_id + ' ' + self.dowload_request_id


class DownloadHistory(db.Model):
    __tablename__ = "download_history"
    dowload_history_id = db.Column(db.Integer, db.Sequence(
        'download_history_id_seq', metadata=db.Model.metadata), primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    dowload_request_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, index=False, unique=False, nullable=True)

    def __repr__(self):
        return '<Favourite %r>' % self.user_id + ' ' + self.search_request_id


def to_dict(obj):
    if isinstance(obj.__class__, DeclarativeMeta):
        # an SQLAlchemy class
        fields = {}
        for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
            data = obj.__getattribute__(field)
            try:
                # this will fail on non-encodable values, like other classes
                json.dumps(data)
                if data is not None:
                    fields[field] = data
            except TypeError:
                pass
        # a json-encodable dict
        return fields

import json

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
    node_id = db.Column(db.Integer, nullable=True)
    plot_id = db.Column(db.Integer, nullable=True)
    site_visit_id = db.Column(db.Integer, nullable=True)
    spatial_search = db.Column(db.String(50), nullable=True)
    image_type = db.Column(db.String(12), nullable=True)
    search_string = db.Column(db.String(100), nullable=True)
    date_from = db.Column(db.DateTime, index=False,
                          unique=False, nullable=True)
    date_to = db.Column(db.DateTime, index=False, unique=False, nullable=True)

    def __repr__(self):
        return '<SearchFilter %r>' % self.node_id + ' ' + self.search_filter_id

    def search(self):
        query = []
        size = 0
        aggregation = "metadata_doc.plot.keyword"
        if self.node_id:
            query.append({
                "query_string": {
                    "query":  self.node_id,
                    "fields": ["metadata_doc.supersite_node_code"]
                }
            })
            aggregation = "metadata_doc.image_type.keyword"

        if self.image_type:
            query.append({
                "query_string": {
                    "query":  self.image_type,
                    "fields": ["metadata_doc.image_type"]
                }
            })
            aggregation = "metadata_doc.plot.keyword"
            if not self.node_id:
                aggregation = "metadata_doc.supersite_node_code.keyword"

        if self.plot_id:
            query.append({
                "query_string": {
                    "query":  self.plot_id,
                    "fields": ["metadata_doc.plot"]
                }
            })
            aggregation = "metadata_doc.collection_date.keyword"
            aggregation = ""
            if not self.node_id:
                aggregation = "metadata_doc.supersite_node_code.keyword"
            else:
                if not self.image_type:
                    aggregation = "metadata_doc.image_type.keyword"

        if self.site_visit_id:
            size = 20
            aggregation = ""
            #return query

        if self.search_string:
            query.append({
                "query_string": {
                    "query":  self.search_string
                }
            })

        return {"size": size, "query": {"bool": {"must": query}
                                        },
                "aggs": {
                "top_sites": {
                    "terms": {
                        "field": aggregation,  # dependent on the applied filters
                        "order": {
                            "top_hit": "desc"
                        }
                    },
                    "aggs": {
                        "top_tags_hits": {
                            "top_hits": {
                                "_source": {
                                    "includes": [
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
                        "min_doc_count": 1
                    }
            },
            "image_type": {
                    "terms": {
                        "field": "metadata_doc.image_type.keyword",
                        "min_doc_count": 1
                    }
            },
            "plot": {
                    "terms": {
                        "field": "metadata_doc.plot.keyword",
                        "min_doc_count": 1
                    }
            },
            "supersite_node_code": {
                    "terms": {
                        "field": "metadata_doc.supersite_node_code.keyword",
                        "min_doc_count": 1
                    }
            }
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

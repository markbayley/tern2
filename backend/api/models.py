import json

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.declarative import DeclarativeMeta

db = SQLAlchemy()

class Favourite(db.Model):
    __tablename__ = "favourites"
    favourites_id = db.Column(db.Integer, db.Sequence('favourites_id_seq', metadata=db.Model.metadata), primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    search_request_id = db.Column(db.Integer, nullable=False)
    favourite_name = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        return '<Favourite %r>' % self.user_id + ' ' + self.favourites_id

class SearchRequest(db.Model):
    __tablename__ = "search_request"
    search_request_id = db.Column(db.Integer, db.Sequence('search_request_id_seq', metadata=db.Model.metadata), primary_key=True)
    search_filter = db.Column(db.Integer, db.ForeignKey('search_filter.search_filter_id'))
    page_number = db.Column(db.Integer, nullable=True)
    page_size = db.Column(db.Integer, nullable=True)
    sort_column = db.Column(db.String(50), nullable=True)
    search_aggregations = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return '<SearchRequest %r>' % self.user_id + ' ' + self.search_request_id

class SearchFilter(db.Model):
    __tablename__ = "search_filter"
    search_filter_id = db.Column(db.Integer, db.Sequence('search_filter_id_seq', metadata=db.Model.metadata), primary_key=True)
    node_id = db.Column(db.Integer, nullable=True)
    plot_id = db.Column(db.Integer, nullable=True)
    site_visit_id =  db.Column(db.Integer, nullable=True)
    spatial_search = db.Column(db.String(50), nullable=True)
    image_type = db.Column(db.String(12), nullable=True)
    search_string = db.Column(db.String(100), nullable=True)
    date_from = db.Column(db.DateTime, index=False, unique=False, nullable=True)
    date_to = db.Column(db.DateTime, index=False, unique=False, nullable=True)

    def __repr__(self):
        return '<SearchFilter %r>' % self.node_id + ' ' + self.search_filter_id

class DownloadRequest(db.Model):
    __tablename__ = "download_request"
    dowload_request_id = db.Column(db.Integer, db.Sequence('download_request_id_seq', metadata=db.Model.metadata), primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    search_request_id = db.Column(db.Integer, nullable=False)
    selected_images = db.Column(db.String(500), nullable=True)
    dowload_exipiry_date = db.Column(db.DateTime, index=False, unique=False, nullable=True)
    package_files = db.Column(db.String(1000), nullable=True)
    filter_url = db.Column(db.String(200), nullable=True)
    package_location = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return '<DowloadRequest %r>' % self.user_id + ' ' + self.dowload_request_id

class DownloadHistory(db.Model):
    __tablename__ = "download_history"
    dowload_history_id = db.Column(db.Integer, db.Sequence('download_history_id_seq', metadata=db.Model.metadata), primary_key=True)
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
                json.dumps(data)  # this will fail on non-encodable values, like other classes
                if data is not None:
                    fields[field] = data
            except TypeError:
                pass
        # a json-encodable dict
        return fields


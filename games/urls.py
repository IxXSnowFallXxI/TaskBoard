from django.urls import path
from . import views
urlpatterns = [path("games/", views.games_page, name='games_page')]
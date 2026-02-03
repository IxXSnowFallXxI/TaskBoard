from django.urls import path
from . import views
urlpatterns = [
    path("games/", views.games_page, name="games_page"),
    path("game1/", views.game1_view, name="game1_page"),
    path("game2/", views.game2_view, name="game2_page"),
    path("game3/", views.game3_view, name="game3_page"),
    ]
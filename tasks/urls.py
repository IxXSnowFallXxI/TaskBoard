from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.tasks_page, name='tasks_page'),
    path('', views.tasks_page, name='home')
]
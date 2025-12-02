from django.urls import path
from .views import registration
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('register/', registration, name='register'),
    path('login/', auth_views.LoginView.as_view(), name = 'login'),
    path('logout/', auth_views.LogoutView.auth_view(), name='logout'),
]
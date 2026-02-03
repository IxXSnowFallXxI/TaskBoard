from django.shortcuts import render
def games_page(request):
    return render(request, "games/games.html")

def game1_view(request):
    return render(request, "games/game1.html")

def game2_view(request):
    return render(request, "games/game2.html")

def game3_view(request):
    return render(request, "games/game3.html")
# Create your views here.


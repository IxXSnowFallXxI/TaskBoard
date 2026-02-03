from django.shortcuts import render

def tasks_page(request):
    return render(request, 'tasks/tasks.html')

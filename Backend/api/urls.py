from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('resumes/', ResumeListCreateView.as_view()),
    path('jobs/', JobApplicationListCreateView.as_view()),
    path('register/', RegisterView.as_view(), name = 'register'),
    path('token/', TokenObtainPairView.as_view(), name = 'token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name = 'token_refresh'),
    path('jobs/<int:pk>/', JobApplicationListDetailView.as_view()),
    path('resume-analyzer/', ResumeAnalyzerView.as_view()),
    path('resumes/<int:pk>/', ResumeDetailView.as_view()),
    path('analysis-history/', ResumeAnalysisListView.as_view(), name = "analysis-history"),
    path('login/', login_with_email, name = 'login'),
    path('profile/', ProfileView.as_view()),
]
import os
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import JobApplication, Resume, ResumeAnalysis  
from .serializers import RegisterSerializer, JobApplicationSerializer, ResumeSerializer, ResumeAnalyzerSerializer, ResumeAnalysisSerializer
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser
from .utils import extract_resume_text, analyze_resume_vs_job
from .models import ResumeAnalysis
from rest_framework.views import APIView
from rest_framework import status
import tempfile
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import UserRateThrottle

class JobApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['status', 'company']
    ordering_fields = ['date_applied']
    search_fields = ['role', 'company']
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JobApplicationListDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)

class ResumeListCreateView(generics.ListCreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

class ResumeDeleteView(generics.DestroyAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
        
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

from .utils import (
    extract_resume_text,
    analyze_resume_vs_job
)

class ResumeAnalyzerView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]

    def post(self, request):
        serializer = ResumeAnalyzerSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        resume_file = serializer.validated_data.get("resume")
        resume_id = serializer.validated_data.get("resume_id")
        job_description = serializer.validated_data.get("job_description", "")

        tmp_path = None

        try:
            if resume_file:
                suffix = ".pdf" if resume_file.name.endswith(".pdf") else ".docx"
                
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    for chunk in resume_file.chunks():
                        tmp.write(chunk)
                tmp_path = tmp.name
            elif resume_id:
                resume = Resume.objects.get(id=resume_id, user=request.user)
                tmp_path = resume.file.path
            else:
                return Response(
                    {"error": "No resume provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # ✅ Extract text
            resume_text = extract_resume_text(tmp_path)
            if resume_file.size > 5 * 1024 * 1024:
                return Response(
                    {"error": "Resume file size exceeds 5MB limit."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not resume_text:
                return Response(
                    {"error": "Unable to extract text from resume"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ Run analysis
            result = analyze_resume_vs_job(resume_text, job_description)

            return Response({
                "mode": "Job Match Analysis",
                "analysis": result
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        finally:
            # ✅ Cleanup temp file
            if resume_file and tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)


class ResumeAnalysisListView(generics.ListAPIView):
    serializer_class = ResumeAnalysisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ResumeAnalysis.objects.filter(user=self.request.user).order_by('-created_at')


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except User.MultipleObjectsReturned:
            return Response(
                {"error": "Multiple accounts found with this email."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user_obj.check_password(password):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        user = user_obj

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        })

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })
    def put(self, request):
        user = request.user
        username = request.data.get("username")

        if username:
            user.username = username
            user.save()

        return Response({
            "message": "Profile updated successfully",
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })
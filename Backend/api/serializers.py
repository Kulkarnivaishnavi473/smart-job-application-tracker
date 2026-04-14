from rest_framework import serializers
from .models import Resume, JobApplication, ResumeAnalysis
from django.contrib.auth.models import User
from datetime import date


class ResumeSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'user', 'file', 'uploaded_at', 'file_name', 'file_size']
        read_only_fields = ['user', 'uploaded_at']

    def get_file_name(self, obj):
        return obj.file.name.split("/")[-1] if obj.file else ""

    def get_file_size(self, obj):
        try:
            return obj.file.size
        except Exception:
            return 0

class JobApplicationSerializer(serializers.ModelSerializer):
    dateApplied = serializers.DateField(source='date_applied', required=False)
    jobLink = serializers.URLField(source='job_link', allow_blank=True, required=False)
    resume = ResumeSerializer(read_only=True)
    resumeId = serializers.PrimaryKeyRelatedField(
        queryset=Resume.objects.all(),
        source='resume',
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = JobApplication
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
            'date_applied': {'required': False}
        }
    
    # ✅ CREATE FIX
    def create(self, validated_data):
        if 'date_applied' not in validated_data:
            validated_data['date_applied'] = date.today()
        return JobApplication.objects.create(**validated_data)
    
    def to_representation(self, instance):
        data= super().to_representation(instance)
        data['dateApplied'] = data.pop('date_applied', None)
        data['jobLink'] = data.pop('job_link', None)
        data['resumeId'] = instance.resume.id if instance.resume else None
        return data

    # ✅ UPDATE FIX
    def update(self, instance, validated_data):
        instance.company = validated_data.get('company', instance.company)
        instance.role = validated_data.get('role', instance.role)
        instance.job_link = validated_data.get('job_link', instance.job_link)
        instance.date_applied = validated_data.get('date_applied', instance.date_applied)
        instance.status = validated_data.get('status', instance.status)
        instance.notes = validated_data.get('notes', instance.notes)

        # 🔥 CRITICAL LINE
        instance.resume = validated_data.get('resume', instance.resume)

        instance.save()
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate(self, data):
        if User.objects.filter(username = data.get('username')).exists():
            raise serializers.ValidationError({"username": "A user with that username already exists."})
        if User.objects.filter(email = data.get('email')).exists():
            raise serializers.ValidationError({"email": "An account with this email already exists."})
        return data

    def create(self, validated_data):
        print("CREATING USER: ", validated_data)
        try:
            user = User.objects.create_user(
                username = validated_data.get('username'),
                email = validated_data.get('email'),
                password = validated_data.get('password')
            )
            return user
        except Exception as e:
            print("ERROR CREATING USER: ", e)
            raise serializers.ValidationError({"error": str(e)})


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False)
    resume_id = serializers.IntegerField(required=False)
    job_description = serializers.CharField()
    class Meta:
        model = ResumeAnalysis
        fields = '__all__'
        # read_only_fields = ['user', 'match_score', 'suggestions']

class ResumeAnalyzerSerializer(serializers.Serializer):
    resume = serializers.FileField()
    job_description = serializers.CharField(
        required = False,
        allow_blank = True,
    )   
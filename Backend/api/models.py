from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to="resumes/")
    file_size = models.IntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} Resume"


class JobApplication(models.Model):

    STATUS_CHOICES = [
        ("applied", "Applied"),
        ("oa", "Online Assessment"),
        ("interview", "Interview"),
        ("offer", "Offer"),
        ("rejected", "Rejected"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    company = models.CharField(max_length=255)

    role = models.CharField(max_length=255)

    job_link = models.URLField(blank=True, null = True)

    date_applied = models.DateField()

    resume = models.ForeignKey(
        Resume,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="applied"
    )

    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company} - {self.role}"

class ResumeAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, null = True, blank = True)
    job_description = models.TextField(null=True, blank=True)
    semantic_score = models.FloatField(default=0)
    keyword_score = models.FloatField(default=0)
    ats_score = models.FloatField(default=0)
    matched_keywords = models.JSONField(default=list, blank=True)
    suggestions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.ats_score}"

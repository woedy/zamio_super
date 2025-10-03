"""
Tests for royalty file security service
"""
import os
import tempfile
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from royalties.models import PartnerPRO
from royalties.servi
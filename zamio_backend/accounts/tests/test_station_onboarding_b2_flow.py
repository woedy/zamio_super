from __future__ import annotations

import uuid

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from stations.models import Station


class StationOnboardingB2FlowTests(APITestCase):
    """Ensure station onboarding endpoints mark steps and expose progress metadata."""

    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            email="b2-station@example.com",
            password="StrongPass1!",
            first_name="Station",
            last_name="Tester",
        )
        self.user.user_type = "Station"
        self.user.save(update_fields=["user_type"])
        self.user.email_verified = True
        self.user.is_active = True
        self.user.save(update_fields=["email_verified", "is_active"])

        self.station = Station.objects.create(
            user=self.user,
            name="B2 Station",
            station_id=str(uuid.uuid4()),
        )

        self.complete_profile_url = reverse("accounts:complete_station_profile_view")
        self.complete_staff_url = reverse("accounts:complete_add_staff_view")
        self.complete_payment_url = reverse("accounts:complete_station_payment_view")
        self.status_url = reverse("accounts:station_onboarding_status_view")

        self.client.force_authenticate(self.user)

    def test_station_onboarding_progress_state(self) -> None:
        profile_response = self.client.post(
            self.complete_profile_url,
            {
                "station_id": self.station.station_id,
                "bio": "Community radio",
                "country": "GH",
                "region": "Ashanti",
                "location_name": "Kumasi",
            },
            format="json",
        )
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK, profile_response.data)
        profile_data = profile_response.data["data"]
        self.assertEqual(profile_data["next_step"], "staff")
        self.assertTrue(profile_data["progress"]["profile_completed"])

        staff_payload = [
            {"name": "Station Manager", "role": "Producer", "email": "manager@example.com"},
        ]
        staff_response = self.client.post(
            self.complete_staff_url,
            {"station_id": self.station.station_id, "staff": staff_payload},
            format="json",
        )
        self.assertEqual(staff_response.status_code, status.HTTP_200_OK, staff_response.data)
        staff_data = staff_response.data["data"]
        self.assertEqual(staff_data["next_step"], "payment")
        self.assertTrue(staff_data["progress"]["staff_completed"])

        payment_response = self.client.post(
            self.complete_payment_url,
            {"station_id": self.station.station_id, "momo": "+233555000222"},
            format="json",
        )
        self.assertEqual(payment_response.status_code, status.HTTP_200_OK, payment_response.data)
        payment_data = payment_response.data["data"]
        self.assertEqual(payment_data["next_step"], "done")
        self.assertTrue(payment_data["progress"]["payment_info_added"])

        self.station.refresh_from_db()
        self.assertTrue(self.station.profile_completed)
        self.assertTrue(self.station.staff_completed)
        self.assertTrue(self.station.payment_info_added)
        self.assertEqual(self.station.onboarding_step, "done")

        status_response = self.client.get(self.status_url, {"station_id": self.station.station_id}, format="json")
        self.assertEqual(status_response.status_code, status.HTTP_200_OK, status_response.data)
        status_data = status_response.data["data"]
        self.assertEqual(status_data["onboarding_step"], "done")
        self.assertTrue(status_data["progress"]["payment_info_added"])

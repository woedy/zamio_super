from __future__ import annotations

import uuid

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from artists.models import Artist


class ArtistOnboardingB2FlowTests(APITestCase):
    """Validate the artist onboarding completion endpoints advance progress consistently."""

    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            email="b2-artist@example.com",
            password="StrongPass1!",
            first_name="B2",
            last_name="Artist",
        )
        self.user.email_verified = True
        self.user.is_active = True
        self.user.save(update_fields=["email_verified", "is_active"])

        self.artist = Artist.objects.create(
            user=self.user,
            stage_name="B2 Artist",
            artist_id=str(uuid.uuid4()),
        )

        self.complete_profile_url = reverse("accounts:complete_artist_profile_view")
        self.complete_social_url = reverse("accounts:complete_artist_social_view")
        self.complete_payment_url = reverse("accounts:complete_artist_payment_view")
        self.complete_publisher_url = reverse("accounts:complete_artist_publisher_view")
        self.status_url = reverse(
            "accounts:artist_onboarding_status_view",
            kwargs={"artist_id": self.artist.artist_id},
        )

        self.client.force_authenticate(self.user)

    def test_artist_onboarding_advances_through_all_steps(self) -> None:
        profile_response = self.client.post(
            self.complete_profile_url,
            {
                "artist_id": self.artist.artist_id,
                "bio": "Test bio",
                "country": "GH",
                "region": "Greater Accra",
                "location": "Accra",
            },
            format="multipart",
        )
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK, profile_response.data)
        profile_data = profile_response.data["data"]
        self.assertEqual(profile_data["next_step"], "social-media")
        self.assertTrue(profile_data["progress"]["profile_completed"])

        social_response = self.client.post(
            self.complete_social_url,
            {
                "artist_id": self.artist.artist_id,
                "instagram": "https://instagram.com/zamio-test",
                "twitter": "https://twitter.com/zamio-test",
            },
            format="json",
        )
        self.assertEqual(social_response.status_code, status.HTTP_200_OK, social_response.data)
        social_data = social_response.data["data"]
        self.assertEqual(social_data["next_step"], "payment")
        self.assertTrue(social_data["progress"]["social_media_added"])

        payment_response = self.client.post(
            self.complete_payment_url,
            {
                "artist_id": self.artist.artist_id,
                "momo": "+233555000111",
            },
            format="json",
        )
        self.assertEqual(payment_response.status_code, status.HTTP_200_OK, payment_response.data)
        payment_data = payment_response.data["data"]
        self.assertEqual(payment_data["next_step"], "publisher")
        self.assertTrue(payment_data["progress"]["payment_info_added"])

        publisher_response = self.client.post(
            self.complete_publisher_url,
            {
                "artist_id": self.artist.artist_id,
                "self_publish": True,
            },
            format="json",
        )
        self.assertEqual(publisher_response.status_code, status.HTTP_200_OK, publisher_response.data)
        publisher_data = publisher_response.data["data"]
        self.assertEqual(publisher_data["next_step"], "kyc")
        self.assertTrue(publisher_data["progress"]["publisher_added"])

        self.artist.refresh_from_db()
        self.assertTrue(self.artist.profile_completed)
        self.assertTrue(self.artist.social_media_added)
        self.assertTrue(self.artist.payment_info_added)
        self.assertTrue(self.artist.publisher_added)
        self.assertEqual(self.artist.onboarding_step, "kyc")

        status_response = self.client.get(self.status_url, format="json")
        self.assertEqual(status_response.status_code, status.HTTP_200_OK, status_response.data)
        status_data = status_response.data["data"]
        self.assertEqual(status_data["onboarding_step"], "kyc")
        self.assertGreaterEqual(status_data["profile_complete_percentage"], 50)
        self.assertTrue(status_data["required_fields"]["payment_required"] is False)

        complete_response = self.client.post(
            reverse("accounts:complete_artist_onboarding_view"),
            {
                "artist_id": self.artist.artist_id,
            },
            format="json",
        )
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK, complete_response.data)
        final_data = complete_response.data["data"]
        self.assertEqual(final_data["next_step"], "done")

        self.artist.refresh_from_db()
        self.assertEqual(self.artist.onboarding_step, "done")

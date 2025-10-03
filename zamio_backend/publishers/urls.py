"""
URL patterns for publishers app
"""
from django.urls import path, include
from publishers.api.contract_views import (
    ContractUploadView,
    ContractDownloadView,
    ContractSecureUrlView,
    ContractVersionHistoryView,
    quarantine_contract,
    unquarantine_contract,
    contract_retention_report,
    delete_contract_file
)

app_name = 'publishers'

# API URL patterns
api_urlpatterns = [
    # Contract file management
    path('contracts/<int:contract_id>/download/', ContractDownloadView.as_view(), name='contract-download'),
    path('contracts/<int:contract_id>/secure-url/', ContractSecureUrlView.as_view(), name='contract-secure-url'),
    path('contracts/<str:contract_type>/<int:contract_id>/upload/', ContractUploadView.as_view(), name='contract-upload'),
    path('contracts/<str:contract_type>/<int:contract_id>/versions/', ContractVersionHistoryView.as_view(), name='contract-versions'),
    
    # Admin contract management
    path('admin/contracts/<int:contract_id>/quarantine/', quarantine_contract, name='quarantine-contract'),
    path('admin/contracts/<int:contract_id>/unquarantine/', unquarantine_contract, name='unquarantine-contract'),
    path('admin/contracts/retention-report/', contract_retention_report, name='contract-retention-report'),
    path('admin/contracts/<int:contract_id>/delete/', delete_contract_file, name='delete-contract-file'),
]

urlpatterns = [
    path('api/publishers/', include(api_urlpatterns)),
]
# Publisher Contract File Security System

This document describes the enhanced security features implemented for publisher contract file management in the ZamIO platform.

## Overview

The secure publisher contract file system provides comprehensive security controls for legal contract documents, including enhanced validation, access controls, file integrity checking, version tracking, and audit logging.

## Features Implemented

### 1. Enhanced File Validation (`ContractFileValidator`)

- **File Type Validation**: Only allows specific document types (PDF, DOC, DOCX, RTF, images)
- **File Size Limits**: Maximum 50MB for contract files
- **Security Scanning**: Detects and blocks malicious content patterns
- **Filename Validation**: Prevents path traversal and dangerous file extensions
- **Content Validation**: Validates PDF structure and blocks embedded JavaScript

### 2. Secure File Storage

- **Secure Upload Paths**: User-isolated directory structure with date organization
- **File Integrity**: SHA-256 hash generation and verification
- **Metadata Tracking**: Original filename, file size, MIME type storage
- **Quarantine System**: Ability to quarantine suspicious files

### 3. Access Control (`ContractAccessService`)

- **Role-Based Access**: Publishers, artists, and admins have appropriate access levels
- **Secure Token System**: HMAC-based tokens for temporary file access
- **Permission Checking**: Comprehensive permission validation before file access
- **Audit Logging**: All file access attempts are logged

### 4. Version Tracking

- **Contract Versioning**: Automatic version numbering for contract updates
- **Version History**: Complete history of all contract versions
- **Previous Version Links**: Maintains relationships between contract versions

### 5. File Retention Policies (`ContractRetentionService`)

- **Retention Rules**: 7 years for terminated contracts, 3 years for rejected contracts
- **Automated Cleanup**: Celery tasks for automated file cleanup
- **Retention Reports**: Administrative reports for files eligible for deletion

## Model Enhancements

### PublishingAgreement Model

New fields added:
- `file_hash`: SHA-256 hash for integrity verification
- `file_size`: File size in bytes
- `file_type`: MIME type of the file
- `original_filename`: Original filename when uploaded
- `version`: Version number for tracking
- `previous_version`: Link to previous version
- `access_count`: Number of times file has been accessed
- `last_accessed`: Timestamp of last access
- `is_quarantined`: Quarantine status flag
- `quarantine_reason`: Reason for quarantine
- `quarantined_at`: Quarantine timestamp
- `quarantined_by`: User who quarantined the file

### PublisherArtistRelationship Model

Same security fields as PublishingAgreement model.

## API Endpoints

### Contract File Management
- `POST /api/publishers/contracts/{contract_type}/{contract_id}/upload/` - Upload contract file
- `GET /api/publishers/contracts/{contract_id}/download/` - Download contract file
- `GET /api/publishers/contracts/{contract_id}/secure-url/` - Generate secure download URL
- `GET /api/publishers/contracts/{contract_type}/{contract_id}/versions/` - Get version history

### Admin Contract Management
- `POST /api/publishers/admin/contracts/{contract_id}/quarantine/` - Quarantine contract file
- `POST /api/publishers/admin/contracts/{contract_id}/unquarantine/` - Remove quarantine
- `GET /api/publishers/admin/contracts/retention-report/` - Get retention report
- `DELETE /api/publishers/admin/contracts/{contract_id}/delete/` - Delete contract file

## Security Features

### File Validation
```python
# Example of file validation
from publishers.services.contract_security_service import ContractFileValidator

validation_result = ContractFileValidator.validate_contract_file(uploaded_file, publisher_id)
if validation_result['is_valid']:
    # File is safe to process
    file_hash = validation_result['sha256_hash']
    mime_type = validation_result['mime_type']
```

### Access Control
```python
# Example of access control check
from publishers.services.contract_security_service import ContractAccessService

has_access = ContractAccessService.check_contract_access_permission(user, contract_id)
if has_access:
    # User can access the contract
    secure_url = ContractAccessService.get_secure_contract_url(user, contract_id)
```

### File Integrity
```python
# Example of integrity verification
contract = PublishingAgreement.objects.get(id=contract_id)
if contract.verify_file_integrity():
    # File integrity is intact
    pass
else:
    # File may be corrupted or tampered with
    contract.quarantine_file("Integrity check failed")
```

## Management Commands

### Contract File Cleanup
```bash
# Dry run to see what would be deleted
python manage.py cleanup_contract_files --dry-run

# Delete expired files (with confirmation)
python manage.py cleanup_contract_files

# Force deletion without confirmation
python manage.py cleanup_contract_files --force

# Limit number of files processed
python manage.py cleanup_contract_files --max-files 50
```

## Celery Tasks

### Automated Cleanup
```python
# Schedule automated cleanup
from publishers.tasks import cleanup_expired_contract_files

# Run cleanup task
cleanup_expired_contract_files.delay(dry_run=False, max_files=50)
```

### Integrity Verification
```python
# Schedule integrity verification
from publishers.tasks import verify_contract_file_integrity

# Run integrity check
verify_contract_file_integrity.delay()
```

### Retention Reports
```python
# Generate retention report
from publishers.tasks import generate_contract_retention_report

# Run report generation
generate_contract_retention_report.delay()
```

## Configuration

### File Upload Settings
```python
# In settings.py
MEDIA_ROOT = '/path/to/media'
MEDIA_URL = '/media/'

# Contract file settings
CONTRACT_MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
CONTRACT_ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'image/jpeg',
    'image/png',
    'image/tiff'
]
```

### Celery Beat Schedule
```python
# In settings.py
CELERY_BEAT_SCHEDULE = {
    'cleanup-expired-contracts': {
        'task': 'publishers.tasks.cleanup_expired_contract_files',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
        'kwargs': {'dry_run': False, 'max_files': 100}
    },
    'verify-contract-integrity': {
        'task': 'publishers.tasks.verify_contract_file_integrity',
        'schedule': crontab(hour=3, minute=0, day_of_week=0),  # Weekly on Sunday at 3 AM
    },
}
```

## Security Considerations

1. **File Validation**: All uploaded files are validated for type, size, and content
2. **Access Control**: Role-based access ensures only authorized users can access contracts
3. **Audit Logging**: All file operations are logged for security monitoring
4. **File Integrity**: SHA-256 hashes ensure files haven't been tampered with
5. **Quarantine System**: Suspicious files can be quarantined immediately
6. **Secure Tokens**: Time-limited HMAC tokens for secure file access
7. **Retention Policies**: Automated cleanup based on legal retention requirements

## Testing

Run the test suite to verify functionality:
```bash
python manage.py test publishers.tests.test_contract_security
```

## Migration

To apply the database changes:
```bash
python manage.py migrate publishers
```

This will add all the necessary fields for the enhanced security features.
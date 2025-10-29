from django.db import migrations


def add_mime_type_column(apps, schema_editor):
    model = apps.get_model("artists", "UploadProcessingStatus")
    table_name = model._meta.db_table
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        existing_columns = {
            column.name for column in connection.introspection.get_table_description(cursor, table_name)
        }

    if "mime_type" in existing_columns:
        return

    schema_editor.execute(
        f"ALTER TABLE {schema_editor.quote_name(table_name)} ADD COLUMN mime_type varchar(100)"
    )


def drop_mime_type_column(apps, schema_editor):
    # We intentionally leave the column in place on reverse migrations to avoid
    # backend-specific ALTER TABLE limitations (SQLite does not support DROP COLUMN).
    pass


def populate_mime_type(apps, schema_editor):
    import mimetypes
    from django.db.models import Q

    UploadProcessingStatus = apps.get_model('artists', 'UploadProcessingStatus')

    empty_mime_q = Q(mime_type__isnull=True) | Q(mime_type='')
    for upload in UploadProcessingStatus.objects.filter(empty_mime_q).iterator():
        metadata = upload.metadata or {}
        candidate = metadata.get('mime_type') or metadata.get('file_type') or ''
        if not candidate and upload.original_filename:
            guess, _ = mimetypes.guess_type(upload.original_filename)
            if guess:
                candidate = guess
        if candidate:
            UploadProcessingStatus.objects.filter(pk=upload.pk).update(mime_type=candidate)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("artists", "0008_rename_artists_art_artist_9f629e_idx_artists_art_artist__bf845a_idx_and_more"),
    ]

    operations = [
        migrations.RunPython(add_mime_type_column, drop_mime_type_column),
        migrations.RunPython(populate_mime_type, noop),
    ]

# Generated migration for correcting duplicate-vote constraints.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spotify', '0003_vote'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vote',
            name='user',
            field=models.CharField(max_length=50),
        ),
        migrations.AddConstraint(
            model_name='vote',
            constraint=models.UniqueConstraint(
                fields=('user', 'room', 'song_id'),
                name='unique_user_room_song_vote',
            ),
        ),
    ]

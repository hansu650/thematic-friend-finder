from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("social", "0001_initial")]
    operations = [
        migrations.AlterField(
            model_name="decision", name="kind",
            field=models.CharField(choices=[("like", "喜欢"), ("skip", "跳过"), ("star", "超级喜欢")], max_length=4),
        ),
    ]

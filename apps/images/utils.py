from .models import ImageModel, TagModel

def clear_all():
    ImageModel.objects.all().delete()
    TagModel.objects.all().delete()

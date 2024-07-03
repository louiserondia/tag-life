from django.db import models
    
class TagModel(models.Model):
    title = models.CharField(max_length=200)

    def __str__(self):
        return self.title

class ImageModel(models.Model):
    title = models.CharField(max_length=200)
    image_field = models.ImageField(upload_to='trash/')
    tags = models.ManyToManyField(TagModel, related_name='images')

    def __str__(self):
        return self.title
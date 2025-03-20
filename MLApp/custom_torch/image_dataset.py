import PIL
import os
import torch
from torchvision import datasets
from MLApp.parameters import device




class ImageDataset(datasets.VisionDataset):
    """Ineherits Torch's datasets.VisionDataset.  

    Attributes
    ----------

    targets : list
        List of materials, each is composed of a list of floats.
    image_dir : str
        Path to image directory.
    """

    def __init__(self, root, targets, transform=None, target_transform=None):
        super(ImageDataset, self).__init__(
            root, transform=transform, target_transform=target_transform)
        self.targets = targets
        self.image_dir = root
        # self.images =

    def __getitem__(self, key):
        """Loads and returns an image from the dataset. Allows
        requesting individual images by index, as well as lists
        defined by slices.

        key : index, slice
            Can be an index or a slice.
        image_path : str
            Path to image.
        image : PIL.Image.Image
            PIL image object.
        target : torch.FloatTensor
            Torch tensor containing the material parameter labels.
        """
        if isinstance(key, int):
            image_path = os.path.join(self.image_dir, f"{self.targets[key][0]}.jpg")
            image = PIL.Image.open(image_path)
            target = torch.FloatTensor(self.targets[key][1:])
            if self.transform is not None:
                image = self.transform(image)

            if self.target_transform is not None:
                target = self.target_transform(target)

            return image.to(device), target.to(device)
        elif isinstance(key, slice):
            start, stop, step = key.indices(len(self))
            return [self[i] for i in range(start, stop, step)]
        else:
            raise TypeError("Unsupported key type")

    def __len__(self):
        """Returns number of iamges in dataset.
        """
        return len(self.targets)
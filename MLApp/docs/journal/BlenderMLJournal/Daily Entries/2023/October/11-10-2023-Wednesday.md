- [x] Add subset generating functionality to image_datset
- [x] document this functionality
- [ ] Create functionality to: for a given set, predict parameters 
- [ ] render those predictions  
- [ ] display predictions side by side with test data (images).


## What I did

Added functionality necessary to accept slices as arguments for the __getitem___ method of the image_dataset class. Can now easily create subsets of datasets:

```python
def __getitem__(self, key):

        """Loads and returns an image from the dataset.

        image_path : str

            Path to image.

        image : PIL.Image.Image

            PIL image object.

        target : torch.FloatTensor

            Torch tensor containing the material parameter labels.

        """

        if isinstance(key, int):


            image_path = os.path.join(self.image_dir, f"{key}.jpg")

            image = PIL.Image.open(image_path)

            target = torch.FloatTensor(self.targets[key])

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
```

worked on functionality to render from list of params instead of just a whole directory:    (from render_data.py)

```python
if isinstance(sys.argv[3], str):

      data = os.getcwd()+"\\"+sys.argv[3]

  

      if os.path.isfile(data + "\\props\\params.json"):

            print("true")

            with open(data + "\\props\\params.json", 'r+') as file:

                  material_props = list(json.load(file).values())

      else:

            print("Error: Prop file not found")

      for ind, material_prop in enumerate(material_props):

            nodes['Principled BSDF'].inputs[0].default_value = material_prop["nodes['Principled BSDF'].inputs[0].default_value"]

            nodes['Principled BSDF'].inputs[6].default_value = material_prop["nodes['Principled BSDF'].inputs[6].default_value"]

            nodes['Principled BSDF'].inputs[9].default_value = material_prop["nodes['Principled BSDF'].inputs[9].default_value"]

            bpy.data.scenes["Scene"].render.filepath = f"{directory}\\renders\\{ind}.jpg"

            bpy.ops.render.render(use_viewport = True, write_still=True)

elif isinstance(sys.argv[3], list):

      data = sys.argv[3]
```
## Conclusion, Notes of Importance and Plans

Currently the output of test(model, DataLoader) method is returning redundantly nested lists, need to figure out why:
```
[[[0.8943488597869873,
   0.42488059401512146,
   0.28301477432250977,
   0.5533531308174133,
   0.5920646786689758,
   0.6447961330413818]],
 [[0.661704421043396,
   0.5800814628601074,
   0.2515903413295746,
   0.4619675278663635,
   0.2899457514286041,
   0.06051035597920418]],
 ....] etc
```
To continue, see Jupyter Notebook.

reminder for git: 

git add --all
git commit -m "commit message"
git push
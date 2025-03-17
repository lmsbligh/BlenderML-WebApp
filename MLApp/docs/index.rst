.. Blender ML documentation master file, created by
   sphinx-quickstart on Sun Oct  1 17:48:20 2023.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Blender ML's documentation!
======================================
Fill in some basic description of the project and what it does; 
Currently this app can:

* Randomly generate principled BSDF shader nodes. Currently it can only
 set base colour RGBA, metalic, and roughness.
* Launch Blender, iterate through a list of materials 
 from file saving a render of the scene with each material.
* Define and train a convolutional neural network using Pytorch
 train this network using the renders as input and the known
 parameters as the targets.
* Render the predicted parameters of the test data and compare
 side by side.


.. toctree::
   :maxdepth: 2
   :caption: Contents:




Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`

Classes
=======
 


.. automodule:: custom_nn.custom_nn
   :members:
   :undoc-members:
   :show-inheritance:



.. automodule:: data_generator
   :members:
   :undoc-members:
   :show-inheritance:

.. automodule:: data_generator.prop_generator
   :members:
   :undoc-members:
   :show-inheritance:

.. automodule:: app
   :members:
   :undoc-members:
   :show-inheritance:

.. automodule:: parameters
   :members:
   :undoc-members:
   :show-inheritance:

Methods
=======

.. automodule:: blender_scripts.blender_launcher
   :members:

.. automodule:: blender_scripts.render_data
   :members:

.. automodule:: custom_nn.target_loader
   :members:

.. automodule:: custom_nn.test
   :members:

.. automodule:: custom_nn.train
   :members:
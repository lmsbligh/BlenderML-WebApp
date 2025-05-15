MLApp package
=============

This is the machine learning and Blender portion of the app.

.. contents::
   :local:
   :depth: 3

Machine Learning Functionality
------------------------------

Custom Neural Net 
~~~~~~~~~~~~~~~~~

.. automodule:: MLApp.custom_torch.custom_net
   :members:
   :undoc-members:
   :show-inheritance:

Material Generation 
~~~~~~~~~~~~~~~~~

.. automodule:: MLApp.custom_torch.flask_generate_material
   :members:
   :undoc-members:
   :show-inheritance:

Training
~~~~~~~~~~~~~~~~~

.. automodule:: MLApp.custom_torch.flask_train
   :members:
   :undoc-members:
   :show-inheritance:

Image Dataset
~~~~~~~~~~~~~~~~~

.. automodule:: MLApp.custom_torch.image_dataset
   :members:
   :undoc-members:
   :show-inheritance:

Target Loader
~~~~~~~~~~~~~~~~~

.. automodule:: MLApp.custom_torch.target_loader
   :members:
   :undoc-members:
   :show-inheritance:

MLApp.parameters module
~~~~~~~~~~~~~~~~~~~~~~~

Contains all constants and paths.

.. toggle:: Show MODEL_FORM source code

   .. literalinclude:: ../../MLApp/parameters.py
      :language: python
      :dedent: 0


Blender Scripts
---------------

Blender Launcher
~~~~~~~~~~~~~~~~
.. automodule:: MLApp.blender_scripts.blender_launcher
   :members:
   :undoc-members:
   :show-inheritance:

Render Scripts
~~~~~~~~~~~~~~
.. automodule:: MLApp.blender_scripts.render_data
   :members:
   :undoc-members:
   :exclude-members: main, parse_arguments
   :show-inheritance:




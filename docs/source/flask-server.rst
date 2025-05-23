Flask\-server package
=====================



This is the documentation for the Flask server. Each route is saved in its own file and ran as a Flask Blueprint. 
The configuration for the server is stored in conf.py.

.. contents::
   :local:
   :depth: 3

Routes
------

Models
~~~~~~

The endpoints in `models` allow users to create, retrieve, update, and delete neural network models. These include routes for managing model architecture, 
and retrieving activation types, layer types, as well as checkpoint listings for existing models.

.. automodule:: api.routes.models
   :members:
   :undoc-members:
   :show-inheritance:

Datasets
~~~~~~~~

The endpoints in `datasets` allow users to create, retrieve, update and delete dataset profiles, as well as retrieving a subset of images from the dataset.

.. automodule:: api.routes.datasets
   :members:
   :undoc-members:
   :show-inheritance:

Training
~~~~~~~~

.. automodule:: api.routes.training
   :members:
   :undoc-members:
   :show-inheritance:

Material Generation
~~~~~~~~~~~~~~~~~~~

.. automodule:: api.routes.material_generation
   :members:
   :undoc-members:
   :show-inheritance:
Forms Criteria/Validation Dictionaries
--------------------------------------

The following dictionaries contain the validiation/criteria for their respective forms.

Training
~~~~~~~~

Required fields:
   - model: Alphanumeric string of up to 8 characters.
   - checkpoint: Alphanumeric string, maximum length of 30 characters. Can also include - and . characters.
   - dataset: Alphanumeric string, maximum of 30 characters. Can also include -
   - epochs: Positive integer less than 1000.
   - learningRate: Float of up to 4 decimal places between 0.1 and 0.0001.
   - optimizer: Alphanumeric string of up to 30 characters. Can also include -  
   - lossFunction: Alphanumeric string of up to 30 characters. Can also include -  
   - xVal: Integer between 1 and 99.

.. toggle:: Show MODEL_FORM source code

   .. literalinclude:: ../../flask-server/api/forms/training_forms.py
      :language: python
      :dedent: 0

---

Dataset Profiles
~~~~~~~~~~~~~~~~

Required fields:
   - value: Eight character alphanumeric string.
   - datasetName: Alphanumeric string of up to 15 characters. Can also include -
   - datasetSize: Integer between 1 and 5000
   - imageHeight: Integer between 1 and 1000
   - imageWidth: Integer between 1 and 1000
   
Optional fields:
   - description: Alphanumeric string of up to 150 characters. Can also include -,.
   - meshes: Dictionary.
   - randomOrientation: Boolean.
   - skyboxPath: String of up to 150 characters. Can also include /:.-\

.. toggle:: Show DATASET_FORM source code

   .. literalinclude:: ../../flask-server/api/forms/dataset_forms.py
      :language: python
      :dedent: 0

---

Material Generation
~~~~~~~~~~~~~~~~~~~

Required fields:
   - model: Alphanumeric string of up to 8 characters.
   - image_url: Alphanumeric string of up to 150 characters. Can also include \:./-_
   - image_path: Alphanumeric string of up to 150 characters. Can also include \:./-_
   - checkpoint: Alphanumeric string, maximum length of 30 characters. Can also include - and . characters.

.. toggle:: Show MATERIAL_GENERATION_FORM source code

   .. literalinclude:: ../../flask-server/api/forms/material_generation_forms.py
      :language: python
      :dedent: 0

---

Model Submission
~~~~~~~~~~~~~~~~
The model form itself has the following criteria:

Required fields:
   - value: Eight character alphanumeric string.
   - modelName: Alphanumeric string of up to 15 characters. Can also include -
   - layers: List.

Optional fields:
   - description: Alphanumeric string of up to 150 characters. Can also include -,.:/
   - input: Integer between 1 and 1000. Not yet implemented.
   - output: Integer between 1 and 1000. Not yet implemented.

.. toggle:: Show MODEL_FORM source code

   .. literalinclude:: ../../flask-server/api/forms/model_forms.py
      :language: python
      :start-after: MODEL_FORM = {
      :end-before: LAYER_FORM =
      :dedent: 0

---

Individual layers must also conform to the following criteria:

Required fields:
   - id: Alphanumeric string of up to 8 characters.
   - activation: Alphanumeric string of up to 15 characters. Can also include -.
   - layer_type: Alphanumeric string of up to 15 characters. Can also include -.
   - x_0: Integer between 0 and 1000.
   - x_1: Integer between 0 and 1000.

Optional fields:
   - description: Alphanumeric string of up to 150 characters. Can also include -,.:/
   - x_2: Integer between 0 and 1000. Not yet implemented.
   - x_3: Integer between 0 and 1000. Not yet implemented.
   - padding: Integer between 0 and 99. Not yet implemented.

.. toggle:: Show MODEL_FORM source code

   .. literalinclude:: ../../flask-server/api/forms/training_forms.py
      :language: python
      :start-after: LAYER_FORM = {
      :end-after: }
      :dedent: 0

---

Utils
-----

.. automodule:: api.utils
   :members:
   :undoc-members:
   :show-inheritance:

Configuration
-------------

.. automodule:: config
   :members:
   :undoc-members:
   :show-inheritance:
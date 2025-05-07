# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.



# -- Project information -----------------------------------------------------

project = 'BlenderML WebApp'
copyright = '2025, Liam Bligh'
author = 'Liam Bligh'


# -- General configuration ---------------------------------------------------
import os
import sys
import sphinx_rtd_theme
# Get the path to the root of your project (assuming conf.py is in the "docs" directory)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.insert(0, os.path.abspath('../../flask-server'))
sys.path.insert(0, os.path.abspath('../../MLApp'))
sys.path.insert(0, os.path.abspath('../../client'))
sys.path.insert(0, os.path.abspath('../..'))
# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx.ext.autodoc',        
    'sphinx.ext.napoleon',       
    'sphinx.ext.viewcode',
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = []


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]
html_theme = 'sphinx_rtd_theme'

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']


# Set the CWD to the project's root directory
os.chdir(project_root)

# Add the project's root directory to sys.path
sys.path.insert(0, project_root)
templates_path = ['_templates']

html_static_path = ['_static']
html_css_files = ['custom.css']
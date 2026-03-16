from setuptools import setup, find_packages

setup(
    name='gitagent',
    version='0.1.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'click>=8.1.0',
        'gitpython>=3.1.0',
        'pyyaml>=6.0',
        'openai>=1.0.0',
        'pydantic>=2.0.0',
    ],
    extras_require={
        'dev': [
            'pytest>=7.0.0',
        ]
    },
    entry_points={
        'console_scripts': [
            'gitagent=gitagent.cli:cli',
        ],
    },
    author='GitAgent Team',
    description='An open standard and CLI tool for AI agents as version-controlled Git repositories.',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='https://github.com/your-org/gitagent', # Replace with your project URL
    classifiers=[
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.10',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Version Control',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
    ],
    python_requires='>=3.10',
)

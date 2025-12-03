# bdoPF

# DEV
```
"assets": [
    {
        "glob": "favicon.ico",
        "input": "public"
    },
    // dev:  Just watch pngs, if you wanna run this project, enable it.
    // build: DON'T DO THIS, all png will be copy in exe
    {
        "glob": "product_icon_png",
        "input": "public"
    },
    // dev: Enable this, angular will watch  public folder
    // build: DON'T DO THIS, the files inside  public will be copy in exe
    {
        "glob": "**/*",
        "input": "public"
    },
]
```
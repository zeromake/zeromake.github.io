# zeromake-blog

my hugo static blog

## my hugo fork download

**MacOSX**
``` bash
curl -fLo hugo.tar.gz https://github.com/zeromake/hugo/releases/download/v0.128.2/hugo_extended_0.128.2_darwin-universal.tar.gz
tar -xf hugo.tar.gz
rm hugo.tar.gz
```

**Linux**
``` bash
curl -fLo hugo.tar.gz https://github.com/zeromake/hugo/releases/download/v0.128.2/hugo_extended_0.128.2_linux-amd64.tar.gz
tar -xf hugo.tar.gz
rm hugo.tar.gz
```

**Windows**
``` pwsh
Invoke-WebRequest -Uri https://github.com/zeromake/hugo/releases/download/v0.128.2/hugo_extended_0.128.2_windows-amd64.zip -OutFile hugo.zip
Expand-Archive -Path hugo.zip -DestinationPath .
Remove-Item hugo.zip
```

## dev server

``` bash
./hugo server -D
```

## build static files

``` bash
./hugo --enableGitInfo --gc --minify
```


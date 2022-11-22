hugo:
	curl -fLo hugo https://github.com/zeromake/hugo/releases/download/v0.89.4/hugo_darwin_amd64 && chmod +x hugo
	# curl -fLo hugo https://github.com/zeromake/hugo/releases/download/v0.89.4/hugo_linux_amd64 && chmod +x hugo
	# curl -fLo hugo.exe https://github.com/zeromake/hugo/releases/download/v0.89.4/hugo_windows_amd64.exe
build: hugo ## Build the non-production site, which adds noindex headers to prevent indexing
	./hugo --enableGitInfo --gc --minify
